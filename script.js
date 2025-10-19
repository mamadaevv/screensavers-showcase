// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}

// Обработка установки PWA
window.addEventListener('beforeinstallprompt', (e) => {
    // Не предотвращаем показ промпта, позволяем браузеру показать кнопку в адресной строке
});

window.addEventListener('appinstalled', (evt) => {
    // PWA успешно установлено
});

// Получаем элементы
const openDrawerBtn = document.getElementById('open-drawer-btn');
const drawer = document.querySelector('.drawer-placement-start');

// Обработчик клика для открытия drawer
openDrawerBtn.addEventListener('click', () => {
    drawer.show();
});

// Обработчик события закрытия drawer (опционально)
drawer.addEventListener('sl-after-hide', () => {
    // Drawer закрыт
});

// Получаем селект для выбора заставки
const screensaverSelect = document.querySelector('sl-select');

// Функция создания элементов управления настройками
function createSettingsControls(componentClass, container) {
    // Очищаем контейнер
    container.innerHTML = '';

    // Получаем настройки из компонента
    const settings = componentClass.getSettings();

    // Вычисляем имя тега компонента (тот же формат, что в switchScreensaver)
    const componentName = componentClass.name.replace('Screensaver', '');
    const componentTagName = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') + '-screensaver';

    // Создаем элементы управления для каждой настройки
    settings.forEach(setting => {
        const settingDiv = document.createElement('div');

        // Создаем лейбл
        const label = document.createElement('label');
        label.textContent = setting.label;
        label.style.display = 'block';
        label.style.marginBottom = 'var(--sl-spacing-small)';
        label.style.fontSize = 'var(--sl-input-label-font-size-medium)';
        label.style.fontWeight = 'var(--sl-input-label-font-weight)';
        label.style.color = 'var(--sl-input-label-color)';

        // Создаем sl-range без лейбла
        const range = document.createElement('sl-range');
        range.min = setting.min;
        range.max = setting.max;
        range.step = setting.step;
        range.value = getSavedSetting(componentTagName, setting.name, setting.default);

        // Создаем sl-input для числового ввода без лейбла
        const input = document.createElement('sl-input');
        input.type = 'number';
        input.min = setting.min;
        input.max = setting.max;
        input.step = setting.step;
        input.value = range.value;

        // Синхронизируем значения между range и input
        range.addEventListener('sl-change', (e) => {
            input.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);
            updateCurrentScreensaver();
        });

        input.addEventListener('sl-change', (e) => {
            range.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);
            updateCurrentScreensaver();
        });

        settingDiv.appendChild(label);
        settingDiv.appendChild(input);
        settingDiv.appendChild(range);
        container.appendChild(settingDiv);
    });
}

// Функция получения сохраненной настройки
function getSavedSetting(componentName, settingName, defaultValue) {
    const key = `screensaver-${componentName}-${settingName}`;
    const saved = localStorage.getItem(key);
    return saved !== null ? parseInt(saved, 10) : defaultValue;
}

// Функция сохранения настройки
function saveSetting(componentName, settingName, value) {
    const key = `screensaver-${componentName}-${settingName}`;
    localStorage.setItem(key, value);
}

// Функция получения класса компонента по имени
function getComponentClass(componentName) {
    switch (componentName) {
        case 'linear-gradient-screensaver':
            return LinearGradientScreensaver;
        case 'conic-gradient-screensaver':
            return ConicGradientScreensaver;
        default:
            return null;
    }
}

// Функция обновления текущей заставки с новыми настройками
function updateCurrentScreensaver() {
    const container = document.getElementById('screensaver-container');
    const currentElement = container.firstElementChild;

    if (currentElement) {
        const componentName = currentElement.tagName.toLowerCase();
        const settings = getComponentClass(componentName).getSettings();

        settings.forEach(setting => {
            const value = getSavedSetting(componentName, setting.name, setting.default);

            if (setting.name === 'speed') {
                currentElement.updateSpeed(value);
            }
            // Здесь можно добавить другие настройки
        });
    }
}

// Функция переключения заставок
function switchScreensaver(type) {
    const container = document.getElementById('screensaver-container');
    const settingsContainer = document.getElementById('screensaver-settings');

    // Очищаем контейнер
    container.innerHTML = '';

    // Получаем класс компонента
    let componentClass;
    switch (type) {
        case 'linear-gradient':
            componentClass = LinearGradientScreensaver;
            break;
        case 'conic-gradient':
            componentClass = ConicGradientScreensaver;
            break;
        default:
            return;
    }

    // Создаем новый компонент
    const component = document.createElement(`${type}-screensaver`);

    // Устанавливаем настройки из localStorage
    const settings = componentClass.getSettings();
    const componentTagName = `${type}-screensaver`;
    settings.forEach(setting => {
        const value = getSavedSetting(componentTagName, setting.name, setting.default);
        component.setAttribute(`data-${setting.name}`, value);
    });

    // Добавляем компонент в контейнер
    container.appendChild(component);

    // Создаем динамические элементы управления
    createSettingsControls(componentClass, settingsContainer);

    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedScreensaver', type);
}

// Обработчик изменения селекта
screensaverSelect.addEventListener('sl-change', (event) => {
    const selectedValue = event.target.value;
    switchScreensaver(selectedValue);
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Ждем инициализации Shoelace компонентов
    Promise.all([
        customElements.whenDefined('sl-select'),
        customElements.whenDefined('sl-option')
    ]).then(() => {
        // Получаем сохраненную заставку или используем значение по умолчанию
        const savedScreensaver = localStorage.getItem('selectedScreensaver') || 'linear-gradient';

        // Устанавливаем значение в селекте
        screensaverSelect.value = savedScreensaver;

        // Показываем выбранную заставку (это также создаст динамические элементы управления)
        switchScreensaver(savedScreensaver);
    });
});