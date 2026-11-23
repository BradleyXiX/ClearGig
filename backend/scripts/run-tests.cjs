#!/usr/bin/env node
/**
 * Portable test runner using explicit file discovery for backend tests.
 * Works consistently across Node 24 and 26 without changing package.json module type.
 */
const { readdirSync, statSync } = require('node:fs');
const { join, relative } = require('node:path');
const { spawnSync } = require('node:child_process');

const targetDir = process.argv[2] ?? 'utils';
const TEST_FILE_RE = /\.test\.(?:js|mjs|cjs)$/;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build']);

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
