/**
 * МАСИВ ПИТАНЬ ДЛЯ АНАЛІЗУ ВІДВАЛУ
 * Кожне питання містить варіанти вибору та підказку для розгорнутої відповіді (доказу)
 */
const churnQuestions = [
    { 
        title: "1. Успіхи учня у навчанні", 
        placeholder: "Які маркери (виконані ДЗ, активність на уроці, самостійні рішення) підтверджують успіх або його відсутність?",
        options: ["Високі: все виходить", "Середні: потребує постійної допомоги", "Низькі: матеріал не засвоєно зовсім"] 
    },
    { 
        title: "2. Чи бачить учень результати?", 
        placeholder: "Звідки ти це знаєш? (Його прямі слова, завершені проєкти, реакція на свої помилки чи успіхи)",
        options: ["Так, пишається роботами", "Частково помічає прогрес", "Ні, знецінює результати/не бачить сенсу"] 
    },
    { 
        title: "3. Мотивація та залученість", 
        placeholder: "Опишіть поведінку: чи став менше вмикати камеру, чи запізнюється, чи змінився тон спілкування?",
        options: ["Стабільна", "Різко впала на останніх заняттях", "Поступове згасання протягом модуля"] 
    },
    { 
        title: "4. Вчитель як авторитет та контакт з групою", 
        placeholder: "Чи звертається за порадою? Як взаємодіє з іншими (лідер, аутсайдер чи відсторонений)?",
        options: ["Активна взаємодія", "Суто формальний контакт", "Повна ізоляція/ігнорування"] 
    },
    { 
        title: "5. Висновок та прогноз вчителя", 
        placeholder: "Які маркери поведінки вказують на те, що він повернеться (або ні)? Твій професійний прогноз.",
        options: ["Тимчасова пауза (повернеться)", "Йде назавжди", "Потрібна термінова зміна групи або курсу"] 
    }
];

/**
 * ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ СТОРІНКИ
 */
window.addEventListener('load', () => {
    const qArea = document.getElementById('dynamic-questions');
    if (!qArea) return;

    // Очищуємо контейнер і генеруємо нові преміум-картки питань
    qArea.innerHTML = '';
    churnQuestions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'q-block premium-card';
        card.innerHTML = `
            <div class="q-header">
                <span class="q-number">${idx + 1}</span>
                <label>${q.title}</label>
            </div>
            <select class="q-select" data-title="${q.title}">
                ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                <option value="custom">-- Свій варіант статусу --</option>
            </select>
            <input type="text" class="q-custom hidden" placeholder="Вкажіть свій статус...">
            <textarea class="q-evidence" placeholder="${q.placeholder}"></textarea>
        `;
        qArea.appendChild(card);
    });

    // Логіка показу поля "Свій варіант" для селектів
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
 * ЛОГІКА ВИБОРУ КУРСУ ТА ЗАВАНТАЖЕННЯ УРОКІВ
 */
document.querySelector('.course-card')?.addEventListener('click', async () => {
    try {
        const res = await fetch('python_start.json');
        if (!res.ok) throw new Error('Файл не знайдено');
        
        const data = await res.json();
        const list = document.getElementById('lesson-container');
        if (!list) return;

        list.innerHTML = ''; // Очищуємо список
        
        data.forEach(mod => {
            const moduleDiv = document.createElement('div');
            moduleDiv.className = 'module';
            moduleDiv.innerHTML = `<h2>${mod.moduleTitle}</h2>`;
            
            const ul = document.createElement('ul');
            mod.lessons.forEach(l => {
                const li = document.createElement('li');
                li.className = 'lesson-item';
                li.innerText = l.lessonTheme;
                li.addEventListener('click', () => {
                    // Оновлюємо заголовок поточного уроку
                    document.getElementById('current-lesson').innerText = l.lessonTheme;
                    // Підсвітка активного елемента
                    document.querySelectorAll('.lesson-item').forEach(i => i.classList.remove('active-lesson'));
                    li.classList.add('active-lesson');
                });
                ul.appendChild(li);
            });
            
            moduleDiv.appendChild(ul);
            list.appendChild(moduleDiv);
        });

        // Ховаємо оверлей вибору курсу
        document.getElementById('course-selector').classList.add('hidden');
    } catch (err) {
        console.error(err);
        alert("Помилка завантаження даних курсу. Переконайтеся, що python_start.json у тій же папці.");
    }
});

/**
 * ГЕНЕРАЦІЯ ПІДСУМКОВОГО ЗВІТУ
 */
document.getElementById('generate_btn')?.addEventListener('click', () => {
    const studentName = document.getElementById('student_name').value.trim() || "Не вказано";
    const lessonName = document.getElementById('current-lesson').innerText;
    const date = new Date().toLocaleDateString('uk-UA');

    let report = `🛑 ЗВІТ ПО ОБРОБЦІ ВІДВАЛУ\n`;
    report += `📅 Дата: ${date}\n`;
    report += `👤 Учень: ${studentName}\n`;
    report += `📖 Зупинився на: ${lessonName}\n`;
    report += `\n${'━'.repeat(25)}\n\n`;

    // Збираємо дані з кожної картки питання
    document.querySelectorAll('.q-block').forEach((block) => {
        const title = block.querySelector('label').innerText;
        const select = block.querySelector('.q-select');
        const customInput = block.querySelector('.q-custom');
        const evidence = block.querySelector('.q-evidence').value.trim();

        let status = select.value;
        if (status === 'custom') {
            status = customInput.value || "Власний варіант не заповнено";
        }

        report += `📍 ${title}\n`;
        report += `📊 Статус: ${status}\n`;
        report += `📝 Докази/Маркери: ${evidence || "Докази не надані (вимагає уточнення!)"}\n\n`;
    });

    report += `${'━'.repeat(25)}\n`;
    report += `💡 Звіт згенеровано автоматично.`;

    // Виводимо в блок результату
    const resultArea = document.getElementById('result-text');
    if (resultArea) {
        resultArea.innerText = report;
        // Прокручуємо до звіту на мобільних пристроях
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }
});

/**
 * КОПІЮВАННЯ В БУФЕР ОБМІНУ
 */
document.getElementById('copy-btn')?.addEventListener('click', () => {
    const text = document.getElementById('result-text').innerText;
    
    if (text.includes("Готовий звіт")) {
        alert("Спочатку згенеруйте звіт!");
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copy-btn');
        const originalText = btn.innerText;
        btn.innerText = "✅ СКОПІЙОВАНО!";
        btn.style.background = "#22c55e";
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = ""; // Повертаємо колір з CSS
        }, 2000);
    }).catch(err => {
        alert("Не вдалося скопіювати. Спробуйте виділити текст вручну.");
    });
});



