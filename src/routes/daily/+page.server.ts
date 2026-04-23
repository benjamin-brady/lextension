import type { PageServerLoad } from './$types';
import { ensureDaily, prefillUpcoming, todayForRequest } from '$lib/server/daily';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform, cookies }) => {
  const db = platform?.env.DB;
  if (!db) error(500, 'D1 not bound');
  const date = todayForRequest(cookies.get('puzzle_date'));
  // Fire-and-forget prefill so cron isn't the only mechanism.
  const daily = await ensureDaily(db, date, 'chain');
  // Best-effort upcoming prefill — don't block response on it.
  void prefillUpcoming(db, date).catch(() => {});
  if (daily.mode !== 'chain') error(500, 'Mode mismatch');
  return { daily };
};
