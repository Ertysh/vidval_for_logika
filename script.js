const churnQuestions = [
    { title: "0. ОЧІКУВАНО/НЕОЧІКУВАНО", options: ["Очікувано", "Неочікувано (раптово)"] },
    { title: "1. Коментарі по студенту", options: ["Здібний, але втратив мотивацію", "Технічні проблеми/Пропуски", "Переоцінив свій час", "Зник зі зв'язку"] },
    { title: "2. Чи розумів учень, що він робить", options: ["Так, чітко розумів ціль", "Розумів частково", "Ні, не усвідомлював складність"] },
    { title: "3. Чи бачив результати (чи задоволений)", options: ["Так, був задоволений", "Результати здавалися малими", "Ні, не відчував прогресу"] },
    { title: "4. Зворотній зв’язок від вчителя", options: ["Отримував регулярно", "Отримував, але не реагував", "Мало контактував з вчителем"] },
    { title: "5. Які стосунки були з однокласниками", options: ["Активні/Дружні", "Нейтральні/Пасивні", "Був відсторонений"] },
    { title: "6. Чи розумів нащо ДЗ і чи робив", options: ["Розумів, робив стабільно", "Розумів, але не мав часу", "Не робив, вважав необов'язковим"] },
    { title: "7. Чи був вчитель авторитетом", options: ["Так, безумовно", "Скоріше так", "Ні/Дистанція"] },
    { title: "8. Висновок", options: ["Тимчасова пауза", "Повне припинення навчання", "Зміна групи/Формату"] },
    { title: "9. Подальші дії", options: ["Архівувати профіль", "Зв'язатися через місяць", "Запропонувати інший курс"] }
];

// Ініціалізація питань
const qArea = document.getElementById('dynamic-questions');
churnQuestions.forEach((q, idx) => {
    const div = document.createElement('div');
    div.className = 'q-block';
    div.innerHTML = `
        <label>${q.title}</label>
        <select class="q-select" data-title="${q.title}">
            ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            <option value="custom">-- Свій варіант --</option>
        </select>
        <input type="text" class="q-custom hidden" placeholder="Ваша відповідь...">
    `;
    qArea.appendChild(div);
});

// Логіка вибору курсу
document.querySelector('.course-card').addEventListener('click', async () => {
    const res = await fetch('python_start.json');
    const data = await res.json();
    const list = document.getElementById('lesson-container');
    list.innerHTML = '';
    
    data.forEach(mod => {
        let html = `<div class="module"><h2>${mod.moduleTitle}</h2><ul>`;
        mod.lessons.forEach(l => html += `<li class="lesson-item">${l.lessonTheme}</li>`);
        list.innerHTML += html + `</ul></div>`;
    });

    document.querySelectorAll('.lesson-item').forEach(li => {
        li.addEventListener('click', () => {
            document.getElementById('current-lesson').innerText = li.innerText;
            document.querySelectorAll('.lesson-item').forEach(i => i.classList.remove('active-lesson'));
            li.classList.add('active-lesson');
        });
    });
    document.getElementById('course-selector').classList.add('hidden');
});

// Обробка "Свого варіанту"
qArea.addEventListener('change', (e) => {
    if (e.target.classList.contains('q-select')) {
        const customInput = e.target.nextElementSibling;
        customInput.classList.toggle('hidden', e.target.value !== 'custom');
    }
});

// Генерація звіту
document.getElementById('generate_btn').addEventListener('click', () => {
    const name = document.getElementById('student_name').value || "Учень";
    const lesson = document.getElementById('current-lesson').innerText;
    let report = `🛑 ОБРОБКА ВІДВАЛУ\n👤 Учень: ${name}\n📖 Зупинився на: ${lesson}\n\n`;

    document.querySelectorAll('.q-select').forEach(select => {
        const title = select.dataset.title;
        let val = select.value;
        if (val === 'custom') val = select.nextElementSibling.value || "---";
        report += `**${title}**\n${val}\n\n`;
    });

    document.getElementById('result-text').innerText = report;
});

// Копіювання
document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('result-text').innerText);
    alert("Звіт скопійовано!");
});