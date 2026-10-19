import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['testing/themebuilder/*.test.js'],
        globals: true,
        testTimeout: 1800000, // 30min
        hookTimeout: 1800000,
        // NOTE: Tests change the working directory and share the packed cli
        fileParallelism: false
    }
});
