class SolidColorScreensaver extends HTMLElement {
  static getSettings() {
    return [
      {
        name: 'color',
        label: 'Цвет',
        type: 'color',
        default: '#ff0000'
      }
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.color = '#ff0000'; // значение по умолчанию: красный
  }

  connectedCallback() {
    // Читаем настройки из атрибутов
    const colorAttr = this.getAttribute('data-color');
    if (colorAttr !== null) {
      this.color = colorAttr;
    }

    // Загружаем цвет из localStorage
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
        z-index: -1;
      }
    `;

    const container = document.createElement('div');
    container.className = 'solid-background';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this.backgroundElement = container;

    // Устанавливаем начальный цвет
    this.updateColor();
  }

  // Метод для обновления цвета
  updateColor(newColor) {
    if (newColor !== undefined) {
      this.color = newColor;
      // Сохраняем цвет в localStorage
      this.saveColorToStorage();
    }
    this.backgroundElement.style.setProperty('--background-color', this.color);
  }

  // Метод для сохранения цвета в localStorage
  saveColorToStorage() {
    const tagName = this.tagName.toLowerCase();
    const key = `screensaver-${tagName}-color`;
    localStorage.setItem(key, this.color);
  }

  // Метод для загрузки цвета из localStorage
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
