<script lang="ts">
  import { createInitialState, validateLink, getScore, type GameState } from '$lib/game';
  import type { LinkVerdict } from '$lib/types';
  import { trackGuessHit, trackGuessMiss, trackGameComplete, trackShare, trackReset } from '$lib/analytics';
  import { chainEmojiSummary } from '$lib/share';
  import { recordCompletion, type DailyMode } from '$lib/streak';
  import { saveChainGame, loadChainGame } from '$lib/game-persist';
  import CrossPromoCard from '$lib/components/CrossPromoCard.svelte';
  import LinkTypeHelp from '$lib/components/LinkTypeHelp.svelte';
  import { getRelationTypeEmoji } from '$lib/link-type-help';

  let {
    start,
    end,
    daily,
  }: {
    start: string;
    end: string;
    daily?: { date: string; mode: DailyMode };
  } = $props();

  let game: GameState = $state((() => {
    const saved = loadChainGame(start, end);
    if (saved && saved.chain.length >= 1) {
      return {
        ...createInitialState(start, end),
        chain: saved.chain,
        verdicts: saved.verdicts,
        isComplete: saved.isComplete,
      };
    }
    return createInitialState(start, end);
  })());
  let inputValue = $state('');
  let inputEl: HTMLInputElement | null = $state(null);

  // Auto-save on every chain mutation
  $effect(() => {
    saveChainGame(start, end, {
      chain: game.chain,
      verdicts: game.verdicts,
      isComplete: game.isComplete,
    });
  });

  const lastWord = $derived(game.chain[game.chain.length - 1]);
  const scoreInfo = $derived(game.isComplete ? getScore(game.chain) : null);

  function resetGame() {
    game = createInitialState(start, end);
    inputValue = '';
    trackReset('chain');
  }

  async function addWord() {
    const word = inputValue.trim();
    if (!word || game.isValidating || game.isComplete) return;

    if (/\s/.test(word)) {
      game.error = 'One word only — no spaces!';
      return;
    }

    // Don't allow duplicates in chain
    if (game.chain.some((w: string) => w.toLowerCase() === word.toLowerCase())) {
      game.error = `"${word}" is already in the chain`;
      return;
    }

    game.isValidating = true;
    game.error = null;

    try {
      const verdict = await validateLink(lastWord, word);
      if (verdict.valid) {
        game.chain = [...game.chain, word];
        game.verdicts = [...game.verdicts, verdict];
        inputValue = '';
        trackGuessHit(lastWord, word, verdict.type, 'chain');

        // Check if we can connect to the end word
        // (don't auto-check, let the player explicitly bridge to end)
        if (word.toLowerCase() === end.toLowerCase()) {
          game.isComplete = true;
          const si = getScore(game.chain);
          if (si) trackGameComplete('chain', si.hops, si.score, si.rating);
          if (daily) recordCompletion(daily.mode, daily.date);
        }
      } else {
        game.error = `No valid link: ${lastWord} → ${word}. ${verdict.reason}`;
        trackGuessMiss(lastWord, word, verdict.reason, 'chain');
      }
    } catch (err) {
      game.error = err instanceof Error ? err.message : 'Validation failed';
    } finally {
      game.isValidating = false;
      inputEl?.focus();
    }
  }

  async function tryFinish() {
    if (game.isValidating || game.isComplete) return;

    game.isValidating = true;
    game.error = null;

    try {
      const verdict = await validateLink(lastWord, end);
      if (verdict.valid) {
        game.chain = [...game.chain, end];
        game.verdicts = [...game.verdicts, verdict];
        game.isComplete = true;
        trackGuessHit(lastWord, end, verdict.type, 'chain');
        const si = getScore(game.chain);
        if (si) trackGameComplete('chain', si.hops, si.score, si.rating);
        if (daily) recordCompletion(daily.mode, daily.date);
      } else {
        game.error = `No valid link: ${lastWord} → ${end}. ${verdict.reason}`;
        trackGuessMiss(lastWord, end, verdict.reason, 'chain');
      }
    } catch (err) {
      game.error = err instanceof Error ? err.message : 'Validation failed';
    } finally {
      game.isValidating = false;
    }
  }

  function undoLast() {
    if (game.chain.length <= 1 || game.isComplete) return;
    game.chain = game.chain.slice(0, -1);
    game.verdicts = game.verdicts.slice(0, -1);
    game.error = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addWord();
    }
  }

  function isTextInputTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tagName = target.tagName;
    return tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;
  }

  function handleWindowKeydown(e: KeyboardEvent) {
    if (game.isComplete || game.isValidating || !inputEl) return;
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1 || isTextInputTarget(e.target)) return;

    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body && activeElement !== inputEl) return;

    e.preventDefault();
    inputEl.focus();
    inputValue += e.key;
  }

  function getTypeEmoji(type: string | null): string {
    return getRelationTypeEmoji(type);
  }

  function shareResult() {
    if (!scoreInfo) return;
    const emoji = chainEmojiSummary(game.chain);
    const header = daily ? `🔗 Lextension Daily ${daily.date}` : `🔗 Lextension: ${start} → ${end}`;
    const text = `${header}\n${emoji}\n${scoreInfo.hops} hops • ${scoreInfo.rating}\nhttps://lextension.net`;
    navigator.clipboard?.writeText(text);
    trackShare('chain');
  }

  // --- Feedback (thumbs-down) ---
  let feedbackOpen: number | null = $state(null); // verdict index
  let feedbackComment = $state('');
  let feedbackSending = $state(false);
  let feedbackSent = new Set<number>();

  async function sendFeedback(idx: number) {
    const v = game.verdicts[idx];
    if (!v) return;
    feedbackSending = true;
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: v.a, b: v.b, comment: feedbackComment }),
      });
      feedbackSent.add(idx);
      feedbackOpen = null;
      feedbackComment = '';
    } catch {
      // best-effort
    } finally {
      feedbackSending = false;
    }
  }
