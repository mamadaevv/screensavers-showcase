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
const drawer = document.querySelector('.drawer-placement-start');
const mainContainer = document.querySelector('main');

// Обработчик клика для открытия drawer
mainContainer.addEventListener('click', () => {
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
  // Делаем функцию глобальной для доступа из компонентов
  window.createSettingsControls = createSettingsControls;
    // Очищаем контейнер
    container.innerHTML = '';

    // Получаем настройки из компонента
    const settings = componentClass.getSettings();

    // Вычисляем имя тега компонента (тот же формат, что в switchScreensaver)
    const componentName = componentClass.name.replace('Screensaver', '');
    const componentTagName = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') + '-screensaver';

    // Группируем настройки по типу
    const rangeSettings = settings.filter(setting => setting.type === 'range');
    const colorSettings = settings.filter(setting => setting.type === 'color');

    // Создаем элементы управления для range настроек
    rangeSettings.forEach(setting => {
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

        // Синхронизируем значения между range и input в реальном времени
        range.addEventListener('sl-input', (e) => {
            input.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);
            updateCurrentScreensaver();
        });

        input.addEventListener('sl-input', (e) => {
            range.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);
            updateCurrentScreensaver();
        });

        settingDiv.appendChild(label);
        settingDiv.appendChild(input);
        settingDiv.appendChild(range);
        container.appendChild(settingDiv);
    });

    // Создаем блок для цветовых настроек
    if (colorSettings.length > 0) {
        const colorsDiv = document.createElement('div');

        // Создаем заголовок для блока цветов
        const colorsLabel = document.createElement('label');
        colorsLabel.textContent = 'Цвета';
        colorsLabel.style.display = 'block';
        colorsLabel.style.marginBottom = 'var(--sl-spacing-small)';
        colorsLabel.style.fontSize = 'var(--sl-input-label-font-size-medium)';
        colorsLabel.style.fontWeight = 'var(--sl-input-label-font-weight)';
        colorsLabel.style.color = 'var(--sl-input-label-color)';

        // Создаем контейнер для цветовых строк
        const colorsContainer = document.createElement('div');
        colorsContainer.className = 'colors-container';

        colorSettings.forEach((setting, index) => {
            // Создаем строку для каждого цвета
            const colorRow = document.createElement('div');
            colorRow.className = 'color-row';
            colorRow.style.display = 'flex';
            colorRow.style.alignItems = 'center';
            colorRow.style.gap = 'var(--sl-spacing-medium)';
            colorRow.style.marginBottom = 'var(--sl-spacing-small)';
            colorRow.style.padding = 'var(--sl-spacing-small)';
            colorRow.style.border = '1px solid var(--sl-color-neutral-200)';
            colorRow.style.borderRadius = 'var(--sl-border-radius-medium)';

            // Цветовой пикер (swatch)
            const colorPicker = document.createElement('sl-color-picker');
            colorPicker.value = getSavedSetting(componentTagName, setting.name, setting.default);
            colorPicker.size = 'small';

            colorPicker.addEventListener('sl-input', (e) => {
                const newHex = e.target.value;

                // Для конического градиента обновляем массив цветов в компоненте
                if (componentTagName === 'conic-gradient-screensaver') {
                    const currentElement = document.querySelector(`${componentTagName}`);
                    if (currentElement && typeof currentElement.updateColor === 'function') {
                        const colorIndex = parseInt(setting.name.replace('color', '')) - 1;
                        currentElement.updateColor(colorIndex, newHex);
                    }
                } else {
                    // Для других компонентов сохраняем обычным способом
                    saveSetting(componentTagName, setting.name, newHex);
                }
                updateCurrentScreensaver();
            });

            const currentColor = getSavedSetting(componentTagName, setting.name, setting.default);

            // Кнопка дублировать цвет
            const duplicateButton = document.createElement('sl-button');
            duplicateButton.variant = 'default';
            duplicateButton.size = 'small';
            duplicateButton.innerHTML = '<sl-icon name="copy"></sl-icon>';
            duplicateButton.title = 'Дублировать цвет';

            duplicateButton.addEventListener('click', () => {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.addColor === 'function') {
                    currentElement.addColor(currentColor);
                }
            });

            // Кнопка удалить цвет
            const deleteButton = document.createElement('sl-button');
            deleteButton.variant = 'danger';
            deleteButton.size = 'small';
            deleteButton.innerHTML = '<sl-icon name="trash"></sl-icon>';
            deleteButton.title = 'Удалить цвет';

            deleteButton.addEventListener('click', () => {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.removeColor === 'function') {
                    currentElement.removeColor(index);
                }
            });

            // Отключаем кнопку удаления, если только один цвет
            if (colorSettings.length <= 1) {
                deleteButton.disabled = true;
            }

            // Добавляем элементы в строку
            colorRow.appendChild(colorPicker);
            colorRow.appendChild(duplicateButton);
            colorRow.appendChild(deleteButton);

            colorsContainer.appendChild(colorRow);
        });

        // Кнопка "Добавить цвет" на всю ширину
        const addColorRow = document.createElement('div');
        addColorRow.style.marginTop = 'var(--sl-spacing-medium)';

        const addColorButton = document.createElement('sl-button');
        addColorButton.variant = 'default';
        addColorButton.outline = true;
        addColorButton.size = 'medium';
        addColorButton.style.width = '100%';
        addColorButton.innerHTML = '<sl-icon name="plus" slot="prefix"></sl-icon>Добавить цвет';

        addColorButton.addEventListener('click', () => {
            const currentElement = document.querySelector(`${componentTagName}`);
            if (currentElement && typeof currentElement.addColor === 'function') {
                currentElement.addColor();
            }
        });

        addColorRow.appendChild(addColorButton);

        colorsDiv.appendChild(colorsLabel);
        colorsDiv.appendChild(colorsContainer);
        colorsDiv.appendChild(addColorRow);
        container.appendChild(colorsDiv);
    }
}

