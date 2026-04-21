import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { VALIDATION_PROMPT } from '$lib/validation-prompt';
import type { LinkVerdict } from '$lib/types';

function cacheKey(a: string, b: string): string {
  const lo = a.toLowerCase().trim();
  const hi = b.toLowerCase().trim();
  // Alphabetical order so (ice,cream) and (cream,ice) hit the same key
  return lo < hi ? `lext:${lo}:${hi}` : `lext:${hi}:${lo}`;
}

async function validatePairWithLLM(a: string, b: string, apiKey: string): Promise<LinkVerdict> {
  const prompt = VALIDATION_PROMPT.replace('{a}', a).replace('{b}', b);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b:nitro',
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
  };
  const raw = data.choices[0]?.message?.content ?? '';

  try {
    // Strip markdown fences if present
    const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned) as { valid: boolean; type: string | null; reason: string };
    return {
      a,
      b,
      valid: parsed.valid,
      type: parsed.type ?? null,
      reason: parsed.reason ?? '',
    };
  } catch {
    console.error('Failed to parse LLM response:', raw);
    return { a, b, valid: false, type: null, reason: 'Failed to parse validation response' };
  }
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

  // Sanitize: only allow letters, hyphens, spaces, apostrophes
  const wordPattern = /^[a-zA-Z\s'-]+$/;
  if (!wordPattern.test(a) || !wordPattern.test(b)) {
    return json({ error: 'Words must contain only letters' }, { status: 400 });
  }

  if (a.toLowerCase() === b.toLowerCase()) {
    return json({ error: 'Words must be different' }, { status: 400 });
  }

  const kv = platform?.env?.LINK_CACHE;
  const apiKey = platform?.env?.AI_API_KEY;

  if (!apiKey) {
    return json({ error: 'AI validation not configured' }, { status: 503 });
  }

  const key = cacheKey(a, b);

  // Check KV cache first
  if (kv) {
    const cached = await kv.get(key, 'json');
    if (cached) {
      return json(cached as LinkVerdict);
    }
  }

  // Call LLM
  const verdict = await validatePairWithLLM(a, b, apiKey);

  // Cache the result (no expiry — word relationships don't change)
  if (kv) {
    await kv.put(key, JSON.stringify(verdict));
  }

  return json(verdict);
};
