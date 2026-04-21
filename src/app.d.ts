// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	interface Window {
		dataLayer: unknown[];
		gtag?: (
			command: 'js' | 'config' | 'event',
			target: string | Date,
			params?: Record<string, unknown>
		) => void;
	}
	namespace App {
		interface Platform {
			env: {
				LINK_CACHE: KVNamespace;
				OPENROUTER_API_KEY?: string;
				LANGFUSE_PUBLIC_KEY?: string;
				LANGFUSE_SECRET_KEY?: string;
			};
			cf?: {
				country?: string;
				[key: string]: unknown;
			};
		}
	}
}

export {};
