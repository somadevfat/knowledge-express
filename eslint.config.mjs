import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsdoc from "eslint-plugin-jsdoc";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Ban `any` outright rather than the default warn — an escape hatch
      // that's easy to reach for and hard to grep back out later.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    // Require a JSDoc comment on every function declaration, class, and
    // class method (exported or not) so intent/params/throws are documented
    // at the point of use, not just re-derivable from the implementation.
    // Excludes __tests__/**: test intent lives in the it()/describe() text.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/__tests__/**"],
    plugins: { jsdoc },
    rules: {
      "jsdoc/require-jsdoc": [
        "error",
        {
          require: {
            FunctionDeclaration: true,
            ClassDeclaration: true,
            MethodDefinition: true,
          },
        },
      ],
    },
  },
  {
    // Architecture boundary: features/knowledge/server/** is an
    // implementation detail behind features/knowledge/api/knowledge-api.ts.
    // Everything else (pages, components) should go through the api layer
    // instead of reaching into server internals directly.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/features/knowledge/{api,server}/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/knowledge/server", "@/features/knowledge/server/*"],
              message:
                "features/knowledge/server/* is an implementation detail — import from @/features/knowledge/api/knowledge-api instead.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // vinext build output:
    "dist/**",
    ".vinext/**",
    ".wrangler/**",
  ]),
]);

export default eslintConfig;
