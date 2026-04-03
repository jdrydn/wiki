import { defineConfig } from 'vitepress';
import { generateSidebar } from 'vitepress-sidebar';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "James's Wiki",
  description: "If you're not learning, you're not moving forwards!",
  lang: 'en-GB',
  appearance: false,
  lastUpdated: true,
  srcExclude: ['./readme.md', './license.md'],
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: 'https://jdrydn.com/favicons/favicon-16x16.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: 'https://jdrydn.com/favicons/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: 'https://jdrydn.com/favicons/favicon-16x16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: 'https://jdrydn.com/favicons/apple-touch-icon.png' }],
  ],
  themeConfig: {
    sidebar: generateSidebar([
      {
        scanStartPath: 'Entries',
        basePath: '/Entries/',
        resolvePath: '/Entries/',
        useTitleFromFileHeading: true,
      },
      {
        scanStartPath: 'Archived',
        resolvePath: '/Archived/',
        useTitleFromFrontmatter: true,
      },
    ]),

    socialLinks: [
      { icon: 'safari', link: 'https://jdrydn.com' },
      { icon: 'github', link: 'https://github.com/jdrydn' },
      { icon: 'threads', link: 'https://threads.net/@jdrydn' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/jdrydn' },
    ],

    editLink: {
      pattern: 'https://github.com/jdrydn/wiki/edit/main/:path',
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Released under the MIT License',
    },
    docFooter: {
      prev: false,
      next: false,
    },
    lastUpdated: {
      formatOptions: {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'Europe/London',
      },
    },
  },
  markdown: {
    anchor: {
      permalink: undefined,
    },
  },
});
