import type { FeedbackStub } from '@/content/feedbackStub';

/**
 * Pure scorer module: prompt + response_format + validation for the
 * Writing section B grader. Dependency-free (type-only imports), so the
 * same builder runs in the app and in the /tmp calibration probe —
 * one definition, no drift.
 *
 * Wire shape mirrors docs/contest/feedback.schema.json (writing, B).
 * The model returns levels only; NCLC and /450 come from
 * config/scoring.ts on the app side (rubric.md section 2).
 */

export const SCORER_MODEL = 'muse-spark-1.3';

/** The seven Writing criteria, in schema order. */
export const WRITING_B_CRITERION_IDS = [
  'situation',
  'organisation',
  'clarity',
  'development',
  'lexicon',
  'syntax',
  'spelling',
] as const;

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const HALF_OK: Record<string, readonly string[]> = {
  A1: ['none'],
  A2: ['none'],
  B1: ['lower', 'upper'],
  B2: ['lower', 'upper'],
  C1: ['lower', 'upper'],
  C2: ['none'],
};

const SYSTEM_PROMPT = [
  'You grade TEF Canada Writing section B (a letter to the newspaper defending a point of view).',
  'Grade holistically like the official grid: one CEFR level per criterion below, then one overall level.',
  'Criteria: situation (task respected, register), organisation (paragraphs, links), clarity (easy to follow),',
  'development (arguments with examples), lexicon (range, precision), syntax (complex sentences, agreements),',
  'spelling (accents, agreements, common words).',
  'Rules: comments in English (1-2 sentences, specific to this text); every quote, correction and rewrite in French,',
  'copied from or applied to the learner text; corrections sorted by importance, max 15; 2-5 betterPhrasing rewrites;',
  '1-3 strengths and 1-3 nextSteps. The overall level must lie between the lowest and highest assessed criterion level.',
  'half is lower/upper only for B1, B2, C1, otherwise none.',
].join(' ');

/** response_format value for Chat Completions structured output. */
export const SCORER_RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: 'writing_b_feedback',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: [
        'schemaVersion',
        'skill',
        'section',
        'criteria',
        'overall',
        'corrections',
        'betterPhrasing',
        'strengths',
        'nextSteps',
      ],
      properties: {
        schemaVersion: { type: 'string' },
        skill: { type: 'string', enum: ['writing'] },
        section: { type: 'string', enum: ['B'] },
        criteria: {
          type: 'array',
          minItems: 7,
          maxItems: 7,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'assessed', 'comment'],
            properties: {
              id: { type: 'string', enum: [...WRITING_B_CRITERION_IDS] },
              assessed: { type: 'boolean' },
              level: { type: 'string', enum: [...CEFR_ORDER] },
              comment: { type: 'string' },
              evidence: { type: 'array', items: { type: 'string' }, maxItems: 3 },
            },
          },
        },
        overall: {
          type: 'object',
          additionalProperties: false,
          required: ['level', 'half'],
          properties: {
            level: { type: 'string', enum: [...CEFR_ORDER] },
            half: { type: 'string', enum: ['lower', 'upper', 'none'] },
          },
        },
        corrections: {
          type: 'array',
          maxItems: 15,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['original', 'corrected', 'type', 'explanation'],
            properties: {
              original: { type: 'string' },
              corrected: { type: 'string' },
              type: {
                type: 'string',
                enum: ['grammar', 'vocabulary', 'spelling', 'punctuation', 'register'],
              },
              explanation: { type: 'string' },
            },
          },
        },
        betterPhrasing: {
          type: 'array',
          minItems: 2,
          maxItems: 5,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['original', 'suggestion', 'why'],
            properties: {
              original: { type: 'string' },
              suggestion: { type: 'string' },
              why: { type: 'string' },
            },
          },
        },
        strengths: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'string' } },
        nextSteps: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'string' } },
      },
    },
  },
};

export function buildWritingBRequest(
  consigne: string,
  text: string,
): Record<string, unknown> {
  return {
    model: SCORER_MODEL,
    temperature: 0,
    // Grading needs judgment, not deep chains: low reasoning keeps the
    // trace small so the 8k budget is spent on the JSON itself.
    // (Default effort once ate 4094/4096 tokens in reasoning and left
    // finish_reason=length with null content — probe 2026-10-29.)
    reasoning_effort: 'low',
    max_completion_tokens: 8192,
    response_format: SCORER_RESPONSE_FORMAT,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Consigne (French): ${consigne}\n\nLearner text (French):\n${text}`,
      },
    ],
  };
}

export class ScorerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScorerValidationError';
  }
}

/** Parse one completion content string into a FeedbackStub; throws on mismatch. */
export function parseWritingBResult(content: string): FeedbackStub {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(content) as Record<string, unknown>;
  } catch {
    throw new ScorerValidationError('Scorer returned non-JSON content.');
  }
  if (raw.skill !== 'writing' || raw.section !== 'B') {
    throw new ScorerValidationError('Scorer returned the wrong skill/section.');
  }
  const criteria = raw.criteria;
  if (!Array.isArray(criteria) || criteria.length !== WRITING_B_CRITERION_IDS.length) {
    throw new ScorerValidationError(
      `Expected ${WRITING_B_CRITERION_IDS.length} criteria, got ${Array.isArray(criteria) ? criteria.length : 'none'}.`,
    );
  }
  const seen = new Set<string>();
  const assessedLevels: string[] = [];
  for (const c of criteria) {
    const row = c as { id?: unknown; assessed?: unknown; level?: unknown };
    if (typeof row.id !== 'string' || !WRITING_B_CRITERION_IDS.includes(row.id as never)) {
      throw new ScorerValidationError(`Unknown criterion id: ${String(row.id)}.`);
    }
    if (seen.has(row.id)) {
      throw new ScorerValidationError(`Duplicate criterion id: ${row.id}.`);
    }
    seen.add(row.id);
    if (row.assessed === true) {
      if (typeof row.level !== 'string' || !CEFR_ORDER.includes(row.level as never)) {
        throw new ScorerValidationError(`Bad level for ${row.id}.`);
      }
      assessedLevels.push(row.level);
    }
  }
  const overall = raw.overall as { level?: unknown; half?: unknown } | undefined;
  if (
    !overall ||
    typeof overall.level !== 'string' ||
    !CEFR_ORDER.includes(overall.level as never) ||
    typeof overall.half !== 'string' ||
    !HALF_OK[overall.level]?.includes(overall.half)
  ) {
    throw new ScorerValidationError('Bad overall level/half.');
  }
  if (assessedLevels.length > 0) {
    const rank = (l: string): number => CEFR_ORDER.indexOf(l as never);
    const lo = Math.min(...assessedLevels.map(rank));
    const hi = Math.max(...assessedLevels.map(rank));
    const r = rank(overall.level);
    if (r < lo || r > hi) {
      throw new ScorerValidationError(
        `Overall ${overall.level} outside assessed range.`,
      );
    }
  }
  return raw as unknown as FeedbackStub;
}
