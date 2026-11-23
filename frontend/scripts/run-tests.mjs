#!/usr/bin/env node
/**
 * Portable test runner using explicit file discovery.
 *
 * Node 24 on Windows can fail on directory arguments (`node --test src/lib`).
 * Passing discovered test files explicitly works consistently across Node 24 and 26
 * without modifying package.json module semantics or adding dependencies.
 */
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const targetDir = process.argv[2] ?? 'src';
const TEST_FILE_RE = /\.test\.(?:ts|mts|cts|js|mjs|cjs)$/;
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'out']);

function collectTests(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) collectTests(full, results);
    } else if (TEST_FILE_RE.test(entry)) {
      results.push(relative(process.cwd(), full));
    }
  }
  return results;
}

const files = collectTests(targetDir).sort();
if (files.length === 0) {
  console.error(`No test files found under ${targetDir}`);
  process.exit(1);
}

const res = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit',
});

process.exit(res.status ?? 1);
