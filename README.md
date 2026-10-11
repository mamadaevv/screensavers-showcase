# Screensavers Showcase

A Progressive Web App (PWA) with animated splash screens based on web components. Supports switchable splash screen options with dynamically generated settings. Can be installed as a native app.

## Features

- **Linear gradient**: A smoothly rotating linear gradient from red to blue through yellow
- **Conical gradient**: A colored conical gradient with a smooth rotation
- **Color transitions**: Smooth transitions between multiple colors at a customizable speed
- **Solid Color**: A static background in the selected color
- **Dynamic settings**: Rotation/swivel speed (0–100°/sec or 1–10) saved in localStorage
- **Web Components**: Each splash screen is a self-contained, encapsulated web component
- **Adaptive Interface**: Sidebar with a ⚙️ button
- **Brightness Settings**: Global screen brightness adjustment (-100 to +100)
- **Offline operation**: Caching via Service Worker

## Project Structure

```
/
├── index.html                          # Main HTML file with a drawer interface
├── style.css                           # Global Application Styles
├── script.js                           # The Application's Core Logic and Splash Screen Control
├── manifest.json                       # Web App Manifest for PWAs
├── sw.js                              # Service Worker for Offline Use
├── favicon.ico                        # App icon
├── screensavers/                       # Folder containing web components for splash screens
│   ├── linear-gradient/
│   │   └── linear-gradient-component.js    # Linear Gradient Web Component
│   └── conic-gradient/
│       └── conic-gradient-component.js      # Conical Gradient Web Component
├── node_modules/                      # Dependencies (Shoelace UI)
├── package.json                       # Project Configuration
└── README.md                          # This documentation
```

## Technologies

- **HTML5**: Semantic Markup and Application Structure
- **CSS3**: Styling components, CSS variables, animations, Grid
- **JavaScript (ES6+)**: Classes, modules, asynchronous functions, Web Components API
- **Web Components**: Shadow DOM, Custom Elements, component encapsulation
- **Shoelace UI**: UI components (@shoelace-style/shoelace v2.20.1)
- **Progressive Web App (PWA)**: Web App Manifest, Service Worker for offline functionality
- **localStorage**: Storing user settings
- **npm**: Dependency management

## Architecture

The project is built using **Web Components** (Web Components API):

- **Shadow DOM**: Encapsulation of the styles and markup for each splash screen
- **Custom Elements**: Custom HTML tags (`<linear-gradient-screensaver>`)
- **Dynamic UI Generation**: Settings are created automatically based on the `getSettings()` methods of the components

### Main Files

**index.html**
- Basic layout with a drawer interface
- Connecting Web Components
- A settings form with dynamically generated controls

**script.js**
- Screen Saver Control
- Dynamic generation of configuration elements
- Working with localStorage
- Application Initialization

**Web Components** (`*-component.js`)
- Fully self-contained modules
- They encapsulate HTML, CSS, and JavaScript
- Support settings via data attributes
- Control their own animations

## Management

- **Open Settings**: Click the ⚙️ button in the upper-left corner
- **Switching between screensavers**: Select from the drop-down list
- **Speed adjustment**: Slider and numeric field (0–100°/sec)
- **Close Settings**: Click outside the drawer panel

## Adding a New Screensaver

To add a new screensaver, follow these steps:

### 1. Create a splash screen component

Create a folder in `screensavers/` (for example, `new-effect/`) and a file named `new-effect-component.js`:

```javascript
class NewEffectScreensaver extends HTMLElement {
  static getSettings() {
    return [
      {
        name: 'speed',
        label: 'Speed of Effect',
        type: 'range',
        min: 0,
        max: 100,
        default: 50,
        step: 1
      }
      // Add other settings as needed
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.animationId = null;
    this.speed = 50;
  }

  connectedCallback() {
    // Reading Settings from Attributes
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
      .effect-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: /* your effect */;
        z-index: -1;
      }
    `;

    const container = document.createElement('div');
    container.className = 'effect-background';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this.effectElement = container;
  }

  startAnimation() {
    if (this.speed === 0) return;

    let lastTime = 0;
    const animate = (currentTime) => {
      if (lastTime === 0) lastTime = currentTime;

      const deltaTime = currentTime - lastTime;
      // Your animation logic here

      lastTime = currentTime;
      this.animationId = requestAnimationFrame(animate);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  updateSpeed(newSpeed) {
    this.speed = newSpeed;
    this.stopAnimation();
    this.startAnimation();
  }
}

customElements.define('new-effect-screensaver', NewEffectScreensaver);
```

### 2. Connect the component in `index.html`

Add the following to the end of `<head>`:

```html
<script src="screensavers/new-effect/new-effect-component.js"></script>
```

### 3. Add the variant to the selector in `index.html`

Find `<sl-select>` and add:

```html
<sl-option value="new-effect">New Effect</sl-option>
```

### 4. Update `script.js`

**In the `getComponentClass` function:**
```javascript
case 'new-effect-screensaver':
    return NewEffectScreensaver;
```

**In the `switchScreensaver` function:**
```javascript
case 'new-effect':
    componentClass = NewEffectScreensaver;
    break;
```

**In the `DOMContentLoaded` handler:**
```javascript
const components = [
    // ... existing components
    'new-effect-screensaver'
];
```

**In `window.addEventListener('load')`:**
```javascript
const componentPromises = [
    // ... existing promises
    customElements.whenDefined('new-effect-screensaver')
];
```

### 5. Support for Custom Settings

For color settings using a color array:
- Implement the methods `updateColor(index, color)`, `addColor(color)`, and `removeColor(index)`
- Save the colors to localStorage with the key `screensaver-{tagName}-colors`

For individual color settings:
- Implement the `updateColor(color)` method
- Save the color to localStorage with the key `screensaver-{tagName}-color`

The component will automatically retrieve dynamically generated settings based on the `getSettings()` method.

## Launch

### Local Execution
Open `index.html` in a modern browser that supports ES6 modules and Service Workers.

### Deployment to GitHub Pages

The project is configured for automatic deployment to GitHub Pages:

1. **Create a repository** on GitHub
2. **Upload the code** to the repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. **Enable GitHub Pages** in the repository settings:
   - Go to Settings → Pages
   - Select "GitHub Actions" as the source
4. **Wait for deployment** — GitHub Actions will automatically publish the app

The app will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## Install as a PWA

The app can be installed natively on the following platforms:

### Chrome/Chromium (Android/Desktop)
1. Open the app in your browser
2. Click the "Install" button in the address bar or menu

### Firefox (Desktop)
1. Open the app in your browser
2. Click the "Install this app" button in the address bar

### Safari (iOS)
1. Open the app in Safari
2. Click the "Share" button
3. Select "Add to Home Screen"

### Edge (Windows)
1. Open the app in your browser
2. Click the "Install" button in the address bar

Once installed, the app will run in full-screen mode without browser controls.

## Compatibility

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### PWA Support
- Chrome/Chromium 70+ (full support)
- Firefox 68+ (limited support)
- Safari 12.2+ (iOS), 13.1+ (macOS)
- Edge 79+ (full support)

PWA features (installation, offline mode) are available only when using HTTPS or localhost.
