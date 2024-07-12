const detectPort = require('detect-port');
const { spawn } = require('child_process');

const preferredPort = process.env.PORT || 5001;

detectPort(preferredPort, (err, availablePort) => {
  if (err) {
    console.error('Error in port detection:', err);
    process.exit(1);
  }

  if (availablePort !== preferredPort) {
    console.warn(`Preferred port ${preferredPort} is in use. Using available port ${availablePort} instead.`);
    process.env.PORT = availablePort; // Update the environment variable for the server
  }

  // Start the server with nodemon, passing the updated PORT environment variable
  const nodemon = spawn('nodemon', ['server.js'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: availablePort },
  });

  nodemon.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
});