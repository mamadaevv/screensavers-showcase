class LinearGradientScreensaver extends HTMLElement {
  static getSettings() {
    return [
      {
        name: 'speed',
        label: 'Скорость движения',
        type: 'range',
        min: 0,
        max: 100,
        default: 50,
        step: 1
      },
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
        name: 'color1',
        label: 'Цвет 1',
        type: 'color',
        default: '#ff0000'
      },
      {
        name: 'color2',
        label: 'Цвет 2',
        type: 'color',
        default: '#ffff00'
      },
      {
        name: 'color3',
        label: 'Цвет 3',
        type: 'color',
        default: '#0000ff'
      }
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.animationId = null;
    this.offset = 0; // смещение позиций цветов
    this.speed = 50; // значение по умолчанию
    this.angle = 90; // значение по умолчанию
    this.color1 = '#ff0000'; // значение по умолчанию
    this.color2 = '#ffff00'; // значение по умолчанию
    this.color3 = '#0000ff'; // значение по умолчанию
  }

  connectedCallback() {
    // Читаем настройки из атрибутов
    const speedAttr = this.getAttribute('data-speed');
    if (speedAttr !== null) {
      this.speed = parseInt(speedAttr, 10);
    }

    const angleAttr = this.getAttribute('data-angle');
    if (angleAttr !== null) {
      this.angle = parseInt(angleAttr, 10);
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
        background: repeating-linear-gradient(
          var(--angle, 90deg),
          var(--color1, #ff0000) 0px, var(--color1, #ff0000) 20px,
          var(--color2, #ffff00) 20px, var(--color2, #ffff00) 40px,
          var(--color3, #0000ff) 40px, var(--color3, #0000ff) 60px
        );
        background-size: 60px 100%;
        transform: translateX(var(--offset, 0px));
        z-index: -1;
      }
    `;

    const container = document.createElement('div');
    container.className = 'gradient-background';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this.gradientElement = container;

    // Устанавливаем начальные значения
    this.updateAngle();
    this.updateColors();
  }

  startAnimation() {
    if (this.speed === 0) {
      return; // не запускаем анимацию при нулевой скорости
    }

    let lastTime = 0;
    const patternWidth = 60; // ширина повторяющегося паттерна в пикселях

    const animateGradient = (currentTime) => {
      if (lastTime === 0) {
        lastTime = currentTime;
      }

      const deltaTime = currentTime - lastTime;
      // Скорость влияет на пиксели в секунду
      const pixelsPerSecond = this.speed;
      const pixelsToAdd = (pixelsPerSecond * deltaTime) / 1000;

      this.offset = (this.offset + pixelsToAdd) % patternWidth; // циклически от 0 до patternWidth

      this.gradientElement.style.setProperty('--offset', this.offset + 'px');

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

  // Метод для обновления угла
  updateAngle() {
    this.gradientElement.style.setProperty('--angle', this.angle + 'deg');
  }

  // Метод для обновления цветов
  updateColors() {
    this.gradientElement.style.setProperty('--color1', this.color1);
    this.gradientElement.style.setProperty('--color2', this.color2);
    this.gradientElement.style.setProperty('--color3', this.color3);
  }

  // Метод для обновления скорости
  updateSpeed(newSpeed) {
    this.speed = newSpeed;
    // Перезапускаем анимацию с новой скоростью
    this.stopAnimation();
    this.startAnimation();
  }

  // Метод для обновления угла
  updateAngleValue(newAngle) {
    this.angle = newAngle;
    this.updateAngle();
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
}

customElements.define('linear-gradient-screensaver', LinearGradientScreensaver);
