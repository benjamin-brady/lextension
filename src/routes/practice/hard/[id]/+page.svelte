<script lang="ts">
	import PuzzleRunner from '$lib/components/PuzzleRunner.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="grid gap-4">
	<section class="rounded-2xl border border-(--border) bg-(--surface) p-4">
		<p class="text-xs font-bold uppercase tracking-[0.18em] text-(--text-muted)">Hard mode</p>
		<h2 class="mt-2 text-xl font-bold">Hard practice puzzle #{data.id}</h2>
		<p class="mt-1 text-sm text-(--text-muted)">
			This pool uses less obvious compounds, denser overlap, and slightly sharper wordplay.
		</p>
		<div class="mt-4 flex flex-wrap gap-2">
			<a
				href="/practice"
				class="rounded-lg border border-(--border) bg-(--surface-light) px-3 py-2 text-sm font-semibold transition-colors hover:border-(--accent)"
			>
				All practice
			</a>
			<a
				 href="/daily"
				class="rounded-lg bg-(--accent) px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
			>
				Open daily
			</a>
		</div>
	</section>

	{#key data.storageId}
		<PuzzleRunner puzzle={data.puzzle} storageId={data.storageId} shareLabel={data.shareLabel} />
	{/key}

	<div class="flex items-center justify-between gap-3">
		{#if data.previousId}
			<a
				href={`/practice/hard/${data.previousId}`}
				class="rounded-lg border border-(--border) bg-(--surface) px-3 py-2 text-sm font-semibold transition-colors hover:border-(--accent)"
			>
				Previous hard
			</a>
		{:else}
			<div></div>
		{/if}

		{#if data.nextId}
			<a
				href={`/practice/hard/${data.nextId}`}
				class="rounded-lg border border-(--border) bg-(--surface) px-3 py-2 text-sm font-semibold transition-colors hover:border-(--accent)"
			>
				Next hard
			</a>
		{/if}
	</div>
</div>