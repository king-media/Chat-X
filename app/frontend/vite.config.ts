/** @type {import('vite').UserConfig} */
// vite.config.js
import path from 'path'

import { defineConfig } from 'vite'

import postcssMixins from 'postcss-mixins'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import tailwindNesting from 'tailwindcss/nesting'

const mixins = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: (_mixin: any, property: string, active: string, color = "lightgray") => ({
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
      plugins: [postcssMixins({ mixins }), tailwindNesting, tailwind, autoprefixer],
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