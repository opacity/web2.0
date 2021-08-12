import { fusebox, sparky, pluginReplace, pluginLink } from "fuse-box";
import * as path from "path";

class Context {
  runServer: boolean;
  env: {
    NODE_ENV: "development" | "production" | "localhost";
    STORAGE_NODE_VERSION: "beta" | "production";
    VERSION: string;
  };
  getConfig = () =>
    fusebox({
      target: "browser",
      entry: "src/index.tsx",
      webIndex: {
        template: "src/index.html",
      },
      cache: true,
      devServer: this.runServer,
      plugins: [
        pluginLink(/\.ico/, { useDefault: true }),
        pluginReplace(/(?:.*[\/\\])?node_modules[\/\\]bn\.js[\/\\].*/, {
          "require('buffer')": "require('" + require.resolve("./node_modules/buffer").replace(/\\/g, "\\\\") + "')",
        }),
        pluginReplace(/(?:.*[\/\\])?node_modules[\/\\]hdkey[\/\\].*/, {
          "require('crypto')":
            "require('" + require.resolve("./node_modules/crypto-browserify").replace(/\\/g, "\\\\") + "')",
        }),
        pluginReplace(/(?:.*[\/\\])?node_modules[\/\\]readable-stream[\/\\].*/, {
          "require('util')": "require('" + require.resolve("./node_modules/util").replace(/\\/g, "\\\\") + "')",
          "require('stream')":
            "require('" + require.resolve("./node_modules/stream-browserify").replace(/\\/g, "\\\\") + "')",
        }),
      ],
      env: this.env,
    });
}

const { task, src, exec, rm } = sparky<Context>(Context);

task("remove-artifacts", async () => {
  rm("dist");
  rm(".cache");
});

task("copy-streamsaver", async () => {
  await src("node_modules/streamsaver/{mitm.html,sw.js}")
    .dest("dist/resources/streamsaver", path.join(__dirname, "node_modules/streamsaver"))
    .write()
    .exec();

  await src("src/favicon.ico").dest("dist/resources", path.join(__dirname, "src")).write().exec();

  await src("src/sitemap.xml").dest("dist", path.join(__dirname, "src")).write().exec();

  await src("src/robots.txt").dest("dist", path.join(__dirname, "src")).write().exec();
});

task("default", async (ctx) => {
  await exec("run-dev-beta");
});

task("run-dev-prod", async (ctx) => {
  await exec("remove-artifacts");

  ctx.runServer = true;
  ctx.env = {
    NODE_ENV: "development",
    STORAGE_NODE_VERSION: "production",
    VERSION: process.env.VERSION,
  };
  const fuse = ctx.getConfig();

  await exec("copy-streamsaver");
  await fuse.runDev();
});

task("run-dev-beta", async (ctx) => {
  await exec("remove-artifacts");

  ctx.runServer = true;
  ctx.env = {
    NODE_ENV: "development",
    STORAGE_NODE_VERSION: "beta",
    VERSION: process.env.VERSION,
  };
  const fuse = ctx.getConfig();

  await exec("copy-streamsaver");
  await fuse.runDev();
});

task("run-prod-beta", async (ctx) => {
  await exec("remove-artifacts");

  ctx.runServer = true;
  ctx.env = {
    NODE_ENV: "production",
    STORAGE_NODE_VERSION: "beta",
    VERSION: process.env.VERSION,
  };
  const fuse = ctx.getConfig();

  await exec("copy-streamsaver");
  await fuse.runProd({ uglify: false });
});

task("run-prod-prod", async (ctx) => {
  await exec("remove-artifacts");

  ctx.runServer = true;
  ctx.env = {
    NODE_ENV: "production",
    STORAGE_NODE_VERSION: "production",
    VERSION: process.env.VERSION,
  };
  const fuse = ctx.getConfig();

  await exec("copy-streamsaver");
  await fuse.runProd({ uglify: false });
});

task("dist-prod-beta", async (ctx) => {
  await exec("remove-artifacts");

  ctx.runServer = false;
  ctx.env = {
    NODE_ENV: "production",
    STORAGE_NODE_VERSION: "beta",
    VERSION: process.env.VERSION,
  };
  const fuse = ctx.getConfig();

  await exec("copy-streamsaver");
  await fuse.runProd({ uglify: false });
});

task("dist-beta-local", async (ctx) => {
  await exec("remove-artifacts");

  ctx.runServer = true;
  ctx.env = {
    NODE_ENV: "localhost",
    STORAGE_NODE_VERSION: "beta",
    VERSION: "local",
  };
  const fuse = ctx.getConfig();

  await exec("copy-streamsaver");
  await fuse.runDev();
});

task("dist-prod-prod", async (ctx) => {
  await exec("remove-artifacts");

  ctx.runServer = false;
  ctx.env = {
    NODE_ENV: "production",
    STORAGE_NODE_VERSION: "production",
    VERSION: process.env.VERSION,
  };
  const fuse = ctx.getConfig();

  await exec("copy-streamsaver");
  await fuse.runProd({ uglify: false });
});
