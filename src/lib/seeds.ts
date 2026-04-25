import { CHAIN_DAILY_PUZZLES } from './daily-chain-catalog';

/**
 * Daily puzzle seed catalog.
 *
 * Normal-mode dailies are selected from CHAIN_DAILY_PUZZLES, a committed
 * catalog of vetted pairs with sample routes. The pools below remain for
 * Fibonacci-mode puzzle selection.
 *
 * Two Fibonacci pools:
 *  - `ANCHORS`: versatile words with rich compound/rhyme/cultural networks.
 *    At least one endpoint in every puzzle is drawn from here so players
 *    always have a fertile foothold. Critical for Fibonacci mode where
 *    the two seeds must share enough neighbourhood to make progress possible.
 *  - `TARGETS`: concrete, evocative "far-away" words that make for punchy
 *    endpoints (and funny juxtapositions with anchors).
 *
 * Everything here is a single, common, concrete English noun/adj so the
 * LLM validator has no trouble classifying relationships.
 *
 * Emoji map is used by share-text rendering. Words missing from the map
 * fall back to a generic placeholder.
 */

/** Words with huge relationship networks — great as at least one seed. */
export const ANCHORS: readonly string[] = [
  'Fire', 'Ice', 'Sun', 'Moon', 'Star', 'Rock', 'Sand', 'Gold', 'Iron',
  'Rain', 'Snow', 'Wind', 'Wave', 'Storm', 'Stone', 'Water', 'Earth',
  'Tree', 'Rose', 'Leaf', 'Seed', 'Apple', 'Cat', 'Dog', 'Fish', 'Bird',
  'Snake', 'Wolf', 'Bear', 'Horse', 'Cow', 'Bee', 'Fly',
  'Crown', 'Sword', 'Bread', 'Honey', 'Salt', 'Milk', 'Butter',
  'Bell', 'Drum', 'Horn', 'Key', 'Lock', 'Book', 'Pen', 'Ink', 'Paper',
  'Wheel', 'Tower', 'Gate', 'Wall', 'Bridge', 'Door', 'House', 'Home',
  'Head', 'Hand', 'Heart', 'Eye', 'Bone', 'Foot', 'Tooth', 'Tail', 'Back',
  'Ship', 'Sail', 'Boat', 'Car', 'Road', 'Train', 'Wing', 'Air',
  'Clock', 'Mirror', 'Candle', 'Light', 'Dark', 'Shadow', 'Day', 'Night',
  'Hot', 'Cold', 'Sweet', 'Hard', 'Soft', 'High', 'Low', 'Long', 'Short',
  'Black', 'White', 'Blue', 'Red', 'Green',
  'Cake', 'Cream', 'Cheese', 'Cup', 'Dish', 'Pot', 'Pan',
  'Flower', 'Leaf', 'Wood', 'Hay', 'Corn', 'Bean',
  'Play', 'Work', 'Run', 'Jump', 'Walk',
  'Nail', 'Thumb', 'Finger', 'Hammer', 'Saw', 'Knife', 'Fork', 'Spoon',
  'Side', 'Top', 'Bottom', 'Over', 'Under', 'Up', 'Down', 'Out', 'In',
  'Bow', 'Arrow', 'Fish', 'Hook', 'Line', 'Net', 'String',
  'Pine', 'Oak', 'Grape', 'Peach', 'Lime', 'Lemon', 'Cherry',
] as const;

/** "Far-away" endpoint words — evocative, often silly when paired with anchors. */
export const TARGETS: readonly string[] = [
  'Goat', 'Lawyer', 'Pizza', 'Shakespeare', 'Banana', 'Spaceship',
  'Penguin', 'Guitar', 'Umbrella', 'Dragon', 'Sock', 'Volcano',
  'Pancake', 'Astronaut', 'Wizard', 'Robot', 'Ninja', 'Pirate',
  'Cactus', 'Taco', 'Vampire', 'Mummy', 'Zombie', 'Unicorn',
  'Submarine', 'Helicopter', 'Dinosaur', 'Mermaid', 'Octopus',
  'Kangaroo', 'Sloth', 'Panda', 'Koala', 'Hedgehog', 'Flamingo',
  'Piano', 'Violin', 'Trumpet', 'Saxophone', 'Harmonica',
  'Detective', 'Plumber', 'Barber', 'Baker', 'Butcher', 'Farmer',
  'Teacher', 'Doctor', 'Sailor', 'Cowboy', 'Samurai', 'Viking',
  'Telescope', 'Microscope', 'Compass', 'Calculator', 'Keyboard',
  'Lighthouse', 'Windmill', 'Castle', 'Temple', 'Tunnel', 'Pyramid',
  'Waterfall', 'Glacier', 'Desert', 'Jungle', 'Canyon', 'Meadow',
  'Chocolate', 'Mustard', 'Pickle', 'Sushi', 'Burrito', 'Spaghetti',
  'Lobster', 'Shrimp', 'Oyster', 'Crab', 'Salmon',
  'Tornado', 'Blizzard', 'Hurricane', 'Earthquake',
  'Parachute', 'Skateboard', 'Trampoline', 'Hammock',
] as const;

