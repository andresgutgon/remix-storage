## TODO
- [x] Setup examples folder for remix projects to develop the lib
- [ ] Make esbuild and TS watchers work together. Try [tsup](https://tsup.egoist.sh)
- [ ] Develop the first feature
- [ ] Understad how release / publish proccess works
- [ ] Define all I want to do in this project

## Watch changes on examples
The way Remix compiler watch it doesn't listen to changes inside `node_modules`.
There's an [issue open](https://github.com/remix-run/remix/issues/1193#issuecomment-1033366665) and a workaround fix for it.
Also each time you change something in a `node_modules` you have to save a file
inside `app` folder
