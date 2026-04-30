import { describe, expect, test } from 'bun:test';

import { areAnagrams, findMatchingRhymeEnding, getCodeLinkVerdict } from './word-link-validation';

const ANAGRAM_CASES = [
	{ name: 'accepts reordered letters', left: 'lemon', right: 'melon', expected: true },
	{ name: 'rejects identical words', left: 'stone', right: 'stone', expected: false },
] as const;

const RHYME_ENDING_CASES = [
	{ name: 'matches identical pronunciations', left: 'wheel', right: 'steel', expected: 'IY1 L' },
	{ name: 'matches equivalent pronunciations even when spelling differs', left: 'tail', right: 'scale', expected: 'EY1 L' },
	{ name: 'matches straightforward spelling variants like tail and tale', left: 'tail', right: 'tale', expected: 'EY1 L' },
	{ name: 'converts missing UK spellings before pronunciation lookup', left: 'litre', right: 'cheater', expected: 'IY1 T ER0' },
	{ name: 'converts analyse before pronunciation lookup', left: 'analyse', right: 'sunrise', expected: 'AY2 Z' },
	{ name: 'converts organise before pronunciation lookup', left: 'organise', right: 'sunrise', expected: 'AY2 Z' },
] as const;

const RHYME_ENDING_NULL_CASES = [
	{ name: 'rejects spelling matches that do not actually rhyme', left: 'capital', right: 'vital' },
	{ name: 'rejects similar vowel sounds with different final consonants', left: 'queen', right: 'regime' },
	{ name: 'returns null for endings that are not in the maintained list', left: 'orange', right: 'door hinge' },
] as const;

const VERDICT_CASES = [
	{
		name: 'returns a kangaroo verdict for a curated joey synonym pair',
		left: 'alone',
		right: 'lone',
		expected: {
			a: 'alone',
			b: 'lone',
			valid: true,
			type: 'kangaroo',
			reason: 'Lone is a joey synonym whose letters appear in order inside alone.',
		},
	},
	{
		name: 'returns a kangaroo verdict when the joey word is entered first',
		left: 'stun',
		right: 'astound',
		expected: {
			a: 'stun',
			b: 'astound',
			valid: true,
			type: 'kangaroo',
			reason: 'Stun is a joey synonym whose letters appear in order inside astound.',
		},
	},
	{
		name: 'returns an anagram verdict without the LLM',
		left: 'listen',
		right: 'silent',
		expected: {
			a: 'listen',
			b: 'silent',
			valid: true,
			type: 'anagram',
			reason: 'The words are anagrams of each other.',
		},
	},
	{
		name: 'returns a rhyme verdict for pronunciation matches',
		left: 'wheel',
		right: 'steel',
		expected: {
			a: 'wheel',
			b: 'steel',
			valid: true,
			type: 'rhyme',
			reason: 'Both words share the pronunciation ending IY1 L.',
		},
	},
	{
		name: 'returns a rhyme verdict for tail and tale',
		left: 'tail',
		right: 'tale',
		expected: {
			a: 'tail',
			b: 'tale',
			valid: true,
			type: 'rhyme',
			reason: 'Both words share the pronunciation ending EY1 L.',
		},
	},
	{
		name: 'returns a rhyme verdict for UK spellings after conversion',
		left: 'litre',
		right: 'cheater',
		expected: {
			a: 'litre',
			b: 'cheater',
			valid: true,
			type: 'rhyme',
			reason: 'Both words share the pronunciation ending IY1 T ER0.',
		},
	},
	{
		name: 'still falls back to maintained endings when the dictionary cannot help',
		left: 'wheel',
		right: 'zheel',
		expected: {
			a: 'wheel',
			b: 'zheel',
			valid: true,
			type: 'rhyme',
			reason: 'Both words match the maintained rhyme ending pattern eel/eel.',
		},
	},
] as const;

const NULL_VERDICT_CASES = [
	{ name: 'returns null when code checks cannot decide the link', left: 'stone', right: 'cloud' },
	{ name: 'does not return a rhyme verdict for queen and regime', left: 'queen', right: 'regime' },
	{ name: 'does not accept structural kangaroo pairs without a curated synonym', left: 'cart', right: 'cat' },
] as const;

describe('areAnagrams', () => {
	for (const { name, left, right, expected } of ANAGRAM_CASES) {
		test(name, () => {
			expect(areAnagrams(left, right)).toBe(expected);
		});
	}
});

describe('findMatchingRhymeEnding', () => {
	for (const { name, left, right, expected } of RHYME_ENDING_CASES) {
		test(name, () => {
			expect(findMatchingRhymeEnding(left, right)).toBe(expected);
		});
	}

	for (const { name, left, right } of RHYME_ENDING_NULL_CASES) {
		test(name, () => {
			expect(findMatchingRhymeEnding(left, right)).toBeNull();
		});
	}
});

describe('getCodeLinkVerdict', () => {
	for (const { name, left, right, expected } of VERDICT_CASES) {
		test(name, () => {
			expect(getCodeLinkVerdict(left, right)).toEqual(expected);
		});
	}

	for (const { name, left, right } of NULL_VERDICT_CASES) {
		test(name, () => {
			expect(getCodeLinkVerdict(left, right)).toBeNull();
		});
	}
});
