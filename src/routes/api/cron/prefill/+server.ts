import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prefillUpcoming } from '$lib/server/daily';

/**
 * Prefill upcoming daily puzzles (today, +1, +2) for both modes.
 * Idempotent. Gated by ?secret= matching env.CRON_SECRET if set.
 *
 * Call from any external cron service, or it will be called lazily by
 * the daily page loaders on first request of the day.
 */
export const POST: RequestHandler = async ({ url, platform }) => {
  const secret = platform?.env.CRON_SECRET;
  if (secret && url.searchParams.get('secret') !== secret) {
    error(401, 'Unauthorized');
  }
  const db = platform?.env.DB;
  if (!db) error(500, 'D1 not bound');
  const rows = await prefillUpcoming(db);
  return json({ ok: true, prefilled: rows.length, rows });
};

export const GET = POST;
