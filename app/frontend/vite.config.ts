/** @type {import('vite').UserConfig} */
// vite.config.js
import path from 'path'

import { defineConfig } from 'vite'

import postcssNested from 'postcss-nested'

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [postcssNested],
    },
  },
  resolve: {
    alias: [
      {
        find: '~',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },

  // Define the prot to run the preview in 
  preview: {
    host: true,
    port: 8001
  }
})
