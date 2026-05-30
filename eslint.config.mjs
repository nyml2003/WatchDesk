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
      "**/infrastructure/**/*.ts",
      "**/infra/**/*.ts",
      "**/ipc/**/*.ts",
      "**/preload/**/*.ts",
      "**/workers/**/*.ts",
      "**/native/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["**/components/**/*.tsx", "**/pages/**/*.tsx"],
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
