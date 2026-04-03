import path from 'path';
import { createContentLoader } from 'vitepress';

export default createContentLoader(path.resolve(__dirname, '../archived/*.md'), {
  includeSrc: false,
  render: false,
  excerpt: true,
  transform: (items) =>
    items
      .filter((item) => item.url !== '/archived/')
      .map((item) => {
        const defaultTitle = path.basename(item.url, path.extname(item.url));
        item.frontmatter.title = item.frontmatter.title || defaultTitle;
        return item;
      }),
});
