<script lang="ts">
  import FibonacciGame from '$lib/components/FibonacciGame.svelte';
  import StreakBanner from '$lib/components/StreakBanner.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const daily = $derived(data.daily);
</script>

<svelte:head>
  <title>Daily Fib: {daily.startA} + {daily.startB} → {daily.target} | Lextension</title>
  <meta property="og:image" content="https://lextension.net/og-image-fib.png" />
  <meta name="twitter:image" content="https://lextension.net/og-image-fib.png" />
</svelte:head>

<div class="grid gap-4">
  <div class="flex items-center justify-between text-xs">
    <a href="/daily" class="font-bold uppercase tracking-widest text-(--accent) hover:underline">
      ← 🔗 Chain
    </a>
    <span class="font-bold uppercase tracking-widest text-(--text-muted)">
      Daily Fib · {daily.date}
    </span>
  </div>
  <StreakBanner mode="fib" date={daily.date} />
  {#key `${daily.date}-${daily.startA}-${daily.startB}-${daily.target}`}
    <FibonacciGame
      startA={daily.startA}
      startB={daily.startB}
      target={daily.target}
      daily={{ date: daily.date, mode: 'fib' }}
    />
  {/key}
</div>
