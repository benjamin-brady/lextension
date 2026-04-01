import type { EdgeStatus, NodeStatus, Puzzle, WordItem } from './types';

/**
 * Reactive game state using Svelte 5 runes.
 */
export function createGameState(puzzle: Puzzle) {
	/** Current grid: null means empty slot */
	let grid = $state<(WordItem | null)[]>(Array(9).fill(null));
	const validEdgePairs = puzzle.edges.reduce<Record<string, true>>((lookup, edge) => {
		lookup[edgeKey(puzzle.solution[edge.from].word, puzzle.solution[edge.to].word)] = true;
		return lookup;
	}, {});

	/** Inventory: words not yet placed */
	let inventory = $state<WordItem[]>(shuffleArray([...puzzle.solution]));
	let checks = $state(0);

	/** Whether we are currently showing check results */
	let checked = $state(false);

	/** Snapshot of the grid at the time of last check (word strings) */
	let checkedSnapshot = $state<(string | null)[]>(Array(9).fill(null));

	/** Whether the puzzle is complete and all correct */
	let solved = $derived(checked && grid.every((cell, i) => {
		if (!cell) return false;
		const correct = puzzle.solution[i];
		return cell.word === correct.word;
	}));

	/** Number of correctly placed words (only meaningful when checked) */
	let correctCount = $derived(
		checked
			? grid.reduce((acc, cell, i) => {
				if (!cell) return acc;
				return acc + (cell.word === puzzle.solution[i].word ? 1 : 0);
			}, 0)
			: 0
	);

	let correctEdgeCount = $derived(
		checked
			? puzzle.edges.reduce((acc, edge) => acc + (getRawEdgeStatus(edge.from, edge.to) === 'correct' ? 1 : 0), 0)
			: 0
	);

	/** Invalidate check results whenever the grid changes from the checked snapshot */
	function markDirty() {
		if (!checked) return;
		const current = grid.map((c) => c?.word ?? null);
		const changed = current.some((w, i) => w !== checkedSnapshot[i]);
		if (changed) {
			checked = false;
		}
	}

	function check() {
		checks += 1;
		checked = true;
		checkedSnapshot = grid.map((c) => c?.word ?? null);
	}

	function getNodeStatus(index: number): NodeStatus {
		const cell = grid[index];
		if (!cell) return 'empty';
		if (!checked) return 'unchecked';
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
		if (!checked) return 'empty';
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
		markDirty();
	}

	function removeFromGrid(gridIndex: number) {
		const cell = grid[gridIndex];
		if (cell) {
			inventory = [...inventory, cell];
			grid[gridIndex] = null;
			markDirty();
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
		markDirty();
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
		checked = false;
		checkedSnapshot = Array(9).fill(null);
	}

	return {
		get grid() { return grid; },
		get inventory() { return inventory; },
		get solved() { return solved; },
		get correctCount() { return correctCount; },
		get correctEdgeCount() { return correctEdgeCount; },
		get checks() { return checks; },
		get checked() { return checked; },
		getNodeStatus,
		getEdgeStatus,
		getEdgeClue,
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