/** Deterministic 32-bit hash used to pick puzzles per-date. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

/**
 * Deterministically pick a vetted 2-word chain puzzle for a given ISO date.
 * Normal-mode dailies come from a committed catalog with sample routes so
 * known direct-link pairs like Snake → Dragon do not collapse the puzzle.
 */
export function pickChainPuzzle(isoDate: string): { start: string; end: string } {
  const puzzle = pick(CHAIN_DAILY_PUZZLES, hashString(`chain:${isoDate}:catalog`));
  return { start: puzzle.start, end: puzzle.end };
}

/**
 * Deterministically pick a 3-word fibonacci puzzle for a given ISO date.
 * Both seeds drawn from ANCHORS (so the pair has overlapping neighbourhoods),
 * target from TARGETS.
 */
export function pickFibPuzzle(isoDate: string): { startA: string; startB: string; target: string } {
  const h1 = hashString(`fib:${isoDate}:a`);
  const h2 = hashString(`fib:${isoDate}:b`);
  const h3 = hashString(`fib:${isoDate}:t`);
  const a = pick(ANCHORS, h1);
  // Ensure b != a
  let b = pick(ANCHORS, h2);
  if (b.toLowerCase() === a.toLowerCase()) b = ANCHORS[(h2 + 1) % ANCHORS.length];
  return { startA: a, startB: b, target: pick(TARGETS, h3) };
}

/**
 * Small curated emoji map for share-text rendering.
 * Words not here fall back to a generic placeholder.
 */
