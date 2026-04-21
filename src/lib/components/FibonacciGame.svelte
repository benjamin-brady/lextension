<script lang="ts">
  import { validateLink, type GameState } from '$lib/game';
  import type { LinkVerdict } from '$lib/types';
  import { trackGuessHit, trackGuessMiss, trackGameComplete, trackShare, trackReset } from '$lib/analytics';
  import { fibEmojiSummary } from '$lib/share';
  import { recordCompletion, type DailyMode } from '$lib/streak';

  let {
    startA,
    startB,
    target,
    daily,
  }: {
    startA: string;
    startB: string;
    target: string;
    daily?: { date: string; mode: DailyMode };
  } = $props();

  interface FibState {
    chain: string[];
    /** verdicts[i] = [linkToPrev2, linkToPrev1] for chain[i] where i >= 2 */
    verdictPairs: [LinkVerdict, LinkVerdict][];
    isComplete: boolean;
    isValidating: boolean;
    error: string | null;
  }

  function createState(): FibState {
    return {
      chain: [startA, startB],
      verdictPairs: [],
      isComplete: false,
      isValidating: false,
      error: null,
    };
  }

  let game: FibState = $state(createState());
  let inputValue = $state('');
  let inputEl: HTMLInputElement | null = $state(null);

  const prev1 = $derived(game.chain[game.chain.length - 1]);
  const prev2 = $derived(game.chain[game.chain.length - 2]);
  const steps = $derived(game.chain.length - 2); // words added after the two seeds

  function resetGame() {
    game = createState();
    inputValue = '';
    trackReset('fibonacci');
  }

  async function addWord() {
    const word = inputValue.trim();
    if (!word || game.isValidating || game.isComplete) return;

    if (game.chain.some((w: string) => w.toLowerCase() === word.toLowerCase())) {
      game.error = `"${word}" is already in the chain`;
      return;
    }

    game.isValidating = true;
    game.error = null;

    try {
      // Must validate against BOTH previous words
      const [v1, v2] = await Promise.all([
        validateLink(prev2, word),
        validateLink(prev1, word),
      ]);

      if (v1.valid && v2.valid) {
        game.chain = [...game.chain, word];
        game.verdictPairs = [...game.verdictPairs, [v1, v2]];
        inputValue = '';
        trackGuessHit(prev1, word, v2.type, 'fibonacci');

        if (word.toLowerCase() === target.toLowerCase()) {
          game.isComplete = true;
          const si = getScoreInfo();
          if (si) trackGameComplete('fibonacci', si.steps, si.score, si.rating);
          if (daily) recordCompletion(daily.mode, daily.date);
        }
      } else if (!v1.valid && !v2.valid) {
        game.error = `No link to either word.\n${prev2} → ${word}: ${v1.reason}\n${prev1} → ${word}: ${v2.reason}`;
        trackGuessMiss(prev1, word, 'no link to either', 'fibonacci');
      } else if (!v1.valid) {
        game.error = `Links to ${prev1} (${v2.type}) but not ${prev2}: ${v1.reason}`;
        trackGuessMiss(prev2, word, v1.reason, 'fibonacci');
      } else {
        game.error = `Links to ${prev2} (${v1.type}) but not ${prev1}: ${v2.reason}`;
        trackGuessMiss(prev1, word, v2.reason, 'fibonacci');
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
      const [v1, v2] = await Promise.all([
        validateLink(prev2, target),
        validateLink(prev1, target),
      ]);

      if (v1.valid && v2.valid) {
        game.chain = [...game.chain, target];
        game.verdictPairs = [...game.verdictPairs, [v1, v2]];
        game.isComplete = true;
        trackGuessHit(prev1, target, v2.type, 'fibonacci');
        const si = getScoreInfo();
        if (si) trackGameComplete('fibonacci', si.steps, si.score, si.rating);
        if (daily) recordCompletion(daily.mode, daily.date);
      } else if (!v1.valid && !v2.valid) {
        game.error = `No link to either word.\n${prev2} → ${target}: ${v1.reason}\n${prev1} → ${target}: ${v2.reason}`;
        trackGuessMiss(prev1, target, 'no link to either', 'fibonacci');
      } else if (!v1.valid) {
        game.error = `${target} links to ${prev1} but not ${prev2}: ${v1.reason}`;
        trackGuessMiss(prev2, target, v1.reason, 'fibonacci');
      } else {
        game.error = `${target} links to ${prev2} but not ${prev1}: ${v2.reason}`;
        trackGuessMiss(prev1, target, v2.reason, 'fibonacci');
      }
    } catch (err) {
      game.error = err instanceof Error ? err.message : 'Validation failed';
    } finally {
      game.isValidating = false;
    }
  }

  function undoLast() {
    if (game.chain.length <= 2 || game.isComplete) return;
    game.chain = game.chain.slice(0, -1);
    game.verdictPairs = game.verdictPairs.slice(0, -1);
    game.error = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addWord();
    }
  }

  function getTypeEmoji(type: string | null): string {
    const map: Record<string, string> = {
      compound: '🧩', synonym: '🔄', rhyme: '🎵', opposite: '⚡',
      'category-sibling': '👥', 'part-whole': '🔧', 'object-role': '🎭',
      material: '🧱', 'verb-object': '💪', collocation: '💬',
      'cause-effect': '💥', 'cultural-pair': '🤝', slang: '🗣️',
      'double-meaning': '🎯', homophone: '👂', containment: '📦', anagram: '🔀',
    };
    return map[type ?? ''] ?? '✅';
  }

  function getScoreInfo() {
    if (!game.isComplete) return null;
    const s = steps;
    const score = Math.floor(1000 / Math.max(s, 1));
    let rating: string;
    if (s <= 1) rating = 'Genius';
    else if (s <= 2) rating = 'Brilliant';
    else if (s <= 3) rating = 'Sharp';
    else if (s <= 5) rating = 'Solid';
    else rating = 'Scenic Route';
    return { steps: s, score, rating };
  }

  const scoreInfo = $derived(getScoreInfo());

  function shareResult() {
    if (!scoreInfo) return;
    const url = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    const emoji = fibEmojiSummary(game.chain);
    const header = daily ? `🌀 Lextension Fib Daily ${daily.date}` : `🌀 Lextension Fibonacci: ${startA}, ${startB} → ${target}`;
    const text = `${header}\n${emoji}\n${scoreInfo.steps} steps • ${scoreInfo.rating}${url ? `\n${url}` : ''}`;
    navigator.clipboard?.writeText(text);
    trackShare('fibonacci');
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Header -->
  <div class="p-4 border-2 border-(--ink) bg-(--surface)">
    <div class="flex items-center justify-between">
      <div class="text-center flex-1">
        <div class="text-xs font-bold uppercase tracking-widest text-(--text-muted)">Seeds</div>
        <div class="font-display text-xl font-black">{startA} + {startB}</div>
      </div>
      <div class="text-2xl text-(--text-muted) px-4">→</div>
      <div class="text-center flex-1">
        <div class="text-xs font-bold uppercase tracking-widest text-(--text-muted)">Target</div>
        <div class="font-display text-xl font-black">{target}</div>
      </div>
    </div>
    <div class="mt-2 text-center">
      <span class="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-(--accent) text-white">
        🌀 Fibonacci Mode
      </span>
    </div>
  </div>

  <!-- Chain -->
  <div class="flex flex-col gap-1">
    {#each game.chain as word, i}
      <div class="flex items-center gap-2">
        <span class="w-6 text-center text-xs font-bold text-(--text-muted)">{i + 1}</span>
        <span
          class="flex-1 px-3 py-2 border-2 font-bold text-sm {i < 2
            ? 'border-(--accent) bg-(--accent-soft) text-(--accent-ink)'
            : game.isComplete && i === game.chain.length - 1
              ? 'border-(--green) bg-green-50 dark:bg-green-950 text-(--green)'
              : 'border-(--ink) bg-(--surface)'}"
        >
          {word}
        </span>
        {#if i >= 2 && game.verdictPairs[i - 2]}
          {@const [vPrev2, vPrev1] = game.verdictPairs[i - 2]}
          <span class="flex gap-1 text-sm">
            <span>{getTypeEmoji(vPrev2.type)}</span>
            <span>{getTypeEmoji(vPrev1.type)}</span>
          </span>
        {/if}
      </div>
      {#if i >= 2 && game.verdictPairs[i - 2]}
        {@const [vPrev2, vPrev1] = game.verdictPairs[i - 2]}
        <div class="ml-8 flex flex-col gap-0.5 text-[11px] text-(--text-muted) leading-tight">
          <div>{getTypeEmoji(vPrev2.type)} {game.chain[i-2]} → {word}: {vPrev2.reason}</div>
          <div>{getTypeEmoji(vPrev1.type)} {game.chain[i-1]} → {word}: {vPrev1.reason}</div>
        </div>
      {/if}
    {/each}
  </div>

  <!-- Must-link hint -->
  {#if !game.isComplete && game.chain.length >= 2}
    <div class="text-xs text-(--text-muted) text-center">
      Next word must link to both <strong class="text-(--text)">{prev2}</strong> and <strong class="text-(--text)">{prev1}</strong>
    </div>
  {/if}

  <!-- Input area -->
  {#if !game.isComplete}
    <div class="flex flex-col gap-2">
      <div class="flex gap-2">
        <input
          bind:this={inputEl}
          bind:value={inputValue}
          onkeydown={handleKeydown}
          disabled={game.isValidating}
          placeholder="Word linking both..."
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
          disabled={game.chain.length < 3 || game.isValidating}
          class="flex-1 px-4 py-2 border-2 border-(--green) text-(--green) font-bold text-sm uppercase tracking-wider hover:bg-(--green) hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-(--green)"
        >
          Finish → {target}
        </button>
        <button
          onclick={undoLast}
          disabled={game.chain.length <= 2 || game.isValidating}
          class="px-4 py-2 border-2 border-(--ink) text-(--text-muted) font-bold text-sm uppercase tracking-wider hover:bg-(--surface) transition-colors disabled:opacity-30"
        >
          Undo
        </button>
        <button
          onclick={resetGame}
          disabled={game.chain.length <= 2 || game.isValidating}
          class="px-4 py-2 border-2 border-(--red) text-(--red) font-bold text-sm uppercase tracking-wider hover:bg-(--red) hover:text-white transition-colors disabled:opacity-30"
        >
          Reset
        </button>
      </div>
    </div>

    {#if game.error}
      <div class="px-3 py-2 border-2 border-(--red) bg-red-50 dark:bg-red-950 text-(--red) text-sm font-medium whitespace-pre-line">
        {game.error}
      </div>
    {/if}
  {/if}

  <!-- Score card -->
  {#if game.isComplete && scoreInfo}
    <div class="flex flex-col items-center gap-3 p-6 border-2 border-(--green) bg-green-50 dark:bg-green-950">
      <div class="font-display text-3xl font-black text-(--green)">
        {scoreInfo.rating}!
      </div>
      <div class="text-sm text-(--text-muted)">
        <span class="font-bold">{scoreInfo.steps}</span> step{scoreInfo.steps === 1 ? '' : 's'} •
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
  {/if}

  <!-- How it works -->
  <details class="text-xs text-(--text-muted)">
    <summary class="cursor-pointer font-bold uppercase tracking-wider hover:text-(--text)">How Fibonacci mode works</summary>
    <div class="mt-2 space-y-1 pl-2">
      <p>You start with two seed words: <strong>{startA}</strong> and <strong>{startB}</strong>.</p>
      <p>Each word you add must have a valid link to <strong>both</strong> of the two words before it — like a Fibonacci sequence where each term depends on the previous two.</p>
      <p>Your goal is to reach <strong>{target}</strong>.</p>
      <p class="mt-1">Example: <strong>Fire, Ice</strong> → you need a word related to both Fire AND Ice, like <em>Burn</em> (fire→burn, ice→burn).</p>
      <p>Fewer steps = higher score. This mode is <strong>much harder</strong> than regular bridging!</p>
    </div>
  </details>
</div>
