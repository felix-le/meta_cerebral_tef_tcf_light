import type { FeedbackStub } from '@/content/feedbackStub';
import {
  buildSpeakingBRequest,
  parseSpeakingBResult,
  buildWritingBRequest,
  parseWritingBResult,
  SCORER_MODEL,
} from './scorer';
import {
  buildTranscribeRequest,
  parseTranscribeResult,
  TRANSCRIBE_MODEL,
  TRANSCRIBE_PATH,
} from './transcribe';
import { File, UploadType } from 'expo-file-system';

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
  choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    completion_tokens_details?: { reasoning_tokens?: number };
  };
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

/**
 * Score one Speaking section B conversation with muse-spark-1.3. Same wire
 * shape as Writing (low reasoning, 8k tokens, temperature 0, json_schema).
 * Every HTTP 200 is logged with finish_reason + usage so a truncated or
 * empty reply stays diagnosable. HTTP failures and schema mismatches both
 * throw AiRequestError carrying the status — never fully silent.
 */
export async function scoreSpeakingB(consigne: string, conversation: string): Promise<FeedbackStub> {
  if (!isAiConfigured()) {
    throw new AiNotConfiguredError();
  }
  const url = `${baseUrl()}/chat/completions`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 120000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey()}` },
      body: JSON.stringify(buildSpeakingBRequest(consigne, conversation)),
    });
    if (!res.ok) {
      console.warn(`[scorer] ${SCORER_MODEL} HTTP ${res.status} on /chat/completions (speaking)`);
      throw new AiRequestError(res.status, `Meta Model API ${res.status} on /chat/completions (speaking)`);
    }
    const data = (await res.json()) as ChatCompletion;
    const finishReason = data.choices?.[0]?.finish_reason ?? 'unknown';
    const usage = data.usage;
    const usageStr = usage
      ? `prompt/completion/total=${usage.prompt_tokens ?? 'n/a'}/${usage.completion_tokens ?? 'n/a'}/${usage.total_tokens ?? 'n/a'}`
      : 'prompt/completion/total=n/a/n/a/n/a';
    const reasoning = usage?.completion_tokens_details?.reasoning_tokens ?? 'n/a';
    console.warn(`[scorer] HTTP 200 (speaking) finish_reason=${finishReason} usage ${usageStr} reasoning=${reasoning}`);
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new AiRequestError(200, 'Meta Model API returned no content (speaking)');
    }
    return parseSpeakingBResult(content);
  } catch (e) {
    if (e instanceof AiRequestError || e instanceof AiNotConfiguredError) {
      throw e;
    }
    if (e instanceof Error && e.name === 'ScorerValidationError') {
      console.warn(`[scorer] HTTP 200 (speaking) schema mismatch: ${e.message}`);
      throw new AiRequestError(200, e.message);
    }
    const message = e instanceof Error ? e.message : 'Network request failed';
    console.warn(`[scorer] HTTP 0 (speaking) network failure: ${message}`);
    throw new AiRequestError(0, message);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Transcribe one WAV recording (mono 16-bit PCM 16/24 kHz) with
 * muse-voice-transcribe-1.0. Multipart parts follow docs exactly:
 * `request` (JSON) + `audio` (WAV). Failures throw AiRequestError
 * carrying the status and are always logged — never fully silent.
 */
export async function transcribeWav(uri: string): Promise<string> {
  if (!isAiConfigured()) {
    throw new AiNotConfiguredError();
  }
  const url = `${baseUrl()}${TRANSCRIBE_PATH}`;
  // Native multipart via expo-file-system: WinterCG fetch rejects both
  // web Blob and the legacy { uri, name, type } object, so neither ever
  // reaches the server. The recorder file goes straight from disk.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 120000);
  try {
    const result = await new File(uri).upload(url, {
      uploadType: UploadType.MULTIPART,
      fieldName: 'audio',
      mimeType: 'audio/wav',
      parameters: { request: JSON.stringify(buildTranscribeRequest()) },
      headers: { Authorization: `Bearer ${apiKey()}` },
      signal: ctrl.signal,
    });
    if (result.status < 200 || result.status >= 300) {
      console.warn(
        `[transcribe] ${TRANSCRIBE_MODEL} HTTP ${result.status} on ${TRANSCRIBE_PATH}: ${result.body.slice(0, 500)}`,
      );
      throw new AiRequestError(
        result.status,
        `Meta Model API ${result.status} on ${TRANSCRIBE_PATH}: ${result.body.slice(0, 200)}`,
      );
    }
    let data: unknown;
    try {
      data = JSON.parse(result.body) as unknown;
    } catch {
      console.warn(`[transcribe] HTTP ${result.status} non-JSON body: ${result.body.slice(0, 500)}`);
      throw new AiRequestError(result.status, 'Meta Model API returned non-JSON content');
    }
    return parseTranscribeResult(data);
  } catch (e) {
    if (e instanceof AiRequestError || e instanceof AiNotConfiguredError) {
      throw e;
    }
    if (e instanceof Error && e.name === 'TranscribeValidationError') {
      console.warn(`[transcribe] HTTP 200 without transcript: ${e.message}`);
      throw new AiRequestError(200, e.message);
    }
    const message = e instanceof Error ? e.message : 'Network request failed';
    console.warn(`[transcribe] HTTP 0 network failure: ${message}`);
    throw new AiRequestError(0, message);
  } finally {
    clearTimeout(timer);
  }
}

export interface DebateTurn {
  who: 'you' | 'ai';
  text: string;
}

const DEBATE_SYSTEM = [
  'You are the speaking partner in a TEF Canada Speaking section B role play, in French only.',
  'The candidate defends the 4-day work week to you, a hesitant colleague. You stay hesitant but open.',
  'Each reply is exactly ONE question or ONE objection, one or two short sentences, speakable aloud.',
  'Never argue for the candidate, never give answers, never correct language mid-flow.',
].join(' ');

/**
 * One AI partner turn (muse-spark-1.3, low reasoning). Full task consigne
 * plus every turn so far go in; the model returns one short French reply.
 */
export async function debateReply(consigne: string, turns: DebateTurn[]): Promise<string> {
  if (!isAiConfigured()) {
    throw new AiNotConfiguredError();
  }
  const url = `${baseUrl()}/chat/completions`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey()}` },
      body: JSON.stringify({
        model: SCORER_MODEL,
        reasoning_effort: 'low',
        temperature: 0.7,
        max_completion_tokens: 1000,
        messages: [
          { role: 'system', content: DEBATE_SYSTEM },
          { role: 'user', content: `Consigne: ${consigne}` },
          ...turns.map((t) => ({
            role: t.who === 'you' ? 'user' : 'assistant',
            content: t.text,
          })),
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn(`[debate] ${SCORER_MODEL} HTTP ${res.status} on /chat/completions: ${body.slice(0, 500)}`);
      throw new AiRequestError(res.status, `Meta Model API ${res.status} on /chat/completions`);
    }
    const data = (await res.json()) as ChatCompletion;
    // finish_reason lives in choices[0], usage at the top level of data,
    // reasoning_tokens inside usage.completion_tokens_details. Every read
    // is optional-chained with a fallback: a wrong position yields 'n/a',
    // never a crash.
    const finishReason = data.choices?.[0]?.finish_reason ?? 'unknown';
    const usage = data.usage;
    const usageStr = usage
      ? `prompt/completion/total=${usage.prompt_tokens ?? 'n/a'}/${usage.completion_tokens ?? 'n/a'}/${usage.total_tokens ?? 'n/a'}`
      : 'prompt/completion/total=n/a/n/a/n/a';
    const reasoning = usage?.completion_tokens_details?.reasoning_tokens ?? 'n/a';
    console.warn(`[debate] HTTP 200 finish_reason=${finishReason} usage ${usageStr} reasoning=${reasoning}`);
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new AiRequestError(
        200,
        `Meta Model API returned no content (finish_reason=${finishReason}, usage ${usageStr}, reasoning=${reasoning})`,
      );
    }
    return content;
  } catch (e) {
    if (e instanceof AiRequestError || e instanceof AiNotConfiguredError) {
      throw e;
    }
    const message = e instanceof Error ? e.message : 'Network request failed';
    console.warn(`[debate] HTTP 0 network failure: ${message}`);
    throw new AiRequestError(0, message);
  } finally {
    clearTimeout(timer);
  }
}
