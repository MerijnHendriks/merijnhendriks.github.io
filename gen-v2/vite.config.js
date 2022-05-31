import { defineConfig } from 'vite'
import markdown from 'vite-plugin-md'
import ssr from 'vite-plugin-ssr/plugin'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    markdown(),
    ssr(),
    vue({ include: [/\.vue$/, /\.md$/] })
  ]
})
