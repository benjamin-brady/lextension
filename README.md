# Lextension

Lextension is a Fibonacci word-bridge game. You start with two seed words and build a chain where each new word must link to the previous two (following the Fibonacci pattern). The goal is to reach the target word in as few hops as possible.

## How it works

1. You're given two **seed words** and a **target word**.
2. Each word you play must have a valid relationship with the two words before it (compound, rhyme, category, opposite, etc.). Compound links work in either order: `hot` + `dog` counts whether played as `hot` → `dog` or `dog` → `hot`.
3. Word relationships are validated in real-time by an LLM judge.
4. Reach the target word to win — fewer hops = higher score.

## Tech stack

- **SvelteKit** on **Cloudflare Workers**
- **Cloudflare KV** for caching validated word pairs in either order
- **OpenRouter** (Gemini 2.5 Flash) for real-time word-relationship validation
- **Bun** for package management and scripts

## Development

```bash
bun install
bun run dev
```

## Deployment

```bash
bun run deploy
```

Deployed at [lextension.net](https://lextension.net)

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
