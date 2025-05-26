const { build } = require("esbuild");
const define = {};

for (const k in process.env) {
  define[`process.env.${k}`] = JSON.stringify(process.env[k]);
}

if (!process.env["CODEX_NODE_URL"]) {
  define[`process.env.CODEX_NODE_URL`] = '"http://localhost:8080"';
}

const options = {
  entryPoints: ["./index.js"],
  outfile: "./index.bundle.js",
  bundle: true,
  define,
  logOverride: {
    "ignored-bare-import": "silent",
  },
};

build(options).catch(() => process.exit(1));
