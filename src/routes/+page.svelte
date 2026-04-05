<script lang="ts">
	import PuzzleRunner from '$lib/components/PuzzleRunner.svelte';
	import { getTodaysPuzzleInfo } from '$lib/puzzles';

	const { puzzle, puzzleNumber } = getTodaysPuzzleInfo();
	const shareLabel = `Daily #${puzzleNumber}`;
</script>

<div class="grid gap-4">
	{#key `daily-${puzzleNumber}`}
		<PuzzleRunner {puzzle} storageId={`daily-${puzzleNumber}`} {shareLabel} />
	{/key}
</div>
