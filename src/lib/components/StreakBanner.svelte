<script lang="ts">
  import { getStreak, type DailyMode } from '$lib/streak';

  let { mode, date }: { mode: DailyMode; date: string } = $props();

  // Re-read on each render — PersistedState is reactive.
  const streak = $derived(getStreak(mode));
  const completedToday = $derived(streak.last === date);
</script>

<div class="flex items-center justify-between px-3 py-2 border-2 border-(--ink) bg-(--bg-raised) text-xs">
  <div class="flex items-center gap-3">
    <span class="font-bold uppercase tracking-wider">
      🔥 Streak <span class="text-(--accent)">{streak.current}</span>
    </span>
    <span class="text-(--text-muted)">best {streak.best}</span>
  </div>
  {#if completedToday}
    <span class="font-bold uppercase tracking-wider text-(--green)">✅ Today done</span>
  {/if}
</div>
