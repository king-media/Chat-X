/** @type {import('vite').UserConfig} */
// vite.config.js
import path from 'path'

import { defineConfig } from 'vite'

import postcssMixins from 'postcss-mixins'
import postcssNested from 'postcss-nested'

const mixins = {
  state: (mixin, property: string, active: string, color = "lightgray") => ({
    [property]: {
      '&:hover': {
        cursor: 'pointer',
        backgroundColor: color,
        '@mixin-content': {}
      },
    },
    [`${property}${active}`]: {
      backgroundColor: "rgba(0,0,0,0.5)",
      '@mixin-content': {},
    }
  })
}
// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [postcssMixins({ mixins }), postcssNested],
    },
  },
  resolve: {
    alias: [
      {
        find: '~src',
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