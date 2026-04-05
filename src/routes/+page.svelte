<script lang="ts">
	import PuzzleRunner from '$lib/components/PuzzleRunner.svelte';
	import {
		getHardPracticePuzzleCount,
		getPracticePuzzleCount,
		getTodaysPuzzleInfo,
	} from '$lib/puzzles';

	const { puzzle, puzzleNumber } = getTodaysPuzzleInfo();
	const practiceCount = getPracticePuzzleCount();
	const hardCount = getHardPracticePuzzleCount();
	const shareLabel = `Daily #${puzzleNumber}`;
</script>

<div class="grid gap-4">
	<section class="rounded-2xl border border-(--border) bg-(--surface) p-4">
		<p class="text-xs font-bold uppercase tracking-[0.18em] text-(--text-muted)">Daily mode</p>
		<div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h2 class="text-xl font-bold">Today's puzzle</h2>
				<p class="mt-1 text-sm text-(--text-muted)">
					A fresh daily board plus reusable practice routes when you want more reps.
				</p>
			</div>
			<div class="flex flex-wrap gap-2">
				<a
					href="/daily"
					class="rounded-lg border border-(--border) bg-(--surface-light) px-3 py-2 text-sm font-semibold transition-colors hover:border-(--accent)"
				>
					Open daily route
				</a>
				<a
					href="/practice"
					class="rounded-lg bg-(--accent) px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
				>
					Browse practice
				</a>
			</div>
		</div>

		<div class="mt-4 grid gap-2 text-sm text-(--text-muted) sm:grid-cols-3">
			<p><span class="font-semibold text-(--text)">{practiceCount}</span> standard practice puzzles</p>
			<p><span class="font-semibold text-(--text)">{hardCount}</span> hard-mode practice puzzles</p>
			<p><span class="font-semibold text-(--text)">Saved</span> separately from practice progress</p>
		</div>
	</section>

	{#key `daily-${puzzleNumber}`}
		<PuzzleRunner {puzzle} storageId={`daily-${puzzleNumber}`} {shareLabel} />
	{/key}
</div>
