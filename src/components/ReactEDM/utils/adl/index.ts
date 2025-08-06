// utils/adl/index.ts
const adlFiles = import.meta.glob('./*.adl', {
  eager: true,
  query: '?raw',
  import: 'default'
});

const formatAdlContent = (content: string) => {
  // Convert escaped characters back to their original form
  return content
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"');
};

const modules = Object.entries(adlFiles).reduce((acc, [path, content]) => {
  const key = path
    .replace('./', '')
    .replace('.adl', '');
    
  acc[key] = formatAdlContent(content as string);
  return acc;
}, {} as Record<string, string>);

export default modules;

export { default as simDetector } from './simDetector.adl?raw';
export { default as simDetectorSetup} from './simDetectorSetup.adl?raw';