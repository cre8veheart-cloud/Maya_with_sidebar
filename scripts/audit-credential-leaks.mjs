#!/usr/bin/env node

/**
 * Credential-leak audit.
 *
 * Protects repository secrets without restricting legitimate AI teammates,
 * branch workflows, pull requests, or founder-authorized development.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build', 'coverage']);
const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.yml', '.yaml',
  '.toml', '.sh', '.md', '.env', '.txt'
]);

const RULES = [
  {
    id: 'github-token-in-client',
    re: /NEXT_PUBLIC_(?:GITHUB|GH)_(?:TOKEN|PAT)|VITE_(?:GITHUB|GH)_(?:TOKEN|PAT)|REACT_APP_(?:GITHUB|GH)_(?:TOKEN|PAT)/i,
    why: 'GitHub credential appears exposed to client-side code.'
  },
  {
    id: 'embedded-github-token',
    re: /(?:ghp_|github_pat_)[A-Za-z0-9_]{12,}/,
    why: 'Possible embedded GitHub credential.'
  },
  {
    id: 'embedded-provider-key',
    re: /(?:sk-ant-|sk-proj-)[A-Za-z0-9_-]{12,}/,
    why: 'Possible embedded provider credential.'
  }
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const findings = [];
for (const full of walk(ROOT)) {
  const rel = path.relative(ROOT, full).replaceAll(path.sep, '/');
  const ext = path.extname(rel).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext) && !path.basename(rel).startsWith('.env')) continue;

  let source;
  try { source = fs.readFileSync(full, 'utf8'); } catch { continue; }
  source.split(/\r?\n/).forEach((line, index) => {
    for (const rule of RULES) {
      if (rule.re.test(line)) findings.push({ ...rule, file: rel, line: index + 1 });
    }
  });
}

if (!findings.length) {
  console.log('MAYA CREDENTIAL AUDIT: PASS — no credential leak signatures found.');
  process.exit(0);
}

console.error('MAYA CREDENTIAL AUDIT: FAILED');
for (const finding of findings) {
  console.error(`[HIGH] ${finding.id} ${finding.file}:${finding.line} — ${finding.why}`);
}
process.exit(1);
