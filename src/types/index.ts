export type Gender = 'male' | 'female';
export type AgeGroup = 'child' | 'adult';

export interface DetectedPerson {
  id: string;
  descriptor: Float32Array;
  gender: Gender;
  ageGroup: AgeGroup;
  estimatedAge: number;
  firstSeen: Date;
  appearances: number;
  lastSeen: Date;
}

export interface SessionStats {
  uniquePersons: number;
  totalAppearances: number;
  children: number;
  adults: number;
  males: number;
  females: number;
}

export interface SessionData {
  persons: DetectedPerson[];
  stats: SessionStats;
  startTime: Date;
  endTime?: Date;
}

export type AppScreen = 'home' | 'running' | 'summary';
