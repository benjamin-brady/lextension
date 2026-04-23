import { describe, expect, test } from 'bun:test';

import { areAnagrams, findMatchingRhymeEnding, getCodeLinkVerdict } from './word-link-validation';

describe('areAnagrams', () => {
	test('accepts reordered letters', () => {
		expect(areAnagrams('lemon', 'melon')).toBe(true);
	});

	test('rejects identical words', () => {
		expect(areAnagrams('stone', 'stone')).toBe(false);
	});
});

describe('findMatchingRhymeEnding', () => {
	test('matches identical maintained endings', () => {
		expect(findMatchingRhymeEnding('wheel', 'steel')).toBe('eel/eel');
	});

	test('matches equivalent maintained endings', () => {
		expect(findMatchingRhymeEnding('tail', 'scale')).toBe('ail/ale');
	});

	test('returns null for endings that are not in the maintained list', () => {
		expect(findMatchingRhymeEnding('orange', 'door hinge')).toBeNull();
	});
});

describe('getCodeLinkVerdict', () => {
	test('returns an anagram verdict without the LLM', () => {
		expect(getCodeLinkVerdict('listen', 'silent')).toEqual({
			a: 'listen',
			b: 'silent',
			valid: true,
			type: 'anagram',
			reason: 'The words are anagrams of each other.',
		});
	});

	test('returns a rhyme verdict for maintained endings', () => {
		expect(getCodeLinkVerdict('wheel', 'steel')).toEqual({
			a: 'wheel',
			b: 'steel',
			valid: true,
			type: 'rhyme',
			reason: 'Both words match the maintained rhyme ending pattern eel/eel.',
		});
	});

	test('returns null when code checks cannot decide the link', () => {
		expect(getCodeLinkVerdict('stone', 'cloud')).toBeNull();
	});
});
