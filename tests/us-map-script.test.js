const { initializeStateMap, loadStateData } = require('../src/us-map-script.js');
const path = require('path');

describe('loadStateData', () => {
  const verifyStateData = (result) => {
    // Verify the structure of the data
    expect(result).toHaveProperty('states');
    expect(Array.isArray(result.states)).toBe(true);
    expect(result.states.length).toBeGreaterThan(0);
    
    // Verify first state has all required properties
    const firstState = result.states[0];
    expect(firstState).toHaveProperty('name');
    expect(firstState).toHaveProperty('abbreviation');
    expect(firstState).toHaveProperty('description');
    expect(firstState).toHaveProperty('linkUrl');
    expect(firstState).toHaveProperty('linkTarget');
    expect(firstState).toHaveProperty('linkLabel');
    expect(firstState).toHaveProperty('hoverColor');
    
    // Verify first state (Alabama) properties and values
    expect(firstState.name).toBe('Alabama');
    expect(firstState.abbreviation).toBe('AL');
    expect(firstState.description).toBe("Alabama is known as the 'Heart of Dixie' and features beautiful beaches, space exploration history at the U.S. Space & Rocket Center, and the civil rights landmarks of Birmingham.");
    expect(firstState.linkUrl).toBe('https://alabama.gov');
    expect(firstState.linkTarget).toBe('_blank');
    expect(firstState.linkLabel).toBe('Visit Alabama');
    expect(firstState.hoverColor).toBe('#D14F4F');
  };

  test('loads actual data from JSON file URL', async () => {
    // Assuming that you have started a local server for local file testing (inthis case using LIVE SERVER via VS CODE)
    const dataPath = 'http://127.0.0.1:5501/'+ '/data/us-states-data.json';
    
    const result = await loadStateData(dataPath);
    console.log('TEST:: Loaded State Data via fetch:', result);
    
    // Verify the structure of the data
    verifyStateData(result);
  });


  test('loade data passed as object', async () => {
    const statesData = {
      "states": [
        {
          "name": "Alabama",
          "abbreviation": "AL",
          "description": "Alabama is known as the 'Heart of Dixie' and features beautiful beaches, space exploration history at the U.S. Space & Rocket Center, and the civil rights landmarks of Birmingham.",
          "linkUrl": "https://alabama.gov",
          "linkTarget": "_blank",
          "linkLabel": "Visit Alabama",
          "hoverColor": "#D14F4F"
        },
        // ... other states
      ]
    };
    const result = await loadStateData(statesData);
    console.log('TEST:: Loaded State Data via fetch:', result);
    
    // Verify the structure of the data
    verifyStateData(result);

  });
  test('throws error when no data provided', async () => {
    await expect(loadStateData()).rejects.toThrow('No states data provided');
  });
});
