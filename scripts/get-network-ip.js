const os = require('os');

function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log(`Network IP: ${interface.address}`);
        console.log(`Frontend URL: http://${interface.address}:5173/`);
        console.log(`API URL: http://${interface.address}:5050/`);
        return interface.address;
      }
    }
  }
  
  console.log('No network IP found. Make sure you are connected to a network.');
  return null;
}

getNetworkIP();