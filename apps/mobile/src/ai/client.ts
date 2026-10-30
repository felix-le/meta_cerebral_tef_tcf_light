import type { FeedbackStub } from '@/content/feedbackStub';
import { buildWritingBRequest, parseWritingBResult, SCORER_MODEL } from './scorer';

// Stage-1 AI plumbing (Meta Model API: Muse Spark scorer).
//
// Endpoint (locked 2026-10-29): base EXPO_PUBLIC_META_MODEL_API_BASE_URL
// must be the full host WITH /v1 (https://api.meta.ai/v1); calls go to
// POST {base}/chat/completions — never append another /v1 in code.
//
// The key is NEVER bundled in code: it lives in apps/mobile/.env
// (gitignored; see .env.example). EXPO_PUBLIC_ keys ship inside the app
// bundle — demo/hackathon only. Rotate the key after the contest
// submission and move scoring behind your own server for production.
// Until a key is present, every caller keeps its documented Stage-0
// stub behaviour — check isAiConfigured() before calling.
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

interface ChatCompletion {
  choices?: Array<{ message?: { content?: string } }>;
}

/**
 * Score one Writing section B text with muse-spark-1.3. Output follows
 * docs/contest/feedback.schema.json (same shape as FeedbackStub; the app
 * derives NCLC and /450 from config per rubric 2). HTTP failures and
 * schema mismatches both throw AiRequestError carrying the status, and
 * are always logged with the status first — never fully silent.
 */
export async function scoreWritingB(consigne: string, text: string): Promise<FeedbackStub> {
  if (!isAiConfigured()) {
    throw new AiNotConfiguredError();
  }
  const url = `${baseUrl()}/chat/completions`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 90000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey()}` },
      body: JSON.stringify(buildWritingBRequest(consigne, text)),
    });
    if (!res.ok) {
      console.warn(`[scorer] ${SCORER_MODEL} HTTP ${res.status} on /chat/completions`);
      throw new AiRequestError(res.status, `Meta Model API ${res.status} on /chat/completions`);
    }
    const data = (await res.json()) as ChatCompletion;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.warn('[scorer] HTTP 200 with empty choices');
      throw new AiRequestError(200, 'Meta Model API returned no content');
    }
    return parseWritingBResult(content);
  } catch (e) {
    if (e instanceof AiRequestError || e instanceof AiNotConfiguredError) {
      throw e;
    }
    if (e instanceof Error && e.name === 'ScorerValidationError') {
      console.warn(`[scorer] HTTP 200 schema mismatch: ${e.message}`);
      throw new AiRequestError(200, e.message);
    }
    const message = e instanceof Error ? e.message : 'Network request failed';
    console.warn(`[scorer] HTTP 0 network failure: ${message}`);
    throw new AiRequestError(0, message);
  } finally {
    clearTimeout(timer);
  }
}
