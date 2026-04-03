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
        const defaultTitle = path.basename(item.url, path.extname(item.url));
        item.frontmatter.title = item.frontmatter.title || defaultTitle;
        return item;
      }),
});
