import fs from 'fs';
import fm from 'front-matter';
import path from 'path';
import { globSync } from 'glob';

const ROOT = path.resolve(__dirname, '../');

function parseFolder(folder: string, { ignored }: { ignored?: string[] }) {
  const cwd = path.join(ROOT, folder);
  return globSync('**/*.md', { cwd })
    .sort()
    .filter((filename) => !Array.isArray(ignored) || !ignored.includes(filename))
    .map((filename) => {
      const contents = fs.readFileSync(path.join(cwd, filename), 'utf8');
      const { attributes } = fm<Record<string, unknown>>(contents);
      return {
        url: '/' + path.join(folder, filename.replace('.md', '.html')),
        title:
          typeof attributes.title === 'string' ? attributes.title : path.basename(filename, path.extname(filename)),
        frontmatter: attributes,
      };
    });
}

export default {
  Entries: parseFolder('Entries', {
    ignored: ['index.md'],
  }),
  Archived: parseFolder('Archived', {
    ignored: ['index.md'],
  }),
};
