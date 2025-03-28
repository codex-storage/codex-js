import { Codex } from "@codex-storage/sdk-js";

async function main() {
  const codex = new Codex(process.env.CODEX_NODE_URL, {
    auth: {
      basic: btoa("admin:SuperSecret123"),
    },
  });

  const data = codex.data;

  const cid = process.env.CODEX_CID;

  const result = await data.networkDownloadStream(cid);

  console.info(await result.data.text());
}

main();
