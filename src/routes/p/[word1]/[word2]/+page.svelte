<script lang="ts">
  import LextensionGame from '$lib/components/LextensionGame.svelte';
  import { page } from '$app/state';

  const word1 = $derived(decodeURIComponent(page.params.word1));
  const word2 = $derived(decodeURIComponent(page.params.word2));
</script>

<svelte:head>
  <title>{word1} → {word2} | Lextension</title>
</svelte:head>

<div class="grid gap-4">
  {#key `${word1}-${word2}`}
    <LextensionGame start={word1} end={word2} />
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
