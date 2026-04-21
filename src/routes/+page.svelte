<script lang="ts">
	import { randomPair, randomTriple } from '$lib/words';
	import { goto } from '$app/navigation';

	function goRandom() {
		const [a, b] = randomPair();
		goto(`/p/${encodeURIComponent(a)}/${encodeURIComponent(b)}`);
	}

	function goFibonacci() {
		const [a, b, c] = randomTriple();
		goto(`/fib/${encodeURIComponent(a)}/${encodeURIComponent(b)}/${encodeURIComponent(c)}`);
	}
</script>

<svelte:head>
	<title>Lextension — Word Bridge Puzzle</title>
</svelte:head>

<div class="grid gap-6">
	<section class="grid gap-3">
		<h2 class="font-display text-xs font-bold uppercase tracking-widest text-(--text-muted)">Daily</h2>
		<div class="grid grid-cols-2 gap-3">
			<a
				href="/daily"
				class="flex flex-col items-center justify-center gap-1 p-6 border-2 border-(--ink) bg-(--accent) text-white font-bold uppercase tracking-wider shadow-[3px_3px_0_0_var(--ink)] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--ink)] transition-all"
			>
				<span class="text-2xl">🔗</span>
				<span class="text-sm">Daily Chain</span>
			</a>
			<a
				href="/daily/fib"
				class="flex flex-col items-center justify-center gap-1 p-6 border-2 border-(--ink) bg-(--surface) text-(--text) font-bold uppercase tracking-wider shadow-[3px_3px_0_0_var(--ink)] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--ink)] transition-all"
			>
				<span class="text-2xl">🌀</span>
				<span class="text-sm">Daily Fib</span>
			</a>
		</div>
	</section>

	<section class="grid gap-3">
		<h2 class="font-display text-xs font-bold uppercase tracking-widest text-(--text-muted)">Practice</h2>
		<div class="flex justify-center gap-3">
			<button
				onclick={goRandom}
				class="px-5 py-3 border-2 border-(--ink) bg-(--surface) font-bold text-sm uppercase tracking-wider shadow-[2px_2px_0_0_var(--ink)] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--ink)] transition-all"
			>
				🎲 Random
			</button>
			<button
				onclick={goFibonacci}
				class="px-5 py-3 border-2 border-(--accent) bg-(--accent) text-white font-bold text-sm uppercase tracking-wider shadow-[2px_2px_0_0_var(--ink)] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--ink)] transition-all"
			>
				🌀 Random Fib
			</button>
		</div>
	</section>
</div>
