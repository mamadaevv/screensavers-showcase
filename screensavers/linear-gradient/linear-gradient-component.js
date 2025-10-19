class LinearGradientScreensaver extends HTMLElement {
  static getSettings() {
    const settings = [
      {
        name: 'speed',
        label: 'Скорость анимации (отключена)',
        type: 'range',
        min: 0,
        max: 100,
        default: 50,
        step: 1,
        disabled: true
      },
      {
        name: 'angle',
        label: 'Угол поворота (°)',
        type: 'range',
        min: 0,
        max: 360,
        default: 90,
        step: 1
      }
    ];

    // Загружаем цвета из localStorage для создания настроек
    const tagName = 'linear-gradient-screensaver';
    const key = `screensaver-${tagName}-colors`;
    const saved = localStorage.getItem(key);
    let colors = ['#ff0000', '#ffff00', '#0000ff']; // значения по умолчанию: красный, желтый, синий

    if (saved) {
      try {
        const parsedColors = JSON.parse(saved);
        if (Array.isArray(parsedColors) && parsedColors.length > 0) {
          colors = parsedColors;
        }
      } catch (e) {
        console.warn('Failed to parse saved colors for settings:', e);
      }
    }

    // Добавляем настройки цветов динамически
    colors.forEach((color, index) => {
      settings.push({
        name: `color${index + 1}`,
        label: `Цвет ${index + 1}`,
        type: 'color',
        default: color
      });
    });

    return settings;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.angle = 90; // значение по умолчанию в градусах
    this.colors = ['#ff0000', '#ffff00', '#0000ff']; // массив цветов по умолчанию: красный, желтый, синий
  }

  connectedCallback() {
    // Читаем настройки из атрибутов
    const angleAttr = this.getAttribute('data-angle');
    if (angleAttr !== null) {
      this.angle = parseInt(angleAttr, 10);
    }

    // Загружаем цвета из localStorage
    this.loadColorsFromStorage();

    this.render();
  }

  disconnectedCallback() {
    // CSS анимация не требует остановки
  }

  render() {
    // Создаем динамический CSS для градиента на основе количества цветов
    let colorStops = this.colors.map((color, index) => {
      const percentage = (index / (this.colors.length - 1)) * 100;
      return `var(--color${index + 1}, ${color}) ${percentage}%`;
    }).join(', ');

    const style = document.createElement('style');
    style.textContent = `
      .gradient-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(var(--angle, 90deg), ${colorStops});
        z-index: 0;
      }
    `;

    const container = document.createElement('div');
    container.className = 'gradient-background';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this.gradientElement = container;

    // Устанавливаем начальные значения
    this.updateAngleValue();
    this.updateColors();
  }


  // Метод для обновления угла
  updateAngleValue(newAngle) {
    if (newAngle !== undefined) {
      this.angle = newAngle;
    }
    this.gradientElement.style.setProperty('--angle', this.angle + 'deg');
    // Принудительно перерисовываем элемент
    this.gradientElement.offsetHeight;
  }

  // Метод для обновления цветов
  updateColors() {
    this.colors.forEach((color, index) => {
      this.gradientElement.style.setProperty(`--color${index + 1}`, color);
    });
  }

  // Метод для обновления конкретного цвета
  updateColor(index, newColor) {
    if (index >= 0 && index < this.colors.length) {
      this.colors[index] = newColor;
      this.updateColors();
      // Сохраняем массив цветов в localStorage
      this.saveColorsToStorage();
      // Перерисовываем компонент чтобы обновить CSS с новым количеством цветов
      this.shadowRoot.innerHTML = '';
      this.render();
    }
  }


  // Метод для сохранения массива цветов в localStorage
  saveColorsToStorage() {
    const tagName = this.tagName.toLowerCase();
    const key = `screensaver-${tagName}-colors`;
    localStorage.setItem(key, JSON.stringify(this.colors));
  }

  // Метод для загрузки массива цветов из localStorage
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
        console.warn('Failed to load colors from storage:', e);
      }
    }
  }

  // Метод для добавления нового цвета
  addColor(color) {
    if (!color) {
      color = this.generateRandomColor();
    }
    this.colors.push(color);
    this.updateColors();
    this.saveColorsToStorage();
    // Перерисовываем компонент чтобы обновить CSS с новым количеством цветов
    this.shadowRoot.innerHTML = '';
    this.render();
    // Обновляем настройки в drawer
    this.updateSettingsInDrawer();
  }

  // Метод для удаления цвета по индексу
  removeColor(index) {
    if (this.colors.length > 1 && index >= 0 && index < this.colors.length) {
      this.colors.splice(index, 1);
      this.updateColors();
      this.saveColorsToStorage();
      // Перерисовываем компонент чтобы обновить CSS с новым количеством цветов
      this.shadowRoot.innerHTML = '';
      this.render();
      // Обновляем настройки в drawer
      this.updateSettingsInDrawer();
    }
  }

  // Метод для генерации случайного цвета
  generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 50%)`;
  }

  // Метод для обновления настроек в drawer
  updateSettingsInDrawer() {
    // Находим контейнер настроек и обновляем их
    const settingsContainer = document.getElementById('screensaver-settings');
    if (settingsContainer) {
      // Получаем текущий компонент
      const componentClass = this.constructor;
      // Пересоздаем настройки
      if (window.createSettingsControls) {
        window.createSettingsControls(componentClass, settingsContainer);
      }
    }
  }
}

customElements.define('linear-gradient-screensaver', LinearGradientScreensaver);
