import { fusebox, sparky, pluginReplace } from "fuse-box";
import * as path from "path"

class Context {
  runServer: boolean;
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

const { task, src, exec, rm } = sparky<Context>(Context);

task("remove-artifacts", async () => {
  rm("dist")
  rm(".cache")
})

task("copy-streamsaver", async () => {
  await src("node_modules/streamsaver/{mitm.html,sw.js}")
    .dest("dist/resources/streamsaver", path.join(__dirname, "node_modules/streamsaver"))
    .write()
    .exec()
})

task("default", async ctx => {
  await exec("remove-artifacts")

  ctx.runServer = true;
  const fuse = ctx.getConfig();

  await exec("copy-streamsaver")
  await fuse.runDev();
});

task("preview", async ctx => {
  await exec("remove-artifacts")

  ctx.runServer = true;
  const fuse = ctx.getConfig();

  await exec("copy-streamsaver")
  await fuse.runProd({ uglify: false });
});
task("dist", async ctx => {
  await exec("remove-artifacts")

  ctx.runServer = false;
  const fuse = ctx.getConfig();

  await exec("copy-streamsaver")
  await fuse.runProd({ uglify: false });
});
