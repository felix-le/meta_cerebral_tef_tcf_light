/**
 * Prépa TEF TCF brand tokens (locked 2026-10-27, clarified 2026-10-28).
 * Tile backgrounds follow this table (Speaking = plum, Writing = gold).
 * Skill colours are a SEPARATE system: icon / ring / dot accent only,
 * never a tile background and never a CTA background.
 */

export const Brand = {
  plum: '#6A2A5F',
  gold: '#F9BD48',
  ink: '#2E1A3B',
  muted: '#5E4E69',
  lilac: '#EFE3EC',
  mist: '#F8F3F7',
  paper: '#FFFFFF',
} as const;

export const SkillAccent = {
  listening: '#4A7FE5',
  reading: '#1A9E94',
  speaking: '#8B62E0',
  writing: '#D4860F',
} as const;

export const StatusColor = {
  ok: '#1E7F43',
  bad: '#C0392B',
} as const;

export const FontFamily = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansBold: 'Inter_700Bold',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  serif: 'Georgia',
} as const;

export type Skill = 'listening' | 'reading' | 'speaking' | 'writing';

// Design skill order (Speaking before Writing, as in every design screen).
export const SKILL_ORDER: Skill[] = ['listening', 'reading', 'speaking', 'writing'];

export const SKILL_LABEL: Record<Skill, string> = {
  listening: 'Listening',
  reading: 'Reading',
  speaking: 'Speaking',
  writing: 'Writing',
};

// Dark skill variants for small text on light surfaces (design Home rail).
export const SKILL_DARK: Record<Skill, string> = {
  listening: '#2952A3',
  reading: '#0F6B65',
  speaking: '#5535A8',
  writing: '#966010',
};

// Deep skill variants for gradient tile ends (design detail skill tiles).
export const SKILL_DEEP: Record<Skill, string> = {
  listening: '#2F5FC0',
  reading: '#0E766E',
  speaking: '#6A3FC0',
  writing: '#A86200',
};
