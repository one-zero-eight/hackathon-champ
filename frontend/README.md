# ФСП Линк

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Чемпионат России](https://img.shields.io/badge/Чемпионат%20России-2023-red.svg)](https://example.com)

ФСП Линк - это универсальная платформа для организации и проведения соревнований по спортивному программированию.

## 🚀 Основные возможности

- 📅 Управление календарем мероприятий в одном месте
- 👥 Удобное управление профилями участников
- 📊 Доступ к детальной статистике и аналитике
- 🏢 Управление федерациями и процессом их аккредитации

## 🛠️ Используемые технологии

- [React 18](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tanstack Router](https://tanstack.com/router)
- [Tanstack Query](https://tanstack.com/query)
- [Shadcn/ui](https://ui.shadcn.com/)

## 🚦 Как начать работу

1. Склонируйте репозиторий:

   ```bash
   git clone <repository-url>
   ```

2. Установите зависимости с помощью:

   ```bash
   npm install
   ```

3. Запустите проект с помощью:

   ```bash
   npm run dev
   ```

4. Откройте [http://localhost:3000](http://localhost:3000) в вашем браузере для просмотра

## 📂 Структура проекта

```bash
frontend/
├── src/
│   ├── api/                # API интеграции и типы
│   ├── components/         # UI компоненты
│   ├── icons/             # SVG иконки и графические ресурсы
│   ├── lib/               # Общие утилиты и хелперы
│   ├── routes/            # Маршруты приложения (Tanstack Router)
│   ├── index.css          # Глобальные стили
│   ├── main.tsx           # Точка входа приложения
│   ├── routeTree.gen.ts   # Сгенерированное дерево маршрутов
│   └── vite-env.d.ts      # Определения типов для Vite
├── public/                # Статические файлы
├── .vscode/               # Настройки VS Code
├── components.json        # Конфигурация shadcn/ui
├── eslint.config.js       # Конфигурация ESLint
├── index.html            # Входной HTML файл
├── nginx-server.conf     # Конфигурация Nginx
├── postcss.config.js     # Конфигурация PostCSS
├── tailwind.config.ts    # Конфигурация Tailwind CSS
├── tsconfig.json         # Базовая конфигурация TypeScript
├── tsconfig.app.json     # Конфигурация TypeScript для приложения
├── tsconfig.node.json    # Конфигурация TypeScript для Node.js
├── vite.config.ts        # Конфигурация Vite
├── .env                  # Переменные окружения (по умолчанию)
├── .env.local           # Локальные переменные окружения
├── Dockerfile           # Конфигурация Docker
└── package.json         # Зависимости и скрипты проекта
```

### Описание ключевых директорий

- `src/`: Исходный код приложения

  - `api/`: Интеграции с API и типы данных
  - `components/`: React компоненты
  - `icons/`: SVG иконки и графические ресурсы
  - `lib/`: Общие утилиты и вспомогательные функции
  - `routes/`: Маршруты приложения с использованием Tanstack Router

- `public/`: Статические файлы, доступные напрямую через веб-сервер

- Конфигурационные файлы:

  - `components.json`: Настройки компонентов shadcn/ui
  - `tailwind.config.ts`: Конфигурация Tailwind CSS
  - `vite.config.ts`: Настройки сборки проекта
  - `*.tsconfig.json`: Конфигурации TypeScript для разных частей приложения
  - `nginx-server.conf`: Настройки веб-сервера Nginx для продакшена
  - `Dockerfile`: Инструкции для создания Docker-контейнера

- Переменные окружения:
  - `.env`: Основные переменные окружения
  - `.env.local`: Локальные переменные (не включаются в Git)

## 🤝 Вклад

Мы приветствуем вклад в проект! Пожалуйста, следуйте этим шагам:

1. Форкните репозиторий
2. Создайте свою ветку (`git checkout -b feature/YourFeature`)
3. Сделайте коммит ваших изменений (`git commit -m 'Add some feature'`)
4. Запушьте в ветку (`git push origin feature/YourFeature`)
5. Откройте Pull Request

## 📞 Контакты

Если у вас есть вопросы или предложения, пожалуйста, свяжитесь с нами по адресу [email@example.com](mailto:email@example.com).

## 🌐 Ссылки

- [Документация](https://example.com/docs)
- [Демо](https://example.com/demo)
- [Часто задаваемые вопросы](https://example.com/faq)
