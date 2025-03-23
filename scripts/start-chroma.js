const { spawn } = require('child_process');
const path = require('path');

// Start ChromaDB server
const server = spawn('chroma', ['run'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '../data/chroma')
});

// Handle server exit
server.on('exit', (code) => {
  console.log(`ChromaDB server exited with code ${code}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Failed to start ChromaDB server:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  server.kill();
  process.exit();
}); 