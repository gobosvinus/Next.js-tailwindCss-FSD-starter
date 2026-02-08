import tsPlugin from "@typescript-eslint/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sortExports from "eslint-plugin-sort-exports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "fsd-lint.mjs",
  ]),
  {
    plugins: {
      "react-hooks": reactHooks,
      prettier: prettier,
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
      "sort-exports": sortExports,
      "@typescript-eslint": tsPlugin,
      boundaries: boundaries,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "shared", pattern: "src/shared/**" },
        { type: "entities", pattern: "src/entities/**" },
        { type: "features", pattern: "src/features/**" },
        { type: "widgets", pattern: "src/widgets/**" },
        { type: "pages", pattern: "src/pages/**" },
      ],
      "boundaries/ignore": [
        "**/*.test.*",
        "**/*.spec.*",
        "**/*.stories.*",
        "**/mock/**",
        "**/mocks/**",
        "**/api_gen/**",
        "**/dist/**",
        "**/build/**",
      ],
    },
    rules: {
      // React
      ...reactHooks.configs.recommended.rules,
      "react/jsx-uses-react": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // Prettier
      "prettier/prettier": ["error", { endOfLine: "auto" }],

      // TypeScript
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      // Import sorting
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Node.js встроенные модули
            ["^node:"],
            // React и внешние библиотеки
            ["^react$", "^@?\\w"],
            // Внутренние алиасы (FSD слои)
            [
              "^@app",
              "^@pages",
              "^@widgets",
              "^@features",
              "^@entities",
              "^@shared",
            ],
            // Относительные импорты из src/
            ["^src/"],
            // Относительные импорты родительских директорий
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Относительные импорты текущей директории
            ["^\\./(?=.*[^/]+)"],
            // Стили в конце
            ["^\\./styles$", "\\.s?css$"],
            // Side effect импорты
            ["^\\u0000"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",

      // Export sorting
      "sort-exports/sort-exports": [
        "error",
        {
          sortDir: "asc",
          ignoreCase: true,
          sortExportKindFirst: "type",
        },
      ],

      // Запрет на обход public API (FSD)
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            // Shared слой - запрещаем только импорты через алиасы, относительные разрешены
            {
              group: ["@shared/config/**"],
              message: "Импортируй через public API (index.ts)",
            },
            {
              group: ["@shared/hooks/**"],
              message: "Импортируй через public API (index.ts)",
            },
            {
              group: ["@shared/ui/*/model/**"],
              message: "Импортируй через public API (index.ts)",
            },
            {
              group: ["@shared/ui/*/lib/**"],
              message: "Импортируй через public API (index.ts)",
            },
            {
              group: ["@shared/lib/**"],
              message: "Импортируй через public API (index.ts)",
            },
            {
              group: ["@shared/api/services/**"],
              message: "Импортируй через public API (index.ts)",
            },
            {
              group: ["@shared/store/**"],
              message: "Используй только через @shared/store/index.ts",
            },
            // Остальные слои FSD - запрещаем только импорты через алиасы между разными слайсами
            {
              group: ["@entities/*/*"],
              message: "Импорт только через public API (index.ts)",
            },
            {
              group: ["@features/*/*"],
              message: "Импорт только через public API (index.ts)",
            },
            {
              group: ["@widgets/*/*"],
              message: "Импорт только через public API (index.ts)",
            },
            {
              group: ["@pages/*/*"],
              message: "Импорт только через public API (index.ts)",
            },
            {
              group: ["@app/**"],
              message: "Импорт только через public API (index.ts)",
            },
            // Прямые импорты внутренних папок через алиасы (не относительные)
            {
              group: ["@*/**/api/**", "!@*/**/api/index.ts"],
              message:
                "API должно экспортироваться через index.ts или использовать относительные импорты внутри слайса",
            },
            {
              group: ["@*/**/model/**", "!@*/**/model/index.ts"],
              message:
                "Модели должны экспортироваться через index.ts или использовать относительные импорты внутри слайса",
            },
            {
              group: [
                "@*/**/ui/**",
                "!@*/**/ui/index.tsx",
                "!@*/**/ui/index.ts",
              ],
              message:
                "UI компоненты должны экспортироваться через index или использовать относительные импорты внутри слайса",
            },
          ],
        },
      ],

      // Границы слоёв FSD
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            // Специальное правило для app - доступно всем слоям
            { from: "*", allow: ["app"] },

            // И во внутрь app тоже можно импортировать всё из других из других слоев
            {
              from: "app",
              allow: ["shared", "entities", "features", "widgets", "pages"],
            },
            // Shared слой - может импортировать только себя
            { from: "shared", allow: ["shared"] },
            // Entities - может импортировать shared и entities
            { from: "entities", allow: ["shared", "entities"] },
            // Features - может импортировать shared, entities и features
            { from: "features", allow: ["shared", "entities", "features"] },
            // Widgets - может импортировать shared, entities, features и widgets
            {
              from: "widgets",
              allow: ["shared", "entities", "features", "widgets"],
            },
            // Pages - может импортировать все кроме app
            {
              from: "pages",
              allow: ["shared", "entities", "features", "widgets", "pages"],
            },
            // App - может импортировать всё
            {
              from: "app",
              allow: [
                "shared",
                "entities",
                "features",
                "widgets",
                "pages",
                "app",
              ],
            },
          ],
        },
      ],

      // Cross-imports через @x-notation и entry points (FSD)
      "boundaries/entry-point": [
        "error",
        {
          default: "allow",
          rules: [
            // Разрешаем @x cross-imports между слоями одного уровня
            {
              target: ["entities", "features", "widgets", "pages"],
              allow: "**/@x/**",
            },
            // Запрещаем прямые импорты внутренних файлов
            {
              target: ["entities", "features", "widgets", "pages"],
              disallow: [
                "**/ui/**",
                "**/model/**",
                "**/api/**",
                "**/lib/**",
                "**/hooks/**",
                "**/config/**",
              ],
            },
            // Исключения для index файлов
            {
              target: ["entities", "features", "widgets", "pages"],
              allow: ["**/index.ts", "**/index.tsx"],
            },
            // Исключение для app/providers/router/index.ts - разрешаем экспорт из внутренних директорий
            {
              target: ["app"],
              allow: [
                "**/ui/**",
                "**/model/**",
                "**/api/**",
                "**/lib/**",
                "**/hooks/**",
                "**/config/**",
              ],
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
