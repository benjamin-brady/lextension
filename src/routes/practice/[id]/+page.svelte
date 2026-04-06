<script lang="ts">
	import PuzzleRunner from '$lib/components/PuzzleRunner.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="grid gap-4">
	{#key data.storageId}
		<PuzzleRunner puzzle={data.puzzle} storageId={data.storageId} shareLabel={data.shareLabel} />
	{/key}
</div>