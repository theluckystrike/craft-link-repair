// s1115a A2. eslint-plugin-obsidianmd 0.6.0 regex-lookbehind (iOS before 16.4 has no lookbehind). Equivalence of the
// rewrite with the old lookbehind expression, on a table of edge cases and on seeded fuzz input (as lanes/R1-A1/eq/eq.mts).
import { describe, expect, it } from 'vitest';
import { protectedSpans } from '../src/repair';

let seed = 1115;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const gen = (alpha: string[], len: number) => Array.from({ length: Math.floor(rnd() * len) }, () => alpha[Math.floor(rnd() * alpha.length)]).join('');
const FUZZ = 20000;
const j = (x: unknown) => JSON.stringify(x);
/** Runs old and new on each input. Returns the inputs where they differ. */
function differ(inputs: string[], oldF: (s: string) => unknown, newF: (s: string) => unknown): string[] {
	return inputs.filter((s) => j(oldF(s)) !== j(newF(s)));
}
const fuzz = (alpha: string[], len: number) => Array.from({ length: FUZZ }, () => gen(alpha, len));

const OLD = /((?<![\s\S])---\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)[^\n]*(?:\n|$))|(^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:^ {0,3}\3[ \t\r]*(?:\n|$)|(?![\s\S])))|(`+)[^`]*?\4|<!--[\s\S]*?-->|%%[\s\S]*?%%/gm;
const oldF = (s: string) => [...s.matchAll(OLD)].map((m) => ({ index: m.index, text: m[0] }));
const TABLE = ['', '---\na: 1\n---\n[x](y)', '\n---\na\n---\n', 'x---\na\n---', '---\r\na\r\n...\r\n', '---\na\n---', '---\n---\n', '```\ncode\n```\n---\na\n---', '---\n`a`\n---\n`b`', '<!-- c --> %% d %%', '~~~\nx', '---\na\n--- trailing\nrest'];

describe('protected spans without lookbehind', () => {
	it('matches the old expression on the table', () => {
		expect(differ(TABLE, oldF, protectedSpans)).toEqual([]);
	});
	it('matches the old expression on fuzz input', () => {
		expect(differ(fuzz(['---', '\n', '\r\n', 'a', '...', '```', '~~~', '`', '<!--', '-->', '%%', ' ', '[x](y)'], 20), oldF, protectedSpans)).toEqual([]);
	});
});
