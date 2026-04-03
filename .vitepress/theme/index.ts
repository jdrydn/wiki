import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

import LinkBlock from '../components/LinkBlock.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LinkBlock', LinkBlock);
  },
} satisfies Theme;
