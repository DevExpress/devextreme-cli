import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['testing/__tests__/*.test.js'],
        setupFiles: ['testing/vitest-setup.mjs'],
        globals: true,
        testTimeout: 300000,
        hookTimeout: 300000,
        fileParallelism: false
    }
});
