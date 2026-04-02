import type { EdgeStatus, NodeStatus, Puzzle, WordItem } from './types';

interface SavedState {
	grid: (string | null)[];
	inventory: string[];
	checks: number;
	cellChecked: boolean[];
	checkedSnapshot: (string | null)[];
}

function storageKey(puzzleNumber: number): string {
	return `simicle-game-${puzzleNumber}`;
}

function loadState(puzzleNumber: number): SavedState | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(storageKey(puzzleNumber));
		if (!raw) return null;
		return JSON.parse(raw) as SavedState;
	} catch {
		return null;
	}
}

function saveState(puzzleNumber: number, state: SavedState): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(storageKey(puzzleNumber), JSON.stringify(state));
	} catch {
		// storage full or unavailable
	}
}

/**
 * Reactive game state using Svelte 5 runes.
 */
export function createGameState(puzzle: Puzzle, puzzleNumber: number) {
	const saved = loadState(puzzleNumber);
	const wordLookup = Object.fromEntries(puzzle.solution.map((w) => [w.word, w]));

	/** Current grid: null means empty slot */
	let grid = $state<(WordItem | null)[]>(
		saved ? saved.grid.map((w) => (w ? wordLookup[w] ?? null : null)) : Array(9).fill(null)
	);
	const validEdgePairs = puzzle.edges.reduce<Record<string, true>>((lookup, edge) => {
		lookup[edgeKey(puzzle.solution[edge.from].word, puzzle.solution[edge.to].word)] = true;
		return lookup;
	}, {});

	/** Inventory: words not yet placed */
	let inventory = $state<WordItem[]>(
		saved
			? saved.inventory.map((w) => wordLookup[w]).filter((w): w is WordItem => w != null)
			: shuffleArray([...puzzle.solution])
	);
	let checks = $state(saved?.checks ?? 0);

	/** Per-cell: whether the cell has been checked and not changed since */
	let cellChecked = $state<boolean[]>(saved?.cellChecked ?? Array(9).fill(false));

	/** Snapshot of words at each cell at last check time */
	let checkedSnapshot = $state<(string | null)[]>(saved?.checkedSnapshot ?? Array(9).fill(null));

	$effect(() => {
		saveState(puzzleNumber, {
			grid: grid.map((c) => c?.word ?? null),
			inventory: inventory.map((w) => w.word),
			checks,
			cellChecked: [...cellChecked],
			checkedSnapshot: [...checkedSnapshot],
		});
	});

	/** Whether the puzzle is complete and all correct */
	let solved = $derived(cellChecked.every(Boolean) && grid.every((cell, i) => {
		if (!cell) return false;
		const correct = puzzle.solution[i];
		return cell.word === correct.word;
	}));

	/** Number of correctly placed words (only counts checked cells) */
	let correctCount = $derived(
		grid.reduce((acc, cell, i) => {
			if (!cell || !cellChecked[i]) return acc;
			return acc + (cell.word === puzzle.solution[i].word ? 1 : 0);
		}, 0)
	);

	let correctEdgeCount = $derived(
		puzzle.edges.reduce((acc, edge) => acc + (getRawEdgeStatus(edge.from, edge.to) === 'correct' ? 1 : 0), 0)
	);

	/** Mark specific cells as dirty when they change after a check */
	function markCellsDirty(indices: number[]) {
		for (const idx of indices) {
			const current = grid[idx]?.word ?? null;
			if (current !== checkedSnapshot[idx]) {
				cellChecked[idx] = false;
			}
		}
	}

	function check() {
		checks += 1;
		cellChecked = Array(9).fill(true);
		checkedSnapshot = grid.map((c) => c?.word ?? null);
	}

	function isCellChecked(index: number): boolean {
		return cellChecked[index];
	}

	function getNodeStatus(index: number): NodeStatus {
		const cell = grid[index];
		if (!cell) return 'empty';
		if (!cellChecked[index]) return 'unchecked';
		return cell.word === puzzle.solution[index].word ? 'correct' : 'wrong';
	}

	function getRawEdgeStatus(fromIdx: number, toIdx: number): EdgeStatus {
		const fromCell = grid[fromIdx];
		const toCell = grid[toIdx];
		if (!fromCell || !toCell) return 'empty';

		if (validEdgePairs[edgeKey(fromCell.word, toCell.word)]) {
			return 'correct';
		}
		return 'wrong';
	}

	function getEdgeStatus(fromIdx: number, toIdx: number): EdgeStatus {
		const fromCell = grid[fromIdx];
		const toCell = grid[toIdx];
		if (!fromCell || !toCell) return 'empty';
		if (!cellChecked[fromIdx] || !cellChecked[toIdx]) return 'empty';
		return getRawEdgeStatus(fromIdx, toIdx);
	}

	function getEdgeClue(fromIdx: number, toIdx: number): string | undefined {
		const edge = puzzle.edges.find(
			(e) => (e.from === fromIdx && e.to === toIdx) || (e.from === toIdx && e.to === fromIdx)
		);
		return edge?.clue;
	}

	function placeWord(gridIndex: number, word: WordItem) {
		if (grid[gridIndex]?.word === word.word) {
			return;
		}

		// If something is already in this slot, put it back in inventory
		const existing = grid[gridIndex];
		if (existing) {
			inventory = [...inventory, existing];
		}
		// Remove from inventory
		inventory = inventory.filter((w) => w.word !== word.word);
		// Place in grid
		grid[gridIndex] = word;
		markCellsDirty([gridIndex]);
	}

	function removeFromGrid(gridIndex: number) {
		const cell = grid[gridIndex];
		if (cell) {
			inventory = [...inventory, cell];
			grid[gridIndex] = null;
			markCellsDirty([gridIndex]);
		}
	}

	function moveGridWord(fromIdx: number, toIdx: number) {
		if (fromIdx === toIdx) {
			return;
		}

		const source = grid[fromIdx];
		if (!source) {
			return;
		}

		const target = grid[toIdx];
		grid[toIdx] = source;
		grid[fromIdx] = target ?? null;
		markCellsDirty([fromIdx, toIdx]);
	}

	function swapGridCells(fromIdx: number, toIdx: number) {
		const temp = grid[fromIdx];
		grid[fromIdx] = grid[toIdx];
		grid[toIdx] = temp;
	}

	function reset() {
		inventory = shuffleArray([...puzzle.solution]);
		grid = Array(9).fill(null);
		checks = 0;
		cellChecked = Array(9).fill(false);
		checkedSnapshot = Array(9).fill(null);
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem(storageKey(puzzleNumber));
		}
	}

	return {
		get grid() { return grid; },
		get inventory() { return inventory; },
		get solved() { return solved; },
		get correctCount() { return correctCount; },
		get correctEdgeCount() { return correctEdgeCount; },
		get checks() { return checks; },
		get cellChecked() { return cellChecked; },
		getNodeStatus,
		getEdgeStatus,
		getEdgeClue,
		isCellChecked,
		check,
		placeWord,
		removeFromGrid,
		moveGridWord,
		swapGridCells,
		reset,
	};
}

function edgeKey(firstWord: string, secondWord: string): string {
	return [firstWord, secondWord].sort().join('::');
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