// Функция получения сохраненной настройки
function getSavedSetting(componentName, settingName, defaultValue) {
    // Для цветовых настроек конического градиента получаем из массива цветов
    if (componentName === 'conic-gradient-screensaver' && settingName.startsWith('color')) {
        const colorsKey = `screensaver-${componentName}-colors`;
        const savedColors = localStorage.getItem(colorsKey);
        if (savedColors) {
            try {
                const colors = JSON.parse(savedColors);
                const colorIndex = parseInt(settingName.replace('color', '')) - 1;
                if (colorIndex >= 0 && colorIndex < colors.length) {
                    return colors[colorIndex];
                }
            } catch (e) {
                console.warn('Failed to parse colors for setting:', e);
            }
        }
    }

    const key = `screensaver-${componentName}-${settingName}`;
    const saved = localStorage.getItem(key);
    return saved !== null ? saved : defaultValue;
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
            } else if (setting.name === 'angle' && typeof currentElement.updateAngleValue === 'function') {
                currentElement.updateAngleValue(value);
            } else if (setting.name === 'color1' && typeof currentElement.updateColor1 === 'function') {
                currentElement.updateColor1(value);
            } else if (setting.name === 'color2' && typeof currentElement.updateColor2 === 'function') {
                currentElement.updateColor2(value);
            } else if (setting.name === 'color3' && typeof currentElement.updateColor3 === 'function') {
                currentElement.updateColor3(value);
            } else if (setting.name === 'color4' && typeof currentElement.updateColor4 === 'function') {
                currentElement.updateColor4(value);
            } else if (setting.name === 'color5' && typeof currentElement.updateColor5 === 'function') {
                currentElement.updateColor5(value);
            } else if (setting.name === 'offsetX' && typeof currentElement.updateOffsetX === 'function') {
                currentElement.updateOffsetX(value);
            } else if (setting.name === 'offsetY' && typeof currentElement.updateOffsetY === 'function') {
                currentElement.updateOffsetY(value);
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
        // Для цветовых настроек конического градиента не устанавливаем атрибуты,
        // поскольку цвета загружаются из localStorage в connectedCallback
        if (!(componentTagName === 'conic-gradient-screensaver' && setting.type === 'color')) {
            const value = getSavedSetting(componentTagName, setting.name, setting.default);
            component.setAttribute(`data-${setting.name}`, value);
        }
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