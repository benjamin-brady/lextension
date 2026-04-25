<script lang="ts">
  import FibonacciGame from "$lib/components/FibonacciGame.svelte";
  import { page } from "$app/state";

  const w1 = $derived(decodeURIComponent(page.params.w1 ?? ''));
  const w2 = $derived(decodeURIComponent(page.params.w2 ?? ''));
  const target = $derived(decodeURIComponent(page.params.target ?? ''));
</script>

<svelte:head>
  <title>{w1} + {w2} → {target} | Fibonacci | Lextension</title>
</svelte:head>

<div class="grid gap-4">
  {#key `${w1}-${w2}-${target}`}
    <FibonacciGame startA={w1} startB={w2} {target} />
  {/key}
  <div class="flex justify-center">
    <a
      href="/"
      class="px-4 py-2 text-xs font-bold uppercase tracking-wider text-(--text-muted) hover:text-(--text) transition-colors"
    >
      ← Back
    </a>
  </div>
</div>
