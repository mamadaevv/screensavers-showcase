class SolidColorScreensaver extends HTMLElement {
  static getSettings() {
    return [
      {
        name: 'color',
        label: 'Color',
        type: 'color',
        default: '#ff0000'
      }
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.color = '#ff0000'; // default value: red
  }

  connectedCallback() {
    // Reading Settings from Attributes
    const colorAttr = this.getAttribute('data-color');
    if (colorAttr !== null) {
      this.color = colorAttr;
    }

    // Loading a color from localStorage
    this.loadColorFromStorage();

    this.render();
  }

  render() {
    const style = document.createElement('style');
    style.textContent = `
      .solid-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--background-color, #ff0000);
        z-index: 0;
      }
    `;

    const container = document.createElement('div');
    container.className = 'solid-background';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this.backgroundElement = container;

    // Set the starting color
    this.updateColor();
  }

  // A method for updating colors
  updateColor(newColor) {
    if (newColor !== undefined) {
      this.color = newColor;
      // Save the color to localStorage
      this.saveColorToStorage();
    }
    this.backgroundElement.style.setProperty('--background-color', this.color);
  }

  // A method for storing color in localStorage
  saveColorToStorage() {
    const tagName = this.tagName.toLowerCase();
    const key = `screensaver-${tagName}-color`;
    localStorage.setItem(key, this.color);
  }

  // A method for loading a color from localStorage
  loadColorFromStorage() {
    const tagName = this.tagName.toLowerCase();
    const key = `screensaver-${tagName}-color`;
    const saved = localStorage.getItem(key);

    if (saved) {
      this.color = saved;
    }
  }
}

customElements.define('solid-color-screensaver', SolidColorScreensaver);
