import type { LinkVerdict } from './types';

function normalizeCacheWord(word: string): string {
	return word.toLowerCase().trim();
}

export function getValidationCacheKey(a: string, b: string): string {
	const [left, right] = [normalizeCacheWord(a), normalizeCacheWord(b)].sort((first, second) =>
		first.localeCompare(second)
	);

	return `lext:v2:${left}:${right}`;
}

export function reframeVerdictForPair(verdict: LinkVerdict, a: string, b: string): LinkVerdict {
	return {
		...verdict,
		a,
		b,
	};
}