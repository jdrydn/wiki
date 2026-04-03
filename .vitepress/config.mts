import { defineConfig } from 'vitepress';

import items from './items';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "James's Wiki",
  description: "If you're not learning, you're not moving forwards!",
  appearance: false,
  themeConfig: {
    sidebar: {
      '/Entries/': [
        {
          text: 'Entries',
          items: items.Entries.map(({ title, url }) => ({
            text: title,
            link: url,
          })),
        },
      ],
      '/Archived/': [
        {
          text: 'Archived',
          items: items.Archived.map(({ title, url }) => ({
            text: title,
            link: url,
          })),
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jdrydn' },
      { icon: 'threads', link: 'https://threads.net/@jdrydn' },
    ],

    editLink: {
      pattern: 'https://github.com/jdrydn/wiki/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Released under the MIT License',
    },
    docFooter: {
      prev: false,
      next: false,
    },
  },
});