</script>

<svelte:window on:keydown={handleWindowKeydown} />

<div class="flex flex-col gap-4">
  <!-- Endpoints -->
  <div class="flex items-center justify-between p-4 border-2 border-(--ink) bg-(--surface)">
    <div class="text-center flex-1">
      <div class="text-xs font-bold uppercase tracking-widest text-(--text-muted)">Start</div>
      <div class="font-display text-2xl font-black">{start}</div>
    </div>
    <div class="text-2xl text-(--text-muted) px-4">→</div>
    <div class="text-center flex-1">
      <div class="text-xs font-bold uppercase tracking-widest text-(--text-muted)">End</div>
      <div class="font-display text-2xl font-black">{end}</div>
    </div>
  </div>

  <!-- Chain so far -->
  <div class="flex flex-col gap-1">
    {#each game.chain as word, i (word)}
      <div class="flex items-center gap-2">
        <span class="w-6 text-center text-xs font-bold text-(--text-muted)">{i + 1}</span>
        <span
          class="flex-1 px-3 py-2 border-2 font-bold text-sm {i === 0
            ? 'border-(--accent) bg-(--accent-soft) text-(--accent-ink)'
            : game.isComplete && i === game.chain.length - 1
              ? 'border-(--green) bg-green-50 dark:bg-green-950 text-(--green)'
              : 'border-(--ink) bg-(--surface)'}"
        >
          {word}
        </span>
        {#if i > 0 && game.verdicts[i - 1]}
          <span class="text-sm" title={game.verdicts[i - 1].reason}>
            {getTypeEmoji(game.verdicts[i - 1].type)}
          </span>
          <span class="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) w-20 truncate" title={game.verdicts[i - 1].type ?? ''}>
            {game.verdicts[i - 1].type ?? ''}
          </span>
          {#if !feedbackSent.has(i - 1)}
            <button
              onclick={() => { feedbackOpen = feedbackOpen === i - 1 ? null : i - 1; feedbackComment = ''; }}
              class="text-sm opacity-30 hover:opacity-100 transition-opacity"
              title="Report bad link"
            >👎</button>
          {:else}
            <span class="text-sm opacity-30" title="Reported">✓</span>
          {/if}
        {/if}
      </div>
      {#if feedbackOpen === i - 1}
        <div class="ml-8 flex gap-1 items-center mb-1">
          <input
            bind:value={feedbackComment}
            placeholder="What's wrong? (optional)"
            class="flex-1 px-2 py-1 border border-(--border) bg-(--surface) text-xs focus:outline-none focus:border-(--accent)"
          />
          <button
            onclick={() => sendFeedback(i - 1)}
            disabled={feedbackSending}
            class="px-2 py-1 border border-(--red) text-(--red) text-xs font-bold uppercase hover:bg-(--red) hover:text-white transition-colors disabled:opacity-50"
          >
            {feedbackSending ? '...' : 'Send'}
          </button>
          <button
            onclick={() => { feedbackOpen = null; }}
            class="px-2 py-1 text-xs text-(--text-muted) hover:text-(--text)"
          >✕</button>
        </div>
      {/if}
    {/each}
  </div>

  <!-- Input area (only if not complete) -->
  {#if !game.isComplete}
    <div class="flex flex-col gap-2">
      <div class="flex gap-2">
        <input
          bind:this={inputEl}
          bind:value={inputValue}
          onkeydown={handleKeydown}
          disabled={game.isValidating}
          placeholder="Type next word..."
          class="flex-1 px-3 py-2 border-2 border-(--ink) bg-(--surface) font-bold text-sm placeholder:text-(--text-muted) placeholder:font-normal focus:outline-none focus:border-(--accent) disabled:opacity-50"
        />
        <button
          onclick={addWord}
          disabled={!inputValue.trim() || game.isValidating}
          class="px-4 py-2 border-2 border-(--ink) bg-(--accent) text-white font-bold text-sm uppercase tracking-wider shadow-[2px_2px_0_0_var(--ink)] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--ink)] disabled:opacity-50 disabled:transform-none disabled:shadow-none transition-all"
        >
          {game.isValidating ? '...' : 'Add'}
        </button>
      </div>

      <div class="flex gap-2">
        <button
          onclick={tryFinish}
          disabled={game.chain.length < 2 || game.isValidating}
          class="flex-1 px-4 py-2 border-2 border-(--green) text-(--green) font-bold text-sm uppercase tracking-wider hover:bg-(--green) hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-(--green)"
        >
          Finish → {end}
        </button>
        <button
          onclick={undoLast}
          disabled={game.chain.length <= 1 || game.isValidating}
          class="px-4 py-2 border-2 border-(--ink) text-(--text-muted) font-bold text-sm uppercase tracking-wider hover:bg-(--surface) transition-colors disabled:opacity-30"
        >
          Undo
        </button>
        <button
          onclick={resetGame}
          disabled={game.chain.length <= 1 || game.isValidating}
          class="px-4 py-2 border-2 border-(--red) text-(--red) font-bold text-sm uppercase tracking-wider hover:bg-(--red) hover:text-white transition-colors disabled:opacity-30"
        >
          Reset
        </button>
      </div>
    </div>

    {#if game.error}
      <div class="px-3 py-2 border-2 border-(--red) bg-red-50 dark:bg-red-950 text-(--red) text-sm font-medium">
        {game.error}
      </div>
    {/if}
  {/if}

  <!-- Score card (when complete) -->
  {#if game.isComplete && scoreInfo}
    <div class="flex flex-col items-center gap-3 p-6 border-2 border-(--green) bg-green-50 dark:bg-green-950">
      <div class="font-display text-3xl font-black text-(--green)">
        {scoreInfo.rating}!
      </div>
      <div class="text-sm text-(--text-muted)">
        <span class="font-bold">{scoreInfo.hops}</span> hop{scoreInfo.hops === 1 ? '' : 's'} •
        <span class="font-bold">{scoreInfo.score}</span> pts
      </div>
      <div class="flex gap-2 mt-2">
        <button
          onclick={shareResult}
          class="px-4 py-2 border-2 border-(--ink) bg-(--accent) text-white font-bold text-sm uppercase tracking-wider shadow-[2px_2px_0_0_var(--ink)] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--ink)] transition-all"
        >
          📋 Copy Result
        </button>
        <button
          onclick={resetGame}
          class="px-4 py-2 border-2 border-(--ink) text-(--text) font-bold text-sm uppercase tracking-wider hover:bg-(--surface) transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <CrossPromoCard />
  {/if}

  <!-- How it works hint -->
  <details class="text-xs text-(--text-muted)">
    <summary class="cursor-pointer font-bold uppercase tracking-wider hover:text-(--text)">How to play</summary>
    <div class="mt-2 space-y-1 pl-2">
      <p>Bridge from <strong>{start}</strong> to <strong>{end}</strong> using word relationships.</p>
      <p>Each word you add must have a direct link to the previous word:</p>
      <LinkTypeHelp />
      <p>Rhymes are checked by pronunciation first. Near-rhymes and loose vowel matches do not count.</p>
      <p>Fewer hops = higher score. <strong>1 hop = Genius!</strong></p>
    </div>
  </details>
</div>
