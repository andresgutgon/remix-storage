module.exports = {
  apps: [
    {
      name: "Express App",
      script: "server.js",
      watch: [
        "remix.config.js",
        "app",
        // TODO: Test this:
        // https://github.com/remix-run/remix/discussions/2074#discussioncomment-2237102
        // "node_modules/@remix-storage"
      ],
      watch: [],
      watch_options: {
        followSymlinks: false,
      },
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "Remix",
      script: "remix watch",
      ignore_watch: ["."],
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "Watch dependencies change",
      script: "nodemon -e js,d.ts --watch node_modules/@remix-storage --on-change-only --exec \"touch app/refresh.ignore\" --config nodemon-watch.json",
      watch: false,
      env: { NODE_ENV: "development" }
    },
  ],
}
