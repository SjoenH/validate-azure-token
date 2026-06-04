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
    {
        files: ["**/*.ts"],
        extends: tseslint.configs.recommendedTypeChecked,
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-floating-promises": "error",
        },
    }
);
