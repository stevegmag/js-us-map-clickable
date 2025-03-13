/**
 * US Map SVG Integration with State Data
 * 
 * This script creates interactive functionality for a US states SVG map.
 * @param {Object} options - Configuration options
 * @param {string|Object} options.statesData - Either a URL to JSON file or direct states data object
 * @param {string} options.mapId - ID of the SVG map element (default: 'us-map')
 * @param {boolean} options.showTooltip - Whether to show tooltip on hover (default: true)
 * @param {boolean} options.enableLinks - Whether to enable click navigation (default: true)
 */
function initializeStateMap(options = {}) {
  // Default options
  const config = {
    statesData: null,
    mapId: 'us-map',
    showTooltip: true,
    enableLinks: true,
    ...options
  };
  
  // Store original colors to revert when mouse leaves
  const originalColors = {};
  
  // Create tooltip if enabled
  let tooltip;
  if (config.showTooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'state-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.display = 'none';
    tooltip.style.backgroundColor = 'white';
    tooltip.style.border = '1px solid #ccc';
    tooltip.style.borderRadius = '4px';
    tooltip.style.padding = '10px';
    tooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    tooltip.style.zIndex = '1000';
    tooltip.style.maxWidth = '300px';
    document.body.appendChild(tooltip);
  }

  // Function to initialize the map with data
  function setupMap(data) {
    // Ensure we have the states array
    const states = data.states || data;
    
    // Create a lookup map for faster access to state data
    const stateMap = {};
    states.forEach(state => {
      stateMap[state.abbreviation] = state;
    });
    
    const mapObject = document.getElementById(config.mapId);
    const svgDoc = mapObject.contentDocument;
    const statePaths = svgDoc.querySelectorAll('path');
    
    // Sort states from west to east for logical tab order
    const sortedPaths = Array.from(statePaths).sort((a, b) => {
      const rectA = a.getBBox();
      const rectB = b.getBBox();
      return (rectA.x + rectA.width/2) - (rectB.x + rectB.width/2);
    });
    
    sortedPaths.forEach((path, index) => {
      const stateAbbr = path.id;
      // Store the original style string
      const originalStyle = path.getAttribute('style');
      // Parse out the original fill color
      const fillMatch = originalStyle.match(/fill:#([^;]+)/);
      originalColors[stateAbbr] = fillMatch ? `#${fillMatch[1]}` : '#f9f9f9';
      
      const state = stateMap[stateAbbr];
      
      if (state) {
        // Set tabindex based on position (west to east)    
        path.setAttribute('tabindex', index + 1);
        
        // Add ARIA attributes
        path.setAttribute('role', 'button');
        path.setAttribute('aria-label', `${state.name}: ${state.description}`);
        
        // Add mouse events
        path.addEventListener('mouseenter', function(e) {
          const currentStyle = path.getAttribute('style');
          const newStyle = currentStyle.replace(
            /fill:#[^;]+/, 
            `fill:${state.hoverColor || '#999'}`
          );
          path.setAttribute('style', newStyle);
          path.setAttribute('aria-expanded', 'true');
          
          if (config.showTooltip) {
            tooltip.innerHTML = `
              <h3>${state.name} (${state.abbreviation})</h3>
              <p>${state.description}</p>
              <a href="${state.linkUrl}" 
                 target="${state.linkTarget}"
                 aria-label="Visit ${state.name} website">
                 ${state.linkLabel}
              </a>
            `;
            tooltip.style.display = 'block';
            updateTooltipPosition(e);
          }
        });

        path.addEventListener('mouseleave', function() {
          const currentStyle = path.getAttribute('style');
          const newStyle = currentStyle.replace(
            /fill:#[^;]+/, 
            `fill:${originalColors[stateAbbr]}`
          );
          path.setAttribute('style', newStyle);
          path.setAttribute('aria-expanded', 'false');
          if (config.showTooltip) {
            tooltip.style.display = 'none';
          }
        });

        // Add click and keyboard activation handlers
        const activateState = () => {
          if (config.enableLinks) {
            window.open(state.linkUrl, state.linkTarget);
          }
        };

        path.addEventListener('click', activateState);
        
        path.addEventListener('keydown', function(e) {
          const currentState = e.target;
          const currentRect = currentState.getBBox();
          const centerX = currentRect.x + (currentRect.width / 2);
          const centerY = currentRect.y + (currentRect.height / 2);
          
          let nextState = null;
          let minDistance = Infinity;
          
          switch(e.key) {
            case 'Enter':
            case ' ':
              e.preventDefault();
              activateState();
              break;
              
            case 'ArrowLeft':
            case 'Left':
              e.preventDefault();
              sortedPaths.forEach(state => {
                const stateRect = state.getBBox();
                const stateX = stateRect.x + (stateRect.width / 2);
                const stateY = stateRect.y + (stateRect.height / 2);
                
                if (stateX < centerX) {
                  const distance = Math.hypot(centerX - stateX, centerY - stateY);
                  if (distance < minDistance) {
                    minDistance = distance;
                    nextState = state;
                  }
                }
              });
              break;
              
            case 'ArrowRight':
            case 'Right':
              e.preventDefault();
              sortedPaths.forEach(state => {
                const stateRect = state.getBBox();
                const stateX = stateRect.x + (stateRect.width / 2);
                const stateY = stateRect.y + (stateRect.height / 2);
                
                if (stateX > centerX) {
                  const distance = Math.hypot(centerX - stateX, centerY - stateY);
                  if (distance < minDistance) {
                    minDistance = distance;
                    nextState = state;
                  }
                }
              });
              break;
              
            case 'ArrowUp':
            case 'Up':
              e.preventDefault();
              sortedPaths.forEach(state => {
                const stateRect = state.getBBox();
                const stateX = stateRect.x + (stateRect.width / 2);
                const stateY = stateRect.y + (stateRect.height / 2);
                
                if (stateY < centerY) {
                  const distance = Math.hypot(centerX - stateX, centerY - stateY);
                  if (distance < minDistance) {
                    minDistance = distance;
                    nextState = state;
                  }
                }
              });
              break;
              
            case 'ArrowDown':
            case 'Down':
              e.preventDefault();
              sortedPaths.forEach(state => {
                const stateRect = state.getBBox();
                const stateX = stateRect.x + (stateRect.width / 2);
                const stateY = stateRect.y + (stateRect.height / 2);
                
                if (stateY > centerY) {
                  const distance = Math.hypot(centerX - stateX, centerY - stateY);
                  if (distance < minDistance) {
                    minDistance = distance;
                    nextState = state;
                  }
                }
              });
              break;
          }
          
          if (nextState) {
            nextState.focus();
            // Trigger the mouseenter event to show tooltip
            const mouseenterEvent = new Event('mouseenter');
            nextState.dispatchEvent(mouseenterEvent);
          }
        });

        // Add focus/blur handlers
        path.addEventListener('focus', function(e) {
          const currentStyle = path.getAttribute('style');
          const newStyle = currentStyle.replace(
            /fill:#[^;]+/, 
            `fill:${state.hoverColor || '#999'}`
          );
          path.setAttribute('style', newStyle);
          // Trigger tooltip on focus
          const mouseenterEvent = new Event('mouseenter');
          path.dispatchEvent(mouseenterEvent);
          
          // Update current state indicator
          currentStateIndicator.textContent = `Current state: ${state.name}`;
        });

        path.addEventListener('blur', function() {
          const currentStyle = path.getAttribute('style');
          const newStyle = currentStyle.replace(
            /fill:#[^;]+/, 
            `fill:${originalColors[stateAbbr]}`
          );
          path.setAttribute('style', newStyle);
          if (config.showTooltip) {
            tooltip.style.display = 'none';
          }
        });
      }
    });
    
    // Optional: Add a legend or controls
    const mapContainer = document.getElementById(config.mapId).parentElement;
    const legend = document.createElement('div');
    legend.innerHTML = `
      <h3>United States Interactive Map</h3>
      <p>Hover over a state to see details${config.enableLinks ? '. Click to visit the state website' : ''}.</p>
      <p class="keyboard-instructions">
        Use the tab or arrow keys to navigate between states, Enter or Space to go to the state's website/details.
      </p>
    `;
    mapContainer.insertBefore(legend, document.getElementById(config.mapId));

    // Add to your setupMap function
    const currentStateIndicator = document.createElement('div');
    currentStateIndicator.setAttribute('role', 'status');
    currentStateIndicator.setAttribute('aria-live', 'polite');
    currentStateIndicator.className = 'current-state';
    mapContainer.appendChild(currentStateIndicator);

    // Update the indicator when state changes
    path.addEventListener('focus', function() {
        currentStateIndicator.textContent = `Current state: ${state.name}`;
    });
  }
  
  // Function to update tooltip position
  function updateTooltipPosition(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get tooltip dimensions
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    
    // Calculate position to ensure tooltip stays in viewport
    let left = mouseX + 15;
    let top = mouseY + 15;
    
    // Adjust if tooltip would extend beyond right edge
    if (left + tooltipWidth > viewportWidth) {
      left = mouseX - tooltipWidth - 15;
    }
    
    // Adjust if tooltip would extend beyond bottom edge
    if (top + tooltipHeight > viewportHeight) {
      top = mouseY - tooltipHeight - 15;
    }
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    
    // Ensure tooltip is associated with current focused element
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('id', 'state-tooltip');
    e.target.setAttribute('aria-describedby', 'state-tooltip');
  }

  // Load data and initialize map
  if (typeof config.statesData === 'string') {
    // If statesData is a string, assume it's a URL and fetch it
    fetch(config.statesData)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
        }
        let data = response.json();
        console.log('response.ok', data);
        return data;
      })
      .then(data => { 
        setupMap(data);
      })
      .catch(error => {
        console.error('Error loading states data:', error);
      });
  } else if (config.statesData) {
    // If statesData is an object, use it directly
    setupMap(config.statesData);
  } else {
    console.error('No states data provided. Please provide a URL or data object.');
  }
}

// Usage examples
document.addEventListener('DOMContentLoaded', function() {
  // Option 1: Load from external JSON file
  console.log('DOMContentLoaded evt listener');
  initializeStateMap({
    statesData: './us-states-data.json', 
    mapId: 'us-map',
    showTooltip: true,
    enableLinks: true
  });
  
  // Option 2: Use inline data
  /*
  const statesData = {
    "states": [
      {
        "name": "Alabama",
        "abbreviation": "AL",
        "description": "Alabama is known as the 'Heart of Dixie'...",
        "linkUrl": "https://alabama.gov",
        "linkTarget": "_blank",
        "linkLabel": "Visit Alabama",
        "hoverColor": "#D14F4F"
      },
      // ... other states
    ]
  };
  
  initializeStateMap({
    statesData: statesData,
    mapId: 'us-map'
  });
  */
});