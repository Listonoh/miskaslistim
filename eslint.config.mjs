import astro from "eslint-plugin-astro";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const unusedVarsRule = [
  "error",
  {
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_"
  }
];

export default [
  {
    ignores: ["dist/**", ".astro/**"]
  },
  ...astro.configs.recommended,
  {
    files: [
      "**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}",
      "**/*.astro/*.js",
      "**/*.astro/*.ts"
    ],
    languageOptions: {
      parser: tsParser
    },
    plugins: {
      "@typescript-eslint": tsEslintPlugin
    },
    rules: {
      "@typescript-eslint/no-unused-vars": unusedVarsRule
    }
  },
  {
    files: ["**/*.astro"],
    rules: {
      "astro/no-unused-css-selector": "error"
    }
  }
];
