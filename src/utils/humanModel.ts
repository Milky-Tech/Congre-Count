import { Human, Config } from "@vladmandic/human";
import { Gender } from "../types";

let human: Human | null = null;

const humanConfig: Partial<Config> = {
  // Optimization for mobile and real-time
  backend: "webgl",
  modelBasePath:
    "https://cdn.jsdelivr.net/npm/@vladmandic/human@latest/models/",
  filter: { enabled: true, equalization: false, flip: false },
  face: {
    enabled: true,
    detector: {
      rotation: true,
      maxDetected: 20,
      minConfidence: 0.6,
      return: true,
    },
    mesh: { enabled: false },
    iris: { enabled: false },
    description: { enabled: true }, // This is the unique face descriptor/embedding
    emotion: { enabled: false },
    antispoof: { enabled: false },
    liveness: { enabled: false },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false }, // Disabled - using face recognition only
  segmentation: { enabled: false },
  gesture: { enabled: false },
};

export async function initHuman(): Promise<Human> {
  if (human) {
    console.log("✅ Human library already initialized");
    return human;
  }

  try {
    console.log("📦 Creating Human instance with config:", humanConfig);
    human = new Human(humanConfig);

    console.log(
      "⏳ Loading Human models (face detection, body detection, objects)...",
    );
    await human.load();

    console.log("🔥 Warming up models...");
    await human.warmup();

    console.log("✅ Human library initialized successfully");
    console.log("📊 Enabled detection: Face recognition only");
    return human;
  } catch (err) {
    console.error("❌ Failed to initialize Human:", err);
    human = null;
    throw err;
  }
}

export interface HumanDetectionResult {
  descriptor: Float32Array;
  gender: Gender;
  age: number;
  box: [number, number, number, number]; // [x, y, w, h]
  angle: { roll: number; pitch: number; yaw: number }; // Face orientation
  isForwardFacing: boolean; // Only forward-facing faces
}

export async function detectHumanFaces(
  videoElement: HTMLVideoElement,
): Promise<HumanDetectionResult[]> {
  if (!human) {
    throw new Error("Human library not initialized");
  }

  try {
    const result = await human.detect(videoElement);
    const detections: HumanDetectionResult[] = [];

    // Process face detections with descriptors only
    if (result.face && result.face.length > 0) {
      result.face.forEach((f, index) => {
        if (f.embedding) {
          // Extract rotation/angle information
          const roll = f.rotation?.angle?.roll ?? 0;
          const pitch = f.rotation?.angle?.pitch ?? 0;
          const yaw = f.rotation?.angle?.yaw ?? 0;

          // Only accept forward-facing faces (limited head rotation)
          // Tolerance: ±25 degrees for yaw (left-right), ±20 degrees for pitch/roll
          const maxYaw = 25;
          const maxPitch = 20;
          const maxRoll = 20;

          const isForwardFacing =
            Math.abs(yaw) <= maxYaw &&
            Math.abs(pitch) <= maxPitch &&
            Math.abs(roll) <= maxRoll;

          if (!isForwardFacing) {
            console.log(
              `⏭️ Face ${index + 1} skipped - not forward-facing (yaw=${yaw.toFixed(1)}°, pitch=${pitch.toFixed(1)}°, roll=${roll.toFixed(1)}°)`,
            );
            return;
          }

          const descriptor = new Float32Array(f.embedding);
          detections.push({
            descriptor,
            gender: (f.gender || "unknown") as "male" | "female",
            age: f.age || 0,
            box: f.box as [number, number, number, number],
            angle: { roll, pitch, yaw },
            isForwardFacing: true,
          });

          // Log descriptor quality info
          const descriptorLength = descriptor.length;
          const descriptorMagnitude = Math.sqrt(
            Array.from(descriptor).reduce((sum, val) => sum + val * val, 0),
          );
          console.log(
            `📊 Face ${index + 1} (forward-facing ✓): yaw=${yaw.toFixed(1)}°, pitch=${pitch.toFixed(1)}°, descriptor length=${descriptorLength}, magnitude=${descriptorMagnitude.toFixed(3)}`,
          );
        }
      });
    }

    if (detections.length > 0) {
      console.log(`✓ Accepted: ${detections.length} forward-facing face(s)`);
    } else {
      console.log("No forward-facing face detections in current frame");
    }

    return detections;
  } catch (err) {
    console.error("Error during detection:", err);
    return [];
  }
}

export function calculateSimilarity(
  desc1: Float32Array,
  desc2: Float32Array,
): number {
  if (desc1.length === 0 || desc2.length === 0) {
    return 0;
  }

  if (desc1.length !== desc2.length) {
    return 0;
  }

  // Cosine similarity implementation
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < desc1.length; i++) {
    dotProduct += desc1[i] * desc2[i];
    normA += desc1[i] * desc1[i];
    normB += desc2[i] * desc2[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Classifies a specific face region detected by another model (e.g., YOLOv8)
 * using the Human library's gender and age classification.
 */
export async function classifyFaceFromBox(
  videoElement: HTMLVideoElement,
  box: [number, number, number, number]
): Promise<{ gender: 'male' | 'female' | 'unknown', age: number }> {
  if (!human) {
    console.warn("⚠️ Human library not initialized during classification - returning defaults");
    return { gender: 'unknown', age: 0 };
  }

  try {
    const [x, y, w, h] = box;

    // Create a temporary canvas for the crop
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { gender: 'unknown', age: 0 };

    // Draw the cropped face from the video
    // Use Math.max/min to ensure we stay within video bounds
    ctx.drawImage(
      videoElement,
      Math.max(0, x),
      Math.max(0, y),
      Math.min(w, videoElement.videoWidth - x),
      Math.min(h, videoElement.videoHeight - y),
      0,
      0,
      w,
      h
    );

    // Run Human detection on the single crop (this will be very fast)
    const result = await human.detect(canvas);

    if (result.face && result.face.length > 0) {
      // Take the first face detected in the crop
      const f = result.face[0];
      return {
        gender: (f.gender || 'unknown') as 'male' | 'female' | 'unknown',
        age: f.age || 0
      };
    }

    return { gender: 'unknown', age: 0 };
  } catch (err) {
    console.error("❌ Error during face classification:", err);
    return { gender: 'unknown', age: 0 };
  }
}
