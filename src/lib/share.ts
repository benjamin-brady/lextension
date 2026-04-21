import { emojiFor } from './seeds';

/** nth Fibonacci number (1-indexed): fib(1)=1, fib(2)=1, fib(3)=2, ... */
export function fib(n: number): number {
  if (n <= 0) return 0;
  let a = 1, b = 1;
  for (let i = 3; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return n === 1 ? 1 : b;
}

const KEYCAP_DIGITS: Record<string, string> = {
  '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
  '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣',
};

/** "13" → "1️⃣3️⃣" */
export function keycapNumber(n: number): string {
  return String(n).split('').map((d) => KEYCAP_DIGITS[d] ?? d).join('');
}

/**
 * Render an emoji summary for a completed chain game.
 * Format: startEmoji + (🦤 × hops) + endEmoji
 * where `hops` = words added between start and end (chain.length - 2).
 */
export function chainEmojiSummary(chain: string[]): string {
  if (chain.length < 2) return '';
  const start = emojiFor(chain[0]);
  const end = emojiFor(chain[chain.length - 1]);
  const hops = Math.max(0, chain.length - 2);
  return start + '🦤'.repeat(hops) + end;
}

/**
 * Render an emoji summary for a completed fibonacci game.
 * Format: seedA + seedB + keycap(fib(chainLen)) + targetEmoji
 * The fib number grows with guesses, rewarding short chains.
 */
export function fibEmojiSummary(chain: string[]): string {
  if (chain.length < 3) return '';
  const a = emojiFor(chain[0]);
  const b = emojiFor(chain[1]);
  const target = emojiFor(chain[chain.length - 1]);
  // fib index = position of target in chain (1-indexed)
  const n = chain.length;
  return a + b + keycapNumber(fib(n)) + target;
}
