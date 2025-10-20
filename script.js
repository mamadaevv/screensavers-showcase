// Функция определения типа окружения
function getEnvironmentType() {
    const hostname = location.hostname;
    const protocol = location.protocol;

    // Локальные окружения
    if (protocol === 'file:' ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        (hostname.startsWith('172.') && parseInt(hostname.split('.')[1]) >= 16 && parseInt(hostname.split('.')[1]) <= 31)) {
        return 'local';
    }

    // Все остальные считаем продакшеном
    return 'production';
}

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const environment = getEnvironmentType();
        const swPath = environment === 'local' ? '/sw.js' : '/sw.prod.js';

        navigator.serviceWorker.register(swPath)
            .then(registration => {
                // Service Worker зарегистрирован успешно
            })
            .catch(error => {
                console.error('Ошибка регистрации Service Worker:', error);
            });
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


// Функция добавления глобальных настроек трансформации
function addTransformControl(container) {
    console.log('addTransformControl called, container:', container);

    // Настройка поворота
    const rotationDiv = document.createElement('div');
    rotationDiv.style.marginBottom = 'var(--sl-spacing-medium)';

    const rotationLabel = document.createElement('label');
    rotationLabel.textContent = 'Поворот (°)';
    rotationLabel.style.display = 'block';
    rotationLabel.style.fontSize = 'var(--sl-input-label-font-size-medium)';
    rotationLabel.style.fontWeight = 'var(--sl-input-label-font-weight)';
    rotationLabel.style.color = 'var(--sl-input-label-color)';
    rotationLabel.style.marginBottom = 'var(--sl-spacing-small)';

    const rotationRange = document.createElement('sl-range');
    rotationRange.min = -180;
    rotationRange.max = 180;
    rotationRange.step = 1;
    rotationRange.value = getRotationSetting();

    const rotationInput = document.createElement('sl-input');
    rotationInput.type = 'number';
    rotationInput.min = -180;
    rotationInput.max = 180;
    rotationInput.step = 1;
    rotationInput.value = rotationRange.value;
    rotationInput.size = 'small';
    rotationInput.style.marginLeft = 'var(--sl-spacing-small)';

    // Синхронизируем значения между range и input
    rotationRange.addEventListener('input', (e) => {
        rotationInput.value = e.target.value;
        saveRotationSetting(e.target.value);
        updateTransform();
    });

    rotationRange.addEventListener('sl-input', (e) => {
        rotationInput.value = e.target.value;
        saveRotationSetting(e.target.value);
        updateTransform();
    });

    rotationInput.addEventListener('input', (e) => {
        rotationRange.value = e.target.value;
        saveRotationSetting(e.target.value);
        updateTransform();
    });

    rotationInput.addEventListener('sl-input', (e) => {
        rotationRange.value = e.target.value;
        saveRotationSetting(e.target.value);
        updateTransform();
    });

    rotationDiv.appendChild(rotationLabel);
    rotationDiv.appendChild(rotationRange);
    rotationDiv.appendChild(rotationInput);

    // Настройка масштаба
    const scaleDiv = document.createElement('div');

    const scaleLabel = document.createElement('label');
    scaleLabel.textContent = 'Масштаб';
    scaleLabel.style.display = 'block';
    scaleLabel.style.fontSize = 'var(--sl-input-label-font-size-medium)';
    scaleLabel.style.fontWeight = 'var(--sl-input-label-font-weight)';
    scaleLabel.style.color = 'var(--sl-input-label-color)';
    scaleLabel.style.marginBottom = 'var(--sl-spacing-small)';

    const scaleRange = document.createElement('sl-range');
    scaleRange.min = 0.1;
    scaleRange.max = 3.0;
    scaleRange.step = 0.1;
    scaleRange.value = getScaleSetting();

    const scaleInput = document.createElement('sl-input');
    scaleInput.type = 'number';
    scaleInput.min = 0.1;
    scaleInput.max = 3.0;
    scaleInput.step = 0.1;
    scaleInput.value = scaleRange.value;
    scaleInput.size = 'small';
    scaleInput.style.marginLeft = 'var(--sl-spacing-small)';

    // Синхронизируем значения между range и input
    scaleRange.addEventListener('input', (e) => {
        scaleInput.value = e.target.value;
        saveScaleSetting(e.target.value);
        updateTransform();
    });

    scaleRange.addEventListener('sl-input', (e) => {
        scaleInput.value = e.target.value;
        saveScaleSetting(e.target.value);
        updateTransform();
    });

    scaleInput.addEventListener('input', (e) => {
        scaleRange.value = e.target.value;
        saveScaleSetting(e.target.value);
        updateTransform();
    });

    scaleInput.addEventListener('sl-input', (e) => {
        scaleRange.value = e.target.value;
        saveScaleSetting(e.target.value);
        updateTransform();
    });

    scaleDiv.appendChild(scaleLabel);
    scaleDiv.appendChild(scaleRange);
    scaleDiv.appendChild(scaleInput);

    container.appendChild(rotationDiv);
    container.appendChild(scaleDiv);

    console.log('Transform controls added to container');
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
    const radioSettings = settings.filter(setting => setting.type === 'radio');

    // Специальная обработка для solid-color (inline color picker)
    if (componentTagName === 'solid-color-screensaver' && colorSettings.length === 1) {
        const setting = colorSettings[0];
        const colorDiv = document.createElement('div');

        // Создаем лейбл
        const label = document.createElement('label');
        label.textContent = setting.label;
        label.style.display = 'block';
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
        input.size = 'small';

        // Отключаем элементы управления, если настройка отключена
        if (setting.disabled) {
            range.disabled = true;
            input.disabled = true;
        }

        // Синхронизируем значения между range и input в реальном времени
        range.addEventListener('input', (e) => {
            input.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);

            // Специальная обработка для настроек компонента
            if (setting.name === 'globalRotation' || setting.name === 'globalScale') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement) {
                    if (setting.name === 'globalRotation' && typeof currentElement.updateGlobalRotation === 'function') {
                        currentElement.updateGlobalRotation(e.target.value);
                    } else if (setting.name === 'globalScale' && typeof currentElement.updateGlobalScale === 'function') {
                        currentElement.updateGlobalScale(e.target.value);
                    }
                }
            } else {
                updateCurrentScreensaver();
            }
        });

        range.addEventListener('sl-input', (e) => {
            input.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);

            // Специальная обработка для настроек компонента
            if (setting.name === 'globalRotation' || setting.name === 'globalScale') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement) {
                    if (setting.name === 'globalRotation' && typeof currentElement.updateGlobalRotation === 'function') {
                        currentElement.updateGlobalRotation(e.target.value);
                    } else if (setting.name === 'globalScale' && typeof currentElement.updateGlobalScale === 'function') {
                        currentElement.updateGlobalScale(e.target.value);
                    }
                }
            } else {
                updateCurrentScreensaver();
            }
        });

        input.addEventListener('input', (e) => {
            range.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);

            // Специальная обработка для настроек компонента
            if (setting.name === 'globalRotation' || setting.name === 'globalScale') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement) {
                    if (setting.name === 'globalRotation' && typeof currentElement.updateGlobalRotation === 'function') {
                        currentElement.updateGlobalRotation(e.target.value);
                    } else if (setting.name === 'globalScale' && typeof currentElement.updateGlobalScale === 'function') {
                        currentElement.updateGlobalScale(e.target.value);
                    }
                }
            } else {
                updateCurrentScreensaver();
            }
        });

        input.addEventListener('sl-input', (e) => {
            range.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);

            // Специальная обработка для настроек компонента
            if (setting.name === 'globalRotation' || setting.name === 'globalScale') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement) {
                    if (setting.name === 'globalRotation' && typeof currentElement.updateGlobalRotation === 'function') {
                        currentElement.updateGlobalRotation(e.target.value);
                    } else if (setting.name === 'globalScale' && typeof currentElement.updateGlobalScale === 'function') {
                        currentElement.updateGlobalScale(e.target.value);
                    }
                }
            } else {
                updateCurrentScreensaver();
            }
        });

        settingDiv.appendChild(label);
        settingDiv.appendChild(input);

        // Добавляем button-group для globalRotation между input и range
        if (setting.name === 'globalRotation') {
            // Создаем button-group
            const buttonGroup = document.createElement('sl-button-group');

            // Добавляем button элементы
            const presets = [-90, -45, 0, 45, 90, 180];
            presets.forEach(value => {
                const button = document.createElement('sl-button');
                button.textContent = value + '°';
                button.value = value;
                button.size = 'small';

                // Обработчик клика на кнопку
                button.addEventListener('click', () => {
                    input.value = value;
                    range.value = value;
                    saveSetting(componentTagName, setting.name, value);

                    const currentElement = document.querySelector(`${componentTagName}`);
                    if (currentElement && typeof currentElement.updateGlobalRotation === 'function') {
                        currentElement.updateGlobalRotation(value);
                    }
                });

                buttonGroup.appendChild(button);
            });

            settingDiv.appendChild(buttonGroup);
        }

        // Добавляем button-group для offsetX в коническом градиенте
        if (setting.name === 'offsetX' && componentTagName === 'conic-gradient-screensaver') {
            // Создаем button-group
            const buttonGroup = document.createElement('sl-button-group');

            // Добавляем button элементы
            const presets = [0, 50, 100];
            presets.forEach(value => {
                const button = document.createElement('sl-button');
                button.textContent = value + '%';
                button.value = value;
                button.size = 'small';

                // Обработчик клика на кнопку
                button.addEventListener('click', () => {
                    input.value = value;
                    range.value = value;
                    saveSetting(componentTagName, setting.name, value);

                    const currentElement = document.querySelector(`${componentTagName}`);
                    if (currentElement && typeof currentElement.updateOffsetX === 'function') {
                        currentElement.updateOffsetX(value);
                    }
                });

                buttonGroup.appendChild(button);
            });

            settingDiv.appendChild(buttonGroup);
        }

        // Добавляем button-group для offsetY в коническом градиенте
        if (setting.name === 'offsetY' && componentTagName === 'conic-gradient-screensaver') {
            // Создаем button-group
            const buttonGroup = document.createElement('sl-button-group');

            // Добавляем button элементы
            const presets = [0, 50, 100];
            presets.forEach(value => {
                const button = document.createElement('sl-button');
                button.textContent = value + '%';
                button.value = value;
                button.size = 'small';

                // Обработчик клика на кнопку
                button.addEventListener('click', () => {
                    input.value = value;
                    range.value = value;
                    saveSetting(componentTagName, setting.name, value);

                    const currentElement = document.querySelector(`${componentTagName}`);
                    if (currentElement && typeof currentElement.updateOffsetY === 'function') {
                        currentElement.updateOffsetY(value);
                    }
                });

                buttonGroup.appendChild(button);
            });

            settingDiv.appendChild(buttonGroup);
        }

        settingDiv.appendChild(range);
        container.appendChild(settingDiv);
    });

    // Создаем блок для radio настроек
    if (radioSettings.length > 0) {
        radioSettings.forEach(setting => {
            const radioDiv = document.createElement('div');

            // Создаем контейнер для заголовка и switch (как у яркости)
            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.alignItems = 'center';
            headerDiv.style.justifyContent = 'space-between';
            headerDiv.style.marginBottom = 'var(--sl-spacing-small)';

            // Создаем лейбл
            const label = document.createElement('label');
            label.textContent = setting.label;
            label.style.display = 'block';
            label.style.fontSize = 'var(--sl-input-label-font-size-medium)';
            label.style.fontWeight = 'var(--sl-input-label-font-weight)';
            label.style.color = 'var(--sl-input-label-color)';

            // Создаем switch для включения/выключения настройки
            const radioSwitch = document.createElement('sl-switch');
            radioSwitch.checked = getSavedSetting(componentTagName, setting.name + '_enabled', false);

            // Обработчик изменения switch
            radioSwitch.addEventListener('sl-change', (event) => {
                const isEnabled = event.target.checked;
                saveSetting(componentTagName, setting.name + '_enabled', isEnabled);
                updateRadioGroupVisibility(radioDiv, setting, componentTagName, isEnabled);

                // Если switch выключается, сбрасываем цветовое пространство
                if (!isEnabled) {
                    const currentElement = document.querySelector(`${componentTagName}`);
                    if (currentElement && typeof currentElement.updateColorSpace === 'function') {
                        currentElement.updateColorSpace(null);
                    }
                }
            });

            headerDiv.appendChild(label);
            headerDiv.appendChild(radioSwitch);

            // Создаем radio-group
            const radioGroup = document.createElement('sl-radio-group');
            radioGroup.name = setting.name;
            radioGroup.value = getSavedSetting(componentTagName, setting.name, setting.default);

            // Добавляем radio элементы
            setting.options.forEach(option => {
                const radio = document.createElement('sl-radio');
                radio.value = option.value;
                radio.innerText = option.label;
                radio.style.marginBottom = 'var(--sl-spacing-2x-small)';
                radioGroup.appendChild(radio);
            });

            // Обработчик изменения radio-group
            radioGroup.addEventListener('sl-change', (e) => {
                const value = e.target.value;
                saveSetting(componentTagName, setting.name, value);

                // Применяем цветовое пространство только если switch включен
                const isEnabled = getSavedSetting(componentTagName, setting.name + '_enabled', false);
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateColorSpace === 'function') {
                    currentElement.updateColorSpace(isEnabled ? value : null);
                }
            });

            radioDiv.appendChild(headerDiv);
            radioDiv.appendChild(radioGroup);

            // Управляем видимостью radio-group
            updateRadioGroupVisibility(radioDiv, setting, componentTagName, radioSwitch.checked);

            container.appendChild(radioDiv);
        });
    }


    // Создаем блок для цветовых настроек
    if (colorSettings.length > 0) {
        const colorsDiv = document.createElement('div');

        // Создаем заголовок для блока цветов
        const colorsLabel = document.createElement('label');
        colorsLabel.textContent = 'Цвета';
        colorsLabel.style.display = 'block';
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

        const addColorButton = document.createElement('sl-button');
        addColorButton.variant = 'default';
        addColorButton.outline = true;
        addColorButton.size = 'small';
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

// Функция для управления видимостью radio-group
function updateRadioGroupVisibility(container, setting, componentTagName, isEnabled) {
    const radioGroup = container.querySelector('sl-radio-group');
    if (radioGroup) {
        radioGroup.style.display = isEnabled ? '' : 'none';
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
            } else if (setting.name === 'color' && componentName === 'solid-color-screensaver' && typeof currentElement.updateColor === 'function') {
                currentElement.updateColor(value);
            } else if (setting.name.startsWith('color') && typeof currentElement.updateColor === 'function') {
                const colorIndex = parseInt(setting.name.replace('color', '')) - 1;
                currentElement.updateColor(colorIndex, value);
            } else if (setting.name === 'offsetX' && typeof currentElement.updateOffsetX === 'function') {
                currentElement.updateOffsetX(value);
            } else if (setting.name === 'offsetY' && typeof currentElement.updateOffsetY === 'function') {
                currentElement.updateOffsetY(value);
            } else if (setting.name === 'updateInterval' && typeof currentElement.updateUpdateInterval === 'function') {
                currentElement.updateUpdateInterval(value);
            } else if (setting.name === 'updateStep' && typeof currentElement.updateUpdateStep === 'function') {
                currentElement.updateUpdateStep(value);
            } else if (setting.name === 'colorSpace' && typeof currentElement.updateColorSpace === 'function') {
                currentElement.updateColorSpace(value);
            } else if (setting.name === 'globalRotation' && typeof currentElement.updateGlobalRotation === 'function') {
                currentElement.updateGlobalRotation(value);
            } else if (setting.name === 'globalScale' && typeof currentElement.updateGlobalScale === 'function') {
                currentElement.updateGlobalScale(value);
            }
        });
    }
}

// Функция переключения заставок
function switchScreensaver(type) {
    // Информация о текущей заставке
    const screensaverNames = {
        'linear-gradient': 'Линейный градиент',
        'conic-gradient': 'Конический градиент',
        'color-transition': 'Смена цветов',
        'solid-color': 'Сплошной цвет'
    };

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