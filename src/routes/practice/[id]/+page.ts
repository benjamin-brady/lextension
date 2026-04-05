import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';
import { getPracticePuzzle, getPracticePuzzleCount } from '$lib/puzzles';

export const load: PageLoad = ({ params }) => {
	const id = Number.parseInt(params.id, 10);
	const count = getPracticePuzzleCount();

	if (!Number.isInteger(id) || id < 1 || id > count) {
		error(404, 'Practice puzzle not found');
	}

	const puzzle = getPracticePuzzle(id);
	if (!puzzle) {
		error(404, 'Practice puzzle not found');
	}

	return {
		count,
		id,
		nextId: id < count ? id + 1 : null,
		previousId: id > 1 ? id - 1 : null,
		puzzle,
		shareLabel: `Practice #${id}`,
		storageId: `practice-${id}`,
	};
};