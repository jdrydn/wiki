import path from 'path';
import { createContentLoader } from 'vitepress';

export default createContentLoader(path.resolve(__dirname, '../entries/*.md'), {
  includeSrc: false,
  render: false,
  excerpt: true,
  transform: (items) =>
    items
      .filter((item) => item.url !== '/entries/')
      .map((item) => {
        const filename = path.basename(item.url, path.extname(item.url));
        const firstTitle = item.excerpt?.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1];
        item.frontmatter.title = item.frontmatter.title || firstTitle || filename;
        return item;
      }),
});
