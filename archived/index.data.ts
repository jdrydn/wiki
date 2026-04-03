import path from 'path';
import { createContentLoader } from 'vitepress';

export default createContentLoader(path.resolve(__dirname, '../archived/*.md'), {
  includeSrc: false,
  render: true,
  excerpt: false,
  transform: (items) =>
    items
      .filter((item) => item.url !== '/archived/')
      .map((item) => {
        const filename = path.basename(item.url, path.extname(item.url));
        const firstTitle = item.html?.slice(0, 500).match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1];
        item.frontmatter.title = item.frontmatter.title || firstTitle || filename;
        return item;
      }),
});
