<script lang="ts">
	import { asset } from '$app/paths';
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import HowToPlay from '$lib/components/HowToPlay.svelte';
	import { onMount } from 'svelte';
	import { trackPageView } from '../lib/analytics';
	import '../app.css';

	let { children } = $props();

	const siteName = 'LexLink';
	const metaTitle = `${siteName} - Word Connection Puzzle`;
	const metaDescription =
		'LexLink is a daily word-connection puzzle built around a 3x3 grid. Arrange nine words so every horizontal and vertical neighbor shares a hidden relationship. Use link feedback to spot swaps, wrong matches, and exact placements as you solve. New daily puzzles and a growing practice archive keep the challenge moving.';
	const socialImagePath = asset('/lexlink-social.png');
	const canonicalUrl = $derived(page.url.href);
	const socialImageUrl = $derived(new URL(socialImagePath, page.url).toString());

	const gaMeasurementId = env.PUBLIC_GA_MEASUREMENT_ID ?? '';
	const gaScriptId = 'ga4-google-tag';
	let gaReady = $state(false);

	onMount(() => {
		if (!gaMeasurementId || typeof window === 'undefined') {
			return;
		}

		window.dataLayer = window.dataLayer || [];

		if (typeof window.gtag !== 'function') {
			window.gtag = function gtag(command, target, params) {
				window.dataLayer.push(arguments as unknown as never);
			};
		}

		window.gtag('js', new Date());
		window.gtag('config', gaMeasurementId, { send_page_view: false });

		if (!document.getElementById(gaScriptId)) {
			const script = document.createElement('script');
			script.id = gaScriptId;
			script.async = true;
			script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
			document.head.appendChild(script);
		}

		gaReady = true;
	});

	$effect(() => {
		if (!gaReady || !gaMeasurementId || typeof window === 'undefined') {
			return;
		}

		trackPageView(new URL(page.url.href), gaMeasurementId);
	});
</script>

<svelte:head>
	<title>{metaTitle}</title>
	<meta name="description" content={metaDescription} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={metaTitle} />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={socialImageUrl} />
	<meta property="og:image:alt" content="LexLink word puzzle social preview" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={metaTitle} />
	<meta name="twitter:description" content={metaDescription} />
	<meta name="twitter:image" content={socialImageUrl} />
	<meta name="twitter:image:alt" content="LexLink word puzzle social preview" />
</svelte:head>

<div class="min-h-dvh flex flex-col items-center bg-[var(--bg)] text-[var(--text)]">
	<header class="w-full py-2 border-b border-[var(--border)]">
		<div class="flex items-center justify-between max-w-lg mx-auto px-4">
			<h1 class="text-xl font-bold tracking-tight">LexLink</h1>
			<nav class="flex items-center gap-1 text-sm">
				<a class="rounded-full px-3 py-1 transition-colors hover:bg-[var(--surface)]" href="/">Daily</a>
				<a class="rounded-full px-3 py-1 transition-colors hover:bg-[var(--surface)]" href="/practice">Practice</a>
				<HowToPlay />
			</nav>
		</div>
	</header>
	<main class="flex-1 w-full max-w-lg mx-auto px-2 py-3">
		{@render children()}
	</main>
</div>
