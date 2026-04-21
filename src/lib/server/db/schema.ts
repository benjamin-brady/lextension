import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

/**
 * One row per (date, mode). Chain mode populates start/end and leaves seed_b null.
 * Fibonacci mode uses seed_a + seed_b + target.
 */
export const dailyPuzzles = sqliteTable(
  'daily_puzzles',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(), // ISO YYYY-MM-DD, UTC
    mode: text('mode').notNull(), // 'chain' | 'fib'
    seedA: text('seed_a').notNull(),
    seedB: text('seed_b'),
    target: text('target').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex('daily_puzzles_date_mode_uq').on(t.date, t.mode), index('daily_puzzles_date_idx').on(t.date)],
);

export type DailyPuzzleRow = typeof dailyPuzzles.$inferSelect;
