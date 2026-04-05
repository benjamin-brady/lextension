# LexLink

LexLink is a daily 3x3 word-grid puzzle. You get nine word tiles and need to place them so every horizontal and vertical connection makes sense.

## How the game works

Each puzzle has:

- 9 words that belong in fixed spots in a 3x3 grid
- 12 required links between adjacent cells
- a short reason for every link

The active links are the horizontal and vertical neighbors:

```text
0 - 1 - 2
|   |   |
3 - 4 - 5
|   |   |
6 - 7 - 8
```

To solve a puzzle:

1. Drag words from the tray into the grid.
2. Rearrange tiles until every word is in the right location.
3. Use the link colors as feedback while you work.

Feedback rules:

- Green link: both words are in the correct positions for that link.
- Yellow link: the two words are swapped with each other.
- Red link: both words are placed, but the link is wrong.
- Green tile outline: that word is in its exact final position.

The puzzle is solved only when all nine words are in the correct spots. After that, the app reveals the full list of link explanations for the completed grid.

## Puzzle structure

Puzzle data lives in [src/lib/puzzles.ts](src/lib/puzzles.ts). Each puzzle provides:

- `solution`: the 9 final word slots in row-major order
- `edges`: the 12 adjacent links, each with `from`, `to`, and `clue`

An edge looks like this:

```ts
{ from: 0, to: 1, clue: 'A fire alarm' }
```

That means the words in slots `0` and `1` should have a valid relationship, and the clue explains why once the puzzle is solved.

## Backup and new puzzle data

The puzzle catalog that existed before this update is backed up in [src/lib/puzzle-backups/2026/2026-04-01.ts](src/lib/puzzle-backups/2026/2026-04-01.ts).

The live catalog includes puzzles that use action and property links rather than simple compound-word pairs. For example:

```text
Skin    Boil     Water
Drum    Roll     Tide
Stick   Thunder  Storm
```

Sample links from that grid:

- Skin → Boil: `A boil is a skin condition`
- Drum → Roll: `A drum roll builds suspense`
- Roll → Thunder: `A roll of thunder echoes across the sky`
- Tide → Storm: `A storm surge raises the tide dangerously`

## Development

This repository uses Bun.

```sh
bun install
bun run dev
bun run check
bun run build
bun run deploy
```

`bun run dev` starts the local app, `bun run check` runs Svelte type checks, and `bun run deploy` builds and deploys with Wrangler.

## Analytics

GA4 is loaded from the app layout when `PUBLIC_GA_MEASUREMENT_ID` is present. This repository is configured with:

- local development via `.env`
- a tracked example in `.env.example`
- Cloudflare deployment via `wrangler.toml`

The current measurement ID is `G-4HPSRG5QQ7`.
