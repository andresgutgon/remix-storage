## Test the lib with a remix application example

To see in action `remix-storage` in a Remix app:

```
// nx dev [example remix app]
// Ex.:
nx dev basic

```

To create a new Remix app example:

```
npx nx g @nrwl/remix:app [NAME_OF_YOUR_EXAMPLE]

// Once the app is created edit remix config:
cd [NAME_OF_YOUR_EXAMPLE]
vim .remix.config.js
// Add this:
module.exports = {
  // Rest of existing options
  watchGlobs: ["../../packages/**/src/**/*.ts"]
}
```

## Run tests

Run test one of the packages

```
nx test:watch bodyparser
```
