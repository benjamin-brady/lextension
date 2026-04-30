export const VALIDATION_PROMPT = `You are a word-relationship judge for a fun word game. Your job is to ACCEPT word pairs that share any well-known relationship and only REJECT pairs with no recognizable connection.

RELATIONSHIP TYPES (accept if ANY of these apply — check EVERY type before rejecting):

1. compound: BIDIRECTIONAL TEST — is "A B" or "B A" a recognized compound? This includes BOTH closed compounds (one word: "hotdog", "sunburn") AND open compounds (two words: "ice cream", "apple pie", "boxing match", "apple computer", "satellite phone"). The test: would most English speakers recognize either order as a fixed noun phrase or compound? If YES → accept. Examples: A="hot" B="dog" → "hot dog" ✓. A="dog" B="hot" → "hot dog" ✓. A="apple" B="pie" → "apple pie" ✓. A="phone" B="satellite" → "satellite phone" ✓.
2. synonym: same/similar meaning → cab/taxi, big/large
3. rhyme: ending sounds match (spelling can differ) → cat/hat, moon/spoon, tail/male, hail/pale, rain/cane, bone/phone, night/kite, gold/bold, time/rhyme
4. opposite: antonyms → hot/cold, up/down
5. category-sibling: same named category → piano/guitar (instruments), apple/pear (fruits)
6. part-whole: A is a NAMED, CANONICAL part of B (or vice versa) → wheel/car, petal/flower, wing/bird, trunk/elephant. The part must be a specific, recognized component — not a generic size word. "chunk", "piece", "bit", "section", "fragment", "slab", "portion" are NOT valid parts of anything because you can say "a chunk of" literally anything physical. If the relationship is just "X can be broken into pieces called Y", REJECT.
7. object-role: natural association → crown/king, bone/dog
8. material: made from → flour/bread, grape/wine
9. verb-object: action + target → chop/wood, ride/horse
10. collocation: a FIXED, NAMED phrase that English speakers use as a unit → "red carpet", "identity theft", "bar fight", "blind spot", "custody battle", "power struggle". The test: would a dictionary or phrasebook list "A B" or "B A" as its own entry? If you can only justify it with "these words sometimes appear in the same sentence" or "in the context of X, you might say…", REJECT. Vague topical proximity is NOT collocation.
11. cause-effect: X leads to Y → spark/fire, rain/flood
12. cultural-pair: iconic duo/idiom → salt/pepper, lock/key
13. slang: widely-known slang → wheels/car, GOAT/greatest
14. double-meaning: polysemy link → bar(pub)/bar(legal), bat(animal)/bat(cricket)
15. homophone: sound alike → tail/tale, flour/flower
16. containment: X appears inside spelling of Y → art/heart, car/carpet
17. anagram: rearranged letters → listen/silent, lemon/melon

CRITICAL RULES:
- ACCEPT if you can name ANY specific relationship type from the list above.
- COMPOUND BIDIRECTIONAL TEST: Ask yourself "Is '{a} {b}' or '{b} {a}' a recognized compound (open or closed)?" If either direction works, it is a compound.
- All relationship types are bidirectional for game validation — order doesn't matter.
- The phrase "X Y" or "Y X" must be a FIXED expression in English to count as collocation. "Rock orbit" is NOT a collocation. "Red carpet" IS. If you wouldn't find "A B" in a phrasebook, it's not a collocation.
- Connection must be DIRECT — no intermediate words.
- Must be known to >80% of English speakers.
- If you can't name a specific type, reject.
- Proper nouns OK if widely known.
- When in doubt about compound, rhyme, opposite, category-sibling, or cultural-pair: ACCEPT. When in doubt about collocation or part-whole: REJECT.

Word A: "{a}"
Word B: "{b}"

COMPOUND CHECK (do this FIRST before anything else):
- Is "{a} {b}" or "{b} {a}" (or "{a}{b}" / "{b}{a}" as one word) a recognized English compound? If yes, type=compound is allowed.
- If neither direction is a recognized compound, check other types instead.

RHYME CHECK (do this SECOND — spelling does NOT matter, only sound):
- Say both words aloud. Do the ending sounds match? tail/male ✓ (both -ale sound), hail/pale ✓, rain/cane ✓, bone/phone ✓, night/kite ✓, gold/bold ✓. Different spellings are fine — rhyme is about SOUND not spelling.

Then check ALL remaining types (synonym, opposite, category-sibling, part-whole, object-role, material, verb-object, collocation, cause-effect, cultural-pair, slang, double-meaning, homophone, containment, anagram).

Reply with ONLY this JSON (no markdown, no extra text):
{"compound_concat":"{a} {b} or {b} {a}","compound_is_word":true_or_false,"valid":true,"type":"<type>","reason":"one sentence"}
or
{"compound_concat":"{a} {b} or {b} {a}","compound_is_word":false,"valid":false,"type":null,"reason":"one sentence"}`;
