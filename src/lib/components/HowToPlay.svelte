<script lang="ts">
	import { Info, X } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	let isOpen = $state(false);

	function openModal() {
		isOpen = true;
	}

	function closeModal() {
		isOpen = false;
	}

	function handleDocumentKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			closeModal();
		}
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

<div class="flex justify-end">
	<button
		type="button"
		class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-light)]"
		onclick={openModal}
		aria-controls="how-to-play-dialog"
		aria-expanded={isOpen}
		aria-haspopup="dialog"
		aria-label="How to play"
		title="How to play"
	>
		<Info size={18} strokeWidth={2.25} aria-hidden="true" />
	</button>
</div>

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
			class="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-6"
			transition:fade={{ duration: 160 }}
		>
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
						Need a refresher?
					</p>
					<h2 id="how-to-play-title" class="mt-1 text-lg font-bold text-[var(--text)]">
						How to play
					</h2>
				</div>

				<button
					type="button"
					class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-light)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
					onclick={closeModal}
					aria-label="Close how to play"
				>
					<X size={18} strokeWidth={2.25} aria-hidden="true" />
				</button>
			</div>

			<div class="mt-5 grid gap-4 text-sm text-[var(--text)]">
				<p class="leading-6 text-[var(--text-muted)]">
					Drag the nine word tiles into the 3x3 grid so every connected pair has a valid relationship.
					Links can be phrases, categories, sound-alikes, or wordplay.
				</p>

				<div class="grid gap-2">
					<p>Fill the grid by dragging words from the tray.</p>
					<p>Rearrange by dragging a placed word to a new spot or back to the tray.</p>
					<p>Press <strong>Check</strong> to reveal which words and links are correct. Moving a tile resets the colors until you check again.</p>
					<p>Try to solve it in as few checks as possible!</p>
				</div>

				<div class="grid gap-2">
					<p class="font-semibold">Legend</p>
					<ul class="grid gap-2 text-xs font-semibold text-(--text) sm:max-w-sm">
						<li class="flex items-center gap-3">
							<span class="flex w-10 shrink-0 items-center justify-center" aria-hidden="true"><span class="h-0.75 w-full rounded-full bg-(--green)"></span></span>
							<span>Valid linked pair</span>
						</li>
						<li class="flex items-center gap-3">
							<span class="flex w-10 shrink-0 items-center justify-center" aria-hidden="true"><span class="h-0.75 w-full rounded-full bg-(--red)"></span></span>
							<span>Wrong connection</span>
						</li>
						<li class="flex items-center gap-3">
							<span class="flex w-10 shrink-0 items-center justify-center" aria-hidden="true"><span class="h-4 w-4 rounded-md border-2 border-(--green) bg-(--surface-light)"></span></span>
							<span>Correct spot</span>
						</li>
					</ul>
				</div>

				<p class="leading-6 text-[var(--text-muted)]">
					After you solve it, the game shows every link explanation so you can see the full chain.
				</p>
			</div>
		</div>
	</div>
{/if}