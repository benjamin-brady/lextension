<script lang="ts">
	import {
		getHardPracticePuzzleCount,
		getPracticePuzzleCount,
		getTodaysPuzzleInfo,
	} from '$lib/puzzles';

	const practiceIds = Array.from({ length: getPracticePuzzleCount() }, (_, index) => index + 1);
	const hardIds = Array.from({ length: getHardPracticePuzzleCount() }, (_, index) => index + 1);
	const { cycleIndex } = getTodaysPuzzleInfo();
</script>

<div class="grid gap-4">
	<section class="rounded-2xl border border-(--border) bg-(--surface) p-4">
		<p class="text-xs font-bold uppercase tracking-[0.18em] text-(--text-muted)">Practice mode</p>
		<h2 class="mt-2 text-xl font-bold">Pick a board</h2>
		<p class="mt-1 text-sm text-(--text-muted)">
			Standard practice uses the same cleaner pool as the daily mode. Hard mode leans more cryptic and a bit less obvious.
		</p>
		<div class="mt-4 flex flex-wrap gap-2">
			<a
				href="/daily"
				class="rounded-lg border border-(--border) bg-(--surface-light) px-3 py-2 text-sm font-semibold transition-colors hover:border-(--accent)"
			>
				Today's daily is #{cycleIndex + 1}
			</a>
		</div>
	</section>

	<section class="rounded-2xl border border-(--border) bg-(--surface) p-4">
		<div class="flex items-center justify-between gap-3">
			<div>
				<p class="text-xs font-bold uppercase tracking-[0.18em] text-(--text-muted)">Standard</p>
				<h3 class="mt-1 text-lg font-bold">Practice /practice/{'{id}'}</h3>
			</div>
			<p class="text-sm text-(--text-muted)">{practiceIds.length} puzzles</p>
		</div>
		<div class="mt-4 flex flex-wrap gap-2">
			{#each practiceIds as id (id)}
				<a
					href={`/practice/${id}`}
					class="rounded-lg border border-(--border) bg-(--surface-light) px-3 py-2 text-sm font-semibold transition-colors hover:border-(--accent)"
				>
					#{id}
				</a>
			{/each}
		</div>
	</section>

	<section class="rounded-2xl border border-(--border) bg-(--surface) p-4">
		<div class="flex items-center justify-between gap-3">
			<div>
				<p class="text-xs font-bold uppercase tracking-[0.18em] text-(--text-muted)">Hard mode</p>
				<h3 class="mt-1 text-lg font-bold">Practice /practice/hard/{'{id}'}</h3>
			</div>
			<p class="text-sm text-(--text-muted)">{hardIds.length} puzzles</p>
		</div>
		<div class="mt-4 flex flex-wrap gap-2">
			{#each hardIds as id (id)}
				<a
					href={`/practice/hard/${id}`}
					class="rounded-lg border border-(--border) bg-(--surface-light) px-3 py-2 text-sm font-semibold transition-colors hover:border-(--accent)"
				>
					Hard #{id}
				</a>
			{/each}
		</div>
	</section>
</div>