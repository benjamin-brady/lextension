<script lang="ts">
  import { LINK_TYPE_HELP } from '$lib/link-type-help';
</script>

<ul class="grid grid-cols-1 gap-x-3 gap-y-1 pl-0 sm:grid-cols-2">
  {#each LINK_TYPE_HELP as item (item.type)}
    <li class="flex items-baseline gap-1.5">
      <span aria-hidden="true">{item.emoji}</span>
      <span><strong class="text-(--text)">{item.label}</strong> ({item.example})</span>
    </li>
  {/each}
</ul>