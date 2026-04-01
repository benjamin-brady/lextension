<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { trackPageView } from '../lib/analytics';
	import '../app.css';

	let { children } = $props();

	const gaMeasurementId = env.PUBLIC_GA_MEASUREMENT_ID ?? '';
	const gaBootstrapScript = gaMeasurementId
		? `window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaMeasurementId)}, { send_page_view: false });`
		: '';

	afterNavigate(() => {
		if (!gaMeasurementId || typeof window === 'undefined') {
			return;
		}

		trackPageView(new URL(window.location.href), gaMeasurementId);
	});
</script>

<svelte:head>
	{#if gaMeasurementId}
		<script async src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}></script>
		<script>{gaBootstrapScript}</script>
	{/if}
</svelte:head>

<div class="min-h-dvh flex flex-col items-center bg-[var(--bg)] text-[var(--text)]">
	<header class="w-full text-center py-2 border-b border-[var(--border)]">
		<h1 class="text-2xl font-bold tracking-tight">LexLink</h1>
		<p class="text-sm text-[var(--text-muted)]">Place the words so connected pairs share a link</p>
	</header>
	<main class="flex-1 w-full max-w-lg mx-auto px-4 py-3">
		{@render children()}
	</main>
</div>
