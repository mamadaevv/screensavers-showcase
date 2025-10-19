class ConicGradientScreensaver extends HTMLElement {
  static getSettings() {
    return [
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
        default: 0,
        step: 1
      },
      {
        name: 'offsetY',
        label: 'Смещение по Y (%)',
        type: 'range',
        min: 0,
        max: 100,
        default: 30,
        step: 1
      },
      {
        name: 'color1',
        label: 'Цвет 1',
        type: 'color',
        default: '#0084ff'
      },
      {
        name: 'color2',
        label: 'Цвет 2',
        type: 'color',
        default: '#04ff00'
      },
      {
        name: 'color3',
        label: 'Цвет 3',
        type: 'color',
        default: '#ff00ea'
      },
      {
        name: 'color4',
        label: 'Цвет 4',
        type: 'color',
        default: '#ff9100'
      },
      {
        name: 'color5',
        label: 'Цвет 5',
        type: 'color',
        default: '#7300ff'
      }
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.animationId = null;
    this.gradientAngle = 0;
    this.speed = 50; // значение по умолчанию
    this.offsetX = 0; // значение по умолчанию
    this.offsetY = 30; // значение по умолчанию
    this.color1 = '#0084ff'; // значение по умолчанию
    this.color2 = '#04ff00'; // значение по умолчанию
    this.color3 = '#ff00ea'; // значение по умолчанию
    this.color4 = '#ff9100'; // значение по умолчанию
    this.color5 = '#7300ff'; // значение по умолчанию
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

    const color1Attr = this.getAttribute('data-color1');
    if (color1Attr !== null) {
      this.color1 = color1Attr;
    }

    const color2Attr = this.getAttribute('data-color2');
    if (color2Attr !== null) {
      this.color2 = color2Attr;
    }

    const color3Attr = this.getAttribute('data-color3');
    if (color3Attr !== null) {
      this.color3 = color3Attr;
    }

    const color4Attr = this.getAttribute('data-color4');
    if (color4Attr !== null) {
      this.color4 = color4Attr;
    }

    const color5Attr = this.getAttribute('data-color5');
    if (color5Attr !== null) {
      this.color5 = color5Attr;
    }

    this.render();
    this.startAnimation();
  }

  disconnectedCallback() {
    this.stopAnimation();
  }

  render() {
    const style = document.createElement('style');
    style.textContent = `
      .gradient-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: conic-gradient(from var(--gradient-angle, 90deg) at var(--offset-x, 0%) var(--offset-y, 30%), var(--color1, #0084ff) 0%, var(--color2, #04ff00) 20%, var(--color3, #ff00ea) 40%, var(--color4, #ff9100) 60%, var(--color5, #7300ff) 80%, var(--color1, #0084ff) 100%);
        z-index: -1;
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
    this.gradientElement.style.setProperty('--color1', this.color1);
    this.gradientElement.style.setProperty('--color2', this.color2);
    this.gradientElement.style.setProperty('--color3', this.color3);
    this.gradientElement.style.setProperty('--color4', this.color4);
    this.gradientElement.style.setProperty('--color5', this.color5);
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

  // Методы для обновления цветов
  updateColor1(newColor) {
    this.color1 = newColor;
    this.updateColors();
  }

  updateColor2(newColor) {
    this.color2 = newColor;
    this.updateColors();
  }

  updateColor3(newColor) {
    this.color3 = newColor;
    this.updateColors();
  }

  updateColor4(newColor) {
    this.color4 = newColor;
    this.updateColors();
  }

  updateColor5(newColor) {
    this.color5 = newColor;
    this.updateColors();
  }
}

customElements.define('conic-gradient-screensaver', ConicGradientScreensaver);
