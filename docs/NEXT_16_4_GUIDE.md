# Next.js 16.4.3: гайд для этого стартера

[← Документация](README.md) · [Tailwind CSS 4.3.3](TAILWIND_V4_FEATURES.md)

Проверено 28 октября 2026 года: установлены `next@16.4.3`, `react@19.3.1` и `typescript@6.0.3`. Ниже — изменения относительно Next.js 16.1.x и примеры для App Router.

## Что даёт само обновление

| Версия | Изменение                                                                    | Практический эффект                                            |
| ------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 16.2   | Улучшены запуск dev-сервера, сообщения о гидратации и логи Server Functions  | Проще искать ошибки и видеть серверную работу                  |
| 16.3   | Улучшены управление памятью dev-сервера и серверный рендеринг                | Меньше лишней работы в долгих dev-сессиях                      |
| 16.4   | Ленивые серверные HMR-обновления                                             | Ранее посещённые страницы обновляются, когда снова понадобятся |
| 16.4   | Общий runtime Turbopack, сокращённые CSS Module и внутренние имена экспортов | Меньше дублирования и меньше размер сборки                     |

Эти изменения описаны в анонсах [16.2](https://nextjs.org/blog/next-16-2), [16.3](https://nextjs.org/blog/next-16-3) и [16.4](https://nextjs.org/blog/next-16-4). В проекте уже используется Turbopack, поэтому менять сборщик для этих улучшений не требуется. Точное ускорение зависит от приложения.

Именно **16.4.3** — выпуск с исправлениями, включая обработку Google Fonts URL без расширения и загрузку runtime в `proxy.ts`. Основные новые возможности относятся к веткам 16.3 и 16.4. [Changelog 16.4.3](https://github.com/vercel/next.js/releases/tag/v16.4.3).

## Как выбирать способ доступа к данным

| Задача                                          | Обычная схема                             |
| ----------------------------------------------- | ----------------------------------------- |
| Прочитать данные при серверном рендеринге       | Server Component → серверная функция → БД |
| Читать с клиента: поиск, пагинация, polling     | `useQuery` → GET Route Handler → БД       |
| Создать, изменить, удалить данные из интерфейса | `useMutation` → Server Action → БД        |
| Предоставить HTTP API внешним клиентам          | Route Handler → серверная функция → БД    |

Server Component может обращаться к серверной функции напрямую, без HTTP-запроса к собственному API. Route Handlers подходят и для собственного клиентского интерфейса, а основное назначение Server Actions — изменение данных. [Рекомендации Next.js](https://nextjs.org/docs/app/guides/backend-for-frontend#server-components).

## Cache Components: главное направление Next.js 16.4

Cache Components появились раньше, но в 16.4 команда рекомендует эту модель и включает её в новые проекты `create-next-app`. Обновление существующего проекта само флаг не добавляет. В нашем `next.config.ts` он пока отсутствует. [Анонс 16.4](https://nextjs.org/blog/next-16-4).

Модель позволяет совместить заранее подготовленный интерфейс, явно кэшируемые функции и динамические части страницы. Для перехода добавь в **существующий** объект `nextConfig` поля ниже, сохранив текущую настройку `turbopack` и SVGR:

```diff
 const nextConfig: NextConfig = {
+  cacheComponents: true,
+  partialPrefetching: true,
   devIndicators: false,
```

Оба параметра задаются на верхнем уровне. Режим требует Node.js runtime. [Настройка Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents).

### Как кэшировать данные

Пример функции для серверного API-модуля; адрес и тип ответа замени на свой backend:

```ts
import { cacheLife } from "next/cache";

type Product = { id: string; name: string };

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");

  const response = await fetch("https://api.example.com/products");

  if (!response.ok) {
    throw new Error("Не удалось получить товары");
  }

  return response.json();
}
```

`"use cache"` помечает результат функции как кэшируемый, а `cacheLife` выбирает профиль его жизни. Функция должна быть `async`; аргументы участвуют в ключе кэша. Вызовы `cookies()` и `headers()` выполняй вне обычной кэшируемой области и передавай нужные значения аргументами. [Директива `use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache).

Для динамической части страницы оставляй осмысленный fallback:

```tsx
import { Suspense } from "react";
import { cookies } from "next/headers";

async function Currency() {
  const currency = (await cookies()).get("currency")?.value ?? "RUB";

  return <p>Валюта: {currency}</p>;
}

export default function Page() {
  return (
    <main>
      <h1>Каталог</h1>
      <Suspense fallback={<p>Загружаем настройки…</p>}>
        <Currency />
      </Suspense>
    </main>
  );
}
```

Заголовок и fallback могут появиться до завершения динамической работы. Для реального экрана размещай границы вокруг независимых частей: фильтров, рекомендаций, пользовательских настроек. [Миграция на Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components).

## Partial Prefetching и Instant Navigations

С `partialPrefetching: true` обычные ссылки предварительно получают App Shell — основу будущего экрана. При переходе пользователь видит её, пока недостающие части догружаются. Это отдельная возможность 16.3, а не автоматический результат установки новой версии. [Partial Prefetching](https://nextjs.org/docs/app/api-reference/config/next-config-js/partialPrefetching).

| Ссылка                                           | Поведение при включённом Partial Prefetching           |
| ------------------------------------------------ | ------------------------------------------------------ |
| `<Link href="/catalog">`                         | Предзагрузить App Shell                                |
| `<Link href="/catalog?q=phone" prefetch={true}>` | Дополнительно подготовить содержимое, зависящее от URL |
| `<Link href="/catalog" prefetch={false}>`        | Отключить предзагрузку для этой ссылки                 |

`prefetch={true}` может запускать дополнительную серверную работу. Используй его для переходов, где эта работа оправданна. Новый `await prefetch()` из `next/cache` позволяет отложить отдельное дорогое поддерево до предзагрузки конкретной ссылки или перехода; вызывающий компонент размещают под `<Suspense>`. Это серверный контроль этапов рендера, а не `router.prefetch(url)`. [API `prefetch()`](https://nextjs.org/docs/app/api-reference/functions/prefetch).

`instant` управляет проверкой того, появится ли интерфейс перехода без ожидания данных. `instant = false` отключает соответствующую проверку. Без Cache Components этот экспорт использовать нельзя. [API `instant`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/instant).

Codemod `cache-components-instant-false` помогает постепенно перейти на Cache Components, добавляя временные исключения из проверки. `remove-partial-prefetch` удаляет `prefetch = "partial"` после включения глобального `partialPrefetching`. Для обновления версии без внедрения этих режимов они не требуются. [Описание codemod’ов](https://nextjs.org/docs/app/guides/upgrading/codemods).

## Новое в 16.4: `ensureStatic`

Этот экспорт в серверном `page.tsx` или `layout.tsx` задаёт, какой результат должен оставаться статическим. Требует Cache Components:

| Значение       | Что должно быть статическим               |
| -------------- | ----------------------------------------- |
| `"shell"`      | App Shell                                 |
| `"prefetch"`   | App Shell и результат предзагрузки ссылки |
| `"navigation"` | Полный серверный результат маршрута       |

Например, для раздела документации, который должен целиком предрендериться:

```ts
export const ensureStatic = "navigation";
```

Уровень `"navigation"` проверяется в dev и при сборке: запросные данные вроде `cookies()` несовместимы с полностью статическим серверным результатом. `"shell"` и `"prefetch"` управляют своими этапами и не означают, что весь маршрут проверяется как статический при сборке. [API `ensureStatic`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/ensureStatic).

## Типы и другие полезные возможности

- В новых версиях `next build` по умолчанию использует локальный CLI TypeScript и поддерживает TypeScript 7. У нас установлен **6.0.3**; обновление Next.js не обновляет компилятор автоматически. Наша команда `bun run typecheck` остаётся отдельной проверкой. [TypeScript в Next.js](https://nextjs.org/docs/app/api-reference/config/typescript).
- Начиная с 16.3, `next/root-params` предоставляет типизированные async-геттеры корневых параметров маршрута, например `[lang]`. Они полезны для серверной локализации, когда параметр расположен до корневого layout. В текущей структуре без `[lang]` применять их пока негде. [API `next/root-params`](https://nextjs.org/docs/app/api-reference/functions/next-root-params).
- Версия Next.js включает документацию в `node_modules/next/dist/docs`. Это удобный источник примеров именно для установленной версии.

## Что применять в этом стартере

1. Использовать текущий Turbopack и сравнивать время работы на реальных маршрутах.
2. При появлении серверных данных рассмотреть Cache Components вместе с Partial Prefetching.
3. Явно выбирать кэшируемые функции и размещать динамические части под `<Suspense>`.
4. Для полностью статических разделов рассмотреть `ensureStatic = "navigation"`.
5. После изменения режима рендера выполнить проверки и проверить навигацию через production-сервер:

```bash
bun run lint
bun run typecheck
bun run build
bun run start
```

Экспериментальные Rust React Compiler, worker threads и дополнительные оптимизации Turbopack не нужны для начала работы с этими возможностями. Их статус и параметры перечислены в [анонсе 16.4](https://nextjs.org/blog/next-16-4#new-experimental-features).
