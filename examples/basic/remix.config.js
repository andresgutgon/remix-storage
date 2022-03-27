/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: "app",
  browserBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildDirectory: "build",
  devServerPort: 8002,
  watchGlobs: ["../../packages/**/src/**/*.ts"],
  serverDependenciesToBundle: [/^p-queue.*/, /^p-timeout.*/]
}
