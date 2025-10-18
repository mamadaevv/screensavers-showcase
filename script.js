// Получаем элементы
const openDrawerBtn = document.getElementById('open-drawer-btn');
const drawer = document.querySelector('.drawer-placement-start');

// Обработчик клика для открытия drawer
openDrawerBtn.addEventListener('click', () => {
    drawer.show();
});

// Обработчик события закрытия drawer (опционально)
drawer.addEventListener('sl-after-hide', () => {
    console.log('Drawer закрыт');
});
