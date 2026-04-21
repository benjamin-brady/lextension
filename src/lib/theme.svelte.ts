import { PersistedState } from 'runed';

export type ThemeChoice = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const themeState = new PersistedState<ThemeChoice>('site_theme', 'system', {
	storage: 'local',
	syncTabs: true
});

export const theme = {
	get choice(): ThemeChoice {
		return themeState.current;
	},
	set choice(value: ThemeChoice) {
		themeState.current = value;
	},
	cycle() {
		const order: ThemeChoice[] = ['light', 'dark', 'system'];
		const idx = order.indexOf(themeState.current);
		themeState.current = order[(idx + 1) % order.length];
	}
};

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
	if (choice === 'system') {
		if (typeof window === 'undefined') return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return choice;
}
