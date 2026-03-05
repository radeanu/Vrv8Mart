(function () {
  const FORM_KEY = 'vrv8mart_choice';
  const form = document.getElementById('day-form');
  const resultSection = document.getElementById('result-section');
  const resultList = document.getElementById('result-list');

  /** Человекочитаемые названия занятий */
  const labels = {
    'breakfast-in-bed': 'Завтрак в постель',
    'morning-coffee': 'Утренний кофе вместе',
    'spa-morning': 'Спа-утро (маски, ванна)',
    'sleep-in': 'Спокойное пробуждение без будильника',
    'park-walk': 'Прогулка в парке',
    'cafe': 'Поход в кафе',
    'shopping': 'Шоппинг',
    'cinema': 'Кино',
    'masterclass': 'Мастер-класс',
    'photosession': 'Фотосессия',
    'romantic-dinner': 'Романтический ужин',
    'home-cinema': 'Домашний кинотеатр',
    'massage': 'Массаж',
    'restaurant': 'Ресторан',
    'concert': 'Концерт или театр'
  };

  function getSelected() {
    const data = { morning: [], day: [], evening: [] };
    form.querySelectorAll('input[type="checkbox"]:checked').forEach(function (input) {
      const name = input.getAttribute('name');
      if (data[name]) data[name].push(input.value);
    });
    return data;
  }

  function showResult(data) {
    const all = [
      ...data.morning.map(function (v) { return { period: 'Утро', value: v }; }),
      ...data.day.map(function (v) { return { period: 'День', value: v }; }),
      ...data.evening.map(function (v) { return { period: 'Вечер', value: v }; })
    ];
    resultList.innerHTML = '';
    all.forEach(function (item) {
      const li = document.createElement('li');
      li.textContent = labels[item.value] || item.value;
      resultList.appendChild(li);
    });
    resultSection.hidden = all.length === 0;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = getSelected();
    try {
      localStorage.setItem(FORM_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('localStorage error', err);
    }
    showResult(data);
    if (!resultSection.hidden) {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /** Восстановление выбора из localStorage при загрузке */
  try {
    const saved = localStorage.getItem(FORM_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      form.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
        const name = input.getAttribute('name');
        const value = input.value;
        if (data[name] && data[name].indexOf(value) !== -1) {
          input.checked = true;
        }
      });
      showResult(data);
    }
  } catch (err) {
    console.warn('Restore from localStorage failed', err);
  }
})();
