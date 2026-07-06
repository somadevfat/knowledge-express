const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["app", "docs", "deps", "repo"]],
  },
};

export default config;
