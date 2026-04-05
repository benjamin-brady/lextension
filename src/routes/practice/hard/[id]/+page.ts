import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';
import { getHardPracticePuzzle, getHardPracticePuzzleCount } from '$lib/puzzles';

export const load: PageLoad = ({ params }) => {
	const id = Number.parseInt(params.id, 10);
	const count = getHardPracticePuzzleCount();

	if (!Number.isInteger(id) || id < 1 || id > count) {
		error(404, 'Hard practice puzzle not found');
	}

	const puzzle = getHardPracticePuzzle(id);
	if (!puzzle) {
		error(404, 'Hard practice puzzle not found');
	}

	return {
		count,
		id,
		nextId: id < count ? id + 1 : null,
		previousId: id > 1 ? id - 1 : null,
		puzzle,
		shareLabel: `Hard practice #${id}`,
		storageId: `practice-hard-${id}`,
	};
};