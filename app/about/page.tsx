import { Card, PageHeader } from '@/components/UI';

export default function About() {
  return (
    <>
      <PageHeader eyebrow="About" title="A personal project built by an engineer.">
        Kapil Archive is a fast, clean frontend prototype for organizing projects, tools, notes, images, documents, and useful resources.
      </PageHeader>
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card>
          <p className="text-lg leading-9 text-archive-muted">
            The interface avoids corporate polish and focuses on practical browsing, strong search, plain-language metadata, and reusable components ready for a future backend.
          </p>
        </Card>
      </section>
    </>
  );
}
