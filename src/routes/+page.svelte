<script lang="ts">
	import { createGameState } from '../lib/game.svelte';
	import HowToPlay from '../lib/components/HowToPlay.svelte';
	import { getTodaysPuzzleInfo } from '../lib/puzzles';
	import GameBoard from '../lib/components/GameBoard.svelte';

	const { puzzle, puzzleNumber } = getTodaysPuzzleInfo();
	const game = createGameState(puzzle, puzzleNumber);
</script>

<div class="grid gap-2">
	<HowToPlay />
<GameBoard {game} {puzzleNumber} {puzzle} />
</div>
