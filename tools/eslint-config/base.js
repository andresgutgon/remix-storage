module.exports = {
  extends: ["airbnb", "prettier"],
  plugins: ["prettier"],
  rules: {
    camelcase: "error",
    quotes: ["error", "double", { allowTemplateLiterals: true }],
    semi: ["error", "never", { beforeStatementContinuationChars: "always" }],
    "arrow-body-style": ["error", "as-needed"],
  },
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      extends: ["plugin:@typescript-eslint/recommended"],
      rules: {
        "import/extensions": "off",
        "import/no-unresolved": "off",
        "object-curly-spacing": [
          "error",
          "always",
          { objectsInObjects: false },
        ],
      },
    },
  ],
}
