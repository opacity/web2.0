import { fusebox, sparky, pluginReplace } from "fuse-box";
class Context {
  runServer;
  getConfig = () =>
    fusebox({
      target: "browser",
      entry: "src/index.tsx",
      webIndex: {
        template: "src/index.html"
      },
      cache: true,
      devServer: this.runServer,
      plugins: [
        pluginReplace(/node_modules\/bn\.js\/.*/, {
          "require('buffer')": "require('" + require.resolve("./node_modules/buffer") + "')",
        }),
        pluginReplace(/node_modules\/readable-stream\/.*/, {
          "require('util')": "require('" + require.resolve("./node_modules/util") + "')",
        }),
        pluginReplace(/node_modules\/readable-stream\/.*/, {
          "require('stream')": "require('" + require.resolve("./node_modules/stream-browserify") + "')",
        })
      ],
    });
}
const { task } = sparky<Context>(Context);

task("default", async ctx => {
  ctx.runServer = true;
  const fuse = ctx.getConfig();
  await fuse.runDev();
});

task("preview", async ctx => {
  ctx.runServer = true;
  const fuse = ctx.getConfig();
  await fuse.runProd({ uglify: false });
});
task("dist", async ctx => {
  ctx.runServer = false;
  const fuse = ctx.getConfig();
  await fuse.runProd({ uglify: false });
});

