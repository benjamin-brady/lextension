<script lang="ts">
	import {
		getHardPracticePuzzleCount,
		getPracticePuzzleCount,
	} from '$lib/puzzles';

	const practiceIds = Array.from({ length: getPracticePuzzleCount() }, (_, index) => index + 1);
	const hardIds = Array.from({ length: getHardPracticePuzzleCount() }, (_, index) => index + 1);
</script>

<div class="grid gap-4">
	<section class="rounded-2xl border border-(--border) bg-(--surface) p-4">
		<div class="flex items-center justify-between gap-3">
			<h2 class="text-lg font-bold">Standard</h2>
			<p class="text-sm text-(--text-muted)">{practiceIds.length} puzzles</p>
		</div>
		<div class="mt-3 flex flex-wrap gap-2">
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
			<h2 class="text-lg font-bold">Hard</h2>
			<p class="text-sm text-(--text-muted)">{hardIds.length} puzzles</p>
		</div>
		<div class="mt-3 flex flex-wrap gap-2">
			{#each hardIds as id (id)}
				<a
					href={`/practice/hard/${id}`}
					class="rounded-lg border border-(--border) bg-(--surface-light) px-3 py-2 text-sm font-semibold transition-colors hover:border-(--accent)"
				>
					#{id}
				</a>
			{/each}
		</div>
	</section>
</div>