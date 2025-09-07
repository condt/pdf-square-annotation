module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    ignorePatterns: ["dist", "build"],
    env: {
        browser: true,
        es2021: true,
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: __dirname,
    },
    rules: {
        // awaitなしasync呼び出しがあったらerror
        "@typescript-eslint/no-floating-promises": "error",
        // console.logは禁止(warnとerrorのみok)
        "no-console": ["error", { allow: ["warn", "error"] }],
        "no-empty": "warn",
        "@typescript-eslint/no-empty-function": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "prefer-const": "warn",
    },
};
