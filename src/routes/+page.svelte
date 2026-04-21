<script lang="ts">
	import LextensionGame from '$lib/components/LextensionGame.svelte';
	import { getTodaysChallenge } from '$lib/challenges';
	import { randomPair } from '$lib/words';
	import { goto } from '$app/navigation';

	const challenge = getTodaysChallenge();

	function goRandom() {
		const [a, b] = randomPair();
		goto(`/p/${encodeURIComponent(a)}/${encodeURIComponent(b)}`);
	}
</script>

<div class="grid gap-4">
	{#key challenge.date}
		<LextensionGame start={challenge.start} end={challenge.end} />
	{/key}

	<div class="flex justify-center pt-2">
		<button
			onclick={goRandom}
			class="px-6 py-3 border-2 border-(--ink) bg-(--surface) font-bold text-sm uppercase tracking-wider shadow-[2px_2px_0_0_var(--ink)] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--ink)] transition-all"
		>
			🎲 Random Practice
		</button>
	</div>
</div>
