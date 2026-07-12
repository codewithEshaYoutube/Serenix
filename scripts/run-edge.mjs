import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');
const composeFile = resolve(repoRoot, 'edge', 'docker-compose.yml');
const dockerCommand = process.platform === 'win32' ? 'docker.exe' : 'docker';

function hasDocker() {
  const result = spawnSync(dockerCommand, ['version'], {
    cwd: repoRoot,
    stdio: 'ignore',
    shell: false,
  });

  return result.status === 0;
}

function runDockerCompose() {
  const child = spawn(dockerCommand, ['compose', '-f', composeFile, 'up', '--build', '-d'], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Docker compose exited with code ${code}.`);
      startFallbackServer();
    }
  });

  child.on('error', () => {
    console.error('Docker could not be started. Falling back to local mock mode.');
    startFallbackServer();
  });
}

function startFallbackServer() {
  const server = createServer((req, res) => {
    if (req.url === '/health' || req.url === '/edge/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', mode: 'mock', message: 'Docker is unavailable; this fallback edge service is running.' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Serenix edge fallback service is running. Docker is unavailable, so this is a local mock mode.');
  });

  server.listen(8090, '0.0.0.0', () => {
    console.log('Edge fallback service listening on http://localhost:8090');
    console.log('Use http://localhost:8090/edge/health to verify it is running.');
  });
}

if (hasDocker()) {
  console.log('Starting edge stack with Docker Compose...');
  runDockerCompose();
} else {
  console.warn('Docker was not found on PATH. Starting the local edge fallback service instead.');
  startFallbackServer();
}
