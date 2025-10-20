class LinearGradientScreensaver extends HTMLElement {
  static getSettings() {
    const settings = [
      {
        name: 'angle',
        label: 'Угол поворота (°)',
        type: 'range',
        min: 0,
        max: 360,
        default: 90,
        step: 1
      },
      {
        name: 'updateInterval',
        label: 'Период обновления (мс)',
        type: 'range',
        min: 10,
        max: 1000,
        default: 100,
        step: 10
      },
      {
        name: 'updateStep',
        label: 'Шаг обновления (%)',
        type: 'range',
        min: 0.1,
        max: 10,
        default: 1,
        step: 0.1
      }
    ];

    // Загружаем цвета из localStorage для создания настроек
    const tagName = 'linear-gradient-screensaver';
    const key = `screensaver-${tagName}-colors`;
    const saved = localStorage.getItem(key);
    let colors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00']; // значения по умолчанию: красный, синий, зеленый, желтый

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
    this.updateInterval = Math.max(10, Math.min(1000, 100)); // период обновления в мс (с проверкой)
    this.updateStep = Math.max(0.1, Math.min(10, 1)); // шаг обновления в процентах (с проверкой)
    this.colors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00']; // массив цветов по умолчанию: красный, синий, зеленый, желтый
    this.animationOffset = 0; // смещение для анимации в процентах
    this.animationTimer = null; // таймер для анимации
  }

  connectedCallback() {
    // Читаем настройки из атрибутов
    const angleAttr = this.getAttribute('data-angle');
    if (angleAttr !== null) {
      this.angle = parseInt(angleAttr, 10);
    }
    const intervalAttr = this.getAttribute('data-updateInterval');
    if (intervalAttr !== null) {
      this.updateInterval = Math.max(10, Math.min(1000, parseInt(intervalAttr, 10)));
    }
    const stepAttr = this.getAttribute('data-updateStep');
    if (stepAttr !== null) {
      this.updateStep = Math.max(0.1, Math.min(10, parseFloat(stepAttr)));
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
    // Создаем фиксированный градиент с анимацией через background-position
    const colorStops = this.colors.join(', ');

    const style = document.createElement('style');
    style.textContent = `
      .gradient-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(var(--angle, 90deg), ${colorStops});
        background-size: 200% 100%;
        background-position: var(--position, 0% 0%);
        z-index: 0;
      }
    `;

    const container = document.createElement('div');
    container.className = 'gradient-background';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this.gradientElement = container;

    // Устанавливаем начальную позицию
    this.updatePosition();

    // Отладка: выводим текущую позицию
    console.log(`Linear Gradient position: ${this.animationOffset}%`);
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

  // Метод для обновления периода обновления
  updateUpdateInterval(newInterval) {
    if (newInterval !== undefined) {
      // Ограничиваем период обновления в допустимых пределах
      this.updateInterval = Math.max(10, Math.min(1000, parseInt(newInterval)));
      // Перезапускаем анимацию с новым интервалом
      this.startAnimation();
    }
  }

  // Метод для обновления шага обновления
  updateUpdateStep(newStep) {
    if (newStep !== undefined) {
      // Ограничиваем шаг обновления в допустимых пределах
      this.updateStep = Math.max(0.1, Math.min(10, parseFloat(newStep)));
      // Перезапускаем анимацию с новым шагом
      this.startAnimation();
    }
  }

  // Метод для обновления позиции фона для анимации
  updatePosition() {
    // Анимируем background-position от 0% до 200%
    const positionX = this.animationOffset;
    this.gradientElement.style.setProperty('--position', `${positionX}% 0%`);
  }

  // Метод для обновления конкретного цвета
  updateColor(index, newColor) {
    if (index >= 0 && index < this.colors.length) {
      this.colors[index] = newColor;
      // Сохраняем массив цветов в localStorage
      this.saveColorsToStorage();
      // Перерисовываем компонент чтобы обновить градиент
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
    this.animationOffset = 0; // сбрасываем смещение при изменении количества цветов
    this.saveColorsToStorage();
    // Перерисовываем компонент чтобы обновить градиент
    this.shadowRoot.innerHTML = '';
    this.render();
    this.updatePosition(); // принудительно обновляем позицию после перерисовки
    // Обновляем настройки в drawer
    this.updateSettingsInDrawer();
  }

  // Метод для удаления цвета по индексу
  removeColor(index) {
    if (this.colors.length > 1 && index >= 0 && index < this.colors.length) {
      this.colors.splice(index, 1);
      this.animationOffset = 0; // сбрасываем смещение при изменении количества цветов
      this.saveColorsToStorage();
      // Перерисовываем компонент чтобы обновить градиент
      this.shadowRoot.innerHTML = '';
      this.render();
      this.updatePosition(); // принудительно обновляем позицию после перерисовки
      // Обновляем настройки в drawer
      this.updateSettingsInDrawer();
    }
  }

  // Метод для генерации случайного цвета
  generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    // Возвращаем HEX вместо HSL для совместимости
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

  // Метод для запуска анимации
  startAnimation() {
    if (this.animationTimer) {
      this.stopAnimation(); // останавливаем предыдущую анимацию, если она была
    }
    this.animationTimer = setInterval(() => {
      this.updateAnimation();
    }, this.updateInterval);
  }

  // Метод для остановки анимации
  stopAnimation() {
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
  }

  // Метод для обновления анимации
  updateAnimation() {
    // Проверяем что updateStep корректный
    if (isNaN(this.updateStep) || this.updateStep <= 0) {
      this.updateStep = 1; // сбрасываем на значение по умолчанию
    }
    this.animationOffset = (this.animationOffset + this.updateStep) % 201; // увеличиваем на заданный шаг от 0% до 200%
    this.updatePosition(); // обновляем позицию фона

    // Отладка: выводим текущую позицию каждые 10 обновлений
    if (Math.floor(this.animationOffset / this.updateStep) % 10 === 0) {
      console.log(`Linear Gradient position: ${this.animationOffset.toFixed(1)}%`);
    }
  }
}

customElements.define('linear-gradient-screensaver', LinearGradientScreensaver);
