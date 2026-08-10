import { Card, PageHeader } from '@/components/UI';
import { documents } from '@/lib/data';

export default function Documents() {
  return (
    <>
      <PageHeader eyebrow="Document archive" title="Documents">
        Upload, categorize, search, preview PDFs, and download files using mock frontend data.
      </PageHeader>
      <section className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <input className="rounded-2xl border p-4" placeholder="Search documents" />
            <select className="rounded-2xl border p-4" aria-label="Document category"><option>All categories</option><option>Personal</option><option>Research</option><option>Templates</option></select>
          </div>
          <div className="grid gap-3">
            {documents.map((document) => (
              <Card key={document}>
                <div className="flex items-center justify-between gap-4">
                  <div><h2 className="text-xl font-black">{document}</h2><p className="text-archive-muted">PDF preview · categorized · mock file</p></div>
                  <button className="rounded-full bg-archive-ink px-4 py-2 text-white" type="button">Download</button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <Card>
          <h2 className="text-2xl font-black">PDF Preview</h2>
          <div className="mt-4 grid h-96 place-items-center rounded-2xl bg-archive-bg text-archive-muted">Preview pane</div>
          <input type="file" className="mt-5" />
        </Card>
      </section>
    </>
  );
}
