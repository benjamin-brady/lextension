import type { LinkVerdict } from '$lib/types';

export const RHYME_ENDING_GROUPS = [
	['ight', 'ite'],
	['ail', 'ale'],
	['ain', 'ane'],
	['ise', 'ize'],
	['ime', 'yme'],
	['eel'],
	['old'],
	['one'],
	['oon'],
] as const;

function normalizeLetters(word: string): string {
	return word.toLowerCase().replace(/[^a-z]/g, '');
}

export function areAnagrams(a: string, b: string): boolean {
	const left = normalizeLetters(a);
	const right = normalizeLetters(b);

	if (left.length < 2 || left.length !== right.length || left === right) {
		return false;
	}

	return [...left].sort().join('') === [...right].sort().join('');
}

export function findMatchingRhymeEnding(a: string, b: string): string | null {
	const left = normalizeLetters(a);
	const right = normalizeLetters(b);

	for (const group of RHYME_ENDING_GROUPS) {
		const leftEnding = group.find((ending) => left.endsWith(ending));
		if (!leftEnding) {
			continue;
		}

		const rightEnding = group.find((ending) => right.endsWith(ending));
		if (rightEnding) {
			return `${leftEnding}/${rightEnding}`;
		}
	}

	return null;
}

export function getCodeLinkVerdict(a: string, b: string): LinkVerdict | null {
	if (areAnagrams(a, b)) {
		return {
			a,
			b,
			valid: true,
			type: 'anagram',
			reason: 'The words are anagrams of each other.',
		};
	}

	const rhymeEnding = findMatchingRhymeEnding(a, b);
	if (rhymeEnding) {
		return {
			a,
			b,
			valid: true,
			type: 'rhyme',
			reason: `Both words match the maintained rhyme ending pattern ${rhymeEnding}.`,
		};
	}

	return null;
}
