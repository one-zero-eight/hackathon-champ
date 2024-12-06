def calculate_tea(total_tables, correct_tables):
    """
    Рассчитывает точность извлечения таблиц (TEA).

    :param total_tables: Общее количество таблиц, определённых вручную.
    :param correct_tables: Количество таблиц, корректно извлечённых алгоритмом.
    :return: Точность извлечения таблиц в процентах.
    """
    if total_tables == 0:
        return 0.0  # Нельзя делить на ноль

    tea = (correct_tables / total_tables) * 100
    return round(tea, 2)


def main():
    print("=== Расчёт точности извлечения таблиц ===")

    try:
        # Ввод вручную общего числа таблиц
        total_tables = int(
            input("Введите общее количество таблиц (определённых вручную): ")
        )

        # Ввод вручную числа корректно извлечённых таблиц
        correct_tables = int(
            input("Введите количество таблиц, корректно извлечённых алгоритмом: ")
        )

        # Проверка данных
        if correct_tables > total_tables:
            print(
                "Ошибка: количество корректных таблиц не может превышать общее количество!"
            )
            return

        # Расчёт метрики
        tea = calculate_tea(total_tables, correct_tables)
        print(f"Точность извлечения таблиц (TEA): {tea}%")

    except ValueError:
        print("Ошибка ввода: введите числовое значение.")


if __name__ == "__main__":
    main()
