class ColorTransitionScreensaver extends HTMLElement {
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
        label: 'Color Change Rate',
        type: 'range',
        min: 1,
        max: 10,
        default: 5,
        step: 1
      }
    ];

    // Load colors from localStorage to create settings
    const tagName = 'color-transition-screensaver';
    const key = `screensaver-${tagName}-colors`;
    const saved = localStorage.getItem(key);
    let colors = ['#ff0000', '#ffff00', '#00ff00']; // default values: red, yellow, green

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
    this.speed = 5; // default value (1–10, where 10 = fast)
    this.colors = ['#ff0000', '#ffff00', '#80ff00']; // Colors from the swatches: red, yellow, light green
    this.currentColorIndex = 0;
    this.animationId = null;
  }

  connectedCallback() {
    // Reading Settings from Attributes
    const speedAttr = this.getAttribute('data-speed');
    if (speedAttr !== null) {
      this.speed = parseFloat(speedAttr);
    }

    const animationEnabledAttr = this.getAttribute('data-animationEnabled');
    if (animationEnabledAttr !== null) {
      this.animationEnabled = animationEnabledAttr === 'true';
    }

    // Loading colors from localStorage
    this.loadColorsFromStorage();

    this.render();
    if (this.animationEnabled) {
      this.startAnimation();
    }
  }

  disconnectedCallback() {
    this.stopAnimation();
  }

  render() {
    const style = document.createElement('style');
    style.textContent = `
      .color-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--current-color, #ff0000);
        transition: background-color var(--transition-duration, 3s) ease-in-out;
        z-index: 0;
      }
    `;

    const container = document.createElement('div');
    container.className = 'color-background';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this.backgroundElement = container;

    // Set the starting color
    this.updateCurrentColor();
  }

  startAnimation() {
    if (this.colors.length <= 1) {
      return; // Do not play the animation when there is only one color
    }

    let lastTime = 0;
    const animateColors = (currentTime) => {
      if (lastTime === 0) {
        lastTime = currentTime;
      }

      const deltaTime = currentTime - lastTime;
      const intervalMs = this.getIntervalMs(); // we get an interval in milliseconds

      // We check to see if it's time to change the color
      if (deltaTime >= intervalMs) {
        this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
        this.updateCurrentColor();
        lastTime = currentTime;
      }

      this.animationId = requestAnimationFrame(animateColors);
    };
    this.animationId = requestAnimationFrame(animateColors);
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // A method for calculating an interval in milliseconds (the higher the speed, the shorter the interval)
  getIntervalMs() {
    // speed from 1 to 10, where 10 = fast (0.4 sec), 1 = slow (4 sec)
    return 4000 / this.speed;
  }

  // A Method for Updating Speed
  updateSpeed(newSpeed) {
    this.speed = newSpeed;
    // Restart the animation at a new speed
    this.stopAnimation();
    this.startAnimation();
  }

  // A method for updating the animation state
  updateAnimationEnabled(enabled) {
    if (enabled !== undefined) {
      console.log(`[Debugging] ColorTransition: Animation ${enabled ? 'ON' : 'OFF'}`);
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

  // A method for updating the current color
  updateCurrentColor() {
    const currentColor = this.colors[this.currentColorIndex];
    this.backgroundElement.style.setProperty('--current-color', currentColor);
    // Set the transition duration to equal the color-change interval
    const transitionDuration = this.getIntervalMs() / 1000;
    this.backgroundElement.style.setProperty('--transition-duration', `${transitionDuration}s`);
  }

  // A method for updating a specific color
  updateColor(index, newColor) {
    if (index >= 0 && index < this.colors.length) {
      this.colors[index] = newColor;
      this.updateColors();
      // We store an array of colors in localStorage
      this.saveColorsToStorage();
      // Update the current color if the active color has changed
      if (index === this.currentColorIndex) {
        this.updateCurrentColor();
      }
    }
  }

  // A method for updating all colors (without animation)
  updateColors() {
    // We don't do anything, since the colors are updated individually
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

  // A method for adding a new color
  addColor(color) {
    if (!color) {
      color = this.generateRandomColor();
    }
    this.colors.push(color);
    this.updateColors();
    this.saveColorsToStorage();
    // Updating the settings in the drawer
    this.updateSettingsInDrawer();
  }

  // Method for Removing Color by Index
  removeColor(index) {
    if (this.colors.length > 1 && index >= 0 && index < this.colors.length) {
      this.colors.splice(index, 1);
      // If the current active color has been removed, adjust the index
      if (index <= this.currentColorIndex) {
        this.currentColorIndex = Math.max(0, this.currentColorIndex - 1);
      }
      this.updateColors();
      this.saveColorsToStorage();
      // Updating the settings in the drawer
      this.updateSettingsInDrawer();
    }
  }

  // A Method for Generating a Random Color
  generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 50%)`;
  }

  // A method for shifting color upward
  moveColorUp(index) {
    if (index > 0 && index < this.colors.length) {
      // Swapping Colors
      [this.colors[index - 1], this.colors[index]] = [this.colors[index], this.colors[index - 1]];
      this.updateColors();
      this.saveColorsToStorage();
      // Updating the settings in the drawer
      this.updateSettingsInDrawer();
    }
  }

  // A method for shifting the color downward
  moveColorDown(index) {
    if (index >= 0 && index < this.colors.length - 1) {
      // Swap the colors
      [this.colors[index], this.colors[index + 1]] = [this.colors[index + 1], this.colors[index]];
      this.updateColors();
      this.saveColorsToStorage();
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

customElements.define('color-transition-screensaver', ColorTransitionScreensaver);
