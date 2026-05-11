import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // ─── TypeScript rules (tightened) ──────────────────────────────
    // Warn on `any` usage — should be replaced with proper types
    "@typescript-eslint/no-explicit-any": "warn",
    // Warn on unused variables — dead code should be removed
    "@typescript-eslint/no-unused-vars": ["warn", {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    }],
    // Warn on non-null assertions — use proper null checks instead
    "@typescript-eslint/no-non-null-assertion": "warn",
    // Disallow suppressing TypeScript errors with @ts-ignore/@ts-expect-error
    "@typescript-eslint/ban-ts-comment": "warn",
    // Keep these off — they are style preferences, not bugs
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-unused-disable-directive": "off",

    // ─── React rules ───────────────────────────────────────────────
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/purity": "off",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    "react-compiler/react-compiler": "off",

    // ─── Next.js rules ─────────────────────────────────────────────
    "@next/next/no-img-element": "off",
    "@next/next/no-html-link-for-pages": "off",

    // ─── General JavaScript rules (tightened) ──────────────────────
    "prefer-const": "warn",
    "no-unused-vars": "off", // Handled by @typescript-eslint/no-unused-vars
    // Warn on console statements — should use proper logging in production
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    // Disallow debugger statements — should never reach production
    "no-debugger": "error",
    "no-empty": "warn",
    "no-irregular-whitespace": "warn",
    "no-case-declarations": "off",
    "no-fallthrough": "warn",
    "no-mixed-spaces-and-tabs": "warn",
    "no-redeclare": "off",
    "no-undef": "off", // TypeScript handles this
    "no-unreachable": "warn",
    "no-useless-escape": "warn",
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "examples/**", "skills", "mini-services/**"]
}];

export default eslintConfig;
