class LinearGradientScreensaver extends HTMLElement {
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
    console.log('LinearGradientScreensaver: инициализация компонента');

    // Читаем настройки из атрибутов
    const speedAttr = this.getAttribute('data-speed');
    if (speedAttr !== null) {
      this.speed = parseInt(speedAttr, 10);
      console.log('LinearGradientScreensaver: скорость установлена из атрибута:', this.speed);
    }

    this.render();
    this.startAnimation();
  }

  disconnectedCallback() {
    console.log('LinearGradientScreensaver: компонент удален');
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
        background: linear-gradient(var(--gradient-angle, 90deg), #ff0000 0%, #ffff00 50%, #0000ff 100%);
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
    console.log('LinearGradientScreensaver: запуск анимации со скоростью', this.speed);

    if (this.speed === 0) {
      console.log('LinearGradientScreensaver: скорость 0, анимация не запущена');
      return; // не запускаем анимацию при нулевой скорости
    }

    let lastTime = 0;
    const animateGradient = (currentTime) => {
      if (currentTime - lastTime >= (1000 / (this.speed * 10))) { // скорость влияет на частоту обновлений
        this.gradientAngle = (this.gradientAngle + 1) % 360;
        this.gradientElement.style.setProperty('--gradient-angle', this.gradientAngle + 'deg');
        lastTime = currentTime;
      }
      this.animationId = requestAnimationFrame(animateGradient);
    };
    this.animationId = requestAnimationFrame(animateGradient);
  }

  stopAnimation() {
    if (this.animationId) {
      console.log('LinearGradientScreensaver: остановка анимации');
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Метод для обновления скорости
  updateSpeed(newSpeed) {
    console.log('LinearGradientScreensaver: updateSpeed вызван с параметром', newSpeed);
    console.log('LinearGradientScreensaver: текущая скорость', this.speed);
    this.speed = newSpeed;
    console.log('LinearGradientScreensaver: установлена новая скорость', this.speed);
    // Перезапускаем анимацию с новой скоростью
    this.stopAnimation();
    this.startAnimation();
    console.log('LinearGradientScreensaver: анимация перезапущена с новой скоростью');
  }
}

customElements.define('linear-gradient-screensaver', LinearGradientScreensaver);
