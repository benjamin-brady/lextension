export function trackPageView(url: URL, measurementId: string) {
	if (typeof window === 'undefined' || typeof window.gtag !== 'function' || !measurementId) {
		return;
	}
	window.gtag('event', 'page_view', {
		page_title: document.title,
		page_location: url.href,
		page_path: `${url.pathname}${url.search}`,
		send_to: measurementId
	});
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
	if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
		return;
	}
	window.gtag('event', name, params);
}

/** Player submitted a word and it was accepted */
export function trackGuessHit(from: string, to: string, linkType: string | null, mode: string) {
	trackEvent('guess_hit', { from, to, link_type: linkType ?? 'unknown', game_mode: mode });
}

/** Player submitted a word and it was rejected */
export function trackGuessMiss(from: string, to: string, reason: string, mode: string) {
	trackEvent('guess_miss', { from, to, reason: reason.slice(0, 100), game_mode: mode });
}

/** Player completed a puzzle */
export function trackGameComplete(mode: string, hops: number, score: number, rating: string) {
	trackEvent('game_complete', { game_mode: mode, hops, score, rating });
}

/** Player shared their result */
export function trackShare(mode: string) {
	trackEvent('share_result', { game_mode: mode });
}

/** Player reset the game */
export function trackReset(mode: string) {
	trackEvent('game_reset', { game_mode: mode });
}
