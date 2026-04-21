// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Platform {
			env: {
				LINK_CACHE: KVNamespace;
				OPENROUTER_API_KEY?: string;
			};
			cf?: {
				country?: string;
				[key: string]: unknown;
			};
		}
	}
}

export {};
