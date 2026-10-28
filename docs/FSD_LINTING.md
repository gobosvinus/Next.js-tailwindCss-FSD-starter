# FSD и линтинг

[← Документация](README.md)

Линтер проекта — **Oxlint**, конфигурация находится в `.oxlintrc.json`. Проверки TypeScript, React, Next.js, доступности и импортов выполняют встроенные плагины. Правила FSD и сортировки подключены через `jsPlugins`: `eslint-plugin-boundaries`, `eslint-plugin-simple-import-sort` и `eslint-plugin-sort-exports`.

ESLint отдельно не запускается. Его пакет остаётся транзитивной peer-зависимостью JS-плагинов. Прежний `eslint.config.mjs` удалён.

## Команды

| Команда                | Назначение                                                          |
| ---------------------- | ------------------------------------------------------------------- |
| `bun run lint`         | Проверить код и FSD; предупреждения тоже завершают проверку ошибкой |
| `bun run lint:fix`     | Исправить автоматически исправляемые замечания                      |
| `bun run format:check` | Проверить форматирование Prettier                                   |
| `bun run format`       | Отформатировать проект, включая Tailwind-классы                     |
| `bun run typecheck`    | Сгенерировать типы Next.js и проверить TypeScript                   |

## Границы слоёв

Правило `boundaries/dependencies` проверяет импорты через алиасы и относительные пути. В настройках каждый слайс `entities`, `features`, `widgets` и `pages` считается отдельным элементом; в `shared` элементами являются сегменты.

| Слой     | Разрешено импортировать                                     |
| -------- | ----------------------------------------------------------- |
| App      | Все слои                                                    |
| Pages    | `pages`, `widgets`, `features`, `entities`, `shared`, `app` |
| Widgets  | `widgets`, `features`, `entities`, `shared`, `app`          |
| Features | `features`, `entities`, `shared`, `app`                     |
| Entities | `entities`, `shared`, `app`                                 |
| Shared   | `shared`, `app`                                             |

Сохранена политика проекта: импорты из `app` доступны всем слоям, а импорты других слайсов своего слоя разрешены через public API. Это расширения классического FSD. Например, импорт виджета в `shared` или страницу в `features` запрещён.

Тесты, stories, mocks и сгенерированные API исключены из проверки границ.

## Public API и cross-imports

Импорты из другого слайса `entities`, `features`, `widgets` или `pages` проходят через `index.ts` / `index.tsx` либо выделенный `@x` API:

```ts
import { user } from "@entities/user";
import { userForOrder } from "@entities/user/@x/order";
```

Прямой доступ к внутреннему `model`, `ui` или другому файлу чужого слайса запрещён. Внутри своего слайса можно использовать относительные импорты:

```ts
import { user } from "./model/user";
```

Дополнительное правило `no-restricted-imports` сохраняет ограничения для внутренних путей `shared/config`, `shared/hooks`, `shared/lib`, API, store и UI. Используйте public API соответствующего сегмента.

## Сортировка импортов и экспортов

Группы импортов расположены в следующем порядке:

1. Встроенные модули Node.js: `node:*`.
2. React и внешние библиотеки.
3. FSD-алиасы: `@app`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared`.
4. Импорты через `src/`.
5. Родительские и локальные относительные импорты.
6. Стили.
7. Побочные импорты.

Экспорты сортируются по алфавиту, с типами перед значениями. Исправить сортировку можно командой `bun run lint:fix`.

## React и Next.js

Сохранены поддерживаемые проверки хуков, React Compiler, Next.js и доступности. Как и в прежней конфигурации, `exhaustive-deps` выключен.

Oxlint не поддерживает три прежних правила React Compiler: `component-hook-factories`, `config` и `gating`. Они не перенесены.

Если проверка сообщает об ошибке границ или public API, исправьте направление зависимости или экспорт слайса. Для ошибок форматирования используйте `bun run format`.
