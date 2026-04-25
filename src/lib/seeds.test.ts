import { describe, expect, test } from 'bun:test';

import { CHAIN_DAILY_PUZZLES, isRejectedChainPuzzle } from './daily-chain-catalog';
import { pickChainPuzzle } from './seeds';
import { getCodeLinkVerdict } from './word-link-validation';

describe('daily chain puzzle catalog', () => {
	test('contains a few hundred vetted normal-mode puzzles', () => {
		expect(CHAIN_DAILY_PUZZLES.length).toBeGreaterThanOrEqual(240);
	});

	test('contains only complete sample routes with at least two added words', () => {
		for (const puzzle of CHAIN_DAILY_PUZZLES) {
			expect(puzzle.samplePath[0]).toBe(puzzle.start);
			expect(puzzle.samplePath.at(-1)).toBe(puzzle.end);
			expect(puzzle.samplePath.length).toBeGreaterThanOrEqual(4);
			expect(new Set(puzzle.samplePath.map((word) => word.toLowerCase())).size).toBe(puzzle.samplePath.length);
		}
	});

	test('does not include duplicate start/end pairs or code-obvious direct links', () => {
		const seen = new Set<string>();

		for (const puzzle of CHAIN_DAILY_PUZZLES) {
			const key = `${puzzle.start.toLowerCase()}->${puzzle.end.toLowerCase()}`;
			expect(seen.has(key)).toBe(false);
			seen.add(key);

			expect(getCodeLinkVerdict(puzzle.start, puzzle.end)).toBeNull();
		}
	});

	test('does not serve the reported zero-hop snake to dragon daily', () => {
		expect(pickChainPuzzle('2026-04-25')).not.toEqual({ start: 'Snake', end: 'Dragon' });
	});

	test('marks reported collapsed dailies as rejected for stored-row repair', () => {
		expect(isRejectedChainPuzzle('Snake', 'Dragon')).toBe(true);
		expect(isRejectedChainPuzzle('snake', 'dragon')).toBe(true);

		for (const puzzle of CHAIN_DAILY_PUZZLES) {
			expect(isRejectedChainPuzzle(puzzle.start, puzzle.end)).toBe(false);
		}
	});
});