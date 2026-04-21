<script lang="ts">
	import { Sun, Moon, SunMoon } from 'lucide-svelte';
	import { theme, type ThemeChoice } from '$lib/theme.svelte';

	const icons: Record<ThemeChoice, typeof Sun> = {
		light: Sun,
		dark: Moon,
		system: SunMoon
	};

	const labels: Record<ThemeChoice, string> = {
		light: 'Light theme',
		dark: 'Dark theme',
		system: 'System theme'
	};

	const Icon = $derived(icons[theme.choice]);
	const label = $derived(labels[theme.choice]);
</script>

<button
	type="button"
	onclick={() => theme.cycle()}
	aria-label={label}
	title={label}
	class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-none border-2 border-(--ink) bg-(--surface) text-(--ink) shadow-[2px_2px_0_0_var(--ink)] transition-all hover:bg-(--surface-light) active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--ink)]"
>
	<Icon size={18} />
</button>
