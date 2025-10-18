// Анимация градиента - изменение угла от 0 до 360 градусов
let gradientAngle = 0;
const gradientElement = document.querySelector('.gradient-background');

function animateGradient() {
    gradientAngle = (gradientAngle + 1) % 360; // Увеличиваем угол на 1 градус, сбрасываем на 0 после 360
    gradientElement.style.setProperty('--gradient-angle', gradientAngle + 'deg');
}

// Запускаем анимацию каждые 50ms для плавного изменения
setInterval(animateGradient, 50);
