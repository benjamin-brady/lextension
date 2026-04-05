<script lang="ts">
	import PuzzleRunner from '$lib/components/PuzzleRunner.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="grid gap-4">
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