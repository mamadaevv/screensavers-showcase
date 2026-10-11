class ConicGradientScreensaver extends HTMLElement {
  static getSettings() {
    const settings = [
      {
        name: 'animationEnabled',
        label: 'Animation',
        type: 'switch',
        default: true
      },
      {
        name: 'speed',
        label: 'Rotational speed',
        type: 'range',
        min: 1,
        max: 1000,
        default: 50,
        step: 1
      },
      {
        name: 'offsetX',
        label: 'X-axis offset (%)',
        type: 'range',
        min: 0,
        max: 100,
        default: 100,
        step: 1
      },
      {
        name: 'offsetY',
        label: 'Y-axis offset (%)',
        type: 'range',
        min: 0,
        max: 100,
        default: 0,
        step: 1
      },
      {
        name: 'positionCenter',
        label: 'Location of the Center',
        type: 'position-center',
        default: 'center'
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
        name: 'colorSpace',
        label: 'Color Space',
        type: 'radio',
        options: [
          { value: 'oklab', label: 'in oklab' },
          { value: 'hsl-shorter', label: 'in hsl shorter hue' },
          { value: 'hsl-longer', label: 'in hsl longer' }
        ],
        default: 'oklab'
      }
    ];

    // Load colors from localStorage to create settings
    const tagName = 'conic-gradient-screensaver';
    const key = `screensaver-${tagName}-colors`;
    const saved = localStorage.getItem(key);
    let colors = ['#ff0000', '#8000ff']; // default values: red and purple

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
    this.animationId = null;
    this.gradientAngle = 0;
    this.speed = 50; // default value
    this.offsetX = 100; // default value - upper-right corner
    this.offsetY = 0; // default value - upper-right corner
    this.positionCenter = 'center'; // default value - center
    this.globalScale = 1.0; // global scale
    this.colorSpace = null; // default color space (null = disabled)
    this.colors = ['#ff0000', '#8000ff']; // Colors from the swatches: red, purple
  }

  connectedCallback() {
    // Reading Settings from Attributes
    const speedAttr = this.getAttribute('data-speed');
    if (speedAttr !== null) {
      this.speed = parseInt(speedAttr, 10);
    }

    const offsetXAttr = this.getAttribute('data-offsetX');
    if (offsetXAttr !== null) {
      this.offsetX = parseInt(offsetXAttr, 10);
    }

    const offsetYAttr = this.getAttribute('data-offsetY');
    if (offsetYAttr !== null) {
      this.offsetY = parseInt(offsetYAttr, 10);
    }

    const colorSpaceAttr = this.getAttribute('data-colorSpace');
    if (colorSpaceAttr !== null) {
      this.colorSpace = colorSpaceAttr;
    }

    const animationEnabledAttr = this.getAttribute('data-animationEnabled');
    if (animationEnabledAttr !== null) {
      this.animationEnabled = animationEnabledAttr === 'true';
    }

    const positionCenterAttr = this.getAttribute('data-positionCenter');
    if (positionCenterAttr !== null) {
      this.positionCenter = positionCenterAttr;
    }

    const globalScaleAttr = this.getAttribute('data-globalScale');
    if (globalScaleAttr !== null) {
      this.globalScale = Math.max(0.1, Math.min(3.0, parseFloat(globalScaleAttr)));
    }

    // Loading colors from localStorage
    this.loadColorsFromStorage();

    // Load color space settings
    this.loadSettingsFromStorage();

    this.render();
    if (this.animationEnabled) {
      this.startAnimation();
    }
  }

  disconnectedCallback() {
    this.stopAnimation();
    // Reset the transformation when the component is disabled
    const container = document.getElementById('screensaver-container');
    if (container) {
      container.style.transform = '';
    }
  }

  render() {
    // Creating Dynamic CSS for a Gradient Based on the Number of Colors
    let colorStops = this.colors.map((color, index) => {
      const percentage = (index / this.colors.length) * 100;
      return `var(--color${index + 1}, ${color}) ${percentage}%`;
    }).join(', ');

    // Add the final color to complete the gradient
    if (this.colors.length > 0) {
      colorStops += `, var(--color1, ${this.colors[0]}) 100%`;
    }

    const colorSpaceParam = this.getColorSpaceParameter();

    const style = document.createElement('style');
    style.textContent = `
      .gradient-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: conic-gradient(${colorSpaceParam}from var(--gradient-angle, 90deg) at var(--offset-x, 0%) var(--offset-y, 30%), ${colorStops});
        z-index: 0;
      }
    `;

    const container = document.createElement('div');
    container.className = 'gradient-background';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this.gradientElement = container;

    // Set the initial values
    this.updateOffset();
    this.updateColors();
    this.updateTransform();
  }

  startAnimation() {
    if (this.speed === 0) {
      return; // Do not play the animation when the speed is zero
    }

    let lastTime = 0;
    const animateGradient = (currentTime) => {
      if (lastTime === 0) {
        lastTime = currentTime;
      }

      const deltaTime = currentTime - lastTime;
      // Speed directly affects degrees per second
      const degreesPerSecond = this.speed;
      const degreesToAdd = (degreesPerSecond * deltaTime) / 1000;

      this.gradientAngle = (this.gradientAngle + degreesToAdd) % 360;
      this.gradientElement.style.setProperty('--gradient-angle', Math.round(this.gradientAngle) + 'deg');

      lastTime = currentTime;
      this.animationId = requestAnimationFrame(animateGradient);
    };

    this.animationId = requestAnimationFrame(animateGradient);
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // A Method for Updating Speed
  updateSpeed(newSpeed) {
    this.speed = newSpeed;
    // Restart the animation at a new speed
    this.stopAnimation();
    this.startAnimation();
  }

  // A Method for Updating the Offset
  updateOffset() {
    this.gradientElement.style.setProperty('--offset-x', this.offsetX + '%');
    this.gradientElement.style.setProperty('--offset-y', this.offsetY + '%');
  }

  // A method for obtaining the color space parameter for a conic gradient
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

  // A Method for Updating Colors
  updateColors() {
    this.colors.forEach((color, index) => {
      this.gradientElement.style.setProperty(`--color${index + 1}`, color);
    });
  }

  // Method for Updating the X-Axis Offset
  updateOffsetX(newOffsetX) {
    this.offsetX = newOffsetX;
    this.updateOffset();
  }

  // Method for Updating the Y-Offset
  updateOffsetY(newOffsetY) {
    this.offsetY = newOffsetY;
    this.updateOffset();
  }

  // A Method for Updating the Color Space
  updateColorSpace(newColorSpace) {
    if (newColorSpace !== undefined) {
      this.colorSpace = newColorSpace || null; // If the value is empty, set it to null
      // Redraw the component with a new color space
      this.shadowRoot.innerHTML = '';
      this.render();
    }
  }

  // A Method for Updating the Center's Position
  updatePositionCenter(position) {
    if (position !== undefined) {
      this.positionCenter = position;

      // Convert the position to a percentage
      const positionMap = {
        'top-left': { x: 0, y: 0 },
        'top-center': { x: 50, y: 0 },
        'top-right': { x: 100, y: 0 },
        'middle-left': { x: 0, y: 50 },
        'center': { x: 50, y: 50 },
        'middle-right': { x: 100, y: 50 },
        'bottom-left': { x: 0, y: 100 },
        'bottom-center': { x: 50, y: 100 },
        'bottom-right': { x: 100, y: 100 }
      };

      const coords = positionMap[position] || positionMap['center'];
      this.offsetX = coords.x;
      this.offsetY = coords.y;
      this.updateOffset();
    }
  }

  // A Method for Updating the Global Scale
  updateGlobalScale(newScale) {
    if (newScale !== undefined) {
      this.globalScale = Math.max(0.1, Math.min(3.0, parseFloat(newScale)));
      this.updateTransform();
    }
  }

  // A method for updating a container's transformation
  updateTransform() {
    const container = document.getElementById('screensaver-container');
    if (container) {
      container.style.transform = `scale(${this.globalScale})`;
    }
  }

  // A method for updating the animation state
  updateAnimationEnabled(enabled) {
    if (enabled !== undefined) {
      console.log(`[Debugging] ConicGradient: Animation ${enabled ? 'ON' : 'OFF'}`);
      this.animationEnabled = enabled;
      if (this.animationEnabled) {
        this.startAnimation();
      } else {
        this.stopAnimation();
      }
      // We update the settings in the drawer with a slight delay
      setTimeout(() => {
        this.updateSettingsInDrawer();
      }, 10);
    }
  }

  // A Method for Updating Colors by Index
  updateColor(index, newColor) {
    if (index >= 0 && index < this.colors.length) {
      this.colors[index] = newColor;
      this.updateColors();
      // We store an array of colors in localStorage
      this.saveColorsToStorage();
      // Redraw the component to update the CSS with the new number of colors
      this.shadowRoot.innerHTML = '';
      this.render();
    }
  }

  // Methods for Backward Compatibility
  updateColor1(newColor) { this.updateColor(0, newColor); }
  updateColor2(newColor) { this.updateColor(1, newColor); }
  updateColor3(newColor) { this.updateColor(2, newColor); }
  updateColor4(newColor) { this.updateColor(3, newColor); }
  updateColor5(newColor) { this.updateColor(4, newColor); }

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

  // A Method for Generating a Random Color
  generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
    const lightness = Math.floor(Math.random() * 30) + 35; // 35-65%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // A method for shifting color upward
  moveColorUp(index) {
    if (index > 0 && index < this.colors.length) {
      // Swapping Colors
      [this.colors[index - 1], this.colors[index]] = [this.colors[index], this.colors[index - 1]];
      this.updateColors();
      this.saveColorsToStorage();
      // Redraw the component to update the CSS with the new number of colors
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
      this.updateColors();
      this.saveColorsToStorage();
      // We redraw the component to update the CSS with the new number of colors
      this.shadowRoot.innerHTML = '';
      this.render();
      // Updating the settings in the drawer
      this.updateSettingsInDrawer();
    }
  }

  // A method for adding a new color
  addColor(color) {
    if (!color) {
      color = this.generateRandomColor();
    }
    this.colors.push(color);
    this.updateColors();
    this.saveColorsToStorage();
    // Redraw the component to update the CSS with the new number of colors
    this.shadowRoot.innerHTML = '';
    this.render();
    // Updating the settings in the drawer
    this.updateSettingsInDrawer();
  }

  // Method for Removing Color by Index
  removeColor(index) {
    if (this.colors.length > 1 && index >= 0 && index < this.colors.length) {
      this.colors.splice(index, 1);
      this.updateColors();
      this.saveColorsToStorage();
      // We redraw the component to update the CSS with the new number of colors
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
}

customElements.define('conic-gradient-screensaver', ConicGradientScreensaver);
