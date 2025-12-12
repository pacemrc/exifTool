import { defineConfig } from 'vite';
import path from 'node:path';

const rootDir = 'src/frontend';
const rootAbs = path.resolve(process.cwd(), rootDir);

export default defineConfig({
  root: rootDir,
  base: './',
  // 配置环境变量文件目录，指向项目根目录
  envDir: path.resolve(process.cwd()),
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: path.resolve(rootAbs, 'index.html')
      }
    }
  },
  // 开发模式配置
  server: {
    port: 3000,
    host: true,
    open: true,
    hot: true,
    proxy: {
    }
  }
});
