/**
 * @type {import('@remix-run/dev').AppConfig}.
 *
 * `watchGlobs` IS CUSTOM ATM:
 * https://github.com/remix-run/remix/issues/1193#issuecomment-1033366665
 */
module.exports = {
  ignoredRouteFiles: [".*"],
  watchGlobs: ["./node_modules/@remix-storage/**/.*"]
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  // devServerPort: 8002
};
