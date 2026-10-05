import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/site-transfer/**/*.spec.ts'],
    fileParallelism: false,
  },
})
