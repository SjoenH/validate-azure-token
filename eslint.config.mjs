import eslint from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["lib/**"],
    },
    eslint.configs.recommended,
    eslintConfigPrettier,
    // Node.js globals for plain JS config files (e.g. jest.config.js).
    {
        files: ["*.js"],
        languageOptions: {
            globals: globals.node,
        },
    },
    {
        files: ["**/*.ts"],
        extends: tseslint.configs.recommendedTypeChecked,
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                projectService: {
                    allowDefaultProject: ["src/__tests__/*.ts", "vite.config.ts"],
                    defaultProject: "tsconfig.test.json",
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-floating-promises": "error",
        },
    },
    {
        files: ["src/__tests__/**/*.ts"],
        languageOptions: {
            globals: globals.jest,
        },
        rules: {
            // Dynamic require() is intentional for module isolation in tests.
            "@typescript-eslint/no-require-imports": "off",
        },
    },
);
