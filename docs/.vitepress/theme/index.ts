// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import type { Theme } from 'vitepress'
import TypewriterTerminal from './components/TypewriterTerminal.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('TypewriterTerminal', TypewriterTerminal)
  }
} satisfies Theme