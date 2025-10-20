class ColorTransitionScreensaver extends HTMLElement {
  static getSettings() {
    const settings = [
      {
        name: 'speed',
        label: 'Скорость смены цветов',
        type: 'range',
        min: 1,
        max: 10,
        default: 5,
        step: 1
      }
    ];

    // Загружаем цвета из localStorage для создания настроек
    const tagName = 'color-transition-screensaver';
    const key = `screensaver-${tagName}-colors`;
    const saved = localStorage.getItem(key);
    let colors = ['#ff0000', '#ffff00', '#00ff00']; // значения по умолчанию: красный, желтый, зеленый

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
    this.speed = 5; // значение по умолчанию (1-10, где 10 = быстро)
    this.colors = ['#ff0000', '#ffff00', '#80ff00']; // цвета из swatches: красный, желтый, салатовый
    this.currentColorIndex = 0;
    this.animationId = null;
  }

  connectedCallback() {
    // Читаем настройки из атрибутов
    const speedAttr = this.getAttribute('data-speed');
    if (speedAttr !== null) {
      this.speed = parseFloat(speedAttr);
    }

    // Загружаем цвета из localStorage
    this.loadColorsFromStorage();

    this.render();
    this.startAnimation();
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

    // Устанавливаем начальный цвет
    this.updateCurrentColor();
  }

  startAnimation() {
    if (this.colors.length <= 1) {
      return; // не запускаем анимацию при одном цвете
    }

    let lastTime = 0;
    const animateColors = (currentTime) => {
      if (lastTime === 0) {
        lastTime = currentTime;
      }

      const deltaTime = currentTime - lastTime;
      const intervalMs = this.getIntervalMs(); // получаем интервал в миллисекундах

      // Проверяем, прошло ли время для смены цвета
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

  // Метод для получения интервала в миллисекундах (чем выше скорость, тем меньше интервал)
  getIntervalMs() {
    // speed от 1 до 10, где 10 = быстро (0.4 сек), 1 = медленно (4 сек)
    return 4000 / this.speed;
  }

  // Метод для обновления скорости
  updateSpeed(newSpeed) {
    this.speed = newSpeed;
    // Перезапускаем анимацию с новой скоростью
    this.stopAnimation();
    this.startAnimation();
  }

  // Метод для обновления текущего цвета
  updateCurrentColor() {
    const currentColor = this.colors[this.currentColorIndex];
    this.backgroundElement.style.setProperty('--current-color', currentColor);
    // Устанавливаем продолжительность transition равной интервалу смены цвета
    const transitionDuration = this.getIntervalMs() / 1000;
    this.backgroundElement.style.setProperty('--transition-duration', `${transitionDuration}s`);
  }

  // Метод для обновления конкретного цвета
  updateColor(index, newColor) {
    if (index >= 0 && index < this.colors.length) {
      this.colors[index] = newColor;
      this.updateColors();
      // Сохраняем массив цветов в localStorage
      this.saveColorsToStorage();
      // Обновляем текущий цвет, если изменился активный
      if (index === this.currentColorIndex) {
        this.updateCurrentColor();
      }
    }
  }

  // Метод для обновления всех цветов (без анимации)
  updateColors() {
    // Ничего не делаем, так как цвета обновляются индивидуально
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
    // Обновляем настройки в drawer
    this.updateSettingsInDrawer();
  }

  // Метод для удаления цвета по индексу
  removeColor(index) {
    if (this.colors.length > 1 && index >= 0 && index < this.colors.length) {
      this.colors.splice(index, 1);
      // Если удалили текущий активный цвет, корректируем индекс
      if (index <= this.currentColorIndex) {
        this.currentColorIndex = Math.max(0, this.currentColorIndex - 1);
      }
      this.updateColors();
      this.saveColorsToStorage();
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

customElements.define('color-transition-screensaver', ColorTransitionScreensaver);
