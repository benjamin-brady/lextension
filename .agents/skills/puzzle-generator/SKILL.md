---
name: puzzle-generator
description: Generate LexLink emoji puzzles and 3x3 word-link grids. Use when asked to create, draft, expand, review, or add standard or hard puzzles with word relationships such as common phrases, compounds, containment, rhyme, homophone, derivation, slang, secondary meanings, category links, or other explainable word associations.
---

# Puzzle Generator

Use this skill when working on LexLink puzzle generation for this repository.

The goal is to produce a 3x3 puzzle with:

- 9 words
- 12 valid horizontal and vertical links
- 1 short explanation per link
- 1 clear emoji per word
- Every edge classified by relation type
- No junk edges

## Repo Model

This repo stores puzzles in [../../../src/lib/puzzles.ts](../../../src/lib/puzzles.ts).

The data model is defined in [../../../src/lib/types.ts](../../../src/lib/types.ts):

- `solution`: 9 `WordItem`s in row-major grid order
- `edges`: 12 adjacent links with `from`, `to`, and `clue`
- `WordItem` can include `emoji`

Grid adjacency is fixed:

```text
0 - 1 - 2
|   |   |
3 - 4 - 5
|   |   |
6 - 7 - 8
```

Every puzzle must define all 12 horizontal and vertical links.

---

## Relation Taxonomy

Every edge MUST be classified with exactly one relation type from this taxonomy. If you cannot cleanly assign a type, the edge is junk — reject it.

### A-Tier: Strongest Relations

These are immediately obvious to players. Prefer these. Every board needs at least 6 A-tier edges.

#### 1. Compound / Phrase
`x y` or `y x` is a recognized compound word or common phrase.

- `tea` + `party` → tea party
- `watch` + `dog` → watchdog
- `ice` + `cream` → ice cream
- `green` + `house` → greenhouse
- `sun` + `flower` → sunflower

**Test:** Would a dictionary or common usage list this compound? If you have to argue for it, it fails.

#### 2. Object–Role / Goes-With
`x` naturally belongs to, is worn by, is part of, or is used with `y`.

- `king` → `crown` (kings wear crowns)
- `car` → `trunk` (cars have trunks)
- `watch` → `band` (watches have bands)
- `pen` → `ink` (pens use ink)

**Test:** If you showed someone X, would they immediately think of Y as something X has/uses/wears?

#### 3. Part–Whole
`x` is a component or section of `y`, or `y` contains `x` as a part.

- `wheel` → `car`
- `petal` → `flower`
- `chapter` → `book`
- `brick` → `wall`

**Test:** "A Y has an X" or "X is part of a Y" sounds natural.

#### 4. Material / Made-Of
`x` is made from `y`, or `y` is composed of `x`.

- `bird` → `feathers` (birds are made of feathers)
- `ice` → `water` (ice is frozen water)
- `bread` → `flour` (bread is made from flour)
- `glass` → `sand` (glass is made from sand)
- `wine` → `grape` (wine is made from grapes)

**Test:** "X is made of/from Y" is a true, commonly known fact.

#### 5. Tool–Action / Performer–Output
`x` is the tool or performer, `y` is what it does or produces (or vice versa).

- `hammer` → `nail`
- `brush` → `paint`
- `baker` → `bread`
- `painter` → `painting`
- `camera` → `photo`

**Test:** "X is used for Y" or "X makes Y" is immediately clear.

#### 6. Cause–Effect
`x` causes, produces, or leads to `y`.

- `rain` → `flood`
- `spark` → `fire`
- `storm` → `thunder`
- `fire` → `smoke`

**Test:** "X causes Y" or "X leads to Y" is a known, direct relationship.

#### 7. Cultural Pair / Idiom
`x` and `y` are an iconic pair, proverb duo, or fixed idiom.

- `salt` + `pepper`
- `thunder` + `lightning`
- `Romeo` + `Juliet`
- `trial` + `error`
- `lock` + `key`
- `needle` + `haystack`

**Test:** Saying X almost automatically makes someone think of Y.

### B-Tier: Good Secondary Relations

Useful for variety. No more than 4 B-tier edges per board.

#### 8. Category Siblings
Both `x` and `y` belong to the same well-defined category.

