import {
  evaluatePuzzleState,
  getEdgeStatus as getEvaluatedEdgeStatus,
} from "./game-logic";
import {
  saveGameRecord,
  type PersistedStateHistoryEntry,
} from "./game-storage";
import type { EdgeStatus, NodeStatus, Puzzle, WordItem } from "./types";
import { StateHistory } from "runed";

interface UndoableState {
  grid: (string | null)[];
  inventory: string[];
}

interface SavedState extends UndoableState {
  checks: number;
  cellChecked: boolean[];
  checkedSnapshot: (string | null)[];
}

const HISTORY_CAPACITY = 150;

function storageKey(storageId: string): string {
  return `simicle-game-${storageId}`;
}

function loadState(storageId: string): SavedState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(storageId));
    if (!raw) return null;
    return JSON.parse(raw) as SavedState;
  } catch {
    return null;
  }
}

function saveState(storageId: string, state: SavedState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey(storageId), JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

/**
 * Reactive game state using Svelte 5 runes.
 */
export function createGameState(puzzle: Puzzle, storageId: string) {
  const saved = loadState(storageId);
  const wordLookup = Object.fromEntries(
    puzzle.solution.map((w) => [w.word, w]),
  );
  const normalizedSaved = normalizeSavedState(saved);

  /** Current grid: null means empty slot */
  let grid = $state<(WordItem | null)[]>(
    normalizedSaved
      ? normalizedSaved.grid.map((w) => (w ? (wordLookup[w] ?? null) : null))
      : Array(9).fill(null),
  );
  /** Inventory: words not yet placed */
  let inventory = $state<WordItem[]>(
    normalizedSaved
      ? normalizedSaved.inventory
          .map((w) => wordLookup[w])
          .filter((w): w is WordItem => w != null)
      : shuffleArray([...puzzle.solution]),
  );
  let checks = $state(normalizedSaved?.checks ?? 0);

  /** Per-cell: whether the cell has been checked and not changed since */
  let cellChecked = $state<boolean[]>(
    normalizedSaved?.cellChecked ?? Array(9).fill(false),
  );

  /** Snapshot of words at each cell at last check time */
  let checkedSnapshot = $state<(string | null)[]>(
    normalizedSaved?.checkedSnapshot ?? Array(9).fill(null),
  );

  const history = new StateHistory<UndoableState>(
    () => createUndoableState(),
    (snapshot) => {
      applyUndoableState(snapshot);
    },
    { capacity: HISTORY_CAPACITY },
  );

  $effect(() => {
    const snapshot = createSavedState();
    saveState(storageId, snapshot);
    void saveGameRecord({
      storageId,
      snapshot,
      history: cloneHistoryLog(history.log),
      checks,
      solved,
      updatedAt: Date.now(),
    });
  });

  let evaluation = $derived(evaluatePuzzleState(puzzle, grid, cellChecked));

  /** Whether the puzzle is complete and all correct */
  let solved = $derived(evaluation.solved);

  /** Number of correctly placed words (only counts checked cells) */
  let correctCount = $derived(evaluation.correctWords);

  let correctEdgeCount = $derived(evaluation.correctLinks);

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
    return evaluation.nodeStatuses[index] ?? "empty";
  }

  function getEdgeStatus(fromIdx: number, toIdx: number): EdgeStatus {
    return getEvaluatedEdgeStatus(evaluation, fromIdx, toIdx);
  }

  function getEdgeClue(fromIdx: number, toIdx: number): string | undefined {
    const edge = puzzle.edges.find(
      (e) =>
        (e.from === fromIdx && e.to === toIdx) ||
        (e.from === toIdx && e.to === fromIdx),
    );
    return edge?.clue;
  }

  function createUndoableState(): UndoableState {
    return {
      grid: grid.map((cell) => cell?.word ?? null),
      inventory: inventory.map((word) => word.word),
    };
  }

  function createSavedState(): SavedState {
    return {
      ...createUndoableState(),
      checks,
      cellChecked: [...cellChecked],
      checkedSnapshot: [...checkedSnapshot],
    };
  }

  function movesLocked(): boolean {
    return solved;
  }

  function applyUndoableState(snapshot: UndoableState) {
    grid = snapshot.grid.map((word) =>
      word ? (wordLookup[word] ?? null) : null,
    );
    inventory = snapshot.inventory
      .map((word) => wordLookup[word])
      .filter((word): word is WordItem => word != null);
    markCellsDirty(Array.from({ length: 9 }, (_, index) => index));
  }

  function placeWord(gridIndex: number, word: WordItem) {
    if (movesLocked()) {
      return;
    }

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
    if (movesLocked()) {
      return;
    }

    const cell = grid[gridIndex];
    if (cell) {
      inventory = [...inventory, cell];
      grid[gridIndex] = null;
      markCellsDirty([gridIndex]);
    }
  }

  function moveGridWord(fromIdx: number, toIdx: number) {
    if (movesLocked()) {
      return;
    }

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
    if (movesLocked()) {
      return;
    }

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
    history.clear();
    history.log = [{ snapshot: createUndoableState(), timestamp: Date.now() }];
    saveState(storageId, createSavedState());
  }

  function undo() {
    if (movesLocked() || !history.canUndo) {
      return;
    }

    history.undo();
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
      return checks;
    },
    get canUndo() {
      return !solved && history.canUndo;
    },
    get cellChecked() {
      return cellChecked;
    },
    getNodeStatus,
    getEdgeStatus,
    getEdgeClue,
    isCellChecked,
    check,
    placeWord,
    removeFromGrid,
    moveGridWord,
    swapGridCells,
    undo,
    reset,
  };
}

function cloneUndoableState(state: UndoableState): UndoableState {
  return {
    grid: [...state.grid],
    inventory: [...state.inventory],
  };
}

function cloneHistoryLog(
  log: PersistedStateHistoryEntry<UndoableState>[],
): PersistedStateHistoryEntry<UndoableState>[] {
  return log.map((entry) => ({
    timestamp: entry.timestamp,
    snapshot: cloneUndoableState(entry.snapshot),
  }));
}

function normalizeSavedState(state: SavedState | null): SavedState | null {
  if (!state) {
    return null;
  }

  return {
    grid: Array.from({ length: 9 }, (_, index) => state.grid[index] ?? null),
    inventory: Array.isArray(state.inventory) ? [...state.inventory] : [],
    checks: typeof state.checks === "number" ? state.checks : 0,
    cellChecked: Array.from({ length: 9 }, (_, index) =>
      Boolean(state.cellChecked[index]),
    ),
    checkedSnapshot: Array.from(
      { length: 9 },
      (_, index) => state.checkedSnapshot[index] ?? null,
    ),
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
