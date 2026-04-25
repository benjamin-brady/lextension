import { and, eq } from 'drizzle-orm';
import { getDb, schema } from './db';
import { pickChainPuzzle, pickFibPuzzle } from '$lib/seeds';
import { isRejectedChainPuzzle } from '$lib/daily-chain-catalog';

export type Mode = 'chain' | 'fib';

export interface ChainDaily {
  mode: 'chain';
  date: string;
  start: string;
  end: string;
}

export interface FibDaily {
  mode: 'fib';
  date: string;
  startA: string;
  startB: string;
  target: string;
}

export type Daily = ChainDaily | FibDaily;

export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Resolve the daily puzzle date for a request. Uses the `puzzle_date` cookie
 * (set client-side to the user's local YYYY-MM-DD) when present and well-formed,
 * otherwise falls back to UTC. This lets puzzles roll over at midnight local
 * time for everyone.
 */
export function todayForRequest(cookieValue: string | undefined): string {
  if (typeof cookieValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(cookieValue)) {
    return cookieValue;
  }
  return todayUtc();
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function rowToDaily(r: typeof schema.dailyPuzzles.$inferSelect): Daily {
  if (r.mode === 'fib') {
    return { mode: 'fib', date: r.date, startA: r.seedA, startB: r.seedB ?? '', target: r.target };
  }
  return { mode: 'chain', date: r.date, start: r.seedA, end: r.target };
}

/** Insert a deterministically-picked puzzle for (date, mode) if absent. */
export async function ensureDaily(d1: D1Database, date: string, mode: Mode): Promise<Daily> {
  const db = getDb(d1);
  const existing = await db
    .select()
    .from(schema.dailyPuzzles)
    .where(and(eq(schema.dailyPuzzles.date, date), eq(schema.dailyPuzzles.mode, mode)))
    .limit(1);
  if (existing.length) {
    const row = existing[0];

    if (mode === 'chain' && isRejectedChainPuzzle(row.seedA, row.target)) {
      const { start, end } = pickChainPuzzle(date);
      await db
        .update(schema.dailyPuzzles)
        .set({ seedA: start, seedB: null, target: end })
        .where(eq(schema.dailyPuzzles.id, row.id));

      return { mode: 'chain', date, start, end };
    }

    return rowToDaily(row);
  }

  if (mode === 'fib') {
    const { startA, startB, target } = pickFibPuzzle(date);
    await db
      .insert(schema.dailyPuzzles)
      .values({ date, mode, seedA: startA, seedB: startB, target })
      .onConflictDoNothing();
  } else {
    const { start, end } = pickChainPuzzle(date);
    await db
      .insert(schema.dailyPuzzles)
      .values({ date, mode, seedA: start, seedB: null, target: end })
      .onConflictDoNothing();
  }

  const [row] = await db
    .select()
    .from(schema.dailyPuzzles)
    .where(and(eq(schema.dailyPuzzles.date, date), eq(schema.dailyPuzzles.mode, mode)))
    .limit(1);
  return rowToDaily(row);
}

/**
 * Prefill today, today+1, today+2 for both modes. Used by cron and
 * as a best-effort lazy bootstrap on first request of the day.
 */
export async function prefillUpcoming(d1: D1Database, baseDate = todayUtc()): Promise<Daily[]> {
  const out: Daily[] = [];
  for (let i = 0; i <= 2; i++) {
    const d = addDays(baseDate, i);
    out.push(await ensureDaily(d1, d, 'chain'));
    out.push(await ensureDaily(d1, d, 'fib'));
  }
  return out;
}