- `running` + `swimming` (both sports)
- `oak` + `elm` (both trees)
- `Mars` + `Venus` (both planets)
- `piano` + `guitar` (both instruments)

**Test:** You can name the shared category in one word. "Both are ___." If the category is vague ("both are things", "both are nouns"), it fails.

#### 9. Rhyme
`x` and `y` rhyme clearly.

- `clock` / `sock`
- `cat` / `hat`
- `moon` / `spoon`
- `cake` / `lake`

**Test:** They rhyme. Obviously. Near-rhymes only if very close (e.g. `love` / `dove`).

#### 10. Homophone
`x` and `y` sound the same but are spelled differently.

- `tail` / `tale`
- `night` / `knight`
- `flour` / `flower`
- `bare` / `bear`

**Test:** Pronounced identically or near-identically.

#### 11. Anagram
The letters of `x` rearrange to spell `y`.

- `listen` ↔ `silent`
- `race` ↔ `care`
- `earth` ↔ `heart`
- `dusty` ↔ `study`

**Test:** Same letters, different order. Must be exact.

#### 12. Opposite / Antonym
`x` is the clear opposite or counterpart of `y`.

- `hot` / `cold`
- `night` / `day`
- `question` / `answer`
- `buyer` / `seller`

**Test:** A thesaurus would list them as antonyms.

#### 13. Sequence / Progression / State Change
`x` becomes `y` through a natural process, or they are adjacent steps.

- `egg` → `chicken`
- `seed` → `tree`
- `water` → `ice` (freezing)
- `grape` → `wine` (fermentation)
- `caterpillar` → `butterfly`

**Test:** There is a known, nameable process that turns X into Y.

#### 14. Containment / Hidden Word
`x` is literally inside the spelling of `y`, or a compound of `x` + another word contains `y`.

- `greenhouse` contains `green`
- `fireman` contains `fire`
- `seahorse` contains `horse`
- `carpet` contains `car` and `pet`

**Test:** You can point to the letters.

#### 15. Location / Habitat
`x` lives in, is found at, or is associated with place `y`.

- `fish` → `ocean`
- `bear` → `forest`
- `camel` → `desert`
- `penguin` → `ice`

**Test:** "Where do you find X?" → "Y" is immediate.

#### 16. Collective Noun / Group
`x` is the collective noun for a group of `y`.

- `pride` → `lions`
- `murder` → `crows`
- `flock` → `birds`
- `pack` → `wolves`

**Test:** "A X of Y" is the standard collective form.

### C-Tier: Use Sparingly

Maximum 2 C-tier edges per board. These must be supported by very clear clues.

#### 17. Double Meaning / Polysemy
`x` has a secondary meaning that links to `y` in a non-obvious way.

- `bank` (river) / `bank` (money)
- `bat` (animal) / `bat` (cricket)
- `watch` → `guard` (verb sense overlap)
- `shade` → `insult`

**Test:** The secondary meaning is in common dictionaries, not slang dictionaries.

#### 18. Slang / Informal
`x` is slang, nickname, or informal shorthand for `y`.

- `wheels` → `car`
- `threads` → `clothes`
- `digits` → `phone number`
- `tea` → `gossip`

**Test:** Most English speakers would recognize the slang usage without explanation.

#### 19. Symbol / Represents
`x` symbolically represents `y` in widespread culture.

- `dove` → `peace`
- `crown` → `royalty`
- `skull` → `danger`
- `heart` → `love`

**Test:** The symbolism is globally recognized, not niche.

### REJECTED: Not Valid Relation Types

These are NOT acceptable as edge justifications:

- **Loose thematic association:** "beach" / "summer" — too vague
- **Multi-step trivia chains:** "Mercury → messenger → wings" — requires hops
- **"Both are nouns" / "Both can be adjectives":** — not a relationship
- **Private slang / niche fandom:** — audience won't know it
- **Vibes-based connections:** "they feel related" — not a relation

---

## Hard Reject Rules

An edge is **junk** and must be discarded if ANY of these are true:

