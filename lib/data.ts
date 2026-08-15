export const stats = {
  images: 128,
  notes: 42,
  projects: 9,
  tools: 12,
  documents: 31,
};

export const tags = [
  'design',
  'typescript',
  'photography',
  'nextjs',
  'research',
  'personal',
  'automation',
  'reference',
  'ui',
  'archive',
];

const imageTitles = [
  'Desk setup',
  'Mountain light',
  'Notebook scan',
  'Old library',
  'Prototype board',
  'City texture',
  'Warm gradient',
  'Travel receipt',
  'Reference wall',
];

const imageHeights = [860, 520, 680, 780, 560, 720, 600, 840, 640];

export const images = imageTitles.map((title, index) => ({
  id: `img-${index + 1}`,
  title,
  tag: tags[index % tags.length],
  date: `2026-0${(index % 6) + 1}-1${index % 9}`,
  size: ['1.2 MB', '860 KB', '2.4 MB'][index % 3],
  resolution: ['2400×1600', '1920×1280', '3000×2100'][index % 3],
  format: ['JPG', 'PNG', 'WEBP'][index % 3],
  src: `https://picsum.photos/seed/kapil-${index + 1}/700/${imageHeights[index]}`,
}));

export const tools = [
  'Image Resize Tool',
  'Image Format Converter',
  'Image Compressor',
  'Metadata Viewer',
  'RGB565 Converter',
  'Video to ASCII Converter',
  'Saved Picture Shelf',
];

export const projects = [
  {
    title: 'Archive Indexer',
    desc: 'A fast personal catalog for files, notes, and image references.',
    tech: ['Next.js', 'TypeScript', 'Search'],
    image: 'https://picsum.photos/seed/archive/900/520',
  },
  {
    title: 'Utility Bench',
    desc: 'Browser-first image and document utilities for everyday workflows.',
    tech: ['Canvas', 'Tailwind', 'PWA'],
    image: 'https://picsum.photos/seed/bench/900/520',
  },
  {
    title: 'Knowledge Map',
    desc: 'Linked notes and resources arranged around topics and tags.',
    tech: ['Markdown', 'Graph', 'UX'],
    image: 'https://picsum.photos/seed/map/900/520',
  },
];

export const notes = [
  {
    title: 'Designing small tools',
    cat: 'Engineering',
    tags: ['tools', 'ui'],
    excerpt: 'Notes on keeping utilities focused, fast, and understandable.',
  },
  {
    title: 'Personal archive taxonomy',
    cat: 'Archive',
    tags: ['tags', 'research'],
    excerpt: 'A simple category system for images, documents, and project records.',
  },
  {
    title: 'Markdown reading mode',
    cat: 'Writing',
    tags: ['notes', 'markdown'],
    excerpt: 'Readable knowledge-base pages with calm spacing and clear hierarchy.',
  },
];

export const documents = [
  'Resume.pdf',
  'Project Brief.pdf',
  'Research Notes.pdf',
  'Invoice Template.docx',
  'Reading List.pdf',
];

export const searchGroups = {
  Images: images.slice(0, 3).map((image) => image.title),
  Tools: tools,
  Notes: notes.map((note) => note.title),
  Projects: projects.map((project) => project.title),
  Documents: documents,
};
