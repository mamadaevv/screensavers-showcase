class ConicGradientScreensaver extends HTMLElement {
  static getSettings() {
    const settings = [
      {
        name: 'speed',
        label: 'Скорость вращения',
        type: 'range',
        min: 0,
        max: 100,
        default: 50,
        step: 1
      },
      {
        name: 'offsetX',
        label: 'Смещение по X (%)',
        type: 'range',
        min: 0,
        max: 100,
        default: 100,
        step: 1
      },
      {
        name: 'offsetY',
        label: 'Смещение по Y (%)',
        type: 'range',
        min: 0,
        max: 100,
        default: 0,
        step: 1
      }
    ];

    // Загружаем цвета из localStorage для создания настроек
    const tagName = 'conic-gradient-screensaver';
    const key = `screensaver-${tagName}-colors`;
    const saved = localStorage.getItem(key);
    let colors = ['#ff0000', '#8000ff']; // значения по умолчанию: красный и фиолетовый

    if (saved) {
      try {
        const parsedColors = JSON.parse(saved);
        if (Array.isArray(parsedColors) && parsedColors.length > 0) {
          colors = parsedColors;
        }
      } catch (e) {
      }
    }

    // Добавляем настройки цветов динамически в конец
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
    this.animationId = null;
    this.gradientAngle = 0;
    this.speed = 50; // значение по умолчанию
    this.offsetX = 100; // значение по умолчанию - верхний правый угол
    this.offsetY = 0; // значение по умолчанию - верхний правый угол
    this.colors = ['#ff0000', '#8000ff']; // цвета из swatches: красный, фиолетовый
  }

  connectedCallback() {
    // Читаем настройки из атрибутов
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

    // Загружаем цвета из localStorage
    this.loadColorsFromStorage();

    this.render();
    this.startAnimation();
  }

  disconnectedCallback() {
    this.stopAnimation();
  }

  render() {
    // Создаем динамический CSS для градиента на основе количества цветов
    let colorStops = this.colors.map((color, index) => {
      const percentage = (index / this.colors.length) * 100;
      return `var(--color${index + 1}, ${color}) ${percentage}%`;
    }).join(', ');

    // Добавляем последний цвет для замыкания градиента
    if (this.colors.length > 0) {
      colorStops += `, var(--color1, ${this.colors[0]}) 100%`;
    }

    const style = document.createElement('style');
    style.textContent = `
      .gradient-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: conic-gradient(from var(--gradient-angle, 90deg) at var(--offset-x, 0%) var(--offset-y, 30%), ${colorStops});
        z-index: 0;
      }
    `;

    const container = document.createElement('div');
    container.className = 'gradient-background';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this.gradientElement = container;

    // Устанавливаем начальные значения
    this.updateOffset();
    this.updateColors();
  }

  startAnimation() {
    if (this.speed === 0) {
      return; // не запускаем анимацию при нулевой скорости
    }

    let lastTime = 0;
    const animateGradient = (currentTime) => {
      if (lastTime === 0) {
        lastTime = currentTime;
      }

      const deltaTime = currentTime - lastTime;
      // Скорость напрямую влияет на градусы в секунду
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

  // Метод для обновления скорости
  updateSpeed(newSpeed) {
    this.speed = newSpeed;
    // Перезапускаем анимацию с новой скоростью
    this.stopAnimation();
    this.startAnimation();
  }

  // Метод для обновления смещения
  updateOffset() {
    this.gradientElement.style.setProperty('--offset-x', this.offsetX + '%');
    this.gradientElement.style.setProperty('--offset-y', this.offsetY + '%');
  }

  // Метод для обновления цветов
  updateColors() {
    this.colors.forEach((color, index) => {
      this.gradientElement.style.setProperty(`--color${index + 1}`, color);
    });
  }

  // Метод для обновления смещения по X
  updateOffsetX(newOffsetX) {
    this.offsetX = newOffsetX;
    this.updateOffset();
  }

  // Метод для обновления смещения по Y
  updateOffsetY(newOffsetY) {
    this.offsetY = newOffsetY;
    this.updateOffset();
  }

  // Метод для обновления цвета по индексу
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

  // Методы для обратной совместимости
  updateColor1(newColor) { this.updateColor(0, newColor); }
  updateColor2(newColor) { this.updateColor(1, newColor); }
  updateColor3(newColor) { this.updateColor(2, newColor); }
  updateColor4(newColor) { this.updateColor(3, newColor); }
  updateColor5(newColor) { this.updateColor(4, newColor); }

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
      }
    }
  }

  // Метод для генерации случайного цвета
  generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
    const lightness = Math.floor(Math.random() * 30) + 35; // 35-65%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // Метод для перемещения цвета вверх
  moveColorUp(index) {
    if (index > 0 && index < this.colors.length) {
      // Меняем местами цвета
      [this.colors[index - 1], this.colors[index]] = [this.colors[index], this.colors[index - 1]];
      this.updateColors();
      this.saveColorsToStorage();
      // Перерисовываем компонент чтобы обновить CSS с новым количеством цветов
      this.shadowRoot.innerHTML = '';
      this.render();
      // Обновляем настройки в drawer
      this.updateSettingsInDrawer();
    }
  }

  // Метод для перемещения цвета вниз
  moveColorDown(index) {
    if (index >= 0 && index < this.colors.length - 1) {
      // Меняем местами цвета
      [this.colors[index], this.colors[index + 1]] = [this.colors[index + 1], this.colors[index]];
      this.updateColors();
      this.saveColorsToStorage();
      // Перерисовываем компонент чтобы обновить CSS с новым количеством цветов
      this.shadowRoot.innerHTML = '';
      this.render();
      // Обновляем настройки в drawer
      this.updateSettingsInDrawer();
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

customElements.define('conic-gradient-screensaver', ConicGradientScreensaver);
