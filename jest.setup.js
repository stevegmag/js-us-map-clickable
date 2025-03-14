// Mock window.location
global.window = Object.create(window);
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost'
  }
});