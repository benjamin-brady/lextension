type Env = App.Platform['env'];

const LANGFUSE_HOST = 'https://us.cloud.langfuse.com';

function langfuseAuth(env: Env): string | null {
	const pub = env.LANGFUSE_PUBLIC_KEY;
	const sec = env.LANGFUSE_SECRET_KEY;
	if (!pub || !sec) return null;
	return `Basic ${btoa(`${pub}:${sec}`)}`;
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
	},
): Promise<void> {
	const auth = langfuseAuth(env);
	if (!auth) return;

	const traceId = crypto.randomUUID();
	const now = new Date().toISOString();

	try {
		await fetch(`${LANGFUSE_HOST}/api/public/ingestion`, {
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
							tags: ['lextension'],
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
