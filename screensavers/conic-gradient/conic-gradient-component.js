class ConicGradientScreensaver extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.animationId = null;
    this.gradientAngle = 0;
  }

  connectedCallback() {
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
    const animateGradient = () => {
      this.gradientAngle = (this.gradientAngle + 1) % 360;
      this.gradientElement.style.setProperty('--gradient-angle', this.gradientAngle + 'deg');
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
}

customElements.define('conic-gradient-screensaver', ConicGradientScreensaver);
