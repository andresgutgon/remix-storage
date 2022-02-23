module.exports = {
  extends: ["airbnb", "prettier"],
  plugins: ["prettier"],
  rules: {
    camelcase: "error",
    quotes: ["error", "double", {allowTemplateLiterals: true}],
    semi: ["error", "never", {beforeStatementContinuationChars: "always"}],
  },
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      extends: [
        "prettier/@typescript-eslint",
        "plugin:@typescript-eslint/recommended",
      ],
      rules: {
        "import/extensions": "off",
        "import/no-unresolved": "off",
      },
    },
  ],
}
