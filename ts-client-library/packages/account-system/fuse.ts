import { fusebox, pluginReplace } from "fuse-box"

const fuse = fusebox({
	target: "browser",
	entry: "src/index.ts",
	webIndex: {
		template: "src/index.html",
	},
	devServer: true,
	sourceMap: true,
	hmr: false,
	plugins: [
		pluginReplace(/node_modules\/bn\.js\/.*/, {
			"require('buffer')": "require('" + require.resolve("./node_modules/buffer") + "')",
		}),
		pluginReplace(/node_modules\/readable-stream\/.*/, {
			"require('util')": "require('" + require.resolve("./node_modules/util") + "')",
		}),
	],
})

fuse.runDev()
