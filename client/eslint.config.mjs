import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import vueParser from "vue-eslint-parser";
import vuePlugin from "eslint-plugin-vue";

const commonGlobals = {
  ...globals.browser,
  ...globals.node,
};

const commonRules = {
  "no-debugger": "error",
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_|^props$",
    },
  ],
};

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
      globals: commonGlobals,
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: commonRules,
  },
  {
    files: ["src/**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
      globals: commonGlobals,
    },
    plugins: { "@typescript-eslint": tsPlugin, vue: vuePlugin },
    rules: {
      ...commonRules,
      "vue/multi-word-component-names": "off",
      "vue/no-unused-vars": "error",
    },
  },
  {
    files: ["src/**/*.d.ts"],
    rules: { "@typescript-eslint/no-unused-vars": "off" },
  },
];
