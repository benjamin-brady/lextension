/**
 * Word bank for random practice pairs.
 * All single, concrete, evocative English words that tend to have
 * rich relationship networks (compounds, cultural pairs, rhymes, etc.)
 */
export const WORD_BANK = [
  'Sun', 'Moon', 'Star', 'Fire', 'Ice',
  'Rock', 'Sand', 'Gold', 'Iron', 'Storm',
  'Rain', 'Snow', 'Wind', 'Wave', 'Cloud',
  'Tree', 'Rose', 'Leaf', 'Seed', 'Vine',
  'Fish', 'Bird', 'Bear', 'Wolf', 'Snake',
  'Crown', 'Sword', 'Shield', 'Castle', 'Dragon',
  'Bread', 'Honey', 'Salt', 'Milk', 'Pepper',
  'Drum', 'Bell', 'Horn', 'Piano', 'Guitar',
  'Wheel', 'Bridge', 'Tower', 'Gate', 'Wall',
  'Heart', 'Eye', 'Hand', 'Bone', 'Blood',
  'Ship', 'Sail', 'Anchor', 'Compass', 'Lighthouse',
  'Clock', 'Mirror', 'Candle', 'Key', 'Lock',
  'Book', 'Ink', 'Paper', 'Pen', 'Story',
  'Shadow', 'Dream', 'Ghost', 'Spirit', 'Flame',
  'Apple', 'Lemon', 'Cherry', 'Peach', 'Grape',
  'Hammer', 'Nail', 'Saw', 'Thread', 'Needle',
  'Horse', 'Saddle', 'Barn', 'Hay', 'Cowboy',
  'Rocket', 'Planet', 'Comet', 'Orbit', 'Satellite',
  'Diamond', 'Pearl', 'Ruby', 'Crystal', 'Emerald',
  'Thunder', 'Lightning', 'Tornado', 'Volcano', 'Earthquake',
];

/** Pick two distinct random words from the bank. */
export function randomPair(): [string, string] {
  const a = Math.floor(Math.random() * WORD_BANK.length);
  let b = Math.floor(Math.random() * (WORD_BANK.length - 1));
  if (b >= a) b++;
  return [WORD_BANK[a], WORD_BANK[b]];
}

/** Pick three distinct random words (seeds + target) for Fibonacci mode. */
export function randomTriple(): [string, string, string] {
  const indices = new Set<number>();
  while (indices.size < 3) {
    indices.add(Math.floor(Math.random() * WORD_BANK.length));
  }
  const [a, b, c] = [...indices];
  return [WORD_BANK[a], WORD_BANK[b], WORD_BANK[c]];
}
