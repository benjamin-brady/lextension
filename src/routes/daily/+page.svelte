<script lang="ts">
	import PuzzleRunner from '$lib/components/PuzzleRunner.svelte';
	import { getTodaysPuzzleInfo } from '$lib/puzzles';

	const { puzzle, puzzleNumber, cycleIndex } = getTodaysPuzzleInfo();
	const shareLabel = `Daily #${puzzleNumber}`;
</script>

<div class="grid gap-4">
	<section class="rounded-2xl border border-(--border) bg-(--surface) p-4">
		<p class="text-xs font-bold uppercase tracking-[0.18em] text-(--text-muted)">Daily mode</p>
		<h2 class="mt-2 text-xl font-bold">Daily puzzle #{cycleIndex + 1}</h2>
		<p class="mt-1 text-sm text-(--text-muted)">
			This route always opens today’s board and keeps its progress isolated from practice mode.
		</p>
		<div class="mt-4 flex flex-wrap gap-2">
			<a
				href="/"
				class="rounded-lg border border-(--border) bg-(--surface-light) px-3 py-2 text-sm font-semibold transition-colors hover:border-(--accent)"
			>
				Back to today
			</a>
			<a
				href="/practice"
				class="rounded-lg bg-(--accent) px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
			>
				Browse practice
			</a>
		</div>
	</section>

	{#key `daily-${puzzleNumber}`}
		<PuzzleRunner {puzzle} storageId={`daily-${puzzleNumber}`} {shareLabel} />
	{/key}
</div>