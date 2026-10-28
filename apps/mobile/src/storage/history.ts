import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Cefr, Half } from '@/config/scoring';

export interface MockResult {
  id: string;
  date: string;
  skill: 'listening' | 'reading' | 'speaking' | 'writing';
  section: 'A' | 'B';
  level?: Cefr;
  half?: Half;
  correct?: number;
  total?: number;
}

const KEY = 'prepa-tef-tcf/history-v1';

export async function listResults(): Promise<MockResult[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as MockResult[];
  } catch {
    return [];
  }
}

export async function saveResult(result: MockResult): Promise<void> {
  const current = await listResults();
  await AsyncStorage.setItem(KEY, JSON.stringify([result, ...current]));
}
