# Обработка PDF для получения событий

Этот проект состоит из трёх этапов:

1. **Извлечение и парсинг данных о событиях из PDF-документа.**
2. **Трансформация и экспорт структурированных данных о событиях в формате JSON.**
3. **Оценка точности извлечения таблиц (TEA)**

Скрипты предназначены для обработки PDF-файлов, содержащих данные о событиях (например, спортивных), извлечения таблиц и
атрибутов, формирования финальных данных в формате JSON и оценки качества извлечения таблиц.

> [!IMPORTANT]
> Точность извлечения таблиц (TEA): 99.34%
> 
> Обработано 2500 страниц за 6 минут
> 
> Извлечена информация о 14000 событиях в 152 видах спорта

![image](https://github.com/user-attachments/assets/3c133607-0b72-4c34-9f74-93942c97a7fc)

![image](https://github.com/user-attachments/assets/ec7fd15b-8a90-4580-859d-1e4ea663668d)

![image](https://github.com/user-attachments/assets/fb0b8b46-e557-4878-8113-2c8add262b96)

---

## Этап 1: Обработка PDF

### Описание

Скрипт `stage_1_pdf_processing.py` извлекает таблицы и метки из PDF-файла. Он определяет секции, такие как названия
мероприятий и количество участников, и парсит таблицы, используя информацию о координатах.

**### Возможности**

- **Якоря**: Определяет ключевые метки и секции текста, такие как "Наименование", "Основной состав" и "Молодежный (
  резервный) состав".
- **Извлечение таблиц**: Получает табличные данные, связанные с деталями событий.
- **Режим отладки**: Аннотирует и визуализирует координаты и извлеченные таблицы для отладки.
- **Форматы вывода**:
    - CSV: `label_locations.csv` и `postprocessed_label_locations.csv`.
    - PDF: Отладочный выходной файл с аннотациями (`debugged_output.pdf`).

### Использование

1. Загрузите PDF-файл
   по [ссылке](https://storage.minsport.gov.ru/cms-uploads/cms/II_chast_EKP_2024_14_11_24_65c6deea36.pdf).
   Он взят с [сайта Министерства спорта Российской Федерации](https://minsport.gov.ru/).
2. Установите необходимые зависимости:
   ```bash
   pip install pandas pdfplumber pypdf tqdm six pydantic pyyaml
   ```
3. Запустите скрипт в режиме отладки:
   ```bash
   python stage_1_pdf_processing.py <путь_к_PDF> --debug
   ```

4. Результаты:
    - Промежуточные CSV-файлы с данными о метках и таблицах.
    - `events.csv` с извлечёнными данными таблиц.
    - Отладочный файл `debugged_output.pdf` для ручной проверки таблиц.

---

## Этап 2: Экспорт в JSON

### Описание

Скрипт `stage_2_extract_attributes.py` преобразует извлечённые данные о событиях (`events.csv`) в формат JSON.
Он выполняет проверку и обогащение данных, включая:

- Парсинг и преобразование диапазонов дат.
- Очистку и форматирование количества участников и мест проведения.
- Извлечение структурированных атрибутов, таких как возрастные группы, пол и дисциплины, с использованием заранее
  заданных правил.

### Использование

1. Установите необходимые зависимости:
   ```bash
   pip install pandas
   ```

2. Запустите скрипт:
   ```bash
   python stage_2_extract_attributes.py
   ```

3. Результаты:
    - `events.json`: JSON-файл со структурированными данными о событиях.

---

## Этап 3: Метрики

### Описание

Скрипт `stage_3_eval.py` рассчитывает метрику точности извлечения таблиц (TEA). Она показывает процент корректно
извлечённых таблиц относительно общего количества таблиц, определённых вручную.

**### Возможности**

- Подсчёт общего количества таблиц в отладочном файле `debugged_output.pdf`.
- Подсчёт корректно извлечённых таблиц путём сравнения данных.
- Проверка корректности вводимых данных.
- Расчёт TEA в процентах.

### Использование

1. Запустите скрипт:
   ```bash
   python stage_3_eval.py
   ```

2. Введите следующие данные:
    - Общее количество таблиц (для каждого вида спорта должно быть по одной таблице): 152.
    - Количество таблиц, корректно извлечённых алгоритмом.

3. Скрипт проверит ввод и рассчитает TEA:
   ```
   Точность извлечения таблиц (TEA): <значение>%.
   ```

---

### Заметки по этапу 3:

Для выполнения этого этапа необходимо вручную подсчитать общее количество таблиц и количество корректно извлечённых
таблиц на основе аннотаций в `debugged_output.pdf`.