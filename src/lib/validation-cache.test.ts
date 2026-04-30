import { describe, expect, test } from 'bun:test';

import { getValidationCacheKey, reframeVerdictForPair } from './validation-cache';

describe('getValidationCacheKey', () => {
	test('uses the same cache entry for either word order', () => {
		expect(getValidationCacheKey('Hot', 'dog')).toBe(getValidationCacheKey(' dog ', 'HOT'));
	});
});

describe('reframeVerdictForPair', () => {
	test('preserves verdict details while returning the requested word order', () => {
		expect(
			reframeVerdictForPair(
				{
					a: 'hot',
					b: 'dog',
					valid: true,
					type: 'compound',
					reason: 'Hot dog is a recognized compound.',
				},
				'dog',
				'hot'
			)
		).toEqual({
			a: 'dog',
			b: 'hot',
			valid: true,
			type: 'compound',
			reason: 'Hot dog is a recognized compound.',
		});
	});
});