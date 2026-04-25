import { describe, expect, test } from 'bun:test';

import { ensureDaily } from './daily';
import { isRejectedChainPuzzle } from '$lib/daily-chain-catalog';

interface D1Call {
	sql: string;
	binds: unknown[];
}

function createFakeD1WithStoredChainRow(row: readonly unknown[]): { d1: D1Database; calls: D1Call[] } {
	const calls: D1Call[] = [];

	const d1 = {
		prepare(sql: string) {
			const call: D1Call = { sql, binds: [] };
			calls.push(call);

			return {
				bind(...binds: unknown[]) {
					call.binds = binds;
					return this;
				},
				async raw() {
					return [row];
				},
				async run() {
					return { success: true, meta: {} };
				},
			};
		},
	} as unknown as D1Database;

	return { d1, calls };
}

describe('ensureDaily', () => {
	test('repairs a stored chain puzzle that has been rejected as too easy', async () => {
		const { d1, calls } = createFakeD1WithStoredChainRow([
			1,
			'2026-04-25',
			'chain',
			'Snake',
			null,
			'Dragon',
			Date.now(),
		]);

		const daily = await ensureDaily(d1, '2026-04-25', 'chain');
		const updateCall = calls.find((call) => call.sql.startsWith('update "daily_puzzles"'));

		expect(daily.mode).toBe('chain');
		if (daily.mode !== 'chain') throw new Error('Expected a chain daily');
		expect(daily.date).toBe('2026-04-25');
		expect(isRejectedChainPuzzle(daily.start, daily.end)).toBe(false);
		expect(daily).not.toMatchObject({ start: 'Snake', end: 'Dragon' });

		expect(updateCall).toBeDefined();
		expect(updateCall?.binds.at(0)).toBe(daily.start);
		expect(updateCall?.binds.at(1)).toBeNull();
		expect(updateCall?.binds.at(2)).toBe(daily.end);
		expect(updateCall?.binds.at(3)).toBe(1);
	});
});