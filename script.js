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

// Обработчик для кнопки полноэкранного режима в header drawer'а
document.addEventListener('click', (e) => {
    if (e.target.closest('.fullscreen-button')) {
        toggleFullscreen();
    }
});

// Функция переключения полноэкранного режима
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn('Не удалось перейти в полноэкранный режим:', err);
        });
    } else {
        document.exitFullscreen().catch(err => {
            console.warn('Не удалось выйти из полноэкранного режима:', err);
        });
    }
}

// Получаем селект для выбора заставки
const screensaverSelect = document.querySelector('sl-select');

// Функции для работы с настройками яркости
function getBrightnessSetting() {
    const saved = localStorage.getItem('brightness-value');
    return saved !== null ? parseInt(saved) : 0;
}

function saveBrightnessSetting(value) {
    localStorage.setItem('brightness-value', value);
}

function getBrightnessSwitchSetting() {
    const saved = localStorage.getItem('brightness-switch-enabled');
    return saved !== null ? saved === 'true' : false; // По умолчанию выключено
}

function saveBrightnessSwitchSetting(enabled) {
    localStorage.setItem('brightness-switch-enabled', enabled);
}

// Функция обновления яркости
function updateBrightness() {
    const brightnessSwitch = document.getElementById('brightness-switch');
    const screensaverContainer = document.getElementById('screensaver-container');
    const body = document.body;

    if (!brightnessSwitch || !screensaverContainer) {
        return;
    }

    const isEnabled = brightnessSwitch.checked;
    const brightness = getBrightnessSetting();

    // Показываем/скрываем элементы управления яркостью
    const brightnessContainer = document.getElementById('brightness-settings');
    if (brightnessContainer) {
        const controls = brightnessContainer.querySelectorAll('sl-range, sl-input');
        controls.forEach(control => {
            control.style.display = isEnabled ? '' : 'none';
        });
    }

    if (isEnabled) {
        // Применяем яркость - инвертированная прозрачность
        const opacity = (100 - Math.abs(brightness)) / 100; // От 1 до 0
        screensaverContainer.style.opacity = opacity;

        // Меняем цвет фона body
        if (brightness < 0) {
            body.style.backgroundColor = 'black';
        } else if (brightness > 0) {
            body.style.backgroundColor = 'white';
        } else {
            body.style.backgroundColor = '';
        }
    } else {
        // Не применяем яркость - сбрасываем стили
        screensaverContainer.style.opacity = '';
        body.style.backgroundColor = '';
    }
}

