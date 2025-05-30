import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // run tests sequentially, not in parallel
    // number of workers set to 1 disables parallelism
    maxThreads: 1,
  },
});
