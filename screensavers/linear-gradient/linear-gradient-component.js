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
          #ff0000 0px, #ff0000 20px,
          #ffff00 20px, #ffff00 40px,
          #0000ff 40px, #0000ff 60px
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

    // Устанавливаем начальный угол
    this.updateAngle();
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

      console.log(`LinearGradient: offset = ${Math.round(this.offset)}px`);

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
}

customElements.define('linear-gradient-screensaver', LinearGradientScreensaver);