1. **Can't classify it.** If it doesn't fit cleanly into one taxonomy type, it's out.
2. **Multi-sentence explanation.** If justifying the link takes more than one sentence, it's too weak.
3. **Hedging language.** If the clue needs "could be seen as", "in a way", "loosely", "sort of" — it's out.
4. **Multi-hop reasoning.** If you need A→B→C to explain why A links to C — it's out.
5. **Requires obscure knowledge.** If < 80% of English speakers would get it — it's out.
6. **Generic connector.** If either word could link to 5+ other words on the same board equally well — the word is too generic.
7. **Reverse test failure.** Show someone the two words and the clue. Could they distinguish this pair from a random pairing? If no — it's out.
8. **Clue depends on a third word.** The clue should work from just the two endpoint words.

---

## Board-Level Quality Gates

A complete puzzle must pass ALL of these before it's accepted:

1. **Minimum 3 distinct relation types** across the 12 edges.
2. **No single relation type on more than 6 edges** (50%).
3. **At least 6 A-tier edges.**
4. **No more than 2 C-tier edges.**
5. **Every word participates in at least 1 A-tier edge.**
6. **No word connects plausibly to more than 4 other words** in the set (intended + unintended).
7. **No plausible alternate solution** — swapping 2-3 words should not produce an equally convincing board.
8. **The board has anchors** — at least 2 A-tier edges using Compound/Phrase or Cultural Pair, so players have obvious footholds.

Note: 6 A-tier + 4 B-tier + 2 C-tier = 12 exactly. The math is tight. If a puzzle has 6 A, 5 B, 1 C, that's still valid (at most 6 of one type, at most 2 C-tier). Aim for 7-8 A-tier if possible — it leaves room to drop a weak edge during review.

---

## Hard Puzzle Guidance

Hard puzzles may lean more on B and C-tier relations, but they still need to feel fair after the reveal.

Hard puzzle allowances:

- Up to 4 C-tier edges (instead of 2)
- Minimum 4 A-tier edges (instead of 6)
- May use common double meanings, figurative senses, idioms, and slang
- Words can link through different parts of speech

Hard puzzle constraints:

- Prefer common alternate meanings, not dictionary archaeology.
- Prefer sayings and idioms that are widely recognizable, not regional.
- A player should be able to say "that is fair" once the clue is shown.
- Do not stack obscurity with ambiguity.
- Hard should come from layered reasoning, not from vague words that fit everywhere.

---

## Anti-Patterns: Examples of Slop

These are real examples of bad edges. Learn to recognize the patterns.

| Words | Why it's junk |
|-------|---------------|
| `storm` + `night` | Loose thematic. Storms happen at any time. |
| `board` + `case` | "Both can be containers"? Barely. Two-hop reasoning. |
| `press` + `suit` | Only works via the niche phrase "press a suit." Most people won't get it. |
| `man` + `power` | Too generic. Man + anything forms a compound. |
| `fire` + `dance` | "Fire dance" exists but is not a common compound. |
| `line` + `life` | "Lifeline" is a compound, but the clue leans on grid position rather than the word pair itself. |
| `board` + `game` vs `board` + `room` vs `board` + `meeting` | `board` connecting three ways on one grid = generic connector. Pick one. |
| `tea` + `tree` via "tea tree oil" | Requires a third word (`oil`) to make the phrase — violates the no-third-word rule. |

---

## Emoji Rules

One emoji per word. Rules:

- Prefer a direct, obvious emoji for the intended sense.
- For abstract concepts (colors, directions, numbers), prefer neutral symbols: `Green` → `🟩`, not `🌿`.
- Keep emojis distinct within the same board.
- If a word has multiple senses, choose the emoji that supports the intended clue network.
- Two-emoji combinations are allowed for compound concepts: `Seahorse` → `🌊🐴`.
- Do not use more than two emojis per word.
- Do not smuggle extra meaning through the emoji.

---

## Workflow: Subagent Generate-Review Loop

When the user asks for puzzles, use a **generate → review → fix** loop with subagents. This produces better puzzles than single-pass generation.

Use the `runSubagent` tool for each step. Run generators in parallel when producing multiple puzzles; run the reviewer as a separate subagent call so it starts with no memory of the generator's reasoning — this is the key to harsh, independent review.

### Pre-flight: Word-Set Viability Check

BEFORE arranging any grid, list all 9 candidate words and enumerate every pairwise relation among them (36 possible pairs). The chosen 9 must support at least 12 strong edges drawn from A/B-tier relations, with no single word appearing in more than 4 plausible edges. If the word set can't support this, pick new words — do not proceed to grid placement.

