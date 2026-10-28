// Fails when .env is tracked by git or a value from it appears in any tracked file.
// Runs on every push (see .githooks/pre-push). Never prints the secret itself.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const MIN_SECRET_LENGTH = 8;

const problems = [...trackedEnvFiles(), ...leakedSecrets()];
if (problems.length) {
  problems.forEach((problem) => console.error(`✗ ${problem}`));
  process.exit(1);
}
console.log('✓ No secrets in tracked files');

function trackedEnvFiles() {
  return git(['ls-files'])
    .filter((file) => /(^|\/)\.env(\..+)?$/.test(file))
    .map((file) => `${file} is tracked by git`);
}

function leakedSecrets() {
  return secretValues().flatMap(({ name, value }) =>
    git(['grep', '--cached', '-l', '-F', '-e', value]).map((file) => `${name} appears in ${file}`),
  );
}

function secretValues() {
  if (!existsSync('.env')) return [];
  return readFileSync('.env', 'utf8')
    .split('\n')
    .map((line) => line.match(/^\s*([\w.]+)\s*=\s*["']?(.*?)["']?\s*$/))
    .filter((match) => match && match[2].length >= MIN_SECRET_LENGTH)
    .map(([, name, value]) => ({ name, value }));
}

function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    return []; // git grep exits 1 when nothing matches
  }
}
