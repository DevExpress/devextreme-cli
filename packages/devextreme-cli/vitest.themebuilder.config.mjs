import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['testing/themebuilder/*.test.js'],
        globals: true,
        testTimeout: 1800000,
        hookTimeout: 1800000,
        fileParallelism: false
    }
});