// Функция добавления глобальной настройки яркости
function addBrightnessControl(container) {
    const brightnessDiv = document.createElement('div');

    // Создаем контейнер для заголовка и switch
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.marginBottom = 'var(--sl-spacing-small)';

    // Создаем лейбл
    const label = document.createElement('label');
    label.textContent = 'Яркость';
    label.style.display = 'block';
    label.style.fontSize = 'var(--sl-input-label-font-size-medium)';
    label.style.fontWeight = 'var(--sl-input-label-font-weight)';
    label.style.color = 'var(--sl-input-label-color)';

    // Создаем switch без лейбла
    const brightnessSwitch = document.createElement('sl-switch');
    brightnessSwitch.id = 'brightness-switch';
    brightnessSwitch.checked = getBrightnessSwitchSetting();

    // Обработчик изменения switch яркости
    brightnessSwitch.addEventListener('sl-change', (event) => {
        const isEnabled = event.target.checked;
        saveBrightnessSwitchSetting(isEnabled);
        updateBrightness();
    });

    headerDiv.appendChild(label);
    headerDiv.appendChild(brightnessSwitch);

    // Создаем sl-range с custom track offset
    const range = document.createElement('sl-range');
    range.min = -100;
    range.max = 100;
    range.step = 1;
    range.value = getBrightnessSetting();
    range.style.setProperty('--track-active-offset', '50%');

    // Создаем sl-input для числового ввода
    const input = document.createElement('sl-input');
    input.type = 'number';
    input.min = -100;
    input.max = 100;
    input.step = 1;
    input.value = range.value;

    // Синхронизируем значения между range и input в реальном времени
    range.addEventListener('input', (e) => {
        input.value = e.target.value;
        saveBrightnessSetting(e.target.value);
        updateBrightness();
    });

    range.addEventListener('sl-input', (e) => {
        input.value = e.target.value;
        saveBrightnessSetting(e.target.value);
        updateBrightness();
    });

    input.addEventListener('input', (e) => {
        range.value = e.target.value;
        saveBrightnessSetting(e.target.value);
        updateBrightness();
    });

    input.addEventListener('sl-input', (e) => {
        range.value = e.target.value;
        saveBrightnessSetting(e.target.value);
        updateBrightness();
    });

    brightnessDiv.appendChild(headerDiv);
    brightnessDiv.appendChild(input);
    brightnessDiv.appendChild(range);
    container.appendChild(brightnessDiv);
}

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

    // Специальная обработка для solid-color (inline color picker)
    if (componentTagName === 'solid-color-screensaver' && colorSettings.length === 1) {
        const setting = colorSettings[0];
        const colorDiv = document.createElement('div');

        // Создаем лейбл
        const label = document.createElement('label');
        label.textContent = setting.label;
        label.style.display = 'block';
        label.style.marginBottom = 'var(--sl-spacing-small)';
        label.style.fontSize = 'var(--sl-input-label-font-size-medium)';
        label.style.fontWeight = 'var(--sl-input-label-font-weight)';
        label.style.color = 'var(--sl-input-label-color)';

        // Создаем inline color picker
        const colorPicker = document.createElement('sl-color-picker');
        colorPicker.value = getSavedSetting(componentTagName, setting.name, setting.default);
        colorPicker.inline = true; // Используем inline режим
        colorPicker.swatches = '#ff0000;#ff8000;#ffff00;#80ff00;#00ff80;#0080ff;#8000ff;#ffffff;#c0c0c0;#808080;#404040;#000000';

        colorPicker.addEventListener('sl-input', (e) => {
            const newHex = e.target.value;
            const currentElement = document.querySelector(`${componentTagName}`);
            if (currentElement && typeof currentElement.updateColor === 'function') {
                currentElement.updateColor(newHex);
            }
        });

        colorDiv.appendChild(label);
        colorDiv.appendChild(colorPicker);
        container.appendChild(colorDiv);
        return; // Для solid-color не нужны другие настройки
    }

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

        // Отключаем элементы управления, если настройка отключена
        if (setting.disabled) {
            range.disabled = true;
            input.disabled = true;
        }

        // Синхронизируем значения между range и input в реальном времени
        range.addEventListener('input', (e) => {
            input.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);
            updateCurrentScreensaver();
        });

        range.addEventListener('sl-input', (e) => {
            input.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);
            updateCurrentScreensaver();
        });

        input.addEventListener('input', (e) => {
            range.value = e.target.value;
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
            colorPicker.swatches = '#ff0000;#ff8000;#ffff00;#80ff00;#00ff80;#0080ff;#8000ff;#ffffff;#c0c0c0;#808080;#404040;#000000';

            colorPicker.addEventListener('sl-input', (e) => {
                const newHex = e.target.value;

                // Для конического, линейного градиентов и смены цветов обновляем массив цветов в компоненте
                if (componentTagName === 'conic-gradient-screensaver' || componentTagName === 'linear-gradient-screensaver' || componentTagName === 'color-transition-screensaver') {
                    const currentElement = document.querySelector(`${componentTagName}`);
                    if (currentElement && typeof currentElement.updateColor === 'function') {
                        const colorIndex = parseInt(setting.name.replace('color', '')) - 1;
                        currentElement.updateColor(colorIndex, newHex);
                    }
                } else {
                    // Для других компонентов сохраняем обычным способом
                    saveSetting(componentTagName, setting.name, newHex);
                    updateCurrentScreensaver();
                }
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
    // Для solid-color получаем одиночный цвет
    if (componentName === 'solid-color-screensaver' && settingName === 'color') {
        const colorKey = `screensaver-${componentName}-color`;
        const savedColor = localStorage.getItem(colorKey);
        return savedColor !== null ? savedColor : defaultValue;
    }

    // Для цветовых настроек конического градиента и смены цветов получаем из массива цветов
    if ((componentName === 'conic-gradient-screensaver' || componentName === 'color-transition-screensaver') && settingName.startsWith('color')) {
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
        case 'color-transition-screensaver':
            return ColorTransitionScreensaver;
        case 'solid-color-screensaver':
            return SolidColorScreensaver;
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

            // Пропускаем отключенные настройки
            if (setting.disabled) {
                return;
            }

            if (setting.name === 'speed') {
                currentElement.updateSpeed(value);
            } else if (setting.name === 'angle' && typeof currentElement.updateAngleValue === 'function') {
                currentElement.updateAngleValue(value);
            } else if (setting.name === 'color' && componentName === 'solid-color-screensaver' && typeof currentElement.updateColor === 'function') {
                currentElement.updateColor(value);
            } else if (setting.name.startsWith('color') && typeof currentElement.updateColor === 'function') {
                const colorIndex = parseInt(setting.name.replace('color', '')) - 1;
                currentElement.updateColor(colorIndex, value);
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
    const brightnessContainer = document.getElementById('brightness-settings');

    // Очищаем контейнеры
    container.innerHTML = '';
    brightnessContainer.innerHTML = '';

    // Получаем класс компонента
    let componentClass;
    switch (type) {
        case 'linear-gradient':
            componentClass = LinearGradientScreensaver;
            break;
        case 'conic-gradient':
            componentClass = ConicGradientScreensaver;
            break;
        case 'color-transition':
            componentClass = ColorTransitionScreensaver;
            break;
        case 'solid-color':
            componentClass = SolidColorScreensaver;
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
        // Для цветовых настроек конического градиента, смены цветов и сплошного цвета не устанавливаем атрибуты,
        // поскольку цвета загружаются из localStorage в connectedCallback
        if (!(componentTagName === 'conic-gradient-screensaver' && setting.type === 'color') &&
            !(componentTagName === 'color-transition-screensaver' && setting.type === 'color') &&
            !(componentTagName === 'solid-color-screensaver' && setting.type === 'color')) {
            const value = getSavedSetting(componentTagName, setting.name, setting.default);
            component.setAttribute(`data-${setting.name}`, value);
        }
    });

    // Добавляем компонент в контейнер
    container.appendChild(component);

    // Создаем динамические элементы управления
    createSettingsControls(componentClass, settingsContainer);

    // Добавляем настройки яркости ПОСЛЕ создания основных настроек
    addBrightnessControl(brightnessContainer);

    // Применяем настройки яркости
    updateBrightness();

    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedScreensaver', type);
}

// Обработчик изменения селекта
screensaverSelect.addEventListener('sl-change', (event) => {
    const selectedValue = event.target.value;
    switchScreensaver(selectedValue);
});

// Обработчик изменения switch яркости будет добавлен в addBrightnessControl

// Функция принудительной загрузки заставки из хранилища
function forceLoadScreensaver() {
    // Получаем сохраненную заставку или используем значение по умолчанию
    const savedScreensaver = localStorage.getItem('selectedScreensaver') || 'linear-gradient';

    // Устанавливаем значение в селекте
    if (screensaverSelect) {
        screensaverSelect.value = savedScreensaver;
    }

    // Показываем выбранную заставку
    switchScreensaver(savedScreensaver);
}

// Дополнительная инициализация при готовности DOM
document.addEventListener('DOMContentLoaded', () => {
    // Если основные компоненты уже зарегистрированы, загружаем заставку
    const checkComponentsReady = () => {
        const components = [
            'sl-select', 'sl-option',
            'linear-gradient-screensaver', 'conic-gradient-screensaver',
            'color-transition-screensaver', 'solid-color-screensaver'
        ];

        const ready = components.every(name => customElements.get(name));
        if (ready) {
            forceLoadScreensaver();
        }
    };

    checkComponentsReady();
});

// Инициализация при загрузке страницы
window.addEventListener('load', () => {
    // Ждем инициализации основных Shoelace компонентов и компонентов заставок
    const componentPromises = [
        customElements.whenDefined('sl-select'),
        customElements.whenDefined('sl-option'),
        // Ждем регистрации компонентов заставок
        customElements.whenDefined('linear-gradient-screensaver'),
        customElements.whenDefined('conic-gradient-screensaver'),
        customElements.whenDefined('color-transition-screensaver'),
        customElements.whenDefined('solid-color-screensaver')
    ];

    Promise.all(componentPromises).then(() => {
        forceLoadScreensaver();
    }).catch((error) => {
        // Даже при ошибке пытаемся загрузить заставку
        forceLoadScreensaver();
    });
});