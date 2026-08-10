import Link from 'next/link';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <section className="fade-in mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-archive-accent">
        {eyebrow}
      </p>
      <h1 className="max-w-4xl text-5xl font-black tracking-[-0.06em] md:text-7xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-archive-muted">
        {children}
      </p>
    </section>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-archive-line bg-archive-paper p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function SearchBar({ placeholder = 'Search the archive...' }: { placeholder?: string }) {
  return (
    <form
      action="/search"
      className="flex w-full max-w-3xl items-center gap-2 rounded-3xl border border-archive-line bg-white/85 p-2 shadow-soft"
      role="search"
    >
      <label className="sr-only" htmlFor="global-search">
        Search Kapil Archive
      </label>
      <input
        id="global-search"
        name="q"
        className="min-h-14 flex-1 bg-transparent px-5 text-base outline-none placeholder:text-archive-muted/70 sm:text-lg"
        placeholder={placeholder}
      />
      <button className="rounded-2xl bg-archive-ink px-5 py-4 text-sm font-bold text-white transition hover:bg-black sm:px-6">
        Search
      </button>
    </form>
  );
}

export function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      className="rounded-full border border-archive-line px-4 py-2 text-sm font-bold transition hover:bg-white"
      href={href}
    >
      {children}
    </Link>
  );
}
