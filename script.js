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
    console.log('Script: создание элементов управления для компонента', componentClass.name);

    // Очищаем контейнер
    container.innerHTML = '';

    // Получаем настройки из компонента
    const settings = componentClass.getSettings();
    console.log('Script: настройки компонента:', settings);

    // Вычисляем имя тега компонента (тот же формат, что в switchScreensaver)
    const componentName = componentClass.name.replace('Screensaver', '');
    const componentTagName = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') + '-screensaver';
    console.log('Script: вычисленное имя тега компонента:', componentTagName);

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

        console.log(`Script: создание настройки "${setting.name}" со значением`, range.value);

        // Синхронизируем значения между range и input
        range.addEventListener('sl-change', (e) => {
            console.log(`Script: изменение настройки "${setting.name}" через range на`, e.target.value);
            console.log(`Script: синхронизация input.value =`, e.target.value);
            input.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);
            console.log(`Script: вызов updateCurrentScreensaver для "${setting.name}"`);
            updateCurrentScreensaver();
        });

        input.addEventListener('sl-change', (e) => {
            console.log(`Script: изменение настройки "${setting.name}" через input на`, e.target.value);
            console.log(`Script: синхронизация range.value =`, e.target.value);
            range.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);
            console.log(`Script: вызов updateCurrentScreensaver для "${setting.name}"`);
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
    const result = saved !== null ? parseInt(saved, 10) : defaultValue;
    console.log(`Script: получение настройки "${settingName}" для "${componentName}"`);
    console.log(`  Ключ: "${key}"`);
    console.log(`  Значение в localStorage: "${saved}"`);
    console.log(`  Результат: ${result} ${saved !== null ? '(из localStorage)' : '(по умолчанию)'}`);
    return result;
}

// Функция сохранения настройки
function saveSetting(componentName, settingName, value) {
    const key = `screensaver-${componentName}-${settingName}`;
    console.log(`Script: сохранение настройки "${settingName}" для "${componentName}"`);
    console.log(`  Ключ: "${key}"`);
    console.log(`  Значение: ${value}`);
    localStorage.setItem(key, value);
    console.log(`  Сохранено в localStorage`);
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
    console.log('Script: начало обновления текущей заставки');

    const container = document.getElementById('screensaver-container');
    const currentElement = container.firstElementChild;

    if (currentElement) {
        const componentName = currentElement.tagName.toLowerCase();
        console.log('Script: найден компонент:', componentName);

        const componentClass = getComponentClass(componentName);
        if (!componentClass) {
            console.error('Script: класс компонента не найден для', componentName);
            return;
        }

        console.log('Script: получен класс компонента:', componentClass.name);

        const settings = componentClass.getSettings();
        console.log('Script: настройки компонента:', settings);

        settings.forEach(setting => {
            console.log(`Script: обработка настройки "${setting.name}"`);
            const value = getSavedSetting(componentName, setting.name, setting.default);
            console.log(`Script: получено значение ${value} для настройки "${setting.name}"`);

            if (setting.name === 'speed') {
                console.log('Script: применение скорости', value, 'к компоненту');
                console.log('Script: проверка наличия метода updateSpeed:', typeof currentElement.updateSpeed);
                currentElement.updateSpeed(value);
            }
            // Здесь можно добавить другие настройки
        });

        console.log('Script: обновление заставки завершено');
    } else {
        console.log('Script: текущая заставка не найдена');
        console.log('Script: содержимое контейнера:', container.innerHTML);
    }
}

// Функция переключения заставок
function switchScreensaver(type) {
    console.log('Script: переключение на заставку', type);

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
            console.error('Script: неизвестный тип заставки:', type);
            return;
    }

    console.log('Script: выбран класс компонента', componentClass.name);

    // Создаем новый компонент
    const component = document.createElement(`${type}-screensaver`);
    console.log('Script: создан элемент', component.tagName);

    // Устанавливаем настройки из localStorage
    const settings = componentClass.getSettings();
    const componentTagName = `${type}-screensaver`;
    settings.forEach(setting => {
        const value = getSavedSetting(componentTagName, setting.name, setting.default);
        component.setAttribute(`data-${setting.name}`, value);
        console.log(`Script: установлена настройка ${setting.name}=${value} для компонента`);
    });

    // Добавляем компонент в контейнер
    container.appendChild(component);
    console.log('Script: компонент добавлен в контейнер');

    // Создаем динамические элементы управления
    createSettingsControls(componentClass, settingsContainer);

    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedScreensaver', type);
    console.log('Script: выбор заставки сохранен в localStorage');
}

// Обработчик изменения селекта
screensaverSelect.addEventListener('sl-change', (event) => {
    const selectedValue = event.target.value;
    console.log('Script: выбор заставки в селекте изменен на', selectedValue);
    switchScreensaver(selectedValue);
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Script: инициализация приложения');

    // Получаем сохраненную заставку или используем значение по умолчанию
    const savedScreensaver = localStorage.getItem('selectedScreensaver') || 'linear-gradient';
    console.log('Script: сохраненная заставка:', savedScreensaver);

    // Устанавливаем значение в селекте
    screensaverSelect.value = savedScreensaver;
    console.log('Script: установлено значение в селекте:', savedScreensaver);

    // Показываем выбранную заставку (это также создаст динамические элементы управления)
    switchScreensaver(savedScreensaver);
});