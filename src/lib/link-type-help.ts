import type { RelationType } from "./types";

export interface LinkTypeHelpItem {
  type: RelationType;
  emoji: string;
  label: string;
  example: string;
}

export const LINK_TYPE_HELP: LinkTypeHelpItem[] = [
  { type: "compound", emoji: "🧩", label: "Compound", example: "ice + cream" },
  {
    type: "kangaroo",
    emoji: "🦘",
    label: "Kangaroo",
    example: "astound + stun",
  },
  { type: "synonym", emoji: "🔄", label: "Synonym", example: "cab + taxi" },
  { type: "rhyme", emoji: "🎵", label: "Rhyme", example: "cat + hat" },
  { type: "opposite", emoji: "⚡", label: "Opposite", example: "hot + cold" },
  {
    type: "category-sibling",
    emoji: "👥",
    label: "Category sibling",
    example: "dog + cat",
  },
  {
    type: "part-whole",
    emoji: "🔧",
    label: "Part / whole",
    example: "wheel + car",
  },
  {
    type: "object-role",
    emoji: "🎭",
    label: "Object / role",
    example: "stage + actor",
  },
  { type: "material", emoji: "🧱", label: "Material", example: "wood + chair" },
  {
    type: "verb-object",
    emoji: "💪",
    label: "Verb / object",
    example: "chop + wood",
  },
  {
    type: "collocation",
    emoji: "💬",
    label: "Collocation",
    example: "heavy + rain",
  },
  {
    type: "cause-effect",
    emoji: "💥",
    label: "Cause / effect",
    example: "rain + flood",
  },
  {
    type: "cultural-pair",
    emoji: "🤝",
    label: "Cultural pair",
    example: "salt + pepper",
  },
  { type: "slang", emoji: "🗣️", label: "Slang", example: "buck + dollar" },
  {
    type: "double-meaning",
    emoji: "🎯",
    label: "Double meaning",
    example: "bar + lawyer",
  },
  {
    type: "homophone",
    emoji: "👂",
    label: "Homophone",
    example: "flower + flour",
  },
  {
    type: "containment",
    emoji: "📦",
    label: "Containment",
    example: "art + heart",
  },
  {
    type: "anagram",
    emoji: "🔀",
    label: "Anagram",
    example: "listen + silent",
  },
];

export function getRelationTypeEmoji(type: string | null): string {
  return LINK_TYPE_HELP.find((item) => item.type === type)?.emoji ?? "✅";
}
