'use client';

import { Copy, Download, Heart, X } from 'lucide-react';
import { useState } from 'react';
import { Card, PageHeader } from '@/components/UI';
import { images, tags } from '@/lib/data';

type ArchiveImage = (typeof images)[number];

export default function Images() {
  const [selectedImage, setSelectedImage] = useState<ArchiveImage | null>(images[0]);

  return (
    <>
      <PageHeader eyebrow="Image archive" title="Images">
        Search, filter, preview, favorite, download, and inspect metadata for visual assets.
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input className="rounded-2xl border border-archive-line bg-white p-4" placeholder="Search images" />
          <select className="rounded-2xl border border-archive-line bg-white p-4" aria-label="Filter by tag">
            <option>All tags</option>
            {tags.map((tag) => <option key={tag}>{tag}</option>)}
          </select>
          <input type="date" className="rounded-2xl border border-archive-line bg-white p-4" aria-label="Filter by upload date" />
        </div>

        <div className="masonry">
          {images.map((image) => (
            <button
              type="button"
              onClick={() => setSelectedImage(image)}
              className="w-full overflow-hidden rounded-3xl border border-archive-line bg-white text-left shadow-soft transition hover:-translate-y-1"
              key={image.id}
            >
              <img src={image.src} alt={image.title} loading="lazy" />
              <div className="p-4">
                <b>{image.title}</b>
                <p className="text-sm text-archive-muted">#{image.tag} · {image.date}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedImage ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <Card className="max-h-[90vh] w-full max-w-5xl overflow-auto">
            <button className="float-right rounded-full border p-2" type="button" onClick={() => setSelectedImage(null)} aria-label="Close preview">
              <X className="size-4" />
            </button>
            <img className="max-h-[52vh] w-full rounded-2xl object-cover" src={selectedImage.src} alt={selectedImage.title} />
            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_260px]">
              <div>
                <h2 className="text-3xl font-black">{selectedImage.title}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-full bg-archive-ink px-4 py-2 text-white" type="button"><Download className="inline size-4" /> Download</button>
                  <button className="rounded-full border px-4 py-2" type="button"><Copy className="inline size-4" /> Copy link</button>
                  <button className="rounded-full border px-4 py-2" type="button"><Heart className="inline size-4" /> Favorite</button>
                </div>
              </div>
              <aside className="rounded-2xl bg-archive-bg p-4 text-sm">
                <b>Metadata</b>
                <p>Resolution: {selectedImage.resolution}</p>
                <p>Format: {selectedImage.format}</p>
                <p>File size: {selectedImage.size}</p>
                <p>Uploaded: {selectedImage.date}</p>
                <p>Tag: {selectedImage.tag}</p>
              </aside>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
