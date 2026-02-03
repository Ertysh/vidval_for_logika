/**
 * 1. СПИСОК ПИТАНЬ (БАЗА ДАНИХ АНАЛІТИКИ)
 * Кожне питання тепер вимагає не просто вибору, а й опису маркерів поведінки.
 */
const churnQuestions = [
    { 
        title: "1. Успіхи учня у навчанні", 
        placeholder: "Які конкретні маркери (виконані ДЗ, активність, самостійні рішення) підтверджують успіх або проблему?",
        options: ["Високі: все виходить", "Середні: потребує допомоги", "Низькі: матеріал не засвоєно"] 
    },
    { 
        title: "2. Чи бачить учень результати?", 
        placeholder: "Звідки ти це знаєш? Які докази? (Напр: радіє проєкту, каже що все зрозумів, або навпаки знецінює)",
        options: ["Так, пишається роботами", "Частково помічає", "Ні, не відчуває прогресу"] 
    },
    { 
        title: "3. Мотивація та залученість", 
        placeholder: "Як змінилася поведінка? (Напр: вимкнена камера, перестав відповідати на питання, запізнюється)",
        options: ["Стабільна", "Різко впала", "Поступово згасає"] 
    },
    { 
        title: "4. Коментар по стосунках (Вчитель/Група)", 
        placeholder: "Чи був контакт? Чи не став він відстороненим від групи або вчителя?",
        options: ["Дружні/Активні", "Суто формальні", "Контакт втрачено"] 
    },
    { 
        title: "5. Висновок та подальші дії", 
        placeholder: "Твій прогноз: чи повернеться учень і що для цього потрібно зробити?",
        options: ["Повернеться після паузи", "Повне припинення навчання", "Потрібна заміна групи/формату"] 
    }
];

/**
 * 2. ГЕНЕРАЦІЯ ІНТЕРФЕЙСУ ПИТАНЬ
 */
function initQuestions() {
    const qArea = document.getElementById('dynamic-questions');
    if (!qArea) return;

    qArea.innerHTML = ''; // Очищення
    churnQuestions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'q-block'; // Стилізується в CSS як окрема картка
        card.innerHTML = `
            <label>${q.title}</label>
            <select class="q-select" data-title="${q.title}">
                ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                <option value="custom">-- Свій варіант статусу --</option>
            </select>
            <input type="text" class="q-custom hidden" placeholder="Вкажіть свій статус...">
            <textarea class="q-evidence" placeholder="${q.placeholder}"></textarea>
        `;
        qArea.appendChild(card);
    });

    // Обробка показу поля "Свій варіант"
    qArea.addEventListener('change', (e) => {
        if (e.target.classList.contains('q-select')) {
            const customInput = e.target.nextElementSibling;
            if (customInput && customInput.classList.contains('q-custom')) {
                customInput.classList.toggle('hidden', e.target.value !== 'custom');
            }
        }
    });
}

/**
 * 3. ЛОГІКА ВИБОРУ КУРСУ ТА УРОКІВ
 */
const courseCard = document.querySelector('.course-card');
if (courseCard) {
    courseCard.addEventListener('click', async () => {
        try {
            const res = await fetch('python_start.json');
            if (!res.ok) throw new Error("Не вдалося завантажити JSON");
            
            const data = await res.json();
            const list = document.getElementById('lesson-container');
            if (!list) return;

            list.innerHTML = '';
            data.forEach(mod => {
                const modDiv = document.createElement('div');
                modDiv.className = 'module';
                modDiv.innerHTML = `<h2>${mod.moduleTitle}</h2>`;
                
                const ul = document.createElement('ul');
                mod.lessons.forEach(l => {
                    const li = document.createElement('li');
                    li.className = 'lesson-item';
                    li.innerText = l.lessonTheme;
                    li.addEventListener('click', () => {
                        document.getElementById('current-lesson').innerText = l.lessonTheme;
                        document.querySelectorAll('.lesson-item').forEach(i => i.classList.remove('active-lesson'));
                        li.classList.add('active-lesson');
                    });
                    ul.appendChild(li);
                });
                modDiv.appendChild(ul);
                list.appendChild(modDiv);
            });

            document.getElementById('course-selector').classList.add('hidden');
        } catch (err) {
            alert("Помилка: Переконайтеся, що файл python_start.json лежить у тій же папці, що й сайт.");
        }
    });
}

/**
 * 4. ГЕНЕРАЦІЯ ЗВІТУ
 */
document.getElementById('generate_btn')?.addEventListener('click', () => {
    const student = document.getElementById('student_name').value.trim() || "Учень не вказаний";
    const lesson = document.getElementById('current-lesson').innerText;
    const date = new Date().toLocaleDateString('uk-UA');

    let report = `🛑 ОБРОБКА ВІДВАЛУ (${date})\n`;
    report += `👤 Учень: ${student}\n`;
    report += `📖 Зупинився на: ${lesson}\n`;
    report += `\n${'━'.repeat(20)}\n\n`;

    document.querySelectorAll('.q-block').forEach(block => {
        const title = block.querySelector('label').innerText;
        const select = block.querySelector('.q-select');
        const customInput = block.querySelector('.q-custom');
        const evidence = block.querySelector('.q-evidence').value.trim();

        let status = select.value;
        if (status === 'custom') status = customInput.value || "Власний варіант";

        report += `📍 ${title}\n`;
        report += `📊 Статус: ${status}\n`;
        report += `📝 Докази/Маркери: ${evidence || "⚠️ ДОКАЗИ НЕ ВКАЗАНІ"}\n\n`;
    });

    const resultText = document.getElementById('result-text');
    if (resultText) {
        resultText.innerText = report;
        // Прокрутка до результату на мобільних пристроях
        resultText.scrollIntoView({ behavior: 'smooth' });
    }
});

/**
 * 5. КОПІЮВАННЯ В БУФЕР З ФІДБЕКОМ
 */
document.getElementById('copy-btn')?.addEventListener('click', () => {
    const resultText = document.getElementById('result-text');
    const text = resultText ? resultText.innerText : "";

    if (!text || text.includes("Готовий звіт")) {
        alert("Спочатку згенеруйте звіт!");
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.getElementById('copy-btn');
        const originalText = copyBtn.innerText;
        
        copyBtn.innerText = "✅ СКОПІЙОВАНО!";
        copyBtn.style.background = "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"; // Зелений колір
        
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.background = ""; // Повертаємо стиль з CSS
        }, 2000);
    });
});

// Запуск ініціалізації питань при завантаженні сторінки
window.addEventListener('DOMContentLoaded', initQuestions);




