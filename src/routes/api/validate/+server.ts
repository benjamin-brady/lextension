import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { VALIDATION_PROMPT } from '$lib/validation-prompt';
import type { LinkVerdict } from '$lib/types';
import { traceLLMValidation, hashUserId, getClientIp } from '$lib/langfuse';
import { getCodeLinkVerdict } from '$lib/word-link-validation';
import { getValidationCacheKey, reframeVerdictForPair } from '$lib/validation-cache';

const VALID_TYPES = [
  'compound', 'synonym', 'rhyme', 'opposite', 'category-sibling',
  'part-whole', 'object-role', 'material', 'verb-object', 'collocation',
  'cause-effect', 'cultural-pair', 'slang', 'double-meaning',
  'homophone', 'containment', 'anagram',
];

function parseLLMResponse(a: string, b: string, raw: string): LinkVerdict {
  // 1. Try strict JSON parse (strip markdown fences first)
  const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as { valid: boolean; type: string | null; reason: string };
    return {
      a, b,
      valid: !!parsed.valid,
      type: parsed.type ?? null,
      reason: parsed.reason ?? '',
    };
  } catch {
    // fall through to regex extraction
  }

  // 2. Regex fallback: extract valid, type, reason from messy LLM output
  const lower = raw.toLowerCase();

  // Detect valid/invalid
  const validMatch = lower.match(/"valid"\s*:\s*(true|false)/);
  const hasPass = /\bpass\b|\bvalid\b.*\btrue\b|\byes\b/.test(lower);
  const hasFail = /\bfail\b|\bvalid\b.*\bfalse\b|\breject\b|\binvalid\b/.test(lower);
  let valid: boolean;
  if (validMatch) {
    valid = validMatch[1] === 'true';
  } else if (hasPass && !hasFail) {
    valid = true;
  } else if (hasFail && !hasPass) {
    valid = false;
  } else {
    // ambiguous — default reject
    console.error('Ambiguous LLM response, defaulting to reject:', raw);
    return { a, b, valid: false, type: null, reason: 'Could not parse LLM response' };
  }

  // Extract type
  let type: string | null = null;
  const typeMatch = raw.match(/"type"\s*:\s*"([^"]+)"/);
  if (typeMatch && VALID_TYPES.includes(typeMatch[1])) {
    type = typeMatch[1];
  } else {
    // Scan for any known type keyword in the response
    for (const t of VALID_TYPES) {
      if (lower.includes(t)) { type = t; break; }
    }
  }

  // Extract reason
  const reasonMatch = raw.match(/"reason"\s*:\s*"([^"]+)"/);
  const reason = reasonMatch?.[1] ?? (valid ? 'Accepted (parsed from freeform)' : 'Rejected (parsed from freeform)');

  console.log('Regex-parsed LLM response:', { valid, type, reason, raw: raw.slice(0, 200) });
  return { a, b, valid, type, reason };
}

const MODEL = 'google/gemini-2.5-flash';

type LLMUsage = { promptTokens?: number; completionTokens?: number; totalTokens?: number };

async function validatePairWithLLM(a: string, b: string, apiKey: string): Promise<{ verdict: LinkVerdict; raw: string; prompt: string; usage: LLMUsage | null }> {
  const prompt = VALIDATION_PROMPT.replaceAll('{a}', a).replaceAll('{b}', b);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('LLM API error:', response.status, text);
    throw new Error(`LLM API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };
  const raw = data.choices[0]?.message?.content ?? '';
  const usage = data.usage
    ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      }
    : null;
  return { verdict: parseLLMResponse(a, b, raw), raw, prompt, usage };
}

export const POST: RequestHandler = async ({ request, platform }) => {
  const body = (await request.json()) as { a?: string; b?: string };

  const a = (body.a ?? '').trim();
  const b = (body.b ?? '').trim();

  if (!a || !b) {
    return json({ error: 'Both words "a" and "b" are required' }, { status: 400 });
  }

  if (a.length > 30 || b.length > 30) {
    return json({ error: 'Words must be 30 characters or less' }, { status: 400 });
  }

  // Sanitize: single word only, letters/hyphens/apostrophes (no spaces)
  const wordPattern = /^[a-zA-Z'-]+$/;
  if (!wordPattern.test(a) || !wordPattern.test(b)) {
    return json({ error: 'One word only — no spaces or special characters' }, { status: 400 });
  }

  if (a.toLowerCase() === b.toLowerCase()) {
    return json({ error: 'Words must be different' }, { status: 400 });
  }

  const kv = platform?.env?.LINK_CACHE;
  const key = getValidationCacheKey(a, b);

  const codeVerdict = getCodeLinkVerdict(a, b);
  if (codeVerdict) {
    if (kv) {
      await kv.put(key, JSON.stringify(codeVerdict));
    }

    return json(codeVerdict);
  }

  const apiKey = platform?.env?.OPENROUTER_API_KEY;

  if (!apiKey) {
    return json({ error: 'AI validation not configured' }, { status: 503 });
  }

  // Check KV cache first
  if (kv) {
    const cached = await kv.get(key, 'json');
    if (cached) {
      return json(reframeVerdictForPair(cached as LinkVerdict, a, b));
    }
  }

  // Call LLM
  const t0 = Date.now();
  const { verdict, raw, prompt, usage } = await validatePairWithLLM(a, b, apiKey);
  const durationMs = Date.now() - t0;

  // Cache the result (no expiry — word relationships don't change)
  if (kv) {
    await kv.put(key, JSON.stringify(verdict));
  }

  // Trace to Langfuse (fire-and-forget)
  const env = platform?.env;
  if (env) {
    const userId = await hashUserId(getClientIp(request));
    void traceLLMValidation(env, {
      wordA: a,
      wordB: b,
      prompt,
      rawResponse: raw,
      valid: verdict.valid,
      type: verdict.type,
      reason: verdict.reason,
      model: MODEL,
      cached: false,
      durationMs,
      userId,
      usage,
    });
  }

  return json(verdict);
};
