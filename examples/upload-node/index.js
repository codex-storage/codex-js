const  { Codex } = require("@codex-storage/sdk-js");
const { NodeDownloadStategy } = require("@codex-storage/sdk-js/node");

async function main() {
  const codex = new Codex(process.env.CODEX_NODE_URL || "http://localhost:8080");
  const data = codex.data

  const stategy = new NodeDownloadStategy("Hello World !")
  const uploadResponse = data.upload(stategy);

  const res = await uploadResponse.result 

  if (res.error) {
    console.error(res.data)
    return 
  }

  console.info("CID is", res.data)
}

main()