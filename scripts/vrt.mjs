#!/usr/bin/env node
// Wraps backstop commands so a fresh build + dev server is managed automatically.
// Usage: node scripts/vrt.mjs [reference|test|approve]
import { spawn } from 'child_process';

const command = process.argv[2];
if (!['reference', 'test', 'approve'].includes(command)) {
  console.error('Usage: node scripts/vrt.mjs [reference|test|approve]');
  process.exit(1);
}

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(args[0], args.slice(1), { stdio: 'inherit' });
    child.on('exit', code => (code === 0 ? resolve() : reject(code)));
    child.on('error', reject);
  });
}

if (command === 'approve') {
  run(['npx', 'backstop', 'approve']).catch(code => process.exit(code ?? 1));
} else {
  // Start the dev server and wait for it to print "localhost" before launching backstop.
  const server = spawn('node', ['serve.mjs'], { stdio: ['ignore', 'pipe', 'inherit'] });
  let started = false;

  server.stdout.on('data', async data => {
    if (started || !data.toString().includes('localhost')) return;
    started = true;
    try {
      await run(['npx', 'backstop', command]);
      server.kill();
      process.exit(0);
    } catch (code) {
      server.kill();
      process.exit(typeof code === 'number' ? code : 1);
    }
  });

  server.on('error', err => {
    console.error('Failed to start dev server:', err.message);
    process.exit(1);
  });
}
