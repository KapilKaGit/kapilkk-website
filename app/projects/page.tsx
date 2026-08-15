import { Card, LinkButton, PageHeader } from '@/components/UI';
import { projects } from '@/lib/data';

export default function Projects() {
  return (
    <>
      <PageHeader eyebrow="Project shelf" title="Projects">
        Cards for demos, source code, technologies, and short build notes.
      </PageHeader>
      <section className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        {projects.map((project) => (
          <Card key={project.title} className="overflow-hidden p-0">
            <img src={project.image} alt="" className="h-48 w-full object-cover" loading="lazy" />
            <div className="p-6">
              <h2 className="text-2xl font-black">{project.title}</h2>
              <p className="mt-3 leading-7 text-archive-muted">{project.desc}</p>
              <div className="my-4 flex flex-wrap gap-2">
                {project.tech.map((tech) => <span className="rounded-full bg-archive-bg px-3 py-1 text-sm font-bold" key={tech}>{tech}</span>)}
              </div>
              <div className="flex gap-2"><LinkButton href="#">GitHub</LinkButton><LinkButton href="#">Demo</LinkButton></div>
            </div>
          </Card>
        ))}
      </section>
    </>
  );
}
