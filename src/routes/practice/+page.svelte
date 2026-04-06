<script lang="ts">
	import { loadSolvedGameIds } from '$lib/game-storage';
	import {
		getHardPracticePuzzleCount,
		getPracticePuzzleCount,
	} from '$lib/puzzles';
	import { onMount } from 'svelte';

	const practiceIds = Array.from({ length: getPracticePuzzleCount() }, (_, index) => index + 1);
	const hardIds = Array.from({ length: getHardPracticePuzzleCount() }, (_, index) => index + 1);

	let solvedStorageIds = $state<Set<string>>(new Set());

	function practiceStorageId(id: number): string {
		return `practice-${id}`;
	}

	function hardPracticeStorageId(id: number): string {
		return `practice-hard-${id}`;
	}

	function isSolved(storageId: string): boolean {
		return solvedStorageIds.has(storageId);
	}

	onMount(async () => {
		const storageIds = [
			...practiceIds.map(practiceStorageId),
			...hardIds.map(hardPracticeStorageId)
		];

		try {
			solvedStorageIds = await loadSolvedGameIds(storageIds);
		} catch {
			solvedStorageIds = new Set();
		}
	});
</script>

<div class="grid gap-4">
	<section class="rounded-2xl border border-(--border) bg-(--surface) p-4">
		<div class="flex items-center justify-between gap-3">
			<h2 class="text-lg font-bold">Standard</h2>
			<p class="text-sm text-(--text-muted)">{practiceIds.length} puzzles</p>
		</div>
		<div class="mt-3 flex flex-wrap gap-2">
			{#each practiceIds as id (id)}
				{@const storageId = practiceStorageId(id)}
				<a
					href={`/practice/${id}`}
					class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors hover:border-(--accent)"
					class:border-(--border)={!isSolved(storageId)}
					class:bg-(--surface-light)={!isSolved(storageId)}
					class:border-(--green)={isSolved(storageId)}
					class:bg-[color-mix(in_oklab,var(--green)_14%,white)]={isSolved(storageId)}
					aria-label={isSolved(storageId) ? `Puzzle ${id}, completed` : `Puzzle ${id}`}
				>
					{#if isSolved(storageId)}
						<span aria-hidden="true" class="text-(--green)">✓</span>
					{/if}
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
				{@const storageId = hardPracticeStorageId(id)}
				<a
					href={`/practice/hard/${id}`}
					class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors hover:border-(--accent)"
					class:border-(--border)={!isSolved(storageId)}
					class:bg-(--surface-light)={!isSolved(storageId)}
					class:border-(--green)={isSolved(storageId)}
					class:bg-[color-mix(in_oklab,var(--green)_14%,white)]={isSolved(storageId)}
					aria-label={isSolved(storageId) ? `Hard puzzle ${id}, completed` : `Hard puzzle ${id}`}
				>
					{#if isSolved(storageId)}
						<span aria-hidden="true" class="text-(--green)">✓</span>
					{/if}
					#{id}
				</a>
			{/each}
		</div>
	</section>
</div>