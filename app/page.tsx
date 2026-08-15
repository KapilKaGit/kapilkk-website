import { Archive, Download, FileBox, FileText, FolderKanban, Image as ImageIcon, Wrench } from 'lucide-react';
import { Card, SearchBar } from '@/components/UI';
import { images, projects, stats, tags } from '@/lib/data';

const categories = [
  { name: 'Images', icon: ImageIcon, description: 'Curated photos, screenshots, scans, and visual references.', count: stats.images, href: '/images' },
  { name: 'Tools', icon: Wrench, description: 'Small browser utilities for images, metadata, and file workflows.', count: stats.tools, href: '/tools' },
  { name: 'Projects', icon: FolderKanban, description: 'Builds, experiments, demos, and source links.', count: stats.projects, href: '/projects' },
  { name: 'Notes', icon: FileText, description: 'Markdown knowledge-base entries and research snippets.', count: stats.notes, href: '/notes' },
  { name: 'Documents', icon: FileBox, description: 'PDFs, templates, references, and categorized files.', count: stats.documents, href: '/documents' },
  { name: 'Downloads', icon: Download, description: 'Reusable assets and exports ready to grab.', count: 18, href: '/documents' },
];

export default function Home() {
  const recentAdditions = [
    ...images.slice(0, 3).map((image) => ({ type: 'Image', title: image.title })),
    ...projects.slice(0, 3).map((project) => ({ type: 'Project', title: project.title })),
  ];

  return (
    <div className="fade-in">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-4xl">
          <p className="mb-4 inline-flex rounded-full border border-archive-line bg-white/60 px-4 py-2 text-sm font-bold text-archive-muted">
            <Archive className="mr-2 size-4" aria-hidden />
            Personal archive prototype
          </p>
          <h1 className="text-6xl font-black tracking-[-0.07em] md:text-8xl">Kapil Archive</h1>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-archive-muted">
            A personal archive of projects, tools, notes, images, experiments, and resources.
          </p>
          <div className="mt-10">
            <SearchBar placeholder="Search images, tools, notes, projects, documents..." />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-5 lg:px-8" aria-label="Quick stats">
        {Object.entries(stats).map(([label, value]) => (
          <Card key={label}>
            <p className="text-4xl font-black">{value}</p>
            <p className="mt-2 capitalize text-archive-muted">Total {label}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-black tracking-tight">Categories</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <a href={category.href} key={category.name}>
                <Card className="h-full">
                  <Icon className="mb-6 size-9 text-archive-accent" aria-hidden />
                  <h3 className="text-2xl font-black">{category.name}</h3>
                  <p className="mt-3 leading-7 text-archive-muted">{category.description}</p>
                  <p className="mt-5 text-sm font-bold">{category.count} items</p>
                </Card>
              </a>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-black tracking-tight">Recent Additions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {recentAdditions.map((item) => (
            <Card key={`${item.type}-${item.title}`}>
              <p className="text-xs font-bold uppercase tracking-widest text-archive-accent">{item.type}</p>
              <h3 className="mt-3 text-xl font-black">{item.title}</h3>
              <p className="mt-2 text-archive-muted">Added to the archive this month.</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-3xl font-black tracking-tight">Popular Tags</h2>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <a className="rounded-full border border-archive-line bg-white/60 px-4 py-2 font-bold text-archive-muted hover:text-archive-ink" href={`/search?tag=${tag}`} key={tag}>
              #{tag}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
