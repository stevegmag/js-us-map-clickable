// Import the function if using modules
// import { initializeStateMap } from '../src/us-map-script.js';

// Mock setupMap globally
global.setupMap = jest.fn();

describe('initializeStateMap data loading', () => {
  let mockFetch;
  let consoleSpy;
  
  beforeEach(() => {
    // Mock fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    // Mock console methods
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock setupMap function
    global.setupMap = jest.fn();
    
    // Reset DOM
    document.body.innerHTML = '<div id="us-map"></div>';
  });

  afterEach(() => {
    jest.resetAllMocks();
    consoleSpy.mockRestore();
  });

  test('loads data from URL successfully', async () => {
    const mockData = {
      states: [
        {
          name: 'Test State',
          abbreviation: 'TS'
        }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    initializeStateMap({
      statesData: '../data/us-states-data.json',
      mapId: 'us-map'
    });

    await new Promise(process.nextTick); // Wait for promises to resolve

    expect(mockFetch).toHaveBeenCalledWith('../data/us-states-data.json');
    expect(setupMap).toHaveBeenCalledWith(mockData);
  });

  test('handles fetch error correctly', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    initializeStateMap({
      statesData: '../data/us-states-data.json',
      mapId: 'us-map'
    });

    await new Promise(process.nextTick);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error loading states data:',
      expect.any(Error)
    );
  });

  test('handles non-OK response correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    initializeStateMap({
      statesData: '../data/us-states-data.json',
      mapId: 'us-map'
    });

    await new Promise(process.nextTick);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error loading states data:',
      expect.any(Error)
    );
  });

  test('uses direct data object when provided', () => {
    const directData = {
      states: [
        {
          name: 'Test State',
          abbreviation: 'TS'
        }
      ]
    };

    initializeStateMap({
      statesData: directData,
      mapId: 'us-map'
    });

    expect(setupMap).toHaveBeenCalledWith(directData);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('handles missing data correctly', () => {
    initializeStateMap({
      mapId: 'us-map'
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'No states data provided. Please provide a URL or data object.'
    );
    expect(setupMap).not.toHaveBeenCalled();
  });
});