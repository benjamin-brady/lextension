<script lang="ts">
	import { Info, RotateCcw, X } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { ADJACENCIES } from '../types';

	let isOpen = $state(false);

	const TUTORIAL_SOLUTION = ['MOON', 'LIGHT', 'HOUSE', 'ROCK', 'STAR', 'DOG', 'PET', 'FISH', 'CAT'] as const;
	const TUTORIAL_START = ['CAT', 'LIGHT', 'HOUSE', 'ROCK', 'STAR', 'DOG', 'PET', 'FISH', 'MOON'] as const;
	const TUTORIAL_EXAMPLE_LINKS = ['moonlight', 'lighthouse', 'pet rock', 'starfish', 'catdog'] as const;
	const TUTORIAL_SLOT_SIZE = 68;
	const TUTORIAL_NODE_SIZE = 56;
	const TUTORIAL_GAP = 12;
	const TUTORIAL_GRID_W = TUTORIAL_SLOT_SIZE * 3 + TUTORIAL_GAP * 2;
	const TUTORIAL_GRID_H = TUTORIAL_SLOT_SIZE * 3 + TUTORIAL_GAP * 2;
	const tutorialValidPairs = new Set(
		ADJACENCIES.map(([from, to]) => edgeKey(TUTORIAL_SOLUTION[from], TUTORIAL_SOLUTION[to]))
	);

	let tutorialGrid = $state<string[]>([...TUTORIAL_START]);
	let tutorialSelectedIndex = $state<number | null>(null);

	let tutorialCorrectWords = $derived(
		tutorialGrid.reduce((count, word, index) => count + Number(word === TUTORIAL_SOLUTION[index]), 0)
	);
	let tutorialCorrectLinks = $derived(
		ADJACENCIES.reduce(
			(count, [from, to]) => count + Number(tutorialValidPairs.has(edgeKey(tutorialGrid[from], tutorialGrid[to]))),
			0
		)
	);
	let tutorialSolved = $derived(tutorialCorrectWords === TUTORIAL_SOLUTION.length);

	function openModal() {
		resetTutorial();
		isOpen = true;
	}

	function closeModal() {
		isOpen = false;
	}

	function resetTutorial() {
		tutorialGrid = [...TUTORIAL_START];
		tutorialSelectedIndex = null;
	}

	function handleTutorialTileClick(index: number) {
		if (tutorialSelectedIndex === index) {
			tutorialSelectedIndex = null;
			return;
		}

		if (tutorialSelectedIndex === null) {
			tutorialSelectedIndex = index;
			return;
		}

		const nextGrid = [...tutorialGrid];
		[nextGrid[tutorialSelectedIndex], nextGrid[index]] = [nextGrid[index], nextGrid[tutorialSelectedIndex]];
		tutorialGrid = nextGrid;
		tutorialSelectedIndex = null;
	}

	function tutorialMessage() {
		if (tutorialSelectedIndex !== null) {
			return `Selected ${tutorialGrid[tutorialSelectedIndex]}. Tap another tile to swap it.`;
		}

		if (tutorialSolved) {
			return 'Now every word is home, so all 12 neighboring pairs count as links too.';
		}

		if (tutorialCorrectWords === 7 && tutorialCorrectLinks === 8) {
			return 'Only CAT and MOON are misplaced. Because they are corners, they break just four links, which is why the counts do not fall together.';
		}

		return 'Words count exact homes. Links count green neighboring pairs, even before the whole board is solved.';
	}

	function tutorialCellPos(index: number): { x: number; y: number } {
		const row = Math.floor(index / 3);
		const col = index % 3;
		return {
			x: col * (TUTORIAL_SLOT_SIZE + TUTORIAL_GAP),
			y: row * (TUTORIAL_SLOT_SIZE + TUTORIAL_GAP)
		};
	}

	function tutorialTileBorder(index: number): string {
		if (tutorialSelectedIndex === index) {
			return 'var(--accent)';
		}

		return tutorialGrid[index] === TUTORIAL_SOLUTION[index] ? 'var(--green)' : 'var(--red)';
	}

	function tutorialTileLabel(index: number): string {
		const placement = tutorialGrid[index] === TUTORIAL_SOLUTION[index] ? 'correct spot' : 'wrong spot';
		const selected = tutorialSelectedIndex === index ? ', selected' : '';
		return `${tutorialGrid[index]}, ${placement}${selected}`;
	}

	function tutorialEdgeColor(from: number, to: number): string {
		return tutorialValidPairs.has(edgeKey(tutorialGrid[from], tutorialGrid[to]))
			? 'var(--green)'
			: 'var(--red)';
	}

	function handleDocumentKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			closeModal();
		}
	}

	function edgeKey(firstWord: string, secondWord: string): string {
		return [firstWord, secondWord].sort().join('::');
	}

	$effect(() => {
		if (!isOpen) {
			return;
		}

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = originalOverflow;
		};
	});
</script>

<svelte:document onkeydown={handleDocumentKeydown} />

