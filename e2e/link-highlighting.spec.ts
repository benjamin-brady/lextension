import { expect, test } from '@playwright/test';

const GREEN = 'rgb(34, 204, 85)';
const RED = 'rgb(239, 68, 68)';

const solvedWords = ['Tea', 'Party', 'Floor', 'Tree', 'Line', 'Dance', 'Top', 'Up', 'Step'];

function seedBoard(words: string[], checks = 1) {
	return JSON.stringify({
		grid: words,
		inventory: [],
		checks,
		cellChecked: Array(words.length).fill(true),
		checkedSnapshot: words
	});
}

test('solved hard puzzle highlights every rendered link green', async ({ page }) => {
	await page.addInitScript((seed) => {
		window.localStorage.setItem('simicle-game-practice-hard-1', seed);
	}, seedBoard(solvedWords, 13));

	await page.goto('/practice/hard/1');

	expect(await page.getByText('Solved!').isVisible()).toBe(true);
	await expect(page.getByText('12/12').last()).toBeVisible();

	const strokes = await page.locator('svg line').evaluateAll((lines) =>
		lines.map((line) => window.getComputedStyle(line).stroke)
	);

	expect(strokes).toHaveLength(12);
	expect(strokes).toEqual(Array(12).fill(GREEN));
});

test('swapped words must not show false green edges', async ({ page }) => {
	// Swap Tea (pos 0) and Top (pos 6). Both "Tea-Tree" and "Top-Tree"
	// are valid pairs from other positions, so the current bug would
	// falsely highlight edges 0-3 and 3-6 as green.
	const swappedWords = ['Top', 'Party', 'Floor', 'Tree', 'Line', 'Dance', 'Tea', 'Up', 'Step'];

	await page.addInitScript((seed) => {
		window.localStorage.setItem('simicle-game-practice-hard-1', seed);
	}, seedBoard(swappedWords));

	await page.goto('/practice/hard/1');
	await page.locator('svg line').first().waitFor({ state: 'attached' });

	// Adjacencies in SVG render order (matches ADJACENCIES constant):
	// [0,1], [1,2], [3,4], [4,5], [6,7], [7,8],
	// [0,3], [1,4], [2,5], [3,6], [4,7], [5,8]
	//
	// Position 0 is wrong (Top instead of Tea)  → edges 0-1, 0-3 are wrong
	// Position 6 is wrong (Tea instead of Top)  → edges 6-7, 3-6 are wrong
	// All other positions are correct.
	const expectedColors = [
		RED,   // 0-1: wrong (pos 0 wrong)
		GREEN, // 1-2: both correct
		GREEN, // 3-4: both correct
		GREEN, // 4-5: both correct
		RED,   // 6-7: wrong (pos 6 wrong)
		GREEN, // 7-8: both correct
		RED,   // 0-3: wrong (pos 0 wrong)
		GREEN, // 1-4: both correct
		GREEN, // 2-5: both correct
		RED,   // 3-6: wrong (pos 6 wrong)
		GREEN, // 4-7: both correct
		GREEN, // 5-8: both correct
	];

	const strokes = await page.locator('svg line').evaluateAll((lines) =>
		lines.map((line) => window.getComputedStyle(line).stroke)
	);

	expect(strokes).toHaveLength(12);
	expect(strokes).toEqual(expectedColors);

	// The links counter must agree with the visual count
	await expect(page.getByText('8/12').last()).toBeVisible();
});