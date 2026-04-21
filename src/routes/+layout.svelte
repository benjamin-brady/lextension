<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { theme, resolveTheme } from '$lib/theme.svelte';
	import '../app.css';

	let { children } = $props();

	$effect(() => {
		if (typeof document === 'undefined') return;
		const choice = theme.choice;
		const apply = () => {
			const resolved = resolveTheme(choice);
			document.documentElement.classList.toggle('dark', resolved === 'dark');
			document.documentElement.dataset.theme = choice;
		};
		apply();
		if (choice !== 'system') return;
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		mq.addEventListener('change', apply);
		return () => mq.removeEventListener('change', apply);
	});
</script>

<svelte:head>
	<title>Lextension - Word Bridge Puzzle</title>
	<meta name="description" content="Bridge between two words using word relationships. Fewer hops = higher score!" />
</svelte:head>

<div class="relative z-10 min-h-dvh flex flex-col items-center text-(--text)">
	<header class="w-full border-b-2 border-(--ink) bg-(--bg-raised)">
		<div class="flex items-end justify-between w-full max-w-md mx-auto px-4 pt-4 pb-3">
			<a href="/" class="flex items-baseline gap-2 group">
				<span class="font-display text-3xl font-black tracking-tight leading-none">
					<span>Lex</span><span class="italic text-(--accent)">tension</span>
				</span>
				<span class="text-[10px] font-bold uppercase tracking-wider text-(--accent) border border-(--accent) rounded px-1 py-px leading-tight mb-0.5">alpha</span>
			</a>
			<div class="flex items-center gap-2">
				<ThemeToggle />
			</div>
		</div>
	</header>
	<main class="flex-1 w-full max-w-md mx-auto px-4 py-6">
		{@render children()}
	</main>
	<footer class="w-full border-t-2 border-(--ink) bg-(--bg-raised) mt-6">
		<div class="w-full max-w-md mx-auto px-4 py-4 flex flex-col items-center gap-3">
			<a href="https://ko-fi.com/benbob" target="_blank" rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-(--ink) px-3 py-1.5 shadow-[2px_2px_0_0_var(--ink)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-(--accent) text-white">
				<span aria-hidden="true">☕</span>
				<span>Buy me a coffee</span>
			</a>
			<nav class="flex items-center gap-3 text-xs text-(--text-muted)">
				<a class="hover:text-(--accent) transition-colors" href="https://discord.gg/AWfvmFWBcA" target="_blank" rel="noopener noreferrer">Discord</a>
				<span aria-hidden="true">·</span>
				<a class="hover:text-(--accent) transition-colors" href="/terms">Terms</a>
				<span aria-hidden="true">·</span>
				<a class="hover:text-(--accent) transition-colors" href="/privacy">Privacy</a>
			</nav>
			<p class="text-[10px] text-(--text-muted)">Made with ☕ by Ben Brady</p>
		</div>
	</footer>
</div>

<Toaster richColors position="bottom-center" />
