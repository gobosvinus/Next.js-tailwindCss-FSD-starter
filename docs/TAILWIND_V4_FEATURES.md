# Tailwind CSS 4.3.3: новые возможности и примеры

[← Документация](README.md)

В проекте установлены `tailwindcss@4.3.3` и `@tailwindcss/postcss@4.3.3`. Проверено 28 октября 2026 года. Гайд по Next.js находится [рядом](NEXT_16_4_GUIDE.md).

В 4.2 появились новые палитры и логические размеры/отступы; 4.3 добавила scrollbar-утилиты, `@container-size`, `zoom-*`, `tab-*` и расширения CSS-директив. [Анонс 4.2 и 4.3](https://tailwindcss.com/blog/tailwindcss-v4-3).

Патч **4.3.3** исправляет, например, дробную прозрачность теней, поиск цветов при канонизации и поведение Preflight для фокуса `iframe` в Firefox. Новые семейства классов пришли в 4.2/4.3, а не отдельным набором в 4.3.3. [Changelog 4.3.3](https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.3).

## 1. Полосы прокрутки без дополнительного плагина — 4.3

```tsx
export function ScrollPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="scrollbar-thin scrollbar-thumb-mist-400 scrollbar-track-mist-100 scrollbar-gutter-stable max-h-80 overflow-y-auto">
      {children}
    </div>
  );
}
```

- `scrollbar-thin` — тонкая полоса; также доступны `scrollbar-auto` и `scrollbar-none`.
- `scrollbar-thumb-*` и `scrollbar-track-*` — цвета ползунка и дорожки.
- `scrollbar-gutter-stable` — резервирует место под обычную полосу прокрутки и помогает избежать сдвига содержимого при её появлении. Системные overlay-scrollbar могут вести себя иначе.

Пригодится для сайдбаров, списков, выпадающих панелей и модальных окон. [Ширина scrollbar](https://tailwindcss.com/docs/scrollbar-width), [цвета](https://tailwindcss.com/docs/scrollbar-color), [место под scrollbar](https://tailwindcss.com/docs/scrollbar-gutter).

## 2. Новые палитры — 4.2

Добавлены `mauve`, `olive`, `mist` и `taupe`: дополнительные нейтральные палитры с разными оттенками. Они работают с привычными `bg-*`, `text-*`, `border-*`:

```html
<article
  class="rounded-xl border border-mist-200 bg-mauve-50 p-6 text-taupe-950"
>
  <span class="rounded-full bg-olive-100 px-3 py-1 text-olive-800">Готово</span>
</article>
```

Для общих UI-компонентов проекта удобно связать выбранные цвета с семантическими переменными темы, как уже сделано для `--color-background`. [Цвета и палитры](https://tailwindcss.com/docs/colors).

## 3. Логические отступы, размеры и позиционирование — 4.2

Логические свойства описывают начало и конец осей текста. Они полезны для RTL и разных направлений письма.

| Класс         | CSS-свойство                  |
| ------------- | ----------------------------- |
| `pbs-4`       | `padding-block-start`         |
| `pbe-6`       | `padding-block-end`           |
| `inline-full` | `inline-size: 100%`           |
| `block-64`    | `block-size` по шкале spacing |
| `inset-s-0`   | `inset-inline-start: 0`       |
| `inset-bs-0`  | `inset-block-start: 0`        |

`ps-*` и `pe-*` существовали раньше; в 4.2 семейство стало полнее. Старые `start-*` / `end-*` ещё работают, но вместо них рекомендуются согласованные `inset-s-*` / `inset-e-*`. [Отступы](https://tailwindcss.com/docs/padding), [логическая ширина](https://tailwindcss.com/docs/inline-size), [позиционирование](https://tailwindcss.com/docs/top-right-bottom-left), [изменения 4.2](https://tailwindcss.com/blog/tailwindcss-v4-3#more-logical-property-utilities).

## 4. Контейнер с доступной высотой — 4.3

Обычный `@container` создаёт контейнер по inline-размеру. Новый `@container-size` позволяет использовать и block-размер, например единицу `cqb`:

```html
<section class="@container-size h-96">
  <div class="h-[50cqb] overflow-auto">Половина block-размера контейнера</div>
</section>
```

Родителю здесь явно задан размер. Для обычной адаптации карточки по ширине достаточно прежнего `@container`. [Size containers](https://tailwindcss.com/docs/responsive-design#using-size-containers).

## 5. `zoom-*` и `tab-*` — 4.3

```html
<div class="zoom-125">Предпросмотр с масштабом 125%</div>
<pre class="overflow-auto tab-2"><code>const value = 1;</code></pre>
```

`zoom-125` использует CSS `zoom` и влияет на расчёт layout; это отличается от transform-масштабирования `scale-125`. `tab-2` задаёт ширину настоящего символа табуляции; пробелы в тексте он не меняет. Пригодится для предпросмотров и блоков кода. [Zoom](https://tailwindcss.com/docs/zoom), [tab-size](https://tailwindcss.com/docs/tab-size).

## 6. Более выразительные `@variant` и `@utility` — 4.3

Теперь внутри CSS можно объединять варианты через запятую или складывать через двоеточие:

```css
.control {
  @variant hover, focus-visible {
    outline: 2px solid var(--color-olive-600);
  }

  @variant hover:focus-visible {
    background-color: var(--color-olive-100);
  }
}
```

В первом случае достаточно любого состояния, во втором нужны оба. Это полезно для собственного CSS; в JSX по-прежнему можно применять классы вариантов напрямую. [Директива `@variant`](https://tailwindcss.com/docs/functions-and-directives#variant).

Для функциональных утилит появились значения по умолчанию:

```css
@utility code-tabs-* {
  tab-size: --value(integer, --default(2));
}
```

Теперь `code-tabs` задаёт `2`, а `code-tabs-4` — `4`. Можно дать удобный короткий класс своей дизайн-системе и сохранить возможность явного значения. [Default values](https://tailwindcss.com/docs/adding-custom-styles#default-values).

## 7. Подключение в нашем Next.js-проекте

Мы используем **Turbopack + PostCSS**. Достаточно текущего подключения:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

`tailwindcss` и PostCSS-плагин сейчас согласованы на 4.3.3. Новый `@tailwindcss/webpack`, появившийся в 4.2, относится к webpack-интеграции; для текущего Turbopack-сетапа добавлять его не требуется. [Способы подключения](https://tailwindcss.com/blog/tailwindcss-v4-3).

## Базовые возможности v4, которые появились раньше

CSS-тема, автоматическое обнаружение классов и обычные container queries — основа v4, а не новые возможности 4.3.

### CSS-переменные для конфигурации

Главное изменение в v4 — переход к CSS-first конфигурации. Вместо статического файла `tailwind.config.js`, настройки темы теперь задаются через нативные CSS-переменные внутри директивы `@theme`.

Как это работает:

Вы объявляете переменные прямо в CSS файле, и Tailwind автоматически делает их доступными как утилитарные классы.

```css
@import "tailwindcss";

@theme {
  /* Определение цветов */
  --color-brand-primary: oklch(0.5 0.2 240);
  --color-brand-secondary: oklch(0.8 0.1 240);

  /* Определение шрифтов */
  --font-display: "Satoshi", sans-serif;

  /* Определение радиусов */
  --radius-xl: 1.5rem;
}
```

Теперь эти переменные доступны как классы: `bg-brand-primary`, `text-brand-secondary`, `font-display`, `rounded-xl`. Это упрощает динамическую смену тем и интеграцию с дизайн-системами.

### Современные селекторы и упрощённый синтаксис

Движок Tailwind v4 был полностью переписан для поддержки современных возможностей CSS без дополнительных настроек.

- **Автоматическое обнаружение контента**: Больше не нужно настраивать массив `content` — движок сам находит файлы.
- **Поддержка вложенности (Nesting)**: Можно писать вложенный CSS, который будет работать нативно.
- **Псевдоклассы**: Улучшена поддержка сложных селекторов, таких как `:has()`, `:not()`, `:where()`.

Пример использования `:has` (стилизация родителя в зависимости от потомка) стала проще и быстрее:

```html
<div class="p-4 has-checked:bg-blue-100">
  <input type="checkbox" />
  <span class="ml-2">Выбери меня</span>
</div>
```

### Адаптивность от родительского контейнера

Одной из самых ожидаемых функций стала нативная поддержка **Container Queries** (запросы к контейнеру) без необходимости устанавливать отдельный плагин `@tailwindcss/container-queries`.

Это позволяет элементам адаптироваться не к ширине окна браузера (как при использовании `md:`, `lg:`), а к ширине их непосредственного родителя.

Пример использования:

1. Помечаем родителя как контейнер:

```html
<div class="@container">
  <!-- Дочерний элемент будет менять стиль в зависимости от ширины родителя -->
  <div class="flex flex-col gap-4 @md:flex-row">
    <div class="bg-red-200 @md:w-1/2">Блок 1</div>
    <div class="bg-blue-200 @md:w-1/2">Блок 2</div>
  </div>
</div>
```

В этом примере при ширине контейнера от `28rem` срабатывает `@md` и блоки встают в ряд. Это стандартное значение `@md` для контейнера; обычный viewport-breakpoint `md:` имеет другую шкалу. [Container queries](https://tailwindcss.com/docs/responsive-design#container-queries).

Это критически важно для создания переиспользуемых компонентов (виджетов, карточек), которые могут размещаться как в узких сайдбарах, так и в широких основных секциях.
