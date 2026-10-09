// @ts-check
import eslint from "@eslint/js";
import angular from "angular-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import storybook from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "dist/**",
    "coverage/**",
    "noop-out/**",
    ".angular/**",
    "documentation.json",
  ]),
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended,
    ],
    languageOptions: {
      globals: { ...globals.jest },
      parserOptions: {
        project: ["tsconfig.eslint.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/prefer-enum-initializers": "off",
      "@typescript-eslint/array-type": "off",
      complexity: ["error", 14],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [angular.configs.templateRecommended],
    rules: {
      "@angular-eslint/template/no-negated-async": "warn",
      "@angular-eslint/template/eqeqeq": "off",
    },
  },
  // Cast: the plugin bundles its own @typescript-eslint/utils rule types, which
  // are structurally incompatible with ESLint core's RuleDefinition.
  /** @type {import("eslint").Linter.Config[]} */ (
    storybook.configs["flat/recommended"]
  ),
]);
