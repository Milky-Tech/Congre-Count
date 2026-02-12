import { DetectedPerson, Gender, AgeGroup, SessionStats } from "../types";
import { calculateSimilarity } from "./faceMemory";

export function generatePersonId(): string {
  return `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function classifyAgeGroup(age: number): AgeGroup {
  return age <= 10 ? "child" : "adult";
}

export function findMatchingPerson(
  descriptor: Float32Array,
  persons: DetectedPerson[],
  threshold: number = 0.58,
): DetectedPerson | null {
  if (persons.length === 0) return null;

  // Find the BEST matching person instead of just first match
  let bestMatch: DetectedPerson | null = null;
  let bestSimilarity = 0;

  for (const person of persons) {
    const similarity = calculateSimilarity(descriptor, person.descriptor);

    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = person;
    }
  }

  if (bestMatch && bestSimilarity > threshold) {
    console.log(
      `✅ Person matched in session (ID: ${bestMatch.id}, similarity: ${bestSimilarity.toFixed(4)})`,
    );
    return bestMatch;
  } else if (bestMatch) {
    console.log(
      `⚠️ Best session match (${bestSimilarity.toFixed(4)}) below threshold (${threshold}) - treating as new person`,
    );
  }

  return null;
}

export function createNewPerson(
  descriptor: Float32Array,
  gender: Gender,
  age: number,
): DetectedPerson {
  return {
    id: generatePersonId(),
    descriptor,
    gender,
    ageGroup: classifyAgeGroup(age),
    estimatedAge: age,
    firstSeen: new Date(),
    appearances: 1,
    lastSeen: new Date(),
  };
}

export function updatePersonAppearance(person: DetectedPerson): DetectedPerson {
  return {
    ...person,
    appearances: person.appearances + 1,
    lastSeen: new Date(),
  };
}

export function calculateStats(persons: DetectedPerson[]): SessionStats {
  const stats: SessionStats = {
    uniquePersons: persons.length,
    totalAppearances: 0,
    children: 0,
    adults: 0,
    males: 0,
    females: 0,
  };

  persons.forEach((person) => {
    stats.totalAppearances += person.appearances;

    if (person.ageGroup === "child") {
      stats.children++;
    } else {
      stats.adults++;
    }

    if (person.gender === "male") {
      stats.males++;
    } else {
      stats.females++;
    }
  });

  return stats;
}

export function shouldProcessPerson(
  person: DetectedPerson,
  cooldownMs: number = 5000,
): boolean {
  const timeSinceLastSeen = Date.now() - person.lastSeen.getTime();
  return timeSinceLastSeen >= cooldownMs;
}
