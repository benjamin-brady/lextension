import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { RELATION_TYPES, type RelationType } from "./types";

const ROOT = process.cwd();

const HELP_SOURCE_FILES = [
  "src/lib/components/LextensionGame.svelte",
  "src/lib/components/FibonacciGame.svelte",
  "src/lib/components/LinkTypeHelp.svelte",
  "src/lib/link-type-help.ts",
];

const EXPECTED_COPY: Record<RelationType, string[]> = {
  compound: ["Compound", "ice"],
  kangaroo: ["Kangaroo", "astound"],
  synonym: ["Synonym", "cab"],
  rhyme: ["Rhyme", "cat"],
  opposite: ["Opposite", "hot"],
  "category-sibling": ["Category sibling", "dog"],
  "part-whole": ["Part / whole", "wheel"],
  "object-role": ["Object / role", "stage"],
  material: ["Material", "wood"],
  "verb-object": ["Verb / object", "chop"],
  collocation: ["Collocation", "heavy"],
  "cause-effect": ["Cause / effect", "rain"],
  "cultural-pair": ["Cultural pair", "salt"],
  slang: ["Slang", "buck"],
  "double-meaning": ["Double meaning", "bar"],
  homophone: ["Homophone", "flower"],
  containment: ["Containment", "art"],
  anagram: ["Anagram", "listen"],
};

function readIfPresent(relativePath: string): string {
  const path = join(ROOT, relativePath);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

describe("link type help copy", () => {
  test("lists every supported relationship without an abbreviated catch-all", () => {
    const helpSource = HELP_SOURCE_FILES.map(readIfPresent).join("\n");

    expect(helpSource).not.toContain("...and more");

    for (const relationType of RELATION_TYPES) {
      for (const copyFragment of EXPECTED_COPY[relationType]) {
        expect(helpSource).toContain(copyFragment);
      }
    }
  });
});
