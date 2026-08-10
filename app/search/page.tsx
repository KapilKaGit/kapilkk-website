import { Card, PageHeader, SearchBar } from '@/components/UI';
import { searchGroups } from '@/lib/data';

export default function Search() {
  return (
    <>
      <PageHeader eyebrow="Global search" title="Search results">
        Results are grouped across images, tools, notes, projects, and documents.
      </PageHeader>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SearchBar />
        <div className="mt-8 grid gap-5">
          {Object.entries(searchGroups).map(([group, items]) => (
            <Card key={group}>
              <h2 className="text-2xl font-black">{group}</h2>
              <div className="mt-4 grid gap-2">
                {items.map((item) => <a className="rounded-2xl bg-white p-4 font-bold hover:bg-archive-bg" href="#" key={item}>{item}</a>)}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
