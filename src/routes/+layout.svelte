<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import HowToPlay from '$lib/components/HowToPlay.svelte';
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
	<header class="w-full py-2 border-b border-[var(--border)]">
		<div class="flex items-center justify-between max-w-lg mx-auto px-4">
			<div class="w-10"></div>
			<div class="text-center">
				<h1 class="text-2xl font-bold tracking-tight">LexLink</h1>
			</div>
			<HowToPlay />
		</div>
		<nav class="mt-1 flex items-center justify-center gap-2 text-sm">
			<a class="rounded-full px-3 py-1 transition-colors hover:bg-[var(--surface)]" href="/">Daily</a>
			<a class="rounded-full px-3 py-1 transition-colors hover:bg-[var(--surface)]" href="/practice">Practice</a>
		</nav>
	</header>
	<main class="flex-1 w-full max-w-lg mx-auto px-4 py-3">
		{@render children()}
	</main>
</div>
