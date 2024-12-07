# ФСП Линк

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Чемпионат России](https://img.shields.io/badge/Чемпионат%20России-2024-red.svg)](https://fsp-russia.com/)

> Универсальная платформа для организации и проведения соревнований по спортивному программированию.

## ✨ Возможности

- 📅 **Управление календарем**: Централизованное управление мероприятиями
- 👥 **Профили участников**: Удобное управление профилями и регистрациями
- 📊 **Аналитика**: Детальная статистика и аналитика соревнований
- 🏢 **Управление федерациями**: Процесс аккредитации и управления федерациями

## 🛠️ Технологии

- **Фреймворк для фронтенда**: [React 18](https://reactjs.org/)
- **Язык программирования**: [TypeScript](https://www.typescriptlang.org/)
- **Инструмент сборки**: [Vite](https://vitejs.dev/)
- **Стилизация**: [Tailwind CSS](https://tailwindcss.com/)
- **Маршрутизация**: [Tanstack Router](https://tanstack.com/router)
- **Получение данных**: [Tanstack Query](https://tanstack.com/query)
- **UI Компоненты**: [Shadcn/ui](https://ui.shadcn.com/)

## 🚀 Начало работы

### Предварительные требования

- Node.js (версия 18 или выше)
- pnpm (версия 8 или выше)
- Git

### Установка

1. Клонируйте репозиторий:

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Установите зависимости:

   ```bash
   pnpm install
   ```

3. Запустите проект:

   ```bash
   pnpm dev
   ```

4. Откройте [http://localhost:3000](http://localhost:3000) в браузере

## 📂 Структура проекта

```
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

## 💻 Разработка

### Доступные скрипты

- `pnpm dev` - Запуск сервера разработки
- `pnpm build` - Сборка проекта
- `pnpm preview` - Предпросмотр собранного проекта
- `pnpm lint` - Проверка кода линтером

### Рекомендуемые расширения VS Code

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## 🚢 Деплой

### Используя Docker

1. Соберите образ:

   ```bash
   docker build -t fsp-link-frontend .
   ```

2. Запустите контейнер:

   ```bash
   docker run -p 3000:80 fsp-link-frontend
   ```

### Ручной деплой

1. Соберите проект:

   ```bash
   pnpm build
   ```

2. Скопируйте содержимое папки `dist` на веб-сервер

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для фичи (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте изменения в репозиторий (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 👥 Авторы

- **Сергей Полин** - [@sergepolin](https://github.com/sergepolin)
- **Артем Булгаков** - [@ArtemSBulgakov](https://github.com/ArtemSBulgakov)
- **Владислав Дериабкин** - [@evermake](https://github.com/evermake)
- **Руслан Бельков** - [@dantetemplar](https://github.com/dantetemplar)
- **Альберт Авудеев** - [@TatarinAlba](https://github.com/TatarinAlba)

## 🙏 Благодарности

- Всем участникам и контрибьюторам проекта
- [Чемпионат России по спортивному программированию](https://fsp-russia.com/)
