export interface LinkVerdict {
  a: string;
  b: string;
  valid: boolean;
  type: string | null;
  reason: string;
}

export interface ChainState {
  start: string;
  end: string;
  words: string[];
  verdicts: LinkVerdict[];
}

export const RELATION_TYPES = [
  'compound',
  'kangaroo',
  'synonym',
  'rhyme',
  'opposite',
  'category-sibling',
  'part-whole',
  'object-role',
  'material',
  'verb-object',
  'collocation',
  'cause-effect',
  'cultural-pair',
  'slang',
  'double-meaning',
  'homophone',
  'containment',
  'anagram',
] as const;

export type RelationType = (typeof RELATION_TYPES)[number];

export interface DailyChallenge {
  start: string;
  end: string;
  date: string;
}
