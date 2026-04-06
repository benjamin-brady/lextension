<script lang="ts">
	import { trackEvent } from '$lib/analytics';
	import type { GameState } from '../game.svelte';
	import type { Puzzle, WordItem } from '../types';
	import { ADJACENCIES } from '../types';

	let { game, shareLabel, puzzle, storageId }: { game: GameState; shareLabel: string; puzzle: Puzzle; storageId: string } = $props();

	type DragItem = {
		word: WordItem;
		source: 'inventory' | 'grid';
		gridIndex?: number;
	};

	const DRAG_MIME = 'application/x-lexlink-word';
	const NODE_STATUS_EMOJI = {
		correct: '🟩',
		wrong: '🟥',
		empty: '⬜',
		unchecked: '⬜'
	} as const;

	let draggedItem = $state<DragItem | null>(null);
	let dragOverIndex = $state<number | null>(null);
	let shareFeedback = $state('');
	let shareFeedbackTimer: ReturnType<typeof setTimeout> | null = null;
	let hasObservedSolvedState = false;
	let previousSolved = false;
	let solvedLinks = $derived(
		puzzle.edges.map((edge) => ({
			from: puzzle.solution[edge.from],
			to: puzzle.solution[edge.to],
			clue: edge.clue
		}))
	);

	function wordEmoji(word: WordItem): string {
		return word.emoji ?? '✨';
	}

	function baseEventParams(): Record<string, string | number | boolean> {
		return {
			puzzle_id: storageId,
			puzzle_label: shareLabel,
			correct_words: game.correctCount,
			correct_links: game.correctEdgeCount,
			checks: game.checks,
			solved: game.solved
		};
	}

	function onDragStartInventory(e: DragEvent, word: WordItem) {
		startDrag(e, { word, source: 'inventory' });
	}

	function onDragStartGrid(e: DragEvent, index: number) {
		const cell = game.grid[index];
		if (!cell) return;
		startDrag(e, { word: cell, source: 'grid', gridIndex: index });
	}

	function startDrag(e: DragEvent, item: DragItem) {
		draggedItem = item;
		if (!e.dataTransfer) {
			return;
		}

		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', item.word.word);
		e.dataTransfer.setData(
			DRAG_MIME,
			JSON.stringify({
				word: item.word.word,
				source: item.source,
				gridIndex: item.gridIndex
			})
		);
	}

	function resolveDraggedItem(e?: DragEvent): DragItem | null {
		if (draggedItem) {
			return draggedItem;
		}

		const raw = e?.dataTransfer?.getData(DRAG_MIME);
		if (!raw) {
			return null;
		}

		try {
			const parsed = JSON.parse(raw) as {
				word: string;
				source: 'inventory' | 'grid';
				gridIndex?: number;
			};
			const word = findWord(parsed.word);
			if (!word) {
				return null;
			}

			return {
				word,
				source: parsed.source,
				gridIndex: parsed.gridIndex
			};
		} catch {
			return null;
		}
	}

	function findWord(wordName: string): WordItem | null {
		const inventoryWord = game.inventory.find((item) => item.word === wordName);
		if (inventoryWord) {
			return inventoryWord;
		}

		const gridWord = game.grid.find((item) => item?.word === wordName);
		return gridWord ?? null;
	}

	function onDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		dragOverIndex = index;
	}

	function onDragEnter(e: DragEvent, index: number) {
		e.preventDefault();
		dragOverIndex = index;
	}

	function onDragLeave() {
		dragOverIndex = null;
	}

	function onDropGrid(e: DragEvent, index: number) {
		e.preventDefault();
		dragOverIndex = null;
		const item = resolveDraggedItem(e);
		if (!item) return;

		if (item.source === 'grid' && item.gridIndex !== undefined) {
			game.moveGridWord(item.gridIndex, index);
		} else {
			game.placeWord(index, item.word);
		}
		draggedItem = null;
	}

	function onDropInventory(e: DragEvent) {
		e.preventDefault();
		dragOverIndex = null;
		const item = resolveDraggedItem(e);
		if (!item) return;
		if (item.source === 'grid' && item.gridIndex !== undefined) {
			game.removeFromGrid(item.gridIndex);
		}
		draggedItem = null;
	}

	function onDragEnd() {
		draggedItem = null;
		dragOverIndex = null;
	}

	function shareRows(): string {
		const statusForShare = (index: number) => {
			const cell = game.grid[index];
			if (!cell) return NODE_STATUS_EMOJI.empty;
			if (!game.isCellChecked(index)) return NODE_STATUS_EMOJI.unchecked;
			return NODE_STATUS_EMOJI[game.getNodeStatus(index)];
		};
		return Array.from({ length: 3 }, (_, rowIndex) => {
			return Array.from({ length: 3 }, (_, colIndex) => {
				return statusForShare(rowIndex * 3 + colIndex);
			}).join('');
		}).join('\n');
	}

	function buildShareText() {
		const statusLine = game.solved
			? `Solved in ${game.checks} checks`
			: `${game.correctCount}/9 words, ${game.correctEdgeCount}/${ADJACENCIES.length} links, ${game.checks} checks`;

		const lines = [
			`LexLink ${shareLabel}`,
			statusLine,
			shareRows()
		];

		if (typeof window !== 'undefined') {
			lines.push(window.location.href);
		}

		return lines.join('\n');
	}

	function setShareFeedback(message: string) {
		shareFeedback = message;
		if (shareFeedbackTimer) {
			clearTimeout(shareFeedbackTimer);
		}
		shareFeedbackTimer = setTimeout(() => {
			shareFeedback = '';
		}, 2000);
	}

	function handleCheck() {
		game.check();
		trackEvent('puzzle_check', baseEventParams());
	}

	async function shareResult() {
		const text = buildShareText();
		const url = typeof window !== 'undefined' ? window.location.href : undefined;

		try {
			if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
				await navigator.share({
					title: `LexLink ${shareLabel}`,
					text,
					url
				});
				trackEvent('puzzle_share', {
					...baseEventParams(),
					method: 'web_share'
				});
				setShareFeedback('Shared');
				return;
			}
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				return;
			}
		}

		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			await navigator.clipboard.writeText(text);
			trackEvent('puzzle_share', {
				...baseEventParams(),
				method: 'clipboard'
			});
			setShareFeedback('Copied');
			return;
		}

		trackEvent('puzzle_share_unavailable', baseEventParams());
		setShareFeedback('Share unavailable');
	}

	$effect(() => {
		const solved = game.solved;
		if (hasObservedSolvedState && solved && !previousSolved) {
			trackEvent('puzzle_solved', baseEventParams());
		}

		previousSolved = solved;
		hasObservedSolvedState = true;
	});

	// Touch drag support
	let touchDragItem = $state<{ word: WordItem; source: 'inventory' | 'grid'; gridIndex?: number } | null>(null);
	let touchGhost = $state<{ x: number; y: number } | null>(null);

	function onTouchStartInventory(e: TouchEvent, word: WordItem) {
		e.preventDefault();
		touchDragItem = { word, source: 'inventory' };
		const touch = e.touches[0];
		touchGhost = { x: touch.clientX, y: touch.clientY };
	}

	function onTouchStartGrid(e: TouchEvent, index: number) {
		const cell = game.grid[index];
		if (!cell) return;
		e.preventDefault();
		touchDragItem = { word: cell, source: 'grid', gridIndex: index };
		const touch = e.touches[0];
		touchGhost = { x: touch.clientX, y: touch.clientY };
	}

	function onTouchMove(e: TouchEvent) {
		if (!touchDragItem) return;
		e.preventDefault();
		const touch = e.touches[0];
		touchGhost = { x: touch.clientX, y: touch.clientY };
	}

	function onTouchEnd(e: TouchEvent) {
		if (!touchDragItem || !touchGhost) {
			touchDragItem = null;
			touchGhost = null;
			return;
		}

		// Find which grid cell or inventory we're over
		const el = document.elementFromPoint(touchGhost.x, touchGhost.y);
		if (el) {
			const gridCell = el.closest('[data-grid-index]');
			const invZone = el.closest('[data-inventory]');

			if (gridCell) {
				const index = Number.parseInt(gridCell.getAttribute('data-grid-index') ?? '', 10);
				if (Number.isNaN(index)) {
					touchDragItem = null;
					touchGhost = null;
					return;
				}

				if (touchDragItem.source === 'grid' && touchDragItem.gridIndex !== undefined) {
					game.moveGridWord(touchDragItem.gridIndex, index);
				} else {
					game.placeWord(index, touchDragItem.word);
				}
			} else if (invZone && touchDragItem.source === 'grid' && touchDragItem.gridIndex !== undefined) {
				game.removeFromGrid(touchDragItem.gridIndex);
			}
		}

		touchDragItem = null;
		touchGhost = null;
	}

	function edgeColor(fromIdx: number, toIdx: number): string {
		const status = game.getEdgeStatus(fromIdx, toIdx);
		switch (status) {
			case 'correct': return 'var(--green)';
			case 'wrong': return 'var(--red)';
			default: return 'var(--border)';
		}
	}

	function nodeOutline(index: number): string {
		const status = game.getNodeStatus(index);
		switch (status) {
			case 'correct': return 'var(--green)';
			case 'wrong': return 'var(--border)';
			case 'unchecked': return 'var(--border)';
			default: return 'var(--border)';
		}
	}

	// Grid positioning helpers
	const SLOT_SIZE = 92;
	const NODE_SIZE = 72;
	const GAP = 14;
	const GRID_W = SLOT_SIZE * 3 + GAP * 2;
	const GRID_H = SLOT_SIZE * 3 + GAP * 2;

	function cellPos(index: number): { x: number; y: number } {
		const row = Math.floor(index / 3);
		const col = index % 3;
		return {
			x: col * (SLOT_SIZE + GAP),
			y: row * (SLOT_SIZE + GAP),
		};
	}
