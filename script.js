/**
 * Твій уточнений список із 10 питань для аналізу відвалу
 */
const churnQuestions = [
    { title: "0. ОЧІКУВАНО/НЕОЧІКУВАНО", options: ["Очікувано", "Неочікувано (раптово)"], placeholder: "Які сигнали вказували на це раніше?" },
    { title: "1. Коментарі по студенту", options: ["Здібний, але згас", "Технічні труднощі", "Проблеми з графіком", "Втрата контакту"], placeholder: "Загальний опис ситуації..." },
    { title: "2. Чи розумів учень, що він робить і для чого", options: ["Так, чітко", "Розумів частково", "Ні, не усвідомлював складність"], placeholder: "Маркери: чи міг пояснити мету завдання? Чи ставив уточнюючі питання?" },
    { title: "3. Чи бачив учень свої результати (задоволений ними)", options: ["Так, пишався проєктами", "Результати здавалися йому малими", "Ні, знецінював себе"], placeholder: "Звідки це відомо? Його слова або реакція на завершені роботи?" },
    { title: "4. Чи отримував зворотній зв’язок від вчителя", options: ["Регулярно", "Отримував, але ігнорував", "Мало контактував"], placeholder: "Як саме надавався фідбек і як учень на нього реагував?" },
    { title: "5. Які стосунки були з однокласниками", options: ["Активні/Дружні", "Нейтральні/Пасивні", "Був відсторонений"], placeholder: "Чи була взаємодія в групі/чаті? Докази?" },
    { title: "6. Чи розумів для чого домашня практика і чи робив", options: ["Розумів, робив стабільно", "Розумів, але не мав часу", "Не робив / Вважав необов'язковим"], placeholder: "Якість виконання ДЗ та ставлення до правок?" },
    { title: "7. Чи був вчитель для учня авторитетом", options: ["Так, безумовно", "Скоріше так", "Ні / Була дистанція"], placeholder: "Маркери: чи дослухався до порад? Чи сприймав критику?" },
    { title: "8. Висновок", options: ["Тимчасова пауза", "Повне припинення", "Зміна напрямку/групи"], placeholder: "Твій підсумковий аналіз: чому саме стався відвал?" },
    { title: "9. Подальші дії", options: ["Архівувати", "Зв'язатися через місяць", "Передати менеджеру"], placeholder: "Що саме ти плануєш зробити далі?" }
];

/**
 * ГЕНЕРАЦІЯ ПИТАНЬ ПРИ ЗАВАНТАЖЕННІ
 */
window.addEventListener('load', () => {
    const qArea = document.getElementById('dynamic-questions');
    if (!qArea) return;

    qArea.innerHTML = '';
    churnQuestions.forEach((q, idx) => {
        const div = document.createElement('div');
        div.className = 'q-block'; // Чітка біла картка з твого CSS
        div.innerHTML = `
            <label>${q.title}</label>
            <select class="q-select" data-title="${q.title}">
                ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                <option value="custom">-- Свій варіант --</option>
            </select>
            <input type="text" class="q-custom hidden" placeholder="Ваша версія...">
            <textarea class="q-evidence" placeholder="${q.placeholder}"></textarea>
        `;
        qArea.appendChild(div);
    });

    // Обробка "Свого варіанту"
    qArea.addEventListener('change', (e) => {
        if (e.target.classList.contains('q-select')) {
            const customInput = e.target.nextElementSibling;
            if (customInput && customInput.classList.contains('q-custom')) {
                customInput.classList.toggle('hidden', e.target.value !== 'custom');
            }
        }
    });
});

/**
 * ЛОГІКА ВИБОРУ КУРСУ
 */
document.querySelector('.course-card')?.addEventListener('click', async () => {
    try {
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
    } catch (e) { console.error("Помилка JSON"); }
});

/**
 * ГЕНЕРАЦІЯ ЗВІТУ
 */
document.getElementById('generate_btn')?.addEventListener('click', () => {
    const name = document.getElementById('student_name').value || "Учень";
    const lesson = document.getElementById('current-lesson').innerText;
    let report = `🛑 ОБРОБКА ВІДВАЛУ\n👤 Учень: ${name}\n📖 Урок: ${lesson}\n\n`;

    document.querySelectorAll('.q-block').forEach(block => {
        const title = block.querySelector('label').innerText;
        const select = block.querySelector('.q-select');
        let val = select.value;
        if (val === 'custom') val = select.nextElementSibling.value || "---";
        
        const evidence = block.querySelector('.q-evidence').value || "Маркери не вказані";
        report += `📍 ${title}\n📊 Статус: ${val}\n📝 Докази/Маркери: ${evidence}\n\n`;
    });

    document.getElementById('result-text').innerText = report;
});

/**
 * КОПІЮВАННЯ
 */
document.getElementById('copy-btn')?.addEventListener('click', () => {
    const text = document.getElementById('result-text').innerText;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copy-btn');
        const oldText = btn.innerText;
        btn.innerText = "✅ СКОПІЙОВАНО!";
        setTimeout(() => btn.innerText = oldText, 2000);
    });
});




