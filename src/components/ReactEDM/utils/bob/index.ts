
const bobFiles = import.meta.glob('./*.bob', {
  eager: true,
  query: '?raw',
  import: 'default'
});

const formatbobContent = (content: string) => {
  // Convert escaped characters back to their original form
  return content
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"');
};

const modules = Object.entries(bobFiles).reduce((acc, [path, content]) => {
  const key = path
    .replace('./', '')
    .replace('.bob', '');
    
  acc[key] = formatbobContent(content as string);
  return acc;
}, {} as Record<string, string>);

export default modules;

export { default as ADBase } from './ADBase.bob?raw';