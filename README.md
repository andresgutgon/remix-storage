# WHAT's This?
TBD...

## TODO
- [x] Setup examples folder for remix projects to develop the lib
- [x] Make esbuild and TS watchers work together. Try [tsup](https://tsup.egoist.sh)
- [x] Setup ESLint + Prettier in `@remix-storage/core`
- [ ] Setup Eslint as in this article: https://bereghici.dev/blog/build-a-scalable-front-end-with-rush-monorepo-and-react--eslint+lint-staged
- [ ] Develop the first feature!!!
- [ ] Build production package with Rollup + esbuild
- [ ] Understand how release / publish proccess works
- [ ] Define all I want to do in this project

## ROADMAP
TBD...

## Development
Install dependencies.
This project is a monorepo that has [pnpm.ip](https://pnpm.io/) as Node package
manager (An alternative to `npm` or `yarn1`).
Also has as monorepo manager [rushjs.io](https://rushjs.io/).

The idea is that Rush takes care of
1. Dependency consistency
2. Watching for changes in all the packages
3. Release process.

When developing some of the packages you can use one of the existing Remix apps
inside `./examples/` folder or create a new one.
Go to one of then and run
```
rush build:watch --to-except @examples/[APP_YOU_WANT]
```
In another terminal run `pnpm run dev` remix command.

## How works PM2 and Nodemon together to refresh `node_modules`?
In orther to see in realtime changes I make in one of the packages inside one of
the `./examples` Remix apps I do 3 things:

1. Running Remix as an Express server
2. Using [pm2](https://www.npmjs.com/package/pm2) for running 3 process in parallel
3. Using [nodemon](https://www.npmjs.com/package/nodemon) for watching changes in `node_modules/@mything`

So every Remix app that we want to actively listen to changes in `./packages/**/*.{js,dt.ts}` we have to setup PM2 with a Nodemon watcher.

## References
- This article and repo are interesting. I copied from there []the linter](https://bereghici.dev/blog/build-a-scalable-front-end-with-rush-monorepo-and-react--eslint+lint-staged)
- Commit format reference [conventionalcommits.org](https://www.conventionalcommits.org/en/v1.0.0/)
