import { dictionary } from 'cmu-pronouncing-dictionary';
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

const KANGAROO_PAIRS = [
	{ host: 'alone', joey: 'lone' },
	{ host: 'astound', joey: 'stun' },
	{ host: 'observe', joey: 'see' },
	{ host: 'encourage', joey: 'urge' },
	{ host: 'masculine', joey: 'male' },
] as const;

const PRONUNCIATION_VARIANT_SUFFIX = /\(\d+\)$/;
const STRESSED_VOWEL_PATTERN = /[12]$/;
const UK_TO_US_SPELLING_RULES: ReadonlyArray<readonly [RegExp, string]> = [
	[/isations$/g, 'izations'],
	[/isation$/g, 'ization'],
	[/isers$/g, 'izers'],
	[/iser$/g, 'izer'],
	[/ised$/g, 'ized'],
	[/ises$/g, 'izes'],
	[/ising$/g, 'izing'],
	[/ise$/g, 'ize'],
	[/ysers$/g, 'yzers'],
	[/yser$/g, 'yzer'],
	[/ysed$/g, 'yzed'],
	[/yses$/g, 'yzes'],
	[/ysing$/g, 'yzing'],
	[/yse$/g, 'yze'],
	[/ogues$/g, 'ogs'],
	[/ogue$/g, 'og'],
	[/ours$/g, 'ors'],
	[/our$/g, 'or'],
	[/res$/g, 'ers'],
	[/re$/g, 'er'],
];

const PRONUNCIATIONS_BY_WORD = Object.entries(dictionary).reduce<Map<string, string[]>>((index, [rawWord, pronunciation]) => {
	const word = rawWord.replace(PRONUNCIATION_VARIANT_SUFFIX, '');
	const existing = index.get(word);

	if (existing) {
		existing.push(pronunciation);
	} else {
		index.set(word, [pronunciation]);
	}

	return index;
}, new Map());

function normalizeLetters(word: string): string {
	return word.toLowerCase().replace(/[^a-z]/g, '');
}

export function containsLettersInOrder(host: string, joey: string): boolean {
	const normalizedHost = normalizeLetters(host);
	const normalizedJoey = normalizeLetters(joey);

	if (normalizedHost.length <= normalizedJoey.length || normalizedJoey.length < 2) {
		return false;
	}

	let joeyIndex = 0;
	for (const letter of normalizedHost) {
		if (letter === normalizedJoey[joeyIndex]) {
			joeyIndex += 1;
			if (joeyIndex === normalizedJoey.length) {
				return true;
			}
		}
	}

	return false;
}

function findCuratedKangarooPair(a: string, b: string): { host: string; joey: string } | null {
	const left = normalizeLetters(a);
	const right = normalizeLetters(b);

	for (const pair of KANGAROO_PAIRS) {
		if (
			((left === pair.host && right === pair.joey) || (left === pair.joey && right === pair.host)) &&
			containsLettersInOrder(pair.host, pair.joey)
		) {
			return pair;
		}
	}

	return null;
}

function getPronunciationLookupKeys(word: string): string[] {
	const variants = new Set<string>();
	const pending: string[] = [word.toLowerCase(), normalizeLetters(word)];

	while (pending.length > 0) {
		const current: string | undefined = pending.pop();
		if (current === undefined || variants.has(current)) {
			continue;
		}

		variants.add(current);

		for (const [pattern, replacement] of UK_TO_US_SPELLING_RULES) {
			const converted: string = current.replace(pattern, replacement);
			if (converted !== current) {
				pending.push(converted);
			}
		}
	}

	return [...variants];
}

function getPronunciations(word: string): string[] {
	const pronunciations = new Set<string>();

	for (const key of getPronunciationLookupKeys(word)) {
		for (const pronunciation of PRONUNCIATIONS_BY_WORD.get(key) ?? []) {
			pronunciations.add(pronunciation);
		}
	}

	return [...pronunciations];
}

function getRhymingPart(pronunciation: string): string | null {
	const phonemes = pronunciation.split(' ');

	for (let index = phonemes.length - 1; index >= 0; index -= 1) {
		if (STRESSED_VOWEL_PATTERN.test(phonemes[index])) {
			return phonemes.slice(index).join(' ');
		}
	}

	return null;
}

function findMatchingPronunciationRhyme(a: string, b: string): string | null {
	const leftRhymes = new Set(
		getPronunciations(a)
			.map(getRhymingPart)
			.filter((rhyme): rhyme is string => rhyme !== null)
	);

	for (const pronunciation of getPronunciations(b)) {
		const rhyme = getRhymingPart(pronunciation);
		if (rhyme && leftRhymes.has(rhyme)) {
			return rhyme;
		}
	}

	return null;
}

function findMatchingMaintainedRhymeEnding(a: string, b: string): string | null {
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

export function areAnagrams(a: string, b: string): boolean {
	const left = normalizeLetters(a);
	const right = normalizeLetters(b);

	if (left.length < 2 || left.length !== right.length || left === right) {
		return false;
	}

	return [...left].sort().join('') === [...right].sort().join('');
}

export function findMatchingRhymeEnding(a: string, b: string): string | null {
	return findMatchingPronunciationRhyme(a, b) ?? findMatchingMaintainedRhymeEnding(a, b);
}

export function getCodeLinkVerdict(a: string, b: string): LinkVerdict | null {
	const kangarooPair = findCuratedKangarooPair(a, b);
	if (kangarooPair) {
		const host = kangarooPair.host;
		const joey = kangarooPair.joey;
		return {
			a,
			b,
			valid: true,
			type: 'kangaroo',
			reason: `${joey[0].toUpperCase()}${joey.slice(1)} is a joey synonym whose letters appear in order inside ${host}.`,
		};
	}

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
		const usedPronunciationDictionary = rhymeEnding.includes(' ');
		return {
			a,
			b,
			valid: true,
			type: 'rhyme',
			reason: usedPronunciationDictionary
				? `Both words share the pronunciation ending ${rhymeEnding}.`
				: `Both words match the maintained rhyme ending pattern ${rhymeEnding}.`,
		};
	}

	return null;
}
