import type { PageServerLoad } from './$types';
import { ensureDaily, prefillUpcoming, todayUtc } from '$lib/server/daily';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform }) => {
  const db = platform?.env.DB;
  if (!db) error(500, 'D1 not bound');
  const date = todayUtc();
  const daily = await ensureDaily(db, date, 'fib');
  void prefillUpcoming(db, date).catch(() => {});
  if (daily.mode !== 'fib') error(500, 'Mode mismatch');
  return { daily };
};
