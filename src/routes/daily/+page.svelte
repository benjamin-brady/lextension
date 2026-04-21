<script lang="ts">
  import LextensionGame from '$lib/components/LextensionGame.svelte';
  import StreakBanner from '$lib/components/StreakBanner.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const daily = $derived(data.daily);
</script>

<svelte:head>
  <title>Daily: {daily.start} → {daily.end} | Lextension</title>
</svelte:head>

<div class="grid gap-4">
  <div class="flex items-center justify-between text-xs">
    <span class="font-bold uppercase tracking-widest text-(--text-muted)">
      Daily · {daily.date}
    </span>
    <a href="/daily/fib" class="font-bold uppercase tracking-widest text-(--accent) hover:underline">
      🌀 Fibonacci →
    </a>
  </div>
  <StreakBanner mode="chain" date={daily.date} />
  {#key `${daily.date}-${daily.start}-${daily.end}`}
    <LextensionGame start={daily.start} end={daily.end} daily={{ date: daily.date, mode: 'chain' }} />
  {/key}
</div>
