/**
 * Stage 0 stub shaped like docs/contest/feedback.schema.json.
 * Stage 1 replaces this stub with the real Muse Spark scorer output.
 * Comments are English; quotes and corrections are French.
 */

export interface CriterionScore {
  id: string;
  level: string;
  comment: string;
  evidence: string[];
}

export interface FeedbackStub {
  overall: { level: string; half: 'lower' | 'upper' | 'none' };
  criteria: CriterionScore[];
  corrections: { original: string; corrected: string; type: string; explanation: string }[];
  strengths: string[];
  nextSteps: string[];
}

export const WRITING_B_STUB: FeedbackStub = {
  overall: { level: 'B1', half: 'upper' },
  criteria: [
    {
      id: 'situation',
      level: 'B2',
      comment: 'A clear letter to the newspaper that takes a position and keeps it.',
      evidence: ['Je suis tout à fait opposé à cette mesure'],
    },
    {
      id: 'organisation',
      level: 'B1',
      comment: 'Paragraphs are there, but the arguments follow each other without links.',
      evidence: ['Ensuite, les transports.'],
    },
    {
      id: 'development',
      level: 'B1',
      comment: 'Three arguments, but only the first has an example.',
      evidence: ['Par exemple, ma voisine doit prendre deux bus'],
    },
  ],
  corrections: [
    {
      original: 'il faut que nous prenons',
      corrected: 'il faut que nous prenions',
      type: 'grammar',
      explanation: "'Il faut que' takes the subjunctive.",
    },
  ],
  strengths: ['A clear position from the first line.'],
  nextSteps: ["Give each argument an example.", "Link arguments with 'par ailleurs'."],
};

export const SPEAKING_B_STUB: FeedbackStub = {
  overall: { level: 'B2', half: 'lower' },
  criteria: [
    {
      id: 'presentation',
      level: 'B2',
      comment: 'Clear presentation with the key details of the document.',
      evidence: ['un parc avec des concerts gratuits'],
    },
    {
      id: 'argumentation',
      level: 'B1',
      comment: 'Several arguments, little developed so far.',
      evidence: ['ce serait bien pour les enfants'],
    },
  ],
  corrections: [],
  strengths: ['Keeps a natural exchange going.'],
  nextSteps: ['Answer each objection with an example.'],
};