export const WORD_EMOJIS: Record<string, string> = {
  fire: '🔥', ice: '❄️', sun: '☀️', moon: '🌙', star: '⭐',
  rock: '🪨', sand: '🏖️', gold: '🥇', iron: '⛓️',
  rain: '🌧️', snow: '❄️', wind: '💨', wave: '🌊', storm: '⛈️',
  stone: '🪨', water: '💧', earth: '🌍',
  tree: '🌳', rose: '🌹', leaf: '🍃', seed: '🌱', apple: '🍎',
  cat: '🐱', dog: '🐶', fish: '🐟', bird: '🐦', snake: '🐍',
  wolf: '🐺', bear: '🐻', horse: '🐴', cow: '🐮', bee: '🐝', fly: '🪰',
  goat: '🐐', crown: '👑', sword: '⚔️', bread: '🍞', honey: '🍯',
  salt: '🧂', milk: '🥛', butter: '🧈', bell: '🔔', drum: '🥁',
  horn: '📯', key: '🔑', lock: '🔒', book: '📖', pen: '🖊️',
  ink: '🖋️', paper: '📄', wheel: '🎡', tower: '🗼', gate: '🚪',
  wall: '🧱', bridge: '🌉', door: '🚪', house: '🏠', home: '🏡',
  head: '🗿', hand: '✋', heart: '❤️', eye: '👁️', bone: '🦴',
  foot: '🦶', tooth: '🦷', tail: '🐾', back: '🔙',
  ship: '🚢', sail: '⛵', boat: '🛶', car: '🚗', road: '🛣️',
  train: '🚂', wing: '🕊️', air: '💨',
  clock: '🕰️', mirror: '🪞', candle: '🕯️', light: '💡', dark: '🌑',
  shadow: '👤', day: '🌞', night: '🌌',
  hot: '🥵', cold: '🥶', sweet: '🍬', hard: '🧱', soft: '☁️',
  high: '🔼', low: '🔽', long: '📏', short: '📐',
  black: '⚫', white: '⚪', blue: '🔵', red: '🔴', green: '🟢',
  cake: '🍰', cream: '🍦', cheese: '🧀', cup: '🥤', dish: '🍽️',
  pot: '🪴', pan: '🍳', flower: '🌸', wood: '🪵', hay: '🌾',
  corn: '🌽', bean: '🫘', play: '🎮', work: '💼', run: '🏃',
  jump: '🦘', walk: '🚶', nail: '💅', thumb: '👍', finger: '👆',
  hammer: '🔨', saw: '🪚', knife: '🔪', fork: '🍴', spoon: '🥄',
  side: '↔️', top: '🔝', bottom: '⬇️', over: '🔃', under: '🕳️',
  up: '⬆️', down: '⬇️', out: '🚪', in: '📥',
  bow: '🏹', arrow: '➡️', hook: '🪝', line: '📏', net: '🕸️',
  string: '🧵', pine: '🌲', oak: '🌳', grape: '🍇', peach: '🍑',
  lime: '🟢', lemon: '🍋', cherry: '🍒',
  moss: '🌿', fern: '🌿', ivy: '🍃', emerald: '💚', olive: '🫒',
  mint: '🌿', jade: '🟩', library: '📚', station: '🚉', museum: '🏛️',
  theater: '🎭', airport: '✈️', factory: '🏭', plate: '🍽️', bowl: '🥣',
  harbor: '⚓', anchor: '⚓', island: '🏝️', hail: '🌨️', thunder: '⚡',
  drizzle: '🌧️', sleet: '🌨️', downpour: '🌧️', orchestra: '🎼', concert: '🎶',
  news: '📰', note: '📝', tissue: '🧻', carbon: '◼️', graph: '📈', wax: '🕯️',
  sheriff: '⭐', ranch: '🐎', saddle: '🐎', rodeo: '🤠', wagon: '🛒',
  lasso: '➰', outlaw: '🤠', tiger: '🐯', lion: '🦁', fox: '🦊', paw: '🐾',
  print: '🖨️', screen: '🖥️', camera: '📷', printer: '🖨️', router: '📡',
  monitor: '🖥️', laptop: '💻', microchip: '🧩', sound: '🔊', trail: '🥾',
  // targets
  lawyer: '👨‍⚖️', pizza: '🍕', shakespeare: '🎭', banana: '🍌',
  spaceship: '🚀', penguin: '🐧', guitar: '🎸', umbrella: '☂️',
  dragon: '🐉', sock: '🧦', volcano: '🌋', pancake: '🥞',
  astronaut: '👨‍🚀', wizard: '🧙', robot: '🤖', ninja: '🥷',
  pirate: '🏴‍☠️', cactus: '🌵', taco: '🌮', vampire: '🧛',
  mummy: '🧟', zombie: '🧟', unicorn: '🦄', submarine: '🚤',
  helicopter: '🚁', dinosaur: '🦕', mermaid: '🧜', octopus: '🐙',
  kangaroo: '🦘', sloth: '🦥', panda: '🐼', koala: '🐨',
  hedgehog: '🦔', flamingo: '🦩', piano: '🎹', violin: '🎻',
  trumpet: '🎺', saxophone: '🎷', harmonica: '🎵',
  detective: '🕵️', plumber: '🔧', barber: '💈', baker: '🥖',
  butcher: '🥩', farmer: '🧑‍🌾', teacher: '🧑‍🏫', doctor: '🧑‍⚕️',
  sailor: '⚓', cowboy: '🤠', samurai: '🗡️', viking: '🛡️',
  telescope: '🔭', microscope: '🔬', compass: '🧭', calculator: '🧮',
  keyboard: '⌨️', lighthouse: '🗼', windmill: '🌬️', castle: '🏰',
  temple: '🛕', tunnel: '🕳️', pyramid: '🔺',
  waterfall: '🌊', glacier: '🧊', desert: '🏜️', jungle: '🌴',
  canyon: '🏞️', meadow: '🌾',
  chocolate: '🍫', mustard: '🟡', pickle: '🥒', sushi: '🍣',
  burrito: '🌯', spaghetti: '🍝', lobster: '🦞', shrimp: '🦐',
  oyster: '🦪', crab: '🦀', salmon: '🐟',
  tornado: '🌪️', blizzard: '🌨️', hurricane: '🌀', earthquake: '🌋',
  parachute: '🪂', skateboard: '🛹', trampoline: '🤸', hammock: '🛏️',
};

export function emojiFor(word: string): string {
  return WORD_EMOJIS[word.toLowerCase()] ?? '🔸';
}
