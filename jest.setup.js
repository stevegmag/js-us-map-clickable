const fetch = require('node-fetch');
global.fetch = fetch;

// Mock window.location
global.window = Object.create(window);
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost'
  }
});