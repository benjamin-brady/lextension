import { describe, expect, test } from 'bun:test';

import { VALIDATION_PROMPT } from './validation-prompt';

describe('VALIDATION_PROMPT', () => {
	test('allows compound words in either order', () => {
		expect(VALIDATION_PROMPT).toContain('"{a} {b}" or "{b} {a}"');
		expect(VALIDATION_PROMPT).toContain('type=compound is allowed');
		expect(VALIDATION_PROMPT).not.toContain('Do NOT reverse the order');
		expect(VALIDATION_PROMPT).not.toContain('type=compound is FORBIDDEN');
	});

	test('teaches the validator to accept kangaroo words', () => {
		expect(VALIDATION_PROMPT).toContain('kangaroo');
		expect(VALIDATION_PROMPT).toContain('joey');
		expect(VALIDATION_PROMPT).toContain('letters appear in order');
	});
});