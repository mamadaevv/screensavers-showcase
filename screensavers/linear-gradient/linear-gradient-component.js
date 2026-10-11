class LinearGradientScreensaver extends HTMLElement {
  static getSettings() {
    const settings = [
      {
        name: 'animationEnabled',
        label: 'Animation',
        type: 'switch',
        default: true
      },
      {
        name: 'speedPresets',
        label: 'Displacement velocity',
        type: 'button-group',
        options: [
          { value: 'slow', label: 'Slowly' },
          { value: 'normal', label: 'Normal' },
          { value: 'fast', label: 'Quickly' }
        ]
      },
      {
        name: 'updateInterval',
        label: 'Refresh rate (ms)',
        type: 'range',
        min: 10,
        max: 1000,
        default: 100,
        step: 10
      },
      {
        name: 'updateStep',
        label: 'Update Step (%)',
        type: 'range',
        min: 0.1,
        max: 10,
        default: 1,
        step: 0.1
      },
      {
        name: 'colorSpace',
        label: 'Color Space',
        type: 'radio',
        options: [
          { value: 'oklab', label: 'in oklab' },
          { value: 'hsl-shorter', label: 'in hsl shorter hue' },
          { value: 'hsl-longer', label: 'in hsl longer' }
        ],
        default: 'oklab'
      },
      {
        name: 'globalRotation',
        label: 'Global rotation (°)',
        type: 'range',
        min: -180,
        max: 180,
        default: 0,
        step: 1
      },
      {
        name: 'globalScale',
        label: 'Global Scale',
        type: 'range',
        min: 0.1,
        max: 3.0,
        default: 1.0,
        step: 0.01
      },
      {
        name: 'backgroundSize',
        label: 'Background Size (%)',
        type: 'range',
        min: 100,
        max: 500,
        default: 200,
        step: 10
      }
    ];

    // Load colors from localStorage to create settings
    const tagName = 'linear-gradient-screensaver';
    const key = `screensaver-${tagName}-colors`;
    const saved = localStorage.getItem(key);
    let colors = ['#ff0000', '#0080ff', '#80ff00', '#ffff00', '#ff0000']; // Colors from the swatches: red, blue, light green, yellow, red

    if (saved) {
      try {
        const parsedColors = JSON.parse(saved);
        if (Array.isArray(parsedColors) && parsedColors.length > 0) {
          colors = parsedColors;
        }
      } catch (e) {
      }
    }

    // Add the color settings dynamically at the end
    colors.forEach((color, index) => {
      settings.push({
        name: `color${index + 1}`,
        label: `Color ${index + 1}`,
        type: 'color',
        default: color
      });
    });

    return settings;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.animationEnabled = true; // Animation is enabled by default
    this.updateInterval = Math.max(10, Math.min(1000, 100)); // refresh rate in milliseconds (with validation)
    this.updateStep = Math.max(0.1, Math.min(10, 1)); // Update increment as a percentage (with verification)
    this.colorSpace = null; // default color space (null = disabled)
    this.globalRotation = 0; // global rotation in degrees
    this.globalScale = 1.0; // global scale
    this.backgroundSize = 200; // background size as a percentage
    this.colors = ['#ff0000', '#0080ff', '#80ff00', '#ffff00', '#ff0000']; // Colors from the swatches: red, blue, light green, yellow, red
    this.animationOffset = 0; // animation offset (in percent)
    this.animationTimer = null; // animation timer
  }

  connectedCallback() {
    // Reading Settings from Attributes
    const intervalAttr = this.getAttribute('data-updateInterval');
    if (intervalAttr !== null) {
      this.updateInterval = Math.max(10, Math.min(1000, parseInt(intervalAttr, 10)));
    }
    const stepAttr = this.getAttribute('data-updateStep');
    if (stepAttr !== null) {
      this.updateStep = Math.max(0.1, Math.min(10, parseFloat(stepAttr)));
    }
    const colorSpaceAttr = this.getAttribute('data-colorSpace');
    if (colorSpaceAttr !== null) {
      this.colorSpace = colorSpaceAttr;
    }
    const globalRotationAttr = this.getAttribute('data-globalRotation');
    if (globalRotationAttr !== null) {
      this.globalRotation = Math.max(-180, Math.min(180, parseInt(globalRotationAttr, 10)));
    }
    const globalScaleAttr = this.getAttribute('data-globalScale');
    if (globalScaleAttr !== null) {
      this.globalScale = Math.max(0.1, Math.min(3.0, parseFloat(globalScaleAttr)));
    }
    const backgroundSizeAttr = this.getAttribute('data-backgroundSize');
    if (backgroundSizeAttr !== null) {
      this.backgroundSize = Math.max(100, Math.min(500, parseInt(backgroundSizeAttr, 10)));
    }
    const animationEnabledAttr = this.getAttribute('data-animationEnabled');
    if (animationEnabledAttr !== null) {
      this.animationEnabled = animationEnabledAttr === 'true';
    }

    // Loading colors from localStorage
    this.loadColorsFromStorage();

    // Load color space settings
    this.loadSettingsFromStorage();

    this.render();
    this.updateContainerSizeAndPosition();
    if (this.animationEnabled) {
      this.startAnimation();
    }
  }

  disconnectedCallback() {
    this.stopAnimation();
    // Reset the transformation and dimensions when the component is disabled
    const container = document.getElementById('screensaver-container');
    if (container) {
      container.style.transform = '';
      container.style.width = '';
      container.style.height = '';
      container.style.position = '';
      container.style.left = '';
      container.style.top = '';
      container.style.transformOrigin = '';
    }
  }

  render() {
    // Creating a Fixed Gradient with Animation Using `background-position`
    const colorStops = this.colors.join(', ');
    const colorSpaceParam = this.getColorSpaceParameter();

    const style = document.createElement('style');
    style.textContent = `
      .gradient-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(${colorSpaceParam}var(--angle, 90deg), ${colorStops});
        background-size: var(--background-size, 200% 100%);
        background-position: var(--position, 0% 0%);
        z-index: 0;
      }
    `;

    const container = document.createElement('div');
    container.className = 'gradient-background';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this.gradientElement = container;

    // Set the initial values
    this.updatePosition();
    this.updateTransform();
    this.style.setProperty('--background-size', `${this.backgroundSize}% 100%`);
  }



  // Method for Updating the Refresh Interval
  updateUpdateInterval(newInterval) {
    if (newInterval !== undefined) {
      // We limit the refresh interval to an acceptable range
      this.updateInterval = Math.max(10, Math.min(1000, parseInt(newInterval)));
      // Restart the animation with a new interval
      this.startAnimation();
    }
  }

  // Method for Updating the Update Interval
  updateUpdateStep(newStep) {
    if (newStep !== undefined) {
      // We limit the update interval to within acceptable limits
      this.updateStep = Math.max(0.1, Math.min(10, parseFloat(newStep)));
      // Restart the animation with a new frame
      this.startAnimation();
    }
  }

  // A Method for Updating a Color Space
  updateColorSpace(newColorSpace) {
    if (newColorSpace !== undefined) {
      this.colorSpace = newColorSpace || null; // If the value is empty, set it to null
      // Redraw the component with a new color space
      this.shadowRoot.innerHTML = '';
      this.render();
    }
  }

  // A Method for Updating the Global Rotation
  updateGlobalRotation(newRotation) {
    if (newRotation !== undefined) {
      this.globalRotation = Math.max(-180, Math.min(180, parseInt(newRotation, 10)));
      this.updateTransform();
    }
  }

  // A Method for Updating the Global Scale
  updateGlobalScale(newScale) {
    if (newScale !== undefined) {
      this.globalScale = Math.max(0.1, Math.min(3.0, parseFloat(newScale)));
      this.updateTransform();
    }
  }

  // A method for updating the background size
  updateBackgroundSize(newSize) {
    if (newSize !== undefined) {
      this.backgroundSize = Math.max(100, Math.min(500, parseInt(newSize, 10)));
      // Updating the CSS variable for the background size
      this.style.setProperty('--background-size', `${this.backgroundSize}% 100%`);
    }
  }

  // A method for updating the animation state
  updateAnimationEnabled(enabled) {
    if (enabled !== undefined) {
      console.log(`[Debugging] LinearGradient: updateAnimationEnabled was called with enabled=${enabled}`);
      this.animationEnabled = enabled;
      console.log(`[Debugging] LinearGradient: Animation ${enabled ? 'ON' : 'OFF'}`);
      if (this.animationEnabled) {
        this.startAnimation();
      } else {
        this.stopAnimation();
      }
      // We update the settings in the drawer with a slight delay
      setTimeout(() => {
        console.log(`[Debugging] LinearGradient: Calling updateSettingsInDrawer`);
        this.updateSettingsInDrawer();
      }, 10);
    }
  }

  // A method for updating a container's transformation
  updateTransform() {
    const container = document.getElementById('screensaver-container');
    if (container) {
      // We calculate the container's dimensions and position so that it fully covers the screen when rotated
      this.updateContainerSizeAndPosition();

      container.style.transform = `rotate(${this.globalRotation}deg) scale(${this.globalScale})`;
    }
  }

  // A method for calculating the size and position of a container so that it always covers the entire screen area
  updateContainerSizeAndPosition() {
    const container = document.getElementById('screensaver-container');
    if (!container) return;

    // Get the viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Angle of rotation in radians
    const angleRad = (this.globalRotation * Math.PI) / 180;

    // Calculating the bounding box for a rotated rectangle
    const cos = Math.abs(Math.cos(angleRad));
    const sin = Math.abs(Math.sin(angleRad));

    // The width and height of the bounding box, taking scale into account
    const boundingWidth = Math.ceil((viewportWidth * this.globalScale) * cos + (viewportHeight * this.globalScale) * sin);
    const boundingHeight = Math.ceil((viewportWidth * this.globalScale) * sin + (viewportHeight * this.globalScale) * cos);

    // Set the container dimensions
    container.style.width = `${boundingWidth}px`;
    container.style.height = `${boundingHeight}px`;

    // Center the container
    container.style.position = 'absolute';
    container.style.left = `${Math.ceil((viewportWidth - boundingWidth) / 2)}px`;
    container.style.top = `${Math.ceil((viewportHeight - boundingHeight) / 2)}px`;

    // The pivot point should be in the center of the viewport (since the bounding box is centered)
    container.style.transformOrigin = '50% 50%';
  }

  // A method for obtaining the color space parameter for `linear-gradient`
  getColorSpaceParameter() {
    if (!this.colorSpace) {
      return '';
    }

    if (this.colorSpace === 'oklab') {
      return 'in oklab ';
    } else if (this.colorSpace === 'hsl-shorter') {
      return 'in hsl shorter hue ';
    } else if (this.colorSpace === 'hsl-longer') {
      return 'in hsl longer hue ';
    }

    return '';
  }

  // A method for updating the background position for an animation
  updatePosition() {
    // Animating the `background-position` from 0% to 200%
    const positionX = this.animationOffset;
    this.style.setProperty('--position', `${positionX}% 0%`);
  }

  // A method for updating a specific color
  updateColor(index, newColor) {
    if (index >= 0 && index < this.colors.length) {
      this.colors[index] = newColor;
      // We store an array of colors in localStorage
      this.saveColorsToStorage();
      // Redraw the component to update the gradient
      this.shadowRoot.innerHTML = '';
      this.render();
    }
  }



  // A method for storing an array of colors in localStorage
  saveColorsToStorage() {
    const tagName = this.tagName.toLowerCase();
    const key = `screensaver-${tagName}-colors`;
    localStorage.setItem(key, JSON.stringify(this.colors));
  }

  // A method for loading an array of colors from localStorage
  loadColorsFromStorage() {
    const tagName = this.tagName.toLowerCase();
    const key = `screensaver-${tagName}-colors`;
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        const parsedColors = JSON.parse(saved);
        if (Array.isArray(parsedColors) && parsedColors.length > 0) {
          this.colors = parsedColors;
        }
      } catch (e) {
      }
    }
  }

  // A method for loading settings from localStorage
  loadSettingsFromStorage() {
    const tagName = this.tagName.toLowerCase();

    // Load the color space switch state
    const colorSpaceEnabledKey = `screensaver-${tagName}-colorSpace_enabled`;
    const isEnabled = localStorage.getItem(colorSpaceEnabledKey) === 'true';

    if (isEnabled) {
      // Load the selected color space
      const colorSpaceKey = `screensaver-${tagName}-colorSpace`;
      const savedColorSpace = localStorage.getItem(colorSpaceKey);
      this.colorSpace = savedColorSpace || 'oklab'; // Use the saved value or the default value
    } else {
      this.colorSpace = null;
    }
  }


  // A method for adding a new color
  addColor(color) {
    if (!color) {
      color = this.generateRandomColor();
    }
    this.colors.push(color);
    this.animationOffset = 0; // Reset the offset when the number of colors changes
    this.saveColorsToStorage();
    // Redraw the component to update the gradient
    this.shadowRoot.innerHTML = '';
    this.render();
    this.updatePosition(); // We force a refresh of the position after redrawing
    // Updating the settings in the drawer
    this.updateSettingsInDrawer();
  }

  // Method for Removing Color by Index
  removeColor(index) {
    if (this.colors.length > 1 && index >= 0 && index < this.colors.length) {
      this.colors.splice(index, 1);
      this.animationOffset = 0; // Reset the offset when the number of colors changes
      this.saveColorsToStorage();
      // Redraw the component to update the gradient
      this.shadowRoot.innerHTML = '';
      this.render();
      this.updatePosition(); // We force a refresh of the position after redrawing
      // Updating the settings in the drawer
      this.updateSettingsInDrawer();
    }
  }

  // A Method for Generating a Random Color
  generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    // We're reverting to HEX instead of HSL for compatibility
    const hslToHex = (h, s, l) => {
      h /= 360;
      s /= 100;
      l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => {
        const k = (n + h * 12) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };
    return hslToHex(hue, 70, 50);
  }

  // A method for shifting color upward
  moveColorUp(index) {
    if (index > 0 && index < this.colors.length) {
      // Swapping Colors
      [this.colors[index - 1], this.colors[index]] = [this.colors[index], this.colors[index - 1]];
      this.saveColorsToStorage();
      // Redraw the component to update the gradient
      this.shadowRoot.innerHTML = '';
      this.render();
      // Updating the settings in the drawer
      this.updateSettingsInDrawer();
    }
  }

  // A method for shifting the color downward
  moveColorDown(index) {
    if (index >= 0 && index < this.colors.length - 1) {
      // Swapping Colors
      [this.colors[index], this.colors[index + 1]] = [this.colors[index + 1], this.colors[index]];
      this.saveColorsToStorage();
      // Redraw the component to update the gradient
      this.shadowRoot.innerHTML = '';
      this.render();
      // Updating the settings in the drawer
      this.updateSettingsInDrawer();
    }
  }

  // A method for updating settings in the drawer
  updateSettingsInDrawer() {
    // Find the settings container and update the settings
    const settingsContainer = document.getElementById('screensaver-settings');
    if (settingsContainer) {
      // Get the current component
      const componentClass = this.constructor;
      // Let's reset the settings
      if (window.createSettingsControls) {
        window.createSettingsControls(componentClass, settingsContainer);
      }
    }
  }

  // A method for starting an animation
  startAnimation() {
    if (this.animationTimer) {
      this.stopAnimation(); // We stop the previous animation, if there was one
    }
    this.animationTimer = setInterval(() => {
      this.updateAnimation();
    }, this.updateInterval);
  }

  // A method for stopping an animation
  stopAnimation() {
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
  }

  // A Method for Updating Animations
  updateAnimation() {
    // We check that `updateStep` is correct
    if (isNaN(this.updateStep) || this.updateStep <= 0) {
      this.updateStep = 1; // reset to the default value
    }
    this.animationOffset = (this.animationOffset + this.updateStep) % (this.backgroundSize + 1); // Increase by a specified increment from 0% to backgroundSize%
    this.updatePosition(); // Update the background position
  }
}

customElements.define('linear-gradient-screensaver', LinearGradientScreensaver);
