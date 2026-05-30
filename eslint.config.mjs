import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/dist/",
      "**/out/",
      "release/",
      "**/node_modules/",
      "packages/native/target/",
      "test-results/",
      "playwright-report/",
      "**/*.config.*",
      "**/vite-plugin-conditional-compile.ts",
      ".vscode/",
      ".husky/",
    ],
  },
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
      ],
      "no-void": ["error", { allowAsStatement: false }],
    },
  },
  {
    files: ["packages/desktop/**/*.ts", "packages/desktop/**/*.tsx", "tests/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSAsExpression:not(:has(TSTypeReference > Identifier[name='const']))",
          message: "Use factory functions from @watchdesk/shared instead of 'as'",
        },
      ],
    },
  },
  {
    files: ["**/domain/**/*.ts", "**/application/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
    },
  },
  {
    files: [
      "packages/desktop/**/*.ts",
      "packages/desktop/**/*.tsx",
      "packages/browser/**/*.ts",
      "packages/browser/**/*.tsx",
      "packages/shell/**/*.ts",
      "packages/shell/**/*.tsx",
      "packages/ui/**/*.ts",
      "packages/ui/**/*.tsx",
      "packages/core/**/*.ts",
      "packages/contracts/**/*.ts",
      "packages/event-bus/**/*.ts",
      "packages/shared/**/*.ts",
      "packages/native/**/*.ts",
      "tests/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/unbound-method": "off",
      "no-void": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
  {
    files: ["**/components/**/*.tsx", "**/pages/**/*.tsx", "**/features/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
  {
    files: ["**/domain/entities.ts"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  prettier,
);
