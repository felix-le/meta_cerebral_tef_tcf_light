/**
 * Pure transcribe module: request shape + transcript parsing for
 * muse-voice-transcribe-1.0. Dependency-free (no imports), so the same
 * builder runs in the app and in the /tmp probe — one definition.
 *
 * Wire shape follows docs (dev.meta.ai/docs/speech-to-text) exactly:
 * multipart parts are `request` (JSON) and `audio` (WAV file); the JSON
 * response carries the text in top-level `transcript` (turns[] is empty
 * in PUSH_TO_TALK). No invented field names.
 */

export const TRANSCRIBE_MODEL = 'muse-voice-transcribe-1.0';
export const TRANSCRIBE_PATH = '/asr/transcribe';

export interface TranscribeRequestJson {
  mode: 'PUSH_TO_TALK';
  model: string;
  audioEncoding: 'WAV';
  languageBias: string[];
}

export function buildTranscribeRequest(): TranscribeRequestJson {
  return {
    mode: 'PUSH_TO_TALK',
    model: TRANSCRIBE_MODEL,
    audioEncoding: 'WAV',
    languageBias: ['French'],
  };
}

export class TranscribeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranscribeValidationError';
  }
}

/** Read the docs-defined top-level `transcript` field; throws on mismatch. */
export function parseTranscribeResult(json: unknown): string {
  if (typeof json !== 'object' || json === null) {
    throw new TranscribeValidationError('Transcribe returned non-JSON content.');
  }
  const t = (json as Record<string, unknown>).transcript;
  if (typeof t !== 'string' || t.trim() === '') {
    throw new TranscribeValidationError('Transcribe response has no transcript field.');
  }
  return t;
}
