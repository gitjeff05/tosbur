const { readFileSync } = require('fs');
const { spawn } = require('child_process');

console.log('Preload loaded.');

// app.whenReady().then(() => {
//   console.log('App reading inside preload.');
// });

console.log(__dirname);

const readConfig = () => {
  const data = readFileSync('./jest.config.js', 'utf8');
  return data;
};

window.readConfig = readConfig;

// docker run --rm -it -p 8888:8888 -e RESTARTABLE=yes -e JUPYTER_ENABLE_LAB=yes -v "$HOME/Github/nih-grant-awards":/home/jovyan/work/nih-grant-awards scipy-notebook:geopandas
const args = [
  'run',
  '--rm', // Clean up (automatically clean up the container and remove the file system when the container exits)
  // '-d', // detach mode (exit when the root process used to run the container exits)
  '-t', // Allocate a pseudo-tty
  // '-i',
  '-a',
  'stdout',
  '-p',
  '8888:8888',
  '-e',
  'RESTARTABLE=yes',
  '-e',
  'JUPYTER_ENABLE_LAB=yes',
  '-v',
  '/Users/bishop/Github/nih-grant-awards:/home/jovyan/work/nih-grant-awards',
  'scipy-notebook:geopandas'
];

const LAUNCH_CONTAINER = true;

if (LAUNCH_CONTAINER) {
  const ls = spawn('docker', args);

  ls.stdout.on('data', data => {
    console.log(`stdout: ${data}`);
    console.log(data.toString());
  });

  ls.stderr.on('data', data => {
    console.error(`stderr: ${data}`);
    console.error(data.toString());
  });

  ls.on('close', code => {
    console.log(`child process exited with code ${code}`);
  });
}
