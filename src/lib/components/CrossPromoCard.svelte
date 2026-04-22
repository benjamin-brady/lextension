<script lang="ts">
	import { onMount } from 'svelte';
	import { loadPromoGames, pickWeighted, type PromoGame } from '$lib/cross-promo';

	let game: PromoGame | null = $state(null);

	onMount(async () => {
		const games = await loadPromoGames();
		game = pickWeighted(games);
	});
</script>

{#if game}
	<aside
		class="flex flex-col gap-3 p-5 border-2 border-(--ink) bg-(--surface) shadow-[3px_3px_0_0_var(--ink)]"
	>
		<div class="text-xs font-bold uppercase tracking-widest text-(--text-muted)">
			Try another game
		</div>
		<div class="flex items-start gap-3">
			<div class="text-4xl leading-none shrink-0" aria-hidden="true">{game.emoji}</div>
			<div class="flex flex-col gap-1 min-w-0">
				<div class="font-display text-xl font-black leading-tight">{game.name}</div>
				<div class="text-sm text-(--text-muted)">{game.tagline}</div>
			</div>
		</div>
		<a
			href={game.url}
			target="_blank"
			rel="noopener noreferrer"
			class="self-start px-4 py-2 border-2 border-(--ink) bg-(--accent) text-white font-bold text-sm uppercase tracking-wider shadow-[2px_2px_0_0_var(--ink)] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--ink)] transition-all"
		>
			Play →
		</a>
	</aside>
{/if}
