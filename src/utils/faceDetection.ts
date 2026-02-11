import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';
let modelsLoaded = false;

export async function loadModels(): Promise<void> {
  if (modelsLoaded) return;

  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log('Face-api.js models loaded successfully');
  } catch (error) {
    console.error('Error loading face-api.js models:', error);
    throw new Error('Failed to load face detection models');
  }
}

export interface FaceDetectionResult {
  descriptor: Float32Array;
  gender: 'male' | 'female';
  age: number;
  detection: faceapi.FaceDetection;
}

export async function detectFaces(
  videoElement: HTMLVideoElement
): Promise<FaceDetectionResult[]> {
  if (!modelsLoaded) {
    throw new Error('Models not loaded');
  }

  const detections = await faceapi
    .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors()
    .withAgeAndGender();

  return detections.map((detection) => ({
    descriptor: detection.descriptor,
    gender: detection.gender as 'male' | 'female',
    age: detection.age,
    detection: detection.detection,
  }));
}

export function calculateDistance(descriptor1: Float32Array, descriptor2: Float32Array): number {
  return faceapi.euclideanDistance(descriptor1, descriptor2);
}

export function isMatchingPerson(
  descriptor1: Float32Array,
  descriptor2: Float32Array,
  threshold: number = 0.6
): boolean {
  const distance = calculateDistance(descriptor1, descriptor2);
  return distance < threshold;
}
