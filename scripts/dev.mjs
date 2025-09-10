#!/usr/bin/env node
import { spawn } from 'node:child_process';

const procs = [];

function run(cmd, args, name) {
  const p = spawn(cmd, args, { stdio: ['inherit', 'pipe', 'pipe'], shell: process.platform === 'win32' });
  procs.push(p);
  const prefix = `[${name}]`;
  p.stdout.on('data', (d) => process.stdout.write(`${prefix} ${d}`));
  p.stderr.on('data', (d) => process.stderr.write(`${prefix} ${d}`));
  p.on('exit', (code) => {
    console.log(`${prefix} exited with code ${code}`);
  });
  return p;
}

// 1) Rollup in watch mode (uses local devDependency)
run('node', ['node_modules/.bin/rollup', '-c', 'rollup.config.mjs', '-w'], 'rollup');

// 2) web-ext run (it will auto-reload when files in source-dir change)
run('web-ext', ['run', '--source-dir', './dist/'], 'web-ext');

function cleanup() {
  for (const p of procs) {
    try { p.kill('SIGINT'); } catch {}
  }
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
