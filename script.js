// 1. Повний список з 10 питань для обробки відвалу
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

// 2. Функція, яка малює питання на екрані
function initQuestions() {
    const qWrapper = document.getElementById('questions-wrapper');
    if (!qWrapper) return;
    
    qWrapper.innerHTML = ''; // Очищуємо перед малюванням
    
    churnQuestions.forEach((q) => {
        const div = document.createElement('div');
        div.style.marginBottom = "12px";
        div.innerHTML = `
            <label style="display:block; font-size:11px; font-weight:bold; color:#666; margin-bottom:4px;">${q.title}</label>
            <select class="otval-input" data-q="${q.title}" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ddd;">
                ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                <option value="custom">-- Свій варіант --</option>
            </select>
            <input type="text" class="custom-input" style="width:100%; margin-top:5px; padding:8px; border-radius:8px; border:1px solid #ddd; display:none;" placeholder="Ваш варіант...">
        `;
        qWrapper.appendChild(div);
    });
}

// Запускаємо малювання питань одразу
initQuestions();

// 3. Завантаження всіх 7 модулів з JSON
document.querySelector('.course-card').addEventListener('click', async () => {
    try {
        const res = await fetch('python_start.json');
        if (!res.ok) throw new Error("Файл JSON не знайдено");
        
        const data = await res.json();
        const container = document.getElementById('lesson-container');
        container.innerHTML = '';

        data.forEach(mod => {
            let html = `<div class="module"><h2 style="font-size:14px; color:#5e35b1;">${mod.moduleTitle}</h2><ul style="padding:0; list-style:none;">`;
            mod.lessons.forEach(l => {
                html += `<li class="lesson-item" style="padding:8px; cursor:pointer; font-size:13px; border-bottom:1px solid #f0f0f0;">${l.lessonTheme}</li>`;
            });
            container.innerHTML += html + '</ul></div>';
        });

        // Клік на урок
        document.querySelectorAll('.lesson-item').forEach(li => {
            li.addEventListener('click', () => {
                document.getElementById('current-lesson').innerText = li.innerText;
                document.querySelectorAll('.lesson-item').forEach(i => i.style.background = "none");
                li.style.background = "#f0e6ff";
            });
        });

        document.getElementById('course-selector').classList.add('hidden');
    } catch (e) {
        alert("Помилка завантаження уроків: " + e.message);
    }
});

// 4. Обробка "Свого варіанту"
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('otval-input')) {
        const customField = e.target.nextElementSibling;
        customField.style.display = (e.target.value === 'custom') ? 'block' : 'none';
    }
});

// 5. Генерація звіту
document.getElementById('generate_btn').addEventListener('click', () => {
    const name = document.getElementById('student_name').value || "Учень";
    const lesson = document.getElementById('current-lesson').innerText;
    let report = `🛑 ОБРОБКА ВІДВАЛУ\n👤 Учень: ${name}\n📖 Урок: ${lesson}\n---------------------------\n\n`;

    document.querySelectorAll('.otval-input').forEach(select => {
        let val = select.value;
        if (val === 'custom') val = select.nextElementSibling.value || "Не вказано";
        report += `**${select.dataset.q}**\n${val}\n\n`;
    });

    document.getElementById('result-text').innerText = report;
});

// 6. Копіювання
document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('result-text').innerText);
    alert("Скопійовано!");
});

