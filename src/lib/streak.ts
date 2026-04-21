import { PersistedState } from 'runed';

export type DailyMode = 'chain' | 'fib';

interface StreakData {
  /** ISO date of last completion */
  last: string | null;
  /** Current consecutive-day count */
  current: number;
  /** Best ever */
  best: number;
  /** Dates (ISO) completed, most recent first, cap 60. Used for history dots. */
  history: string[];
}

function empty(): StreakData {
  return { last: null, current: 0, best: 0, history: [] };
}

function yesterday(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Per-mode PersistedState so both daily variants track independently. */
const stores: Record<DailyMode, PersistedState<StreakData> | null> = {
  chain: null,
  fib: null,
};

function store(mode: DailyMode): PersistedState<StreakData> {
  if (!stores[mode]) {
    stores[mode] = new PersistedState<StreakData>(`lext:streak:${mode}:v1`, empty(), {
      storage: 'local',
    });
  }
  return stores[mode]!;
}

export function getStreak(mode: DailyMode): StreakData {
  return store(mode).current;
}

export function hasCompletedToday(mode: DailyMode, isoDate: string): boolean {
  return store(mode).current.last === isoDate;
}

/**
 * Record a daily completion. Returns the updated streak data.
 * Idempotent per-date.
 */
export function recordCompletion(mode: DailyMode, isoDate: string): StreakData {
  const s = store(mode);
  const prev = s.current;
  if (prev.last === isoDate) return prev;

  const continued = prev.last === yesterday(isoDate);
  const current = continued ? prev.current + 1 : 1;
  const best = Math.max(prev.best, current);
  const history = [isoDate, ...prev.history.filter((d) => d !== isoDate)].slice(0, 60);

  const next: StreakData = { last: isoDate, current, best, history };
  s.current = next;
  return next;
}
