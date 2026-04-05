<script lang="ts">
	import { createGameState, type GameState } from '$lib/game.svelte';
	import type { Puzzle } from '$lib/types';
	import GameBoard from './GameBoard.svelte';

	let { puzzle, shareLabel, storageId }: { puzzle: Puzzle; shareLabel: string; storageId: string } = $props();

	let game = $state.raw<GameState | null>(null);

	$effect(() => {
		game = createGameState(puzzle, storageId);
	});
</script>

{#if game}
	<div class="grid gap-2">
		<GameBoard {game} {puzzle} {shareLabel} {storageId} />
	</div>
{/if}