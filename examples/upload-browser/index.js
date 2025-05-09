import { Codex } from "@codex-storage/sdk-js";
import { BrowserUploadStategy } from "@codex-storage/sdk-js/browser";

async function main() {
  const codex = new Codex(process.env.CODEX_NODE_URL);

  const data = codex.data;

  const file = new File(["foo"], "foo.txt", {
    type: "text/plain",
  });

  const onProgress = (loaded, total) => {
    console.info("Loaded", loaded, "total", total);
  };

  const metadata = {
    filename: "foo.xt",
    mimetype: "text/plain",
  };

  const stategy = new BrowserUploadStategy(file, onProgress, metadata);

  const uploadResponse = data.upload(stategy);

  const res = await uploadResponse.result;

  if (res.error) {
    console.error(res.data);
    return;
  }

  console.info("CID is", res.data);
}

main();
