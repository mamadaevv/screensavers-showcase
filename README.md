# Screensavers Showcase

Progressive Web App (PWA) с анимированными заставками экрана на базе веб-компонентов. Поддерживает переключаемые варианты заставок с динамически генерируемыми настройками. Можно установить как нативное приложение.

## Возможности

- **Линейный градиент**: Плавно вращающийся линейный градиент от красного к синему через желтый
- **Конический градиент**: Цветной конический градиент с плавным вращением
- **Переход цветов**: Плавная смена между несколькими цветами с настраиваемой скоростью
- **Сплошной цвет**: Статический фон с выбранным цветом
- **Динамические настройки**: Скорость вращения/смены (0-100°/сек или 1-10) с сохранением в localStorage
- **Веб-компоненты**: Каждая заставка - самодостаточный веб-компонент с инкапсуляцией
- **Адаптивный интерфейс**: Боковая панель настроек с кнопкой ⚙️
- **Настройки яркости**: Глобальная регулировка яркости экрана (-100 до +100)
- **Оффлайн работа**: Кэширование через Service Worker

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

## Технологии

- **HTML5**: Семантическая разметка и структура приложения
- **CSS3**: Стилизация компонентов, CSS Variables, Animations, Grid
- **JavaScript (ES6+)**: Классы, модули, асинхронные функции, Web Components API
- **Web Components**: Shadow DOM, Custom Elements, инкапсуляция компонентов
- **Shoelace UI**: Компоненты интерфейса (@shoelace-style/shoelace v2.20.1)
- **Progressive Web App (PWA)**: Web App Manifest, Service Worker для оффлайн работы
- **localStorage**: Сохранение пользовательских настроек
- **npm**: Управление зависимостями

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

Для добавления новой заставки следуйте этим шагам:

### 1. Создайте компонент заставки

Создайте папку в `screensavers/` (например, `new-effect/`) и файл `new-effect-component.js`:

```javascript
class NewEffectScreensaver extends HTMLElement {
  static getSettings() {
    return [
      {
        name: 'speed',
        label: 'Скорость эффекта',
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
      .effect-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: /* ваш эффект */;
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
      // Ваша логика анимации здесь

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

### 2. Подключите компонент в `index.html`

Добавьте в конец `<head>`:

```html
<script src="screensavers/new-effect/new-effect-component.js"></script>
```

### 3. Добавьте вариант в селектор в `index.html`

Найдите `<sl-select>` и добавьте:

```html
<sl-option value="new-effect">Новый эффект</sl-option>
```

### 4. Обновите `script.js`

**В функции `getComponentClass`:**
```javascript
case 'new-effect-screensaver':
    return NewEffectScreensaver;
```

**В функции `switchScreensaver`:**
```javascript
case 'new-effect':
    componentClass = NewEffectScreensaver;
    break;
```

**В `DOMContentLoaded` обработчике:**
```javascript
const components = [
    // ... существующие компоненты
    'new-effect-screensaver'
];
```

**В `window.addEventListener('load')`:**
```javascript
const componentPromises = [
    // ... существующие промисы
    customElements.whenDefined('new-effect-screensaver')
];
```

### 5. Поддержка специальных настроек

Для цветовых настроек с массивом цветов:
- Реализуйте методы `updateColor(index, color)`, `addColor(color)`, `removeColor(index)`
- Сохраняйте цвета в localStorage с ключом `screensaver-{tagName}-colors`

Для одиночных цветовых настроек:
- Реализуйте метод `updateColor(color)`
- Сохраняйте цвет в localStorage с ключом `screensaver-{tagName}-color`

Компонент автоматически получит динамически сгенерированные настройки на основе метода `getSettings()`.

## Запуск

### Локальный запуск
Откройте `index.html` в современном браузере с поддержкой ES6 модулей и Service Workers.

### Развертывание на GitHub Pages

Проект настроен для автоматического развертывания на GitHub Pages:

1. **Создайте репозиторий** на GitHub
2. **Загрузите код** в репозиторий:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. **Включите GitHub Pages** в настройках репозитория:
   - Перейдите в Settings → Pages
   - Выберите "GitHub Actions" как источник
4. **Дождитесь развертывания** - GitHub Actions автоматически опубликует приложение

Приложение будет доступно по адресу: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

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
