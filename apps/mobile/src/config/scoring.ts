/**
 * Scoring config. Numbers come from docs/exam-format.md (TEF Canada NCLC
 * table) and rubric.md section 2. Never hardcode score bands in UI code —
 * always derive them through estimationFor() below.
 */

export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Half = 'lower' | 'upper' | 'none';

export interface Estimation {
  nclc: string;
  min: number;
  max: number;
}

type BandKey = `${Cefr}:${Half}`;

const TABLE: Partial<Record<BandKey, Estimation>> = {
  'A1:none': { nclc: '1–3', min: 0, max: 180 },
  'A2:none': { nclc: '4', min: 181, max: 225 },
  'B1:lower': { nclc: '5', min: 226, max: 270 },
  'B1:upper': { nclc: '6', min: 271, max: 309 },
  'B2:lower': { nclc: '7', min: 310, max: 348 },
  'B2:upper': { nclc: '8', min: 349, max: 370 },
  'C1:lower': { nclc: '9', min: 371, max: 392 },
  'C1:upper': { nclc: '10', min: 393, max: 415 },
  'C2:none': { nclc: '11–12', min: 416, max: 450 },
};

export function estimationFor(level: Cefr, half: Half): Estimation {
  const band = TABLE[`${level}:${half}`];
  if (!band) {
    throw new Error(`No score band for ${level}/${half}`);
  }
  return band;
}

/** Screen label. Always a range, never an exact score. */
export function estimationLabel(level: Cefr, half: Half): string {
  const band = estimationFor(level, half);
  return `Estimation · NCLC ${band.nclc} · ${band.min}–${band.max} / 450`;
}

export const WORD_FLOOR: Record<'A' | 'B', number> = { A: 80, B: 200 };

export function countWords(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return text.trim() === '' ? 0 : words.length;
}
