import { PersistedState } from 'runed';

import type { EdgeStatus, NodeStatus, Puzzle, WordItem } from './types';

interface SavedState {
	grid: (string | null)[];
	inventory: string[];
	checks: number;
	cellChecked: boolean[];
	checkedSnapshot: (string | null)[];
}

// Bump this when the saved-state schema changes or we want to invalidate all
// existing browser saves (alpha, so we can freely discard).
const STORAGE_VERSION = 'v2';

function storageKey(storageId: string): string {
	return `simicle-game-${STORAGE_VERSION}-${storageId}`;
}

function freshState(puzzle: Puzzle): SavedState {
	return {
		grid: Array(9).fill(null),
		inventory: shuffleArray(puzzle.solution.map((w) => w.word)),
		checks: 0,
		cellChecked: Array(9).fill(false),
		checkedSnapshot: Array(9).fill(null),
	};
}

/**
 * Reactive game state backed by `runed`'s `PersistedState`. Saves to
 * localStorage and syncs across browser tabs automatically.
 */
export function createGameState(puzzle: Puzzle, storageId: string) {
	const wordLookup = Object.fromEntries(puzzle.solution.map((w) => [w.word, w]));
	const validLinks = new Set(
		puzzle.edges.map(({ from, to }) => {
			const a = puzzle.solution[from].word;
			const b = puzzle.solution[to].word;
			return [a, b].sort().join('::');
		})
	);

	const persisted = new PersistedState<SavedState>(storageKey(storageId), freshState(puzzle));

	// Session-only undo stack. Snapshots are taken before each move mutation.
	// History is cleared on check (checks cannot be undone) and on reset.
	type Snapshot = { grid: (string | null)[]; inventory: string[] };
	let history = $state<Snapshot[]>([]);
	const MAX_HISTORY = 50;

	function snapshot(): Snapshot {
		return {
			grid: [...persisted.current.grid],
			inventory: [...persisted.current.inventory],
		};
	}

	function pushHistory() {
		history.push(snapshot());
		if (history.length > MAX_HISTORY) history.shift();
	}

	// Discard stale saves that reference words no longer in this puzzle (e.g. after a puzzle
	// regeneration under the same storageId). Otherwise the grid and inventory would reference
	// unknown words and the board would appear empty.
	{
		const s = persisted.current;
		const allWordsKnown = [...s.grid, ...s.inventory].every(
			(w) => w == null || w in wordLookup
		);
		if (!allWordsKnown) {
			persisted.current = freshState(puzzle);
		}
	}

	const grid = $derived(
		persisted.current.grid.map((w) => (w ? wordLookup[w] ?? null : null))
	);
	const inventory = $derived(
		persisted.current.inventory
			.map((w) => wordLookup[w])
			.filter((w): w is WordItem => w != null)
	);

	const solved = $derived(
		persisted.current.cellChecked.every(Boolean) &&
			persisted.current.grid.every((w, i) => w !== null && w === puzzle.solution[i].word)
	);

	const correctCount = $derived(
		persisted.current.grid.reduce((acc, w, i) => {
			if (!w || !persisted.current.cellChecked[i]) return acc;
			return acc + (w === puzzle.solution[i].word ? 1 : 0);
		}, 0)
	);

	const correctEdgeCount = $derived(
		puzzle.edges.reduce(
			(acc, edge) => acc + (getEdgeStatus(edge.from, edge.to) === 'correct' ? 1 : 0),
			0
		)
	);

	const canCheck = $derived(
		persisted.current.grid.some((w, i) => w !== persisted.current.checkedSnapshot[i])
	);

	function markCellsDirty(indices: number[]) {
		const s = persisted.current;
		for (const idx of indices) {
			if (s.grid[idx] !== s.checkedSnapshot[idx]) {
				s.cellChecked[idx] = false;
			}
		}
	}

	function check() {
		const s = persisted.current;
		s.checks += 1;
		s.cellChecked = Array(9).fill(true);
		s.checkedSnapshot = [...s.grid];
		// Checks cannot be undone.
		history = [];
	}

	function undo() {
		const prev = history.pop();
		if (!prev) return;
		const s = persisted.current;
		s.grid = prev.grid;
		s.inventory = prev.inventory;
		// Recompute checked flags against the last checked snapshot.
		s.cellChecked = s.grid.map((w, i) => w != null && w === s.checkedSnapshot[i]);
	}

	function isCellChecked(index: number): boolean {
		return persisted.current.cellChecked[index];
	}

	function getNodeStatus(index: number): NodeStatus {
		const w = persisted.current.grid[index];
		if (!w) return 'empty';
		if (!persisted.current.cellChecked[index]) return 'unchecked';
		return w === puzzle.solution[index].word ? 'correct' : 'wrong';
	}

	function getRawEdgeStatus(fromIdx: number, toIdx: number): EdgeStatus {
		const a = persisted.current.grid[fromIdx];
		const b = persisted.current.grid[toIdx];
		if (!a || !b) return 'empty';
		const key = [a, b].sort().join('::');
		return validLinks.has(key) ? 'correct' : 'wrong';
	}

	function getEdgeStatus(fromIdx: number, toIdx: number): EdgeStatus {
		const s = persisted.current;
		if (!s.grid[fromIdx] || !s.grid[toIdx]) return 'empty';
		if (!s.cellChecked[fromIdx] || !s.cellChecked[toIdx]) return 'empty';
		return getRawEdgeStatus(fromIdx, toIdx);
	}

	function getEdgeClue(fromIdx: number, toIdx: number): string | undefined {
		const edge = puzzle.edges.find(
			(e) => (e.from === fromIdx && e.to === toIdx) || (e.from === toIdx && e.to === fromIdx)
		);
		return edge?.clue;
	}

	function placeWord(gridIndex: number, word: WordItem) {
		const s = persisted.current;
		if (s.grid[gridIndex] === word.word) return;

		pushHistory();
		const existing = s.grid[gridIndex];
		s.inventory = s.inventory.filter((w) => w !== word.word);
		if (existing) s.inventory.push(existing);
		s.grid[gridIndex] = word.word;
		markCellsDirty([gridIndex]);
	}

	function removeFromGrid(gridIndex: number) {
		const s = persisted.current;
		const existing = s.grid[gridIndex];
		if (!existing) return;
		pushHistory();
		s.inventory.push(existing);
		s.grid[gridIndex] = null;
		markCellsDirty([gridIndex]);
	}

	function moveGridWord(fromIdx: number, toIdx: number) {
		if (fromIdx === toIdx) return;
		const s = persisted.current;
		const source = s.grid[fromIdx];
		if (!source) return;
		pushHistory();
		const target = s.grid[toIdx];
		s.grid[toIdx] = source;
		s.grid[fromIdx] = target ?? null;
		markCellsDirty([fromIdx, toIdx]);
	}

	function swapGridCells(fromIdx: number, toIdx: number) {
		const s = persisted.current;
		pushHistory();
		const temp = s.grid[fromIdx];
		s.grid[fromIdx] = s.grid[toIdx];
		s.grid[toIdx] = temp;
	}

	function flipGrid(pairs: [number, number][]) {
		const s = persisted.current;
		pushHistory();
		const next = [...s.grid];
		for (const [a, b] of pairs) {
			[next[a], next[b]] = [next[b], next[a]];
		}
		s.grid = next;
		markCellsDirty(pairs.flat());
	}

	function flipHorizontal() {
		flipGrid([
			[0, 2],
			[3, 5],
			[6, 8],
		]);
	}

	function flipVertical() {
		flipGrid([
			[0, 6],
			[1, 7],
			[2, 8],
		]);
	}

	function reset() {
		persisted.current = freshState(puzzle);
		history = [];
	}

	return {
		get grid() {
			return grid;
		},
		get inventory() {
			return inventory;
		},
		get solved() {
			return solved;
		},
		get correctCount() {
			return correctCount;
		},
		get correctEdgeCount() {
			return correctEdgeCount;
		},
		get checks() {
			return persisted.current.checks;
		},
		get cellChecked() {
			return persisted.current.cellChecked;
		},
		get canCheck() {
			return canCheck;
		},
		get canUndo() {
			return history.length > 0;
		},
		getNodeStatus,
		getEdgeStatus,
		getEdgeClue,
		isCellChecked,
		check,
		undo,
		placeWord,
		removeFromGrid,
		moveGridWord,
		swapGridCells,
		flipHorizontal,
		flipVertical,
		reset,
	};
}

function shuffleArray<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export type GameState = ReturnType<typeof createGameState>;
