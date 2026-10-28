# Документация

Проект использует Next.js App Router с Turbopack, React, TypeScript, Tailwind CSS и Bun. Oxlint проверяет код, импорты и границы слоёв FSD; Prettier форматирует код и сортирует Tailwind-классы.

## Запуск

Установите Node.js и Bun, затем выполните из корня проекта:

```bash
bun install --frozen-lockfile
bun run dev
```

Откройте [localhost:3000](http://localhost:3000). Главная страница находится в `src/app/page.tsx`, общий layout — в `src/app/layout.tsx`, стили и тема Tailwind — в `src/app/globals.css`.

Шрифты Geist загружаются через `next/font/google`; для их загрузки при сборке нужен доступ к Google Fonts.

## Команды

| Команда                | Назначение                                    |
| ---------------------- | --------------------------------------------- |
| `bun run dev`          | Сервер разработки с Turbopack                 |
| `bun run build`        | Production-сборка с Turbopack                 |
| `bun run start`        | Запуск готовой production-сборки              |
| `bun run lint`         | Проверка Oxlint и правил FSD                  |
| `bun run lint:fix`     | Автоматическое исправление замечаний Oxlint   |
| `bun run format:check` | Проверка форматирования Prettier              |
| `bun run format`       | Форматирование проекта Prettier               |
| `bun run typecheck`    | Генерация типов Next.js и проверка TypeScript |

Зависимости фиксируются в `bun.lock`. После обновления пакетов сохраняйте вместе `package.json` и `bun.lock`, затем запускайте линтер, проверку типов и сборку.

## Структура

Исходный код находится в `src`. Алиасы FSD настроены в `tsconfig.json`: `@app`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared`. Общий алиас `@/*` указывает на `src/*`, а `@images/*` — на `src/shared/assets/images/*`. Папки слоёв и слайсов создаются по мере необходимости.

Декларации типов для импортируемых файлов находятся в `src/ambient` и подключаются через `tsconfig.json`.

## Руководства

- [Next.js 16.4.3: изменения и применение в стартере](NEXT_16_4_GUIDE.md)
- [Правила FSD и линтинга](FSD_LINTING.md)
- [Tailwind CSS 4.3.3: новые утилиты и примеры](TAILWIND_V4_FEATURES.md)
- [Глобальные типы и SVG-компоненты](TYPES_AND_SVGR.md)

## Внешняя документация

- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [SVGR](https://react-svgr.com/docs/next/)
