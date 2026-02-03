// 1. Список питань для обробки відвалу з варіантами відповідей
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

// 2. Генерація полів форми при завантаженні сторінки
const qArea = document.getElementById('dynamic-questions');

if (qArea) {
    churnQuestions.forEach((q) => {
        const div = document.createElement('div');
        div.style.marginBottom = "15px";
        div.innerHTML = `
            <label style="display:block; font-size:12px; font-weight:bold; color:#555; margin-bottom:5px;">${q.title}</label>
            <select class="q-select" data-title="${q.title}" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                <option value="custom">-- Свій варіант --</option>
            </select>
            <input type="text" class="q-custom" style="width:100%; margin-top:5px; padding:10px; border-radius:8px; border:1px solid #ddd; display:none;" placeholder="Введіть ваш текст...">
        `;
        qArea.appendChild(div);
    });
}

// 3. Обробка вибору курсу (клік по картці "Python Start")
document.querySelector('.course-card').addEventListener('click', async () => {
    try {
        console.log("Спроба завантажити файл python_start.json...");
        
        // Завантажуємо дані про 7 модулів та 40 уроків
        const res = await fetch('python_start.json');
        
        if (!res.ok) {
            throw new Error(`Файл не знайдено (код ${res.status}). Перевір назву файлу на GitHub.`);
        }
        
        const data = await res.json();
        const listContainer = document.getElementById('lesson-container');
        listContainer.innerHTML = '';
        
        // Рендеримо модулі та уроки
        data.forEach(mod => {
            let moduleHtml = `
                <div class="module" style="margin-bottom:20px;">
                    <h2 style="font-size:15px; color:#5e35b1; border-bottom:1px solid #eee; padding-bottom:5px;">${mod.moduleTitle}</h2>
                    <ul style="list-style:none; padding:0;">
            `;
            
            mod.lessons.forEach(lesson => {
                moduleHtml += `<li class="lesson-item" style="padding:8px; cursor:pointer; font-size:13px; border-bottom:1px solid #f9f9f9;">${lesson.lessonTheme}</li>`;
            });
            
            moduleHtml += `</ul></div>`;
            listContainer.insertAdjacentHTML('beforeend', moduleHtml);
        });

        // Додаємо подію кліку на кожен урок
        document.querySelectorAll('.lesson-item').forEach(li => {
            li.addEventListener('click', () => {
                document.getElementById('current-lesson').innerText = li.innerText;
                // Виділення обраного уроку
                document.querySelectorAll('.lesson-item').forEach(el => el.style.background = "none");
                li.style.background = "#ede7f6";
                li.style.borderRadius = "5px";
            });
        });

        // Ховаємо оверлей вибору напрямку
        document.getElementById('course-selector').style.display = 'none';
        console.log("Дані успішно завантажені!");

    } catch (error) {
        alert("Помилка: " + error.message);
        console.error("Деталі помилки:", error);
    }
});

// 4. Логіка для "Свого варіанту" в анкетах
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('q-select')) {
        const customInput = e.target.nextElementSibling;
        if (customInput && customInput.classList.contains('q-custom')) {
            customInput.style.display = (e.target.value === 'custom') ? 'block' : 'none';
        }
    }
});

// 5. Генерація фінального звіту
document.getElementById('generate_btn').addEventListener('click', () => {
    const studentName = document.getElementById('student_name').value || "Не вказано";
    const lessonName = document.getElementById('current-lesson').innerText;
    
    let resultText = `🛑 ОБРОБКА ВІДВАЛУ\n`;
    resultText += `👤 Учень: ${studentName}\n`;
    resultText += `📖 Зупинився на темі: ${lessonName}\n`;
    resultText += `---------------------------\n\n`;

    document.querySelectorAll('.q-select').forEach(select => {
        const title = select.dataset.title;
        let answer = select.value;
        
        if (answer === 'custom') {
            answer = select.nextElementSibling.value || "---";
        }
        
        resultText += `**${title}**\n${answer}\n\n`;
    });

    document.getElementById('result-text').innerText = resultText;
});

// 6. Копіювання в буфер обміну
document.getElementById('copy-btn').addEventListener('click', () => {
    const text = document.getElementById('result-text').innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Звіт скопійовано!");
    });
});
