import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        // Node.js globals
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      // Error prevention
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off", // Allow console for backend
      "no-undef": "error",
      
      // Best practices
      "eqeqeq": ["error", "always"],
      "no-var": "error",
      "prefer-const": "warn",
      
      // Style (non-breaking)
      "semi": ["warn", "always"],
      "quotes": ["warn", "single", { avoidEscape: true }],
    },
  },
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
  },
];
