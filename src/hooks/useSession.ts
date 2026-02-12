import { useState, useCallback, useRef, useEffect } from "react";
import { SessionData } from "../types";
import { detectHumanFaces } from "../utils/humanModel";
import {
  findMatchingPerson,
  createNewPerson,
  updatePersonAppearance,
  calculateStats,
  shouldProcessPerson,
} from "../utils/personTracking";
import {
  findMatchingFaceInMemory,
  addToFaceMemory,
  updateFaceMemory,
} from "../utils/faceMemory";

const STORAGE_KEY = "congre-count-session";

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function reviveSessionData(data: unknown): SessionData {
  const parsedData = data as Record<string, unknown>;
  return {
    startTime: new Date(parsedData.startTime as string),
    endTime: parsedData.endTime
      ? new Date(parsedData.endTime as string)
      : undefined,
    persons: (parsedData.persons as Array<Record<string, unknown>>).map(
      (p) => ({
        ...p,
        firstSeen: new Date(p.firstSeen as string),
        lastSeen: new Date(p.lastSeen as string),
      }),
    ) as SessionData["persons"],
    stats: parsedData.stats as SessionData["stats"],
  };
}

export function useSession() {
  const [isRunning, setIsRunning] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return reviveSessionData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved session", e);
      }
    }
    return {
      persons: [],
      stats: {
        uniquePersons: 0,
        totalAppearances: 0,
        children: 0,
        adults: 0,
        males: 0,
        females: 0,
      },
      startTime: new Date(),
    };
  });

  const [error, setError] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] =
    useState<string>("Initializing...");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const sessionIdRef = useRef<string>("");

  // Persist session data to localStorage whenever it changes
  useEffect(() => {
    if (sessionData.persons.length > 0 || isRunning) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    }
  }, [sessionData, isRunning]);

  const startSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    sessionIdRef.current = generateSessionId();
    setIsRunning(true);
    setSessionData({
      persons: [],
      stats: {
        uniquePersons: 0,
        totalAppearances: 0,
        children: 0,
        adults: 0,
        males: 0,
        females: 0,
      },
      startTime: new Date(),
    });
    setError(null);
    setDetectionStatus("🎬 New session started - Ready to detect faces");
  }, []);

  const stopSession = useCallback(() => {
    setIsRunning(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setSessionData((prev) => ({
      ...prev,
      endTime: new Date(),
    }));
    setDetectionStatus("Session stopped");
  }, []);

  const setVideoElement = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
  }, []);

  const processFaces = useCallback(async () => {
    if (!videoRef.current || isProcessingRef.current || !isRunning) return;

    isProcessingRef.current = true;

    try {
      const detections = await detectHumanFaces(videoRef.current);

      if (detections.length === 0) {
        setDetectionStatus("⏳ Waiting for faces...");
        isProcessingRef.current = false;
        return;
      }

      setDetectionStatus(`📹 Processing ${detections.length} face(s)...`);

      const updatedPersons = await Promise.all(
        detections.map(async (detection) => {
          // First, check if this face is already in the current session
          setSessionData((prevData) => {
            const matchingPerson = findMatchingPerson(
              detection.descriptor,
              prevData.persons,
            );

            if (matchingPerson && shouldProcessPerson(matchingPerson)) {
              // Already detected in this session - update appearance
              const newPersons = [...prevData.persons];
              const index = newPersons.findIndex(
                (p) => p.id === matchingPerson.id,
              );
              newPersons[index] = updatePersonAppearance(matchingPerson);
              updateFaceMemory(matchingPerson.id, sessionIdRef.current);
              return {
                ...prevData,
                persons: newPersons,
                stats: calculateStats(newPersons),
              };
            }
            return prevData;
          });

          // Check face memory
          const memoryMatch = await findMatchingFaceInMemory(
            detection.descriptor,
          );

          if (memoryMatch) {
            // Face was seen before - reuse their ID in this session
            const newPerson = createNewPerson(
              detection.descriptor,
              detection.gender,
              detection.age,
            );
            // Use the stored person ID to link to their history
            newPerson.id = memoryMatch.id;

            await updateFaceMemory(memoryMatch.id, sessionIdRef.current);

            console.log(
              `👤 Returning person detected (seen before: ${memoryMatch.detectionCount} times)`,
            );

            return { newPerson, isNew: false };
          } else {
            // Completely new person - create and store
            const newPerson = createNewPerson(
              detection.descriptor,
              detection.gender,
              detection.age,
            );

            await addToFaceMemory(
              detection.descriptor,
              detection.gender,
              detection.age,
              newPerson.id,
              sessionIdRef.current,
            );

            return { newPerson, isNew: true };
          }
        }),
      );

      // Count only new unique persons
      let newDetections = 0;
      updatedPersons.forEach((result) => {
        if (
          result &&
          typeof result === "object" &&
          "newPerson" in result &&
          result.isNew
        ) {
          newDetections++;
        }
      });

      setSessionData((prevData) => {
        const finalPersons = [...prevData.persons];

        // Add only truly new persons (not seen in memory)
        updatedPersons.forEach((result) => {
          if (
            result &&
            typeof result === "object" &&
            "newPerson" in result &&
            !finalPersons.find((p) => p.id === result.newPerson.id)
          ) {
            finalPersons.push(result.newPerson);
          }
        });

        const newStats = calculateStats(finalPersons);

        if (newDetections > 0) {
          console.log(
            `✅ ${newDetections} NEW unique person(s)! Total unique this session: ${finalPersons.filter((p) => p.appearances === 1 && !prevData.persons.find((pp) => pp.id === p.id)).length}`,
          );
          setDetectionStatus(
            `✅ ${newDetections} unique new person(s)! Session total: ${newStats.uniquePersons}`,
          );
        } else {
          setDetectionStatus(
            `👥 Tracking ${finalPersons.length} unique person(s) this session`,
          );
        }

        return {
          ...prevData,
          persons: finalPersons,
          stats: newStats,
        };
      });
    } catch (err) {
      console.error("Error processing detections:", err);
      setDetectionStatus("⚠️ Detection error - check console");
    } finally {
      isProcessingRef.current = false;
    }
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && videoRef.current) {
      detectionIntervalRef.current = window.setInterval(() => {
        processFaces();
      }, 1500);
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isRunning, processFaces]);

  return {
    isRunning,
    sessionData,
    error,
    detectionStatus,
    startSession,
    stopSession,
    setVideoElement,
  };
}
