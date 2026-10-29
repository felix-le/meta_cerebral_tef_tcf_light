import type { FeedbackStub } from '@/content/feedbackStub';

// Stage-1 AI plumbing (Meta Model API: Muse Spark scorer + Voice Transcribe
// + AI debate partner per rubric.md section 3.3).
//
// The key is NEVER bundled in code: it lives in apps/mobile/.env
// (gitignored; see .env.example). Until a key is present, every caller
// keeps its documented Stage-0 stub behaviour — check isAiConfigured()
// before calling.
export class AiNotConfiguredError extends Error {
  constructor() {
    super('Meta Model API key missing: copy apps/mobile/.env.example to .env and fill it in.');
    this.name = 'AiNotConfiguredError';
  }
}

export class AiRequestError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'AiRequestError';
    this.status = status;
  }
}

function baseUrl(): string {
  return (process.env.EXPO_PUBLIC_META_MODEL_API_BASE_URL ?? '').replace(/\/+$/, '');
}

function apiKey(): string {
  return process.env.EXPO_PUBLIC_META_MODEL_API_KEY ?? '';
}

export function isAiConfigured(): boolean {
  return baseUrl() !== '' && apiKey() !== '' && !apiKey().includes('paste-key-here');
}

async function postJson<T>(path: string, body: unknown, timeoutMs = 60000): Promise<T> {
  if (!isAiConfigured()) {
    throw new AiNotConfiguredError();
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey()}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new AiRequestError(res.status, `Meta Model API ${res.status} on ${path}`);
    }
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof AiRequestError) {
      throw e;
    }
    throw new AiRequestError(0, e instanceof Error ? e.message : 'Network request failed');
  } finally {
    clearTimeout(timer);
  }
}

export interface ScorerInput {
  skill: 'writing' | 'speaking';
  section: 'A' | 'B';
  /** Learner text (writing draft or speaking transcript). */
  text: string;
}

// Scorer output follows docs/contest/feedback.schema.json (same shape as
// FeedbackStub; the app derives NCLC and /450 from config per rubric 2).
// Concrete paths and prompts land once the key is in and the first call is
// tested against the real endpoint.
export async function scoreAnswer(input: ScorerInput): Promise<FeedbackStub> {
  return postJson<FeedbackStub>('/score', input);
}
