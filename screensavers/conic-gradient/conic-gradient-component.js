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
        background: conic-gradient(from var(--gradient-angle, 90deg) at var(--offset-x, 0%) var(--offset-y, 30%), #0084ff 0%, #04ff00 20%, #ff00ea 40%, #ff9100 60%, #7300ff 80%, #0084ff 100%);
        z-index: -1;
      }
    `;

    const container = document.createElement('div');
    container.className = 'gradient-background';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this.gradientElement = container;

    // Устанавливаем начальные значения смещений
    this.updateOffset();
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
}

customElements.define('conic-gradient-screensaver', ConicGradientScreensaver);