<button
		type="button"
		class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-(--border) bg-(--surface) text-(--accent) transition-colors hover:border-(--accent) hover:bg-(--surface-light)"
		onclick={openModal}
		aria-controls="how-to-play-dialog"
		aria-expanded={isOpen}
		aria-haspopup="dialog"
		aria-label="How to play"
		title="How to play"
	>
		<Info size={18} strokeWidth={2.25} aria-hidden="true" />
</button>

{#if isOpen}
	<div class="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6">
		<button
			type="button"
			class="absolute inset-0 cursor-pointer bg-[rgba(7,11,20,0.82)] backdrop-blur-[2px]"
			onclick={closeModal}
			aria-label="Close how to play"
			transition:fade={{ duration: 120 }}
		></button>

		<div
			id="how-to-play-dialog"
			role="dialog"
			aria-modal="true"
			aria-labelledby="how-to-play-title"
			class="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-y-auto rounded-3xl border border-(--border) bg-(--surface) p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-6"
			transition:fade={{ duration: 160 }}
		>
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-xs font-bold uppercase tracking-[0.18em] text-(--text-muted)">
						Need a refresher?
					</p>
					<h2 id="how-to-play-title" class="mt-1 text-lg font-bold text-(--text)">
						How to play
					</h2>
				</div>

				<button
					type="button"
					class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--border) bg-(--surface-light) text-(--text-muted) transition-colors hover:border-(--accent) hover:text-(--text)"
					onclick={closeModal}
					aria-label="Close how to play"
				>
					<X size={18} strokeWidth={2.25} aria-hidden="true" />
				</button>
			</div>

			<div class="mt-5 grid gap-6 text-sm text-(--text) lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
				<section class="grid gap-4">
					<p class="max-w-2xl leading-6 text-(--text-muted)">
						Arrange the nine word tiles so every horizontal and vertical neighbor forms one of the puzzle's intended links. Some links are phrases, some are categories, and some are wordplay.
					</p>

					<div class="grid gap-3 sm:grid-cols-2">
						<div class="rounded-2xl border border-(--border) bg-(--surface-light) p-4">
							<p class="text-[11px] font-bold uppercase tracking-[0.18em] text-(--text-muted)">Words counter</p>
							<p class="mt-2 text-base font-semibold text-(--text)">Exact homes only</p>
							<p class="mt-2 leading-6 text-(--text-muted)">
								A word only counts here when it is sitting in its final correct spot.
							</p>
						</div>
						<div class="rounded-2xl border border-(--border) bg-(--surface-light) p-4">
							<p class="text-[11px] font-bold uppercase tracking-[0.18em] text-(--text-muted)">Links counter</p>
							<p class="mt-2 text-base font-semibold text-(--text)">Green neighboring pairs</p>
							<p class="mt-2 leading-6 text-(--text-muted)">
								This counts every valid connection between touching tiles. A 3x3 board always has 12 possible links, so the links total can move separately from the words total.
							</p>
						</div>
					</div>

					<section class="rounded-[22px] border border-(--border) bg-(--surface) p-4 sm:p-5">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div>
								<p class="text-[11px] font-bold uppercase tracking-[0.18em] text-(--text-muted)">
									Interactive example
								</p>
								<h3 class="mt-1 text-base font-bold text-(--text)">
									Why 7/9 words can still show 8/12 links
								</h3>
								<p class="mt-2 max-w-xl leading-6 text-(--text-muted)">
									This sample board has two words swapped. Tap one tile, then another tile, to swap them. Start with the two red corners.
								</p>
							</div>

							<button
								type="button"
								class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-(--border) bg-(--surface-light) text-(--text-muted) transition-colors hover:border-(--accent) hover:text-(--accent)"
								onclick={resetTutorial}
								aria-label="Reset tutorial example"
								title="Reset tutorial example"
							>
								<RotateCcw size={16} strokeWidth={2.25} aria-hidden="true" />
							</button>
						</div>

						<div class="mt-3 flex flex-wrap gap-2 text-xs text-(--text-muted)">
							{#each TUTORIAL_EXAMPLE_LINKS as label (label)}
								<span class="rounded-full border border-(--border) bg-(--surface-light) px-2.5 py-1">
									{label}
								</span>
							{/each}
						</div>

						<div class="mt-4 grid gap-4 xl:grid-cols-[auto_minmax(0,1fr)] xl:items-start">
							<div class="mx-auto w-full max-w-57">
								<div
									class="relative mx-auto"
									style="width: {TUTORIAL_GRID_W}px; height: {TUTORIAL_GRID_H}px;"
									role="group"
									aria-label="Interactive tutorial board"
								>
									<svg
										class="absolute inset-0 pointer-events-none"
										width={TUTORIAL_GRID_W}
										height={TUTORIAL_GRID_H}
									>
										{#each ADJACENCIES as [from, to] (`${from}-${to}`)}
											{@const fromPos = tutorialCellPos(from)}
											{@const toPos = tutorialCellPos(to)}
											<line
												x1={fromPos.x + TUTORIAL_SLOT_SIZE / 2}
												y1={fromPos.y + TUTORIAL_SLOT_SIZE / 2}
												x2={toPos.x + TUTORIAL_SLOT_SIZE / 2}
												y2={toPos.y + TUTORIAL_SLOT_SIZE / 2}
												stroke={tutorialEdgeColor(from, to)}
												stroke-width="3"
												stroke-linecap="round"
											/>
										{/each}
									</svg>

									{#each tutorialGrid as word, i (i)}
										{@const pos = tutorialCellPos(i)}
										<div
											class="absolute flex items-center justify-center"
											style="left: {pos.x}px; top: {pos.y}px; width: {TUTORIAL_SLOT_SIZE}px; height: {TUTORIAL_SLOT_SIZE}px;"
										>
											<button
												type="button"
												class="flex cursor-pointer items-center justify-center rounded-xl border-2 bg-(--surface-light) px-1 text-center text-[11px] font-bold tracking-[0.08em] text-(--text) transition-transform hover:-translate-y-0.5"
												style="width: {TUTORIAL_NODE_SIZE}px; height: {TUTORIAL_NODE_SIZE}px; border-color: {tutorialTileBorder(i)}; box-shadow: {tutorialSelectedIndex === i ? '0 0 0 3px var(--surface), 0 0 0 5px var(--accent)' : 'none'};"
												onclick={() => handleTutorialTileClick(i)}
												aria-pressed={tutorialSelectedIndex === i}
												aria-label={tutorialTileLabel(i)}
											>
												<span>{word}</span>
											</button>
										</div>
									{/each}
								</div>
							</div>

							<div class="grid gap-3">
								<div class="grid gap-3 sm:grid-cols-2">
									<div class="rounded-2xl border border-(--border) bg-(--surface-light) p-3">
										<p class="text-[11px] font-bold uppercase tracking-[0.18em] text-(--text-muted)">Words</p>
										<p class="mt-1 text-2xl font-bold text-(--text)">{tutorialCorrectWords}/9</p>
										<p class="mt-1 text-xs leading-5 text-(--text-muted)">Counts exact positions only.</p>
									</div>
									<div class="rounded-2xl border border-(--border) bg-(--surface-light) p-3">
										<p class="text-[11px] font-bold uppercase tracking-[0.18em] text-(--text-muted)">Links</p>
										<p class="mt-1 text-2xl font-bold text-(--text)">{tutorialCorrectLinks}/{ADJACENCIES.length}</p>
										<p class="mt-1 text-xs leading-5 text-(--text-muted)">Counts green neighboring pairs.</p>
									</div>
								</div>

								<p
									class="rounded-2xl border border-(--border) bg-(--surface-light) px-4 py-3 leading-6 text-(--text-muted)"
									aria-live="polite"
								>
									{tutorialMessage()}
								</p>

								<div class="rounded-2xl border border-(--border) bg-(--surface) p-4">
									<p class="text-[11px] font-bold uppercase tracking-[0.18em] text-(--text-muted)">
										How to read this example
									</p>
									<div class="mt-3 grid gap-2 leading-6 text-(--text-muted)">
										<p><strong class="text-(--text)">Green tile border</strong> means that word is in the right spot.</p>
										<p><strong class="text-(--text)">Green line</strong> means that neighboring pair counts as a valid link.</p>
										<p><strong class="text-(--text)">Red line</strong> means that pair does not work in the current layout.</p>
									</div>
								</div>
							</div>
						</div>
					</section>
				</section>

				<section class="grid gap-4 content-start">
					<div class="rounded-2xl border border-(--border) bg-(--surface-light) p-4">
						<p class="text-[11px] font-bold uppercase tracking-[0.18em] text-(--text-muted)">When to check</p>
						<h3 class="mt-1 text-base font-bold text-(--text)">Check grades your current layout</h3>
						<div class="mt-3 grid gap-2 leading-6 text-(--text-muted)">
							<p>Press <strong class="text-(--text)">Check</strong> whenever you want feedback on the board as it sits right now.</p>
							<p>Green borders mark words in their final homes. Green lines mark neighboring pairs that make a valid link.</p>
							<p>Move any tile afterward and that feedback clears until you check again.</p>
						</div>
					</div>

					<div class="rounded-2xl border border-(--border) bg-(--surface-light) p-4">
						<p class="text-[11px] font-bold uppercase tracking-[0.18em] text-(--text-muted)">Practical tips</p>
						<div class="mt-3 grid gap-2 leading-6 text-(--text-muted)">
							<p>Start by finding easy local pairs, then build outward from them.</p>
							<p>A high links count means some structure is right, even if a few words are still misplaced.</p>
							<p>Drag a word back to the tray any time you want to reopen space and rearrange.</p>
						</div>
					</div>

					<p class="rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 leading-6 text-(--text-muted)">
						After you solve the real puzzle, the game shows every link explanation so you can see the full chain.
					</p>
				</section>
			</div>
		</div>
	</div>
{/if}