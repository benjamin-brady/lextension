export type ChainSamplePath = readonly [string, string, string, string, ...string[]];

export interface ChainDailyPuzzle {
	start: string;
	end: string;
	samplePath: ChainSamplePath;
	difficulty: 'normal';
}

interface PuzzleBand {
	starts: readonly string[];
	ends: readonly string[];
	path: (start: string, end: string) => ChainSamplePath;
}

const PUZZLE_BANDS: readonly PuzzleBand[] = [
	{
		starts: ['Moss', 'Fern', 'Ivy', 'Emerald', 'Olive', 'Mint', 'Lime', 'Jade'],
		ends: ['Castle', 'Temple', 'Library', 'Station', 'Museum', 'Theater', 'Airport', 'Factory'],
		path: (start, end) => [start, 'Green', 'Light', 'House', end],
	},
	{
		starts: ['Fork', 'Spoon', 'Knife', 'Plate', 'Bowl', 'Cup', 'Pan', 'Pot'],
		ends: ['Pirate', 'Sailor', 'Submarine', 'Harbor', 'Compass', 'Anchor', 'Lighthouse', 'Island'],
		path: (start, end) => [start, 'Silver', 'Star', 'Ship', end],
	},
	{
		starts: ['Rain', 'Hail', 'Thunder', 'Storm', 'Drizzle', 'Sleet', 'Blizzard', 'Downpour'],
		ends: ['Guitar', 'Piano', 'Violin', 'Trumpet', 'Saxophone', 'Harmonica', 'Orchestra', 'Concert'],
		path: (start, end) => [start, 'Sound', 'Bell', 'Drum', end],
	},
	{
		starts: ['Sand', 'Wall', 'News', 'Note', 'Tissue', 'Carbon', 'Graph', 'Wax'],
		ends: ['Cowboy', 'Sheriff', 'Ranch', 'Saddle', 'Rodeo', 'Wagon', 'Lasso', 'Outlaw'],
		path: (start, end) => [start, 'Paper', 'Trail', 'Horse', end],
	},
	{
		starts: ['Cat', 'Dog', 'Bear', 'Wolf', 'Tiger', 'Lion', 'Fox', 'Panda'],
		ends: ['Keyboard', 'Calculator', 'Camera', 'Printer', 'Router', 'Monitor', 'Laptop', 'Microchip'],
		path: (start, end) => [start, 'Paw', 'Print', 'Screen', end],
	},
] as const;

export const CHAIN_DAILY_PUZZLES: readonly ChainDailyPuzzle[] = PUZZLE_BANDS.flatMap((band) =>
	band.starts.flatMap((start) =>
		band.ends.map((end) => ({
			start,
			end,
			samplePath: band.path(start, end),
			difficulty: 'normal' as const,
		}))
	)
);

const REJECTED_CHAIN_PUZZLE_KEYS = new Set(['snake->dragon']);

export function isRejectedChainPuzzle(start: string, end: string): boolean {
	return REJECTED_CHAIN_PUZZLE_KEYS.has(`${start.toLowerCase()}->${end.toLowerCase()}`);
}