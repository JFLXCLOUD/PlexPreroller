const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'PlexPreroller',
  description: 'Plex Preroll Manager Service',
  script: path.join(__dirname, 'src/main.js'),
  nodeOptions: [
    '--max_old_space_size=4096'
  ],
  env: [
    {
      name: "NODE_ENV",
      value: "production"
    }
  ]
});

// Listen for the install event, which indicates the
// process is available as a service.
svc.on('install', function() {
  console.log('PlexPreroller service installed successfully');
  svc.start();
});

svc.on('start', function() {
  console.log('PlexPreroller service started');
});

svc.on('stop', function() {
  console.log('PlexPreroller service stopped');
});

svc.on('uninstall', function() {
  console.log('PlexPreroller service uninstalled');
});

svc.on('error', function(err) {
  console.error('PlexPreroller service error:', err);
});

// Install the service
svc.install();
