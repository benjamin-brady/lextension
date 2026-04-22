// Fetches Ben Brady's cross-site game manifest and picks a weighted-random
// game to promote at the end of a round. Fails silently on network errors.

export type PromoGame = {
	slug: string;
	name: string;
	url: string;
	tagline: string;
	description: string;
	emoji: string;
	tags: string[];
	status: 'live' | 'beta' | 'alpha';
	weight: number;
	images: {
		screenshot: string | null;
		og: string | null;
		logo: string | null;
	};
};

type Manifest = {
	version: number;
	updated: string;
	site: string;
	games: PromoGame[];
};

const MANIFEST_URL = 'https://benjamin-brady.github.io/games.json';
const CACHE_KEY = 'lextension:cross-promo:v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const SELF_SLUG = 'lextension';

type Cached = { fetchedAt: number; games: PromoGame[] };

function readCache(): PromoGame[] | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Cached;
		if (!parsed?.fetchedAt || !Array.isArray(parsed.games)) return null;
		if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
		return parsed.games;
	} catch {
		return null;
	}
}

function writeCache(games: PromoGame[]) {
	if (typeof localStorage === 'undefined') return;
	try {
		const payload: Cached = { fetchedAt: Date.now(), games };
		localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
	} catch {
		// quota, private mode, etc. — ignore
	}
}

export async function loadPromoGames(): Promise<PromoGame[]> {
	const cached = readCache();
	if (cached) return cached;
	try {
		const res = await fetch(MANIFEST_URL, { cache: 'no-store' });
		if (!res.ok) return [];
		const data = (await res.json()) as Manifest;
		const games = (data?.games ?? []).filter((g) => g?.slug && g.slug !== SELF_SLUG && g.url);
		writeCache(games);
		return games;
	} catch {
		return [];
	}
}

export function pickWeighted(games: PromoGame[]): PromoGame | null {
	if (!games.length) return null;
	const total = games.reduce((s, g) => s + Math.max(0, g.weight ?? 0), 0);
	if (total <= 0) return games[Math.floor(Math.random() * games.length)];
	let r = Math.random() * total;
	for (const g of games) {
		r -= Math.max(0, g.weight ?? 0);
		if (r <= 0) return g;
	}
	return games[games.length - 1];
}
