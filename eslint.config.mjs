import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [".next/*", "node_modules/*", "dist/*", "build/*"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  /**
   * These three store files deliberately use `require()` inside functions
   * to break circular dependencies at runtime (e.g., useOrderStore ->
   * useAuthStore -> useOrderStore). This is a documented, intentional
   * pattern. Do not remove the require() calls without first restructuring
   * the store dependency graph.
   */
  {
    files: [
      'store/useCartStore.ts',
      'store/useOrderStore.ts',
      'store/useReturnStore.ts',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "prefer-const": "warn",
    },
  },
];

export default eslintConfig;
