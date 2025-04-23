import { defineConfig, transformWithEsbuild, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  return defineConfig({
    root: './client',
    envDir: '../',

    plugins: [
      {
        name: 'treat-js-files-as-jsx',
        async transform (code, id) {
          if (!id.match(/src\/.*\.js$/)) {
            return null;
          }

          // Use the exposed transform from vite, instead of directly
          // transforming with esbuild
          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic'
          });
        }
      },
      react()
    ],
    esbuild: {
      loader: 'jsx'
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx'
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    },
    server: {
      port: parseInt(process.env.VITE_CLIENT_PORT || '3003'),
      open: false
    }
  });
};
