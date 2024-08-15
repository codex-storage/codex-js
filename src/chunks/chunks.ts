export const Chunks = {
  async split(file: File) {
    const totalSize = file.size;
    const chunkSize = 1024 * 1024 * 3; // 10MB

    const chunks = [] as Uint8Array[];
    const amountOfChunks = Math.ceil(totalSize / chunkSize);

    for (let index = 0; index < amountOfChunks; index++) {
      const start = index * chunkSize;
      const end = (index + 1) * chunkSize;

      const chunk = await file.slice(start, end).arrayBuffer();
      chunks.push(new Uint8Array(chunk));
    }

    return chunks;
  },
};
