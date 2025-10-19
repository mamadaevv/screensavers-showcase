# Gradient Screensavers PWA

Progressive Web App (PWA) с анимированными градиентными заставками на базе веб-компонентов. Поддерживает переключаемые варианты заставок с динамически генерируемыми настройками. Можно установить как нативное приложение.

## Возможности

- **Линейный градиент**: Плавно вращающийся линейный градиент от красного к синему через желтый
- **Конический градиент**: Цветной конический градиент с плавным вращением
- **Динамические настройки**: Скорость вращения (0-100°/сек) с сохранением в localStorage
- **Веб-компоненты**: Каждая заставка - самодостаточный веб-компонент с инкапсуляцией
- **Адаптивный интерфейс**: Боковая панель настроек с кнопкой ⚙️

## Структура проекта

```
/
├── index.html                          # Основной HTML файл с drawer интерфейсом
├── style.css                           # Глобальные стили приложения
├── script.js                           # Основная логика приложения и управление заставками
├── manifest.json                       # Web App Manifest для PWA
├── sw.js                              # Service Worker для оффлайн работы
├── favicon.ico                        # Иконка приложения
├── screensavers/                       # Папка с веб-компонентами заставок
│   ├── linear-gradient/
│   │   └── linear-gradient-component.js    # Веб-компонент линейного градиента
│   └── conic-gradient/
│       └── conic-gradient-component.js      # Веб-компонент конического градиента
├── node_modules/                      # Зависимости (Shoelace UI)
├── package.json                       # Конфигурация проекта
└── README.md                          # Эта документация
```

## Архитектура

Проект построен на **веб-компонентах** (Web Components API):

- **Shadow DOM**: Инкапсуляция стилей и разметки каждой заставки
- **Custom Elements**: Собственные HTML теги (`<linear-gradient-screensaver>`)
- **Динамическая генерация UI**: Настройки создаются автоматически на основе `getSettings()` методов компонентов

### Основные файлы

**index.html**
- Основная разметка с drawer интерфейсом
- Подключение веб-компонентов
- Форма настроек с динамически генерируемыми элементами управления

**script.js**
- Управление переключением заставок
- Динамическая генерация элементов настроек
- Работа с localStorage
- Инициализация приложения

**Веб-компоненты** (`*-component.js`)
- Полностью самодостаточные модули
- Инкапсулируют HTML, CSS и JavaScript
- Поддерживают настройки через атрибуты данных
- Управляют собственной анимацией

## Управление

- **Открытие настроек**: Клик по кнопке ⚙️ в левом верхнем углу
- **Переключение заставок**: Выбор в выпадающем списке селекта
- **Настройка скорости**: Ползунок и числовое поле (0-100°/сек)
- **Закрытие настроек**: Клик вне панели drawer

## Добавление новой заставки

1. **Создайте папку** в `screensavers/` (например, `new-gradient/`)

2. **Создайте веб-компонент** со следующей структурой:

```javascript
class NewGradientScreensaver extends HTMLElement {
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
      // Добавьте другие настройки по необходимости
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.animationId = null;
    this.gradientAngle = 0;
    this.speed = 50;
  }

  connectedCallback() {
    // Чтение настроек из атрибутов
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
        background: /* ваш градиент */;
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
    if (this.speed === 0) return;

    let lastTime = 0;
    const animateGradient = (currentTime) => {
      if (lastTime === 0) lastTime = currentTime;

      const deltaTime = currentTime - lastTime;
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

  updateSpeed(newSpeed) {
    this.speed = newSpeed;
    this.stopAnimation();
    this.startAnimation();
  }
}

customElements.define('new-gradient-screensaver', NewGradientScreensaver);
```

3. **Подключите компонент** в `index.html`:

```html
<script src="screensavers/new-gradient/new-gradient-component.js"></script>
```

4. **Добавьте вариант** в селект в `index.html`:

```html
<sl-option value="new-gradient">Новый градиент</sl-option>
```

5. **Добавьте обработчик** в `script.js` в функции `switchScreensaver`:

```javascript
case 'new-gradient':
  componentClass = NewGradientScreensaver;
  break;
```

Компонент автоматически получит динамически сгенерированные настройки на основе метода `getSettings()`.

## Запуск

Откройте `index.html` в современном браузере с поддержкой ES6 модулей и Service Workers.

## Установка как PWA

Приложение можно установить как нативное на следующих платформах:

### Chrome/Chromium (Android/Desktop)
1. Откройте приложение в браузере
2. Нажмите кнопку "Установить" в адресной строке или меню

### Firefox (Desktop)
1. Откройте приложение в браузере
2. Нажмите кнопку "Установить это приложение" в адресной строке

### Safari (iOS)
1. Откройте приложение в Safari
2. Нажмите кнопку "Поделиться" (Share)
3. Выберите "На экран «Домой»" (Add to Home Screen)

### Edge (Windows)
1. Откройте приложение в браузере
2. Нажмите кнопку "Установить" в адресной строке

После установки приложение будет работать в полноэкранном режиме без браузерных элементов управления.

## Технологии

- HTML5
- CSS3 (CSS Variables, Animations, Grid)
- JavaScript (ES6 Classes, Modules, Service Workers)
- Web App Manifest для PWA
- Service Worker для кэширования
- localStorage для сохранения настроек

## Совместимость

### Браузерная поддержка
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### PWA поддержка
- Chrome/Chromium 70+ (полная поддержка)
- Firefox 68+ (ограниченная поддержка)
- Safari 12.2+ (iOS), 13.1+ (macOS)
- Edge 79+ (полная поддержка)

PWA функции (установка, оффлайн режим) доступны только при использовании HTTPS или localhost.