### Generating a single puzzle

#### Step 1: Generate (Subagent)

Launch a subagent via `runSubagent` with the prompt:

> Generate a LexLink puzzle candidate. You are writing a 3x3 word-link grid with 9 words and 12 edges.
>
> GRID LAYOUT:
> ```
> 0 - 1 - 2
> |   |   |
> 3 - 4 - 5
> |   |   |
> 6 - 7 - 8
> ```
>
> RULES:
> 1. Pick 9 concrete, emoji-friendly English words.
> 2. Before placing: list every pairwise relation among the 9 words. Verify at least 12 viable strong edges exist and no word is a generic connector (appears in 5+ plausible pairs).
> 3. Arrange them in the 3x3 grid so every horizontal and vertical adjacency has a strong relationship.
> 4. For EACH of the 12 edges, state:
>    - The two words
>    - The relation type (from: compound/phrase, object-role, part-whole, material/made-of, tool-action, cause-effect, cultural-pair, category-siblings, rhyme, homophone, anagram, opposite, sequence/state-change, containment, location/habitat, collective-noun, double-meaning, slang, symbol)
>    - The tier (A, B, or C)
>    - A one-sentence clue (the clue must work from just the two endpoint words — no reference to a third word)
> 5. Minimum 6 A-tier edges, max 2 C-tier, at least 3 distinct relation types.
> 6. At least 2 anchor edges must be Compound/Phrase or Cultural Pair type.
> 7. Assign one emoji per word.
>
> {Insert any user-specified theme, difficulty, or constraints here.}
>
> Return the puzzle in this exact TypeScript format:
> ```ts
> {
>   solution: [
>     { word: 'Word', emoji: '🎯' },
>     // ... 9 total
>   ],
>   edges: [
>     { from: 0, to: 1, clue: 'Clue text.' },
>     // ... 12 total
>   ]
> }
> ```
>
> Also return a classification table:
> | Edge | Words | Type | Tier | Clue |
> |------|-------|------|------|------|
> | 0→1  | X + Y | compound | A | ... |
> | ...  | ...   | ...  | ... | ... |

#### Step 2: Review (Subagent)

Launch a SEPARATE subagent with the generated puzzle and this prompt:

> You are a puzzle quality reviewer. Your job is to find weak edges and reject junk. Be harsh. Be specific. Do not approve slop.
>
> Review this LexLink puzzle candidate:
> {paste the puzzle + classification table from Step 1}
>
> For EACH of the 12 edges, answer:
> 1. Is the stated relation type correct? If not, what is it really?
> 2. Does it pass the hard reject rules? Check each:
>    - Can it be classified cleanly into one type?
>    - Can the link be explained in one sentence?
>    - Does the clue avoid hedging language?
>    - Is it direct (no multi-hop)?
>    - Would 80%+ of English speakers get it?
>    - Is either word too generic for this board?
>    - Reverse test: could someone distinguish this pair from a random pairing?
>    - Does the clue work without depending on a third word?
> 3. Rate the edge: PASS, WEAK (fixable), or REJECT (must replace).
>
> Then check board-level gates:
> - At least 3 distinct relation types?
> - No type on more than 6/12 edges?
> - At least 6 A-tier edges?
> - No more than 2 C-tier?
> - Every word in at least 1 A-tier edge?
> - Any word a generic connector (links to 5+ others plausibly)?
> - Any plausible alternate solution from swapping 2-3 words?
> - At least 2 obvious anchor edges?
>
> Return:
> - A verdict for each edge (PASS / WEAK / REJECT)
> - A list of specific fixes needed
> - An overall verdict: ACCEPT, REVISE (fixable), or REJECT (start over)

#### Step 3: Fix or Regenerate

Based on the review:

- **ACCEPT**: Use the puzzle as-is.
- **REVISE**: Fix the specific edges flagged as WEAK or REJECT. You can do this yourself or launch another subagent to regenerate just the problem areas. Then send back through Step 2.
- **REJECT**: Go back to Step 1 with adjusted constraints.

**Maximum 3 loops.** If a puzzle hasn't converged after 3 generate-review cycles, discard it and start fresh with a different word seed.

