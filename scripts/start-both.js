const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('🚀 Starting G-Zen Phone Store Full-Stack Ecosystem...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// Start backend
const backend = spawn(npmCmd, ['run', 'start'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
});

// Start frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\n🛑 Stopping servers...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
