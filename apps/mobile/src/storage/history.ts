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
  /** Choice picks by question id (listening/reading review). */
  picks?: Record<string, number>;
  /** Submitted writing text (section B review). */
  text?: string;
  /** Measured take durations in seconds (speaking review). */
  durations?: number[];
}

const KEY = 'prepa-tef-tcf/history-v1';

// In-memory fallback: used when the native module is missing (e.g. a
// library version that does not match the running Expo Go, or the web
// preview). Reads and writes keep working for the session, and nothing in
// this file ever rejects — callers can float these promises safely without
// triggering uncaught-promise error toasts.
const memory = new Map<string, string>();
let useMemory = false;

async function getItem(key: string): Promise<string | null> {
  if (useMemory) {
    return memory.get(key) ?? null;
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    useMemory = true;
    return memory.get(key) ?? null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  if (useMemory) {
    memory.set(key, value);
    return;
  }
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    useMemory = true;
    memory.set(key, value);
  }
}

export async function listResults(): Promise<MockResult[]> {
  const raw = await getItem(KEY);
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
  await setItem(KEY, JSON.stringify([result, ...current]));
}
