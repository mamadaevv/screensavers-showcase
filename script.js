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

// Функция переключения заставок
function switchScreensaver(type) {
    const container = document.getElementById('screensaver-container');

    // Очищаем контейнер
    container.innerHTML = '';

    // Создаем новый компонент
    let component;
    switch (type) {
        case 'linear-gradient':
            component = document.createElement('linear-gradient-screensaver');
            break;
        case 'conic-gradient':
            component = document.createElement('conic-gradient-screensaver');
            break;
        default:
            console.error('Неизвестный тип заставки:', type);
            return;
    }

    // Добавляем компонент в контейнер
    container.appendChild(component);

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
    // Получаем сохраненную заставку или используем значение по умолчанию
    const savedScreensaver = localStorage.getItem('selectedScreensaver') || 'linear-gradient';

    // Устанавливаем значение в селекте
    screensaverSelect.value = savedScreensaver;

    // Показываем выбранную заставку
    switchScreensaver(savedScreensaver);
});