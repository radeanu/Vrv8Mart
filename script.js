document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы DOM
    const submitBtn = document.getElementById('submit-btn');
    const resultsDiv = document.getElementById('results');
    const activitiesList = document.getElementById('activities-list');
    
    // Обработчик события для кнопки "Повелеваю"
    submitBtn.addEventListener('click', function() {
        // Получаем все выбранные чекбоксы
        const selectedActivities = [];
        
        // Получаем выбранные элементы для каждого времени суток
        const morningActivities = document.querySelectorAll('input[name="morning"]:checked');
        const dayActivities = document.querySelectorAll('input[name="day"]:checked');
        const eveningActivities = document.querySelectorAll('input[name="evening"]:checked');
        
        // Добавляем выбранные активности в массив
        morningActivities.forEach(activity => {
            selectedActivities.push(activity.value);
        });
        
        dayActivities.forEach(activity => {
            selectedActivities.push(activity.value);
        });
        
        eveningActivities.forEach(activity => {
            selectedActivities.push(activity.value);
        });
        
        // Сохраняем результат в localStorage в виде JSON
        localStorage.setItem('selectedActivities', JSON.stringify(selectedActivities));
        
        // Отображаем результаты на странице
        displayResults(selectedActivities);
    });
    
    // Функция отображения результатов
    function displayResults(activities) {
        // Очищаем предыдущие результаты
        activitiesList.innerHTML = '';
        
        // Если есть выбранные активности, добавляем их в список
        if (activities.length > 0) {
            activities.forEach(activity => {
                const listItem = document.createElement('li');
                listItem.textContent = activity;
                activitiesList.appendChild(listItem);
            });
            
            // Показываем блок с результатами
            resultsDiv.classList.remove('hidden');
            
            // Прокручиваем к результатам
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Если ничего не выбрано, показываем сообщение
            const listItem = document.createElement('li');
            listItem.textContent = 'Вы не выбрали ни одной активности';
            activitiesList.appendChild(listItem);
            
            resultsDiv.classList.remove('hidden');
        }
    }
    
    // Проверяем, есть ли сохраненные данные в localStorage при загрузке страницы
    const savedActivities = localStorage.getItem('selectedActivities');
    if (savedActivities) {
        const parsedActivities = JSON.parse(savedActivities);
        displayResults(parsedActivities);
        
        // Отмечаем соответствующие чекбоксы как выбранные
        parsedActivities.forEach(activity => {
            const checkbox = document.querySelector(`input[value="${activity}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
});