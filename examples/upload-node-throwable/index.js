const { Codex } = require("@codex-storage/sdk-js/throwable");
const { NodeUploadStrategy } = require("@codex-storage/sdk-js/node");

async function main() {
  const codex = new Codex(
    process.env.CODEX_NODE_URL || "http://localhost:8080"
  );
  const data = codex.data;

  const strategy = new NodeUploadStrategy("Hello World !");
  const uploadResponse = data.upload(strategy);

  const cid = await uploadResponse.result;

  console.info("CID is", cid);
}

main();