</script>

<svelte:window
	ontouchmove={onTouchMove}
	ontouchend={onTouchEnd}
/>

<div class="flex w-full flex-col items-center gap-3 select-none touch-none">
	<div class="flex w-full flex-col gap-3" style="max-width: {GRID_W}px;">
		<div class="grid w-full grid-cols-3 gap-3">
			<div class="rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-center">
				<p class="text-[11px] uppercase tracking-[0.18em] text-(--text-muted)">Checks</p>
				<p class="text-xl font-bold">{game.checks}</p>
			</div>
			<div class="rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-center">
				<p class="text-[11px] uppercase tracking-[0.18em] text-(--text-muted)">Words</p>
				<p class="text-xl font-bold">{game.correctCount}/9</p>
			</div>
			<div class="rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-center">
				<p class="text-[11px] uppercase tracking-[0.18em] text-(--text-muted)">Links</p>
				<p class="text-xl font-bold">{game.correctEdgeCount}/{ADJACENCIES.length}</p>
			</div>
		</div>

		<!-- Grid -->
		<div
			class="relative self-center"
			style="width: {GRID_W}px; height: {GRID_H}px;"
		>
			<!-- Edges (SVG lines) -->
			<svg
				class="absolute inset-0 pointer-events-none"
				width={GRID_W}
				height={GRID_H}
			>
				{#each ADJACENCIES as [a, b] (`${a}-${b}`)}
					{@const pa = cellPos(a)}
					{@const pb = cellPos(b)}
					<line
						x1={pa.x + SLOT_SIZE / 2}
						y1={pa.y + SLOT_SIZE / 2}
						x2={pb.x + SLOT_SIZE / 2}
						y2={pb.y + SLOT_SIZE / 2}
						stroke={edgeColor(a, b)}
						stroke-width="3"
						stroke-linecap="round"
					/>
				{/each}
			</svg>

			<!-- Nodes -->
			{#each Array(9) as _, i (i)}
				{@const pos = cellPos(i)}
				{@const cell = game.grid[i]}
				<div
					class="absolute flex items-center justify-center"
					style="
						left: {pos.x}px;
						top: {pos.y}px;
						width: {SLOT_SIZE}px;
						height: {SLOT_SIZE}px;
					"
					data-grid-index={i}
					role="button"
					tabindex="0"
					ondragenter={(e) => onDragEnter(e, i)}
					ondragover={(e) => onDragOver(e, i)}
					ondragleave={onDragLeave}
					ondrop={(e) => onDropGrid(e, i)}
				>
					{#if cell}
						<div
							class="flex h-18 w-18 cursor-grab flex-col items-center justify-center gap-0.5 rounded-xl border-2 bg-(--surface-light) transition-colors active:cursor-grabbing"
							style="border-color: {nodeOutline(i)};"
							role="button"
							aria-label={`Move ${cell.word}`}
							tabindex="-1"
							draggable="true"
							ondragstart={(e) => onDragStartGrid(e, i)}
							ondragend={onDragEnd}
							ontouchstart={(e) => onTouchStartGrid(e, i)}
						>
							<span aria-hidden="true" class="text-2xl leading-none">{wordEmoji(cell)}</span>
							<span class="px-1 text-center text-[11px] leading-tight font-semibold">{cell.word}</span>
						</div>
					{:else if dragOverIndex === i}
						<div class="flex h-18 w-18 items-center justify-center rounded-xl border-2 border-dashed border-(--accent) bg-(--surface) opacity-70"></div>
					{:else}
						<div
							class="h-18 w-18 rounded-xl border-2 bg-(--surface) transition-colors"
							style="border-color: {nodeOutline(i)};"
						></div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Status -->
		{#if game.solved}
			<div class="text-center">
				<p class="text-lg font-bold text-(--green)">Solved! 🎉</p>
			</div>

			<section class="w-full rounded-2xl border border-(--border) bg-(--surface) p-4">
				<h2 class="text-sm font-bold uppercase tracking-[0.18em] text-(--text-muted)">
					Why the links work
				</h2>
				<div class="mt-3 grid gap-3">
					{#each solvedLinks as link (`${link.from.word}-${link.to.word}`)}
						<div class="rounded-xl border border-(--border) bg-(--surface-light) px-3 py-3">
							<p class="text-sm font-semibold">
								<span aria-hidden="true">{wordEmoji(link.from)}</span>
								{link.from.word} →
								<span aria-hidden="true">{wordEmoji(link.to)}</span>
								{link.to.word}
							</p>
							<p class="mt-1 text-sm text-(--text-muted)">{link.clue}</p>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Inventory -->
		<div
			class="flex min-h-12 w-full flex-wrap justify-center gap-2 rounded-xl border border-(--border) bg-(--surface) p-2"
			data-inventory
			role="list"
			ondragover={(e) => {
				e.preventDefault();
				if (e.dataTransfer) {
					e.dataTransfer.dropEffect = 'move';
				}
			}}
			ondrop={onDropInventory}
		>
			{#if game.inventory.length === 0}
				<p class="self-center text-sm text-(--text-muted)">
					{game.solved ? 'All words placed!' : 'Drag words back here to rearrange'}
				</p>
			{/if}
			{#each game.inventory as word (word.word)}
				<div
					class="flex cursor-grab items-center gap-1.5 rounded-lg border border-(--border) bg-(--surface-light) px-3 py-2 transition-colors hover:border-(--accent) active:cursor-grabbing"
					draggable="true"
					role="listitem"
					ondragstart={(e) => onDragStartInventory(e, word)}
					ondragend={onDragEnd}
					ontouchstart={(e) => onTouchStartInventory(e, word)}
				>
					<span aria-hidden="true" class="text-base leading-none">{wordEmoji(word)}</span>
					<span class="text-sm font-semibold">{word.word}</span>
				</div>
			{/each}
		</div>

		<div class="grid w-full gap-3">
			{#if !game.solved}
				<button
					class="w-full cursor-pointer rounded-xl bg-(--yellow) px-5 py-4 text-base font-black uppercase tracking-[0.18em] text-slate-950 shadow-[0_12px_30px_rgba(234,179,8,0.32)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(234,179,8,0.38)] active:translate-y-0"
					onclick={handleCheck}
				>
					Check
				</button>
			{/if}
			<div class="flex items-center gap-3">
				<button
					class="cursor-pointer rounded-lg border border-(--border) bg-(--surface-light) px-4 py-2 text-sm transition-colors hover:border-(--accent)"
					onclick={shareResult}
				>
					Share
				</button>
				<button
					class="cursor-pointer rounded-lg border border-(--border) bg-(--surface-light) px-4 py-2 text-sm transition-colors hover:border-(--accent)"
					onclick={() => game.reset()}
				>
					Reset
				</button>
			</div>
		</div>

		{#if shareFeedback}
			<p class="text-sm text-(--text-muted)">{shareFeedback}</p>
		{/if}
	</div>
</div>

<!-- Touch drag ghost -->
{#if touchDragItem && touchGhost}
	<div
		class="fixed z-50 flex items-center gap-1.5 rounded-lg bg-(--accent) px-3 py-2 text-white shadow-lg pointer-events-none"
		style="left: {touchGhost.x - 40}px; top: {touchGhost.y - 30}px;"
	>
		<span aria-hidden="true" class="text-base leading-none">{wordEmoji(touchDragItem.word)}</span>
		<span class="text-sm font-semibold">{touchDragItem.word.word}</span>
	</div>
{/if}
