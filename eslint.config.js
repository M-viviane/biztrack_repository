// ESLint finds likely bugs (unused variables, undefined names, == instead
// of ===). Formatting is left to Prettier: eslint-config-prettier turns off
// every ESLint rule that would fight with it.
// Run: npm run lint   (check)   |   npm run lint:fix   (fix what it can)

const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier/flat");

module.exports = [
  {
    ignores: ["node_modules/", "coverage/", "prisma/migrations/"],
  },

  js.configs.recommended,

  // Application code and tests: CommonJS on Node.js.
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      // Unused things are usually mistakes. Prefix with _ to keep one
      // on purpose, e.g. `const { password: _, ...safeUser } = user`
      // (drops the password) or Express's 4-argument error handler.
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // Small ES module scripts (e.g. the husky installer).
  {
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node },
    },
  },

  prettier,
];
