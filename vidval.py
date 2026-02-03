import tkinter as tk
from tkinter import ttk, messagebox
import datetime

# --- КОНФІГУРАЦІЯ СТИЛЮ ---
BG_MAIN = "#FFDE59"       # Яскравий жовтий
PURPLE_DARK = "#4B0082"   # Глибокий фіолетовий
PURPLE_LIGHT = "#6A0DAD"  # Світліший фіолетовий
WHITE = "#FFFFFF"
TEXT_COLOR = "#2D2D2D"

class SmartApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Smart Report System 2.0")
        self.root.geometry("1000x850")
        self.root.configure(bg=BG_MAIN)
        
        self.data_map = {
            "0. Очікувано / Неочікувано": ["Очікувано", "Неочікувано (раптовий відвал)"],
            "1. Коментарі по студенту": ["Здібний, але втратив мотивацію", "Технічні причини", "Брак вільного часу", "Зник зі зв'язку"],
            "2. Розуміння мети": ["Так, чітко розумів", "Частково", "Ні, не усвідомлював"],
            "3. Сприйняття результату": ["Задоволений прогресом", "Суб'єктивно мало результатів", "Не відчував прогресу"],
            "4. Зворотній зв'язок": ["Регулярно отримував", "Отримував, але ігнорував", "Мало контактував"],
            "5. Стосунки в групі": ["Активний", "Нейтральний", "Відсторонений"],
            "6. Домашня практика": ["Виконував стабільно", "Ігнорував через час", "Вважав необов'язковим"],
            "7. Авторитет вчителя": ["Так, безумовний", "Скоріше так", "Дистанція / Немає авторитету"],
            "8. Висновок": ["Тимчасова пауза", "Повне припинення", "Зміна групи"],
            "9. Подальші дії": ["Архівувати", "Зв'язатися через місяць", "Повернення коштів / Інший курс"]
        }
        
        self.entries = {}
        self.setup_styles()
        self.setup_ui()

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use('clam')

        style.configure("Vertical.TScrollbar", 
                        gripcount=0,
                        background=PURPLE_LIGHT, 
                        darkcolor=PURPLE_DARK, 
                        lightcolor=PURPLE_LIGHT, 
                        troughcolor=BG_MAIN, 
                        bordercolor=BG_MAIN, 
                        arrowcolor=WHITE,
                        width=14)
        
        style.configure("TCombobox", fieldbackground=WHITE, background=PURPLE_LIGHT)

    def setup_ui(self):
        header = tk.Label(self.root, text="🟣 SMART REPORT GENERATOR", font=("Verdana", 20, "bold"), 
                         bg=BG_MAIN, fg=PURPLE_DARK, pady=20)
        header.pack()

        main_frame = tk.Frame(self.root, bg=BG_MAIN)
        main_frame.pack(fill="both", expand=True, padx=30, pady=10)

        # ЛІВА ПАНЕЛЬ
        left_panel = tk.Frame(main_frame, bg=BG_MAIN)
        left_panel.pack(side="left", fill="both", expand=True)

        # ПОЛЕ ДЛЯ ІМЕНІ (над скролом)
        name_frame = tk.Frame(left_panel, bg=BG_MAIN, pady=10)
        name_frame.pack(fill="x", padx=(10, 40))
        
        tk.Label(name_frame, text="👤 ПІБ СТУДЕНТА:", bg=BG_MAIN, font=("Verdana", 11, "bold"), fg=PURPLE_DARK).pack(anchor="w")
        self.student_name = tk.Entry(name_frame, font=("Verdana", 12), bg=WHITE, fg=TEXT_COLOR, relief="flat", insertbackground=PURPLE_DARK)
        self.student_name.pack(fill="x", pady=5, ipady=8)
        
        # Контейнер для питань зі скролом
        canvas_container = tk.Frame(left_panel, bg=BG_MAIN)
        canvas_container.pack(fill="both", expand=True)

        self.canvas = tk.Canvas(canvas_container, bg=BG_MAIN, highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(canvas_container, orient="vertical", command=self.canvas.yview, style="Vertical.TScrollbar")
        self.scroll_frame = tk.Frame(self.canvas, bg=BG_MAIN)

        self.scroll_frame.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))
        self.canvas_window = self.canvas.create_window((0, 0), window=self.scroll_frame, anchor="nw")
        
        self.canvas.bind('<Configure>', self._on_canvas_configure)
        self.canvas.configure(yscrollcommand=self.scrollbar.set)

        for question, options in self.data_map.items():
            container = tk.Frame(self.scroll_frame, bg=BG_MAIN, pady=10)
            container.pack(fill="x", padx=(10, 25))
            
            lbl = tk.Label(container, text=question, bg=BG_MAIN, font=("Verdana", 10, "bold"), 
                          fg=PURPLE_DARK, anchor="w")
            lbl.pack(fill="x")
            
            combo = ttk.Combobox(container, values=options, font=("Verdana", 11), state="normal")
            combo.pack(pady=(5, 5), ipady=5, fill="x")
            self.entries[question] = combo

        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y", padx=(5, 0))

        # ПРАВА ПАНЕЛЬ (ПРЕВ'Ю)
        right_panel = tk.Frame(main_frame, bg=WHITE, bd=0)
        right_panel.pack(side="right", fill="both", expand=True, padx=(40, 0))
        
        tk.Label(right_panel, text="ПОПЕРЕДНІЙ ПЕРЕГЛЯД", bg=PURPLE_DARK, fg=WHITE, 
                 font=("Verdana", 10, "bold"), pady=10).pack(fill="x")

        self.output_text = tk.Text(right_panel, font=("Consolas", 11), bg="#F8F9FA", 
                                  fg=TEXT_COLOR, state=tk.DISABLED, padx=20, pady=20, relief="flat")
        self.output_text.pack(fill="both", expand=True)

        # КНОПКИ
        btn_frame = tk.Frame(right_panel, bg=WHITE, pady=20)
        btn_frame.pack(fill="x")

        self.create_button(btn_frame, "ГЕНЕРУВАТИ", self.generate_report, PURPLE_LIGHT).pack(side="left", padx=5, expand=True, fill="x")
        self.create_button(btn_frame, "КОПІЮВАТИ", self.copy_to_clipboard, "#28a745").pack(side="left", padx=5, expand=True, fill="x")
        self.create_button(btn_frame, "ОЧИСТИТИ", self.clear_all, "#dc3545").pack(side="left", padx=5, expand=True, fill="x")

    def _on_canvas_configure(self, event):
        self.canvas.itemconfig(self.canvas_window, width=event.width)

    def create_button(self, parent, text, command, color):
        return tk.Button(parent, text=text, command=command, bg=color, fg=WHITE, 
                        font=("Verdana", 9, "bold"), relief="flat", cursor="hand2",
                        activebackground=PURPLE_DARK, activeforeground=WHITE, padx=10, pady=10)

    def generate_report(self):
        name = self.student_name.get().strip() or "Не вказано"
        report = f"🟣 ОБРОБКА ВІДВАЛУ | {datetime.date.today()}\n"
        report += f"👤 СТУДЕНТ: {name}\n"
        report += "━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        
        for q, combo in self.entries.items():
            val = combo.get().strip() or "Не вказано"
            report += f"📍 {q.upper()}\n   {val}\n\n"
        
        self.output_text.config(state=tk.NORMAL)
        self.output_text.delete(1.0, tk.END)
        self.output_text.insert(tk.END, report)
        self.output_text.config(state=tk.DISABLED)

    def copy_to_clipboard(self):
        content = self.output_text.get(1.0, tk.END).strip()
        if content:
            self.root.clipboard_clear()
            self.root.clipboard_append(content)
            messagebox.showinfo("Успіх", "Звіт у буфері! 🚀")

    def clear_all(self):
        if messagebox.askyesno("Очищення", "Очистити всі поля?"):
            self.student_name.delete(0, tk.END)
            for combo in self.entries.values():
                combo.set('')
            self.output_text.config(state=tk.NORMAL)
            self.output_text.delete(1.0, tk.END)
            self.output_text.config(state=tk.DISABLED)

if __name__ == "__main__":
    root = tk.Tk()
    app = SmartApp(root)
    root.mainloop()