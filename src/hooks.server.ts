import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Force HTTPS — Cloudflare sends the original scheme in CF-Visitor header
	const cfVisitor = event.request.headers.get('cf-visitor');
	if (cfVisitor) {
		try {
			const { scheme } = JSON.parse(cfVisitor);
			if (scheme === 'http') {
				const url = new URL(event.request.url);
				url.protocol = 'https:';
				redirect(301, url.toString());
			}
		} catch {
			// ignore malformed header
		}
	}

	return resolve(event);
};