### Generating multiple puzzles

When asked for N puzzles, launch N generator subagents in parallel (Step 1). Then review each result (Step 2 — can also be parallelized). Fix individually. This is much faster than sequential generation.

### Generating hard puzzles

Use the same loop, but adjust the generator prompt constraints:

> Hard puzzle: minimum 4 A-tier edges (instead of 6), up to 4 C-tier edges (instead of 2). Prefer double meanings, idioms, figurative senses, and less obvious compounds. Every edge must still feel fair after reveal.

---

## Output Format

When returning a puzzle candidate for this repo, use this shape (match the repo's tab indentation):

```ts
{
	solution: [
		{ word: 'King', emoji: '🤴' },
		{ word: 'Crown', emoji: '👑' },
		{ word: 'Tooth', emoji: '🦷' },
		{ word: 'Fairy', emoji: '🧚' },
		{ word: 'Tale', emoji: '📖' },
		{ word: 'Tail', emoji: '🐒' },
		{ word: 'Coat', emoji: '🧥' },
		{ word: 'Pocket', emoji: '👖' },
		{ word: 'Watch', emoji: '⌚' }
	],
	edges: [
		{ from: 0, to: 1, clue: 'Kings wear crowns.' },
		{ from: 1, to: 2, clue: 'A crown can cap a damaged tooth.' },
		{ from: 3, to: 4, clue: 'Fairies belong in fairy tales.' },
		{ from: 4, to: 5, clue: 'Tale and tail sound identical.' },
		{ from: 6, to: 7, clue: 'Coats come with pockets.' },
		{ from: 7, to: 8, clue: 'A pocket watch is a classic pairing.' },
		{ from: 0, to: 3, clue: 'The tooth fairy answers to both.' },
		{ from: 3, to: 6, clue: 'A fairy-tale coat belongs in the wardrobe.' },
		{ from: 1, to: 4, clue: 'Crowns feature in plenty of tales.' },
		{ from: 4, to: 7, clue: 'Tales have pockets of detail.' },
		{ from: 2, to: 5, clue: 'Both can describe an end.' },
		{ from: 5, to: 8, clue: 'A watchful animal keeps an eye on its tail.' }
	]
}
```

Example classification table for that puzzle:

| Edge | Words | Type | Tier |
|------|-------|------|------|
| 0→1 | King + Crown | object-role | A |
| 1→2 | Crown + Tooth | object-role | A |
| 3→4 | Fairy + Tale | compound/phrase | A |
| 4→5 | Tale + Tail | homophone | B |
| 6→7 | Coat + Pocket | part-whole | A |
| 7→8 | Pocket + Watch | compound/phrase | A |
| 0→3 | King + Fairy | cultural-pair | B |
| 3→6 | Fairy + Coat | object-role | B |
| 1→4 | Crown + Tale | object-role | B |
| 4→7 | Tale + Pocket | double-meaning | C |
| 2→5 | Tooth + Tail | category-siblings | B |
| 5→8 | Tail + Watch | object-role | A |

Count: 6 A-tier, 5 B-tier, 1 C-tier. 6 distinct relation types. Passes gates.

---

## Review Checklist

Before presenting or committing a puzzle, verify:

- [ ] All 12 edges are present.
- [ ] Every edge has been classified with a relation type.
- [ ] No edge was classified as REJECT by the reviewer.
- [ ] Every clue matches the exact words in its two endpoints.
- [ ] No clue depends on a third word from the board.
- [ ] The board uses at least 3 relation families.
- [ ] At least 6 A-tier edges (4 for hard).
- [ ] No more than 2 C-tier edges (4 for hard).
- [ ] The board has 2+ obvious anchor edges.
- [ ] No word is a catch-all connector with too many plausible partners.
- [ ] No plausible alternate arrangement.
- [ ] Each word has a suitable emoji.
- [ ] Hard puzzles feel fair after reveal, not obscure.
- [ ] The final result feels like a LexLink puzzle, not a random word web.

---

## If Editing The Repo

If the user asks to add the puzzle directly:

- Edit [../../../src/lib/puzzles.ts](../../../src/lib/puzzles.ts).
- Preserve the existing puzzle object style.
- Include inline `emoji` values on new words when that is the clearest option.
- Run `bun run check` after editing.
