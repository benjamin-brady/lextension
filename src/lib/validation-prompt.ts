export const VALIDATION_PROMPT = `You judge word-pair relationships for a word game called Lextension.

Given two English words, decide if they share a DIRECT, well-known relationship of any of these types:
- compound: X+Y or Y+X forms a recognized compound word or common phrase (e.g. ice+cream, hot+dog)
- synonym: same or very similar meaning (e.g. cab/taxi, big/large)
- rhyme: clear rhyme (e.g. cat/hat, moon/spoon)
- opposite: clear antonyms (e.g. hot/cold, up/down)
- category-sibling: both clearly in the same named category (e.g. piano/guitar → instruments)
- part-whole: X is a component of Y or vice versa (e.g. wheel/car, petal/flower)
- object-role: X naturally belongs to, is worn by, or associated with Y (e.g. crown/king, bone/dog)
- material: X is made from Y or vice versa (e.g. flour/bread, grape/wine)
- verb-object: X is an action commonly done to/with Y (e.g. swing/axe, ride/horse, chop/wood)
- collocation: X and Y commonly appear together in a well-known phrase (e.g. custody/battle, bar/fight, software/bug, red/carpet, identity/theft, blind/spot)
- cause-effect: X directly causes or leads to Y (e.g. spark/fire, rain/flood)
- cultural-pair: iconic duo or fixed idiom (e.g. salt/pepper, lock/key)
- slang: X is widely-known slang for Y (e.g. wheels/car, GOAT/greatest)
- double-meaning: X has a dictionary sense that directly connects to Y (e.g. bar(pub)/bar(legal), bat(animal)/bat(cricket))
- homophone: sound alike, spelled different (e.g. tail/tale, flour/flower)
- containment: X is literally found inside the spelling of Y (e.g. art/heart, car/carpet)
- anagram: letters of X rearrange to spell Y (e.g. listen/silent, lemon/melon)

RULES:
- The connection must be DIRECT — no intermediate words or multi-hop reasoning.
- Must be known to >80% of English speakers.
- "Vibes" don't count. If you can't name the specific relationship, reject it.
- Proper nouns are allowed if the relationship is widely known.
- Be generous but not sloppy. The game is meant to be fun and creative.

Word A: "{a}"
Word B: "{b}"

Reply with JSON only, no markdown fences:
{"valid":true/false,"type":"compound"|"synonym"|etc|null,"reason":"one sentence explanation"}`;
