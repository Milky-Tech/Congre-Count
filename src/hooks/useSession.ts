import { useState, useCallback, useRef, useEffect } from 'react';
import { SessionData } from '../types';
import { detectFaces } from '../utils/faceDetection';
import {
  findMatchingPerson,
  createNewPerson,
  updatePersonAppearance,
  calculateStats,
  shouldProcessPerson,
} from '../utils/personTracking';

export function useSession() {
  const [isRunning, setIsRunning] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData>({
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
  const [error, setError] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] = useState<string>('Initializing...');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  const startSession = useCallback(() => {
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
    setDetectionStatus('Ready - Point camera at entrance');
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
    setDetectionStatus('Session stopped');
  }, []);

  const setVideoElement = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
  }, []);

  const processFaces = useCallback(async () => {
    if (!videoRef.current || isProcessingRef.current || !isRunning) return;

    isProcessingRef.current = true;

    try {
      const detections = await detectFaces(videoRef.current);

      if (detections.length === 0) {
        setDetectionStatus('No faces detected');
        isProcessingRef.current = false;
        return;
      }

      setDetectionStatus(`Processing ${detections.length} face(s)...`);

      setSessionData((prevData) => {
        const updatedPersons = [...prevData.persons];
        let newDetections = 0;

        detections.forEach((detection) => {
          const matchingPerson = findMatchingPerson(detection.descriptor, updatedPersons);

          if (matchingPerson) {
            if (shouldProcessPerson(matchingPerson)) {
              const index = updatedPersons.findIndex((p) => p.id === matchingPerson.id);
              updatedPersons[index] = updatePersonAppearance(matchingPerson);
            }
          } else {
            const newPerson = createNewPerson(
              detection.descriptor,
              detection.gender,
              detection.age
            );
            updatedPersons.push(newPerson);
            newDetections++;
          }
        });

        const newStats = calculateStats(updatedPersons);

        if (newDetections > 0) {
          setDetectionStatus(`${newDetections} new person(s) detected!`);
        } else {
          setDetectionStatus(`Tracking ${updatedPersons.length} unique person(s)`);
        }

        return {
          ...prevData,
          persons: updatedPersons,
          stats: newStats,
        };
      });
    } catch (err) {
      console.error('Error processing faces:', err);
      setError('Error during face detection');
      setDetectionStatus('Detection error - retrying...');
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
