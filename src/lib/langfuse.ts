type Env = App.Platform['env'];

const DEFAULT_LANGFUSE_HOST = 'https://us.cloud.langfuse.com';

function langfuseHost(env: Env): string {
	return env.LANGFUSE_BASE_URL || DEFAULT_LANGFUSE_HOST;
}

function langfuseAuth(env: Env): string | null {
	const pub = env.LANGFUSE_PUBLIC_KEY;
	const sec = env.LANGFUSE_SECRET_KEY;
	if (!pub || !sec) return null;
	return `Basic ${btoa(`${pub}:${sec}`)}`;
}

/**
 * Privacy-friendly user identifier derived from the caller's IP.
 * SHA-256 hash, first 16 hex chars (64 bits) — enough to distinguish users,
 * not enough to recover the original IP.
 */
export async function hashUserId(ip: string | null | undefined): Promise<string | null> {
	if (!ip) return null;
	try {
		const data = new TextEncoder().encode(ip.trim());
		const digest = await crypto.subtle.digest('SHA-256', data);
		const hex = Array.from(new Uint8Array(digest))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
		return `anon-${hex.slice(0, 16)}`;
	} catch {
		return null;
	}
}

/**
 * Best-effort extraction of the caller IP from SvelteKit request headers.
 * Cloudflare sets CF-Connecting-IP; falls back to X-Forwarded-For / X-Real-IP.
 */
export function getClientIp(request: Request): string | null {
	const cf = request.headers.get('cf-connecting-ip');
	if (cf) return cf;
	const xff = request.headers.get('x-forwarded-for');
	if (xff) return xff.split(',')[0].trim();
	return request.headers.get('x-real-ip');
}

/**
 * Log an LLM validation trace to Langfuse. Fire-and-forget — never throws.
 */
export async function traceLLMValidation(
	env: Env,
	opts: {
		wordA: string;
		wordB: string;
		prompt: string;
		rawResponse: string;
		valid: boolean;
		type: string | null;
		reason: string;
		model: string;
		cached: boolean;
		durationMs?: number;
		userId?: string | null;
		usage?: {
			promptTokens?: number;
			completionTokens?: number;
			totalTokens?: number;
		} | null;
	},
): Promise<void> {
	const auth = langfuseAuth(env);
	if (!auth) return;

	const traceId = crypto.randomUUID();
	const now = new Date().toISOString();

	const usageBody = opts.usage
		? {
				input: opts.usage.promptTokens,
				output: opts.usage.completionTokens,
				total: opts.usage.totalTokens,
				unit: 'TOKENS' as const,
			}
		: undefined;

	try {
		await fetch(`${langfuseHost(env)}/api/public/ingestion`, {
			method: 'POST',
			headers: { Authorization: auth, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				batch: [
					{
						id: crypto.randomUUID(),
						type: 'trace-create',
						timestamp: now,
						body: {
							id: traceId,
							...(opts.userId ? { userId: opts.userId } : {}),
							name: 'word-validation',
							input: `${opts.wordA} → ${opts.wordB}`,
							output: opts.rawResponse,
							metadata: {
								wordA: opts.wordA,
								wordB: opts.wordB,
								valid: opts.valid,
								type: opts.type,
								reason: opts.reason,
								model: opts.model,
								cached: opts.cached,
								...(opts.durationMs != null ? { durationMs: opts.durationMs } : {}),
							},
							tags: ['lextension', 'validation'],
						},
					},
					{
						id: crypto.randomUUID(),
						type: 'generation-create',
						timestamp: now,
						body: {
							traceId,
							name: 'openrouter-validation',
							model: opts.model,
							input: opts.prompt,
							output: opts.rawResponse,
							...(usageBody ? { usage: usageBody } : {}),
							metadata: {
								wordA: opts.wordA,
								wordB: opts.wordB,
								valid: opts.valid,
								type: opts.type,
							},
						},
					},
				],
			}),
		});
	} catch {
		// best-effort
	}
}

/**
 * Record a user-feedback score in Langfuse for a word-pair validation.
 * Creates a trace + score event. Fire-and-forget — never throws.
 */
export async function scoreValidationFeedback(
	env: Env,
	opts: {
		wordA: string;
		wordB: string;
		comment: string;
		value: number; // -1 = thumbs down, +1 = thumbs up
		userId?: string | null;
	},
): Promise<void> {
	const auth = langfuseAuth(env);
	if (!auth) return;

	const traceId = crypto.randomUUID();
	const now = new Date().toISOString();

	try {
		await fetch(`${langfuseHost(env)}/api/public/ingestion`, {
			method: 'POST',
			headers: { Authorization: auth, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				batch: [
					{
						id: crypto.randomUUID(),
						type: 'trace-create',
						timestamp: now,
						body: {
							id: traceId,
							...(opts.userId ? { userId: opts.userId } : {}),
							name: 'user-feedback',
							input: `${opts.wordA} → ${opts.wordB}`,
							metadata: {
								wordA: opts.wordA,
								wordB: opts.wordB,
								comment: opts.comment,
								value: opts.value,
							},
							tags: ['lextension', 'feedback'],
						},
					},
					{
						id: crypto.randomUUID(),
						type: 'score-create',
						timestamp: now,
						body: {
							traceId,
							name: 'user-feedback',
							value: opts.value,
							comment: opts.comment || `${opts.wordA} → ${opts.wordB}`,
						},
					},
				],
			}),
		});
	} catch {
		// best-effort
	}
}
