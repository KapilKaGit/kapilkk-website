import { Card, PageHeader } from '@/components/UI';
import { notes, tags } from '@/lib/data';

const categories = ['Engineering', 'Archive', 'Writing'];

export default function Notes() {
  return (
    <>
      <PageHeader eyebrow="Knowledge base" title="Notes">
        Searchable markdown-style notes with categories, tags, and a calm reading mode layout.
      </PageHeader>
      <section className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-[260px_1fr] lg:px-8">
        <aside>
          <input className="mb-4 w-full rounded-2xl border p-4" placeholder="Search notes" />
          <Card>
            <b>Categories</b>
            {categories.map((category) => <p className="mt-3 text-archive-muted" key={category}>{category}</p>)}
            <b className="mt-6 block">Tags</b>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.slice(0, 6).map((tag) => <span className="rounded-full bg-archive-bg px-3 py-1 text-sm" key={tag}>#{tag}</span>)}
            </div>
          </Card>
        </aside>
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.title}>
              <p className="text-sm font-bold text-archive-accent">{note.cat}</p>
              <h2 className="mt-2 text-3xl font-black">{note.title}</h2>
              <p className="mt-3 leading-8 text-archive-muted">{note.excerpt}</p>
              <article className="mt-5 rounded-2xl bg-white p-5 leading-8">
                <h3 className="font-black">Reading mode</h3>
                <p>This area represents rendered Markdown content with generous spacing, readable measure, and minimal interface noise.</p>
              </article>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
