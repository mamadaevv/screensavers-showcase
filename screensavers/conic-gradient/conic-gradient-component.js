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
      }
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.animationId = null;
    this.gradientAngle = 0;
    this.speed = 50; // значение по умолчанию
  }

  connectedCallback() {
    // Читаем настройки из атрибутов
    const speedAttr = this.getAttribute('data-speed');
    if (speedAttr !== null) {
      this.speed = parseInt(speedAttr, 10);
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
        background: conic-gradient(from var(--gradient-angle, 90deg), #0084ff 0%, #04ff00 20%, #ff00ea 40%, #ff9100 60%, #7300ff 80%, #0084ff 100%);
        z-index: -1;
      }
    `;

    const container = document.createElement('div');
    container.className = 'gradient-background';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this.gradientElement = container;
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
}

customElements.define('conic-gradient-screensaver', ConicGradientScreensaver);
