/**
 * Face Memory System using IndexedDB
 * Stores face descriptors with full person correlation to prevent duplicate counting
 */

export interface StoredFaceRecord {
  id: string;
  descriptor: number[]; // Stored as number array
  gender: string;
  age: number;
  firstDetected: number; // timestamp
  lastDetected: number; // timestamp
  detectionCount: number;
  sessionIds: string[]; // Track which sessions this person was in
}

const DB_NAME = "CongreCountDB";
const DB_VERSION = 1;
const STORE_NAME = "faces";

let db: IDBDatabase | null = null;

export async function initFaceDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("❌ Failed to open IndexedDB:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log("✅ IndexedDB initialized successfully");
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("lastDetected", "lastDetected", { unique: false });
        store.createIndex("detectionCount", "detectionCount", {
          unique: false,
        });
        console.log("📦 IndexedDB object store created");
      }
    };
  });
}

function getDatabase(): IDBDatabase {
  if (!db) {
    throw new Error(
      "Face database not initialized. Call initFaceDatabase() first.",
    );
  }
  return db;
}

export async function addToFaceMemory(
  descriptor: Float32Array,
  gender: string,
  age: number,
  personId: string,
  sessionId: string,
): Promise<void> {
  const database = getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const record: StoredFaceRecord = {
      id: personId,
      descriptor: Array.from(descriptor),
      gender,
      age,
      firstDetected: Date.now(),
      lastDetected: Date.now(),
      detectionCount: 1,
      sessionIds: [sessionId],
    };

    const request = store.add(record);

    request.onerror = () => {
      console.error("❌ Error adding face to memory:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log(`💾 Face stored in IndexedDB. ID: ${personId}`);
      resolve();
    };
  });
}

export async function updateFaceMemory(
  personId: string,
  sessionId: string,
): Promise<void> {
  const database = getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const getRequest = store.get(personId);

    getRequest.onsuccess = () => {
      const record = getRequest.result as StoredFaceRecord | undefined;

      if (record) {
        record.lastDetected = Date.now();
        record.detectionCount++;

        // Add session ID if not already present
        if (!record.sessionIds.includes(sessionId)) {
          record.sessionIds.push(sessionId);
        }

        const putRequest = store.put(record);

        putRequest.onerror = () => {
          console.error("❌ Error updating face:", putRequest.error);
          reject(putRequest.error);
        };

        putRequest.onsuccess = () => {
          resolve();
        };
      } else {
        reject(new Error(`Face with ID ${personId} not found`));
      }
    };

    getRequest.onerror = () => {
      reject(getRequest.error);
    };
  });
}

export async function findMatchingFaceInMemory(
  descriptor: Float32Array,
  threshold: number = 0.58,
): Promise<StoredFaceRecord | null> {
  const database = getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const faces = request.result as StoredFaceRecord[];

      // Find the BEST matching face instead of first match
      let bestMatch: StoredFaceRecord | null = null;
      let bestSimilarity = 0;

      for (const face of faces) {
        const similarity = calculateSimilarity(
          descriptor,
          new Float32Array(face.descriptor),
        );

        console.log(
          `🔍 Comparing with face ${face.id}: similarity = ${similarity.toFixed(4)}`,
        );

        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = face;
        }
      }

      if (bestMatch && bestSimilarity > threshold) {
        console.log(
          `✅ Best face match found (ID: ${bestMatch.id}, similarity: ${bestSimilarity.toFixed(4)})`,
        );
        resolve(bestMatch);
      } else if (bestMatch) {
        console.log(
          `⚠️ Best match similarity (${bestSimilarity.toFixed(4)}) below threshold (${threshold})`,
        );
        resolve(null);
      } else {
        console.log("ℹ️ No faces in memory yet");
        resolve(null);
      }
    };

    request.onerror = () => {
      console.error("❌ Error querying face memory:", request.error);
      reject(request.error);
    };
  });
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

  // Cosine similarity
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

export async function clearFaceMemory(): Promise<void> {
  const database = getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => {
      console.error("❌ Error clearing face memory:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log("🗑️ Face memory cleared successfully");
      resolve();
    };
  });
}

export async function getFaceMemoryStats(): Promise<{
  totalFaces: number;
  totalDetections: number;
}> {
  const database = getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const faces = request.result as StoredFaceRecord[];
      const totalDetections = faces.reduce(
        (sum, f) => sum + f.detectionCount,
        0,
      );

      resolve({
        totalFaces: faces.length,
        totalDetections,
      });
    };

    request.onerror = () => {
      console.error("❌ Error getting face stats:", request.error);
      reject(request.error);
    };
  });
}

export async function getStoredFaceMemory(): Promise<StoredFaceRecord[]> {
  const database = getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as StoredFaceRecord[]);
    };

    request.onerror = () => {
      console.error("❌ Error retrieving face memory:", request.error);
      reject(request.error);
    };
  });
}
