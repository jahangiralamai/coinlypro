// Test server startup
const PORT = 5000;

require('./index.js');

// Wait a moment and log that server should be running
setTimeout(() => {
  console.log(`\n✅ Server should be listening on port ${PORT}`);
  console.log(`📍 Frontend should connect to: http://localhost:${PORT}\n`);
}, 1000);
