import Link from 'next/link';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Images', href: '/images' },
  { label: 'Tools', href: '/tools' },
  { label: 'Track Cam', href: '/track-cam' },
  { label: 'Projects', href: '/projects' },
  { label: 'Notes', href: '/notes' },
  { label: 'Documents', href: '/documents' },
  { label: 'About', href: '/about' },
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-archive-line bg-archive-bg/85 backdrop-blur" aria-label="Primary navigation">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
          <span className="grid size-10 place-items-center rounded-2xl bg-archive-ink text-white">K</span>
          <span>Kapil Archive</span>
        </Link>
        <div className="flex flex-wrap gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-archive-muted transition hover:bg-white/70 hover:text-archive-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
