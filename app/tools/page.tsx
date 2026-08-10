'use client';

import { useState } from 'react';
import { Card, PageHeader } from '@/components/UI';

const comingSoonTools = ['PDF Tools', 'Audio Tools', 'Video Tools', 'AI Tools', 'Text Tools'];

export default function Tools() {
  const [quality, setQuality] = useState(70);

  return (
    <>
      <PageHeader eyebrow="Toolbox" title="Tools">
        Frontend-only utilities for image workflows, with mock previews and download controls.
      </PageHeader>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        <Card>
          <h2 className="text-2xl font-black">Image Resize Tool</h2>
          <input type="file" className="mt-4" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <input placeholder="Width" className="rounded-xl border p-3" />
            <input placeholder="Height" className="rounded-xl border p-3" />
          </div>
          <div className="mt-4 rounded-2xl bg-archive-bg p-8 text-center text-archive-muted">Preview result</div>
          <button className="mt-4 rounded-full bg-archive-ink px-4 py-2 text-white" type="button">Download resized image</button>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Image Format Converter</h2>
          <input type="file" className="mt-4" />
          <select className="mt-4 w-full rounded-xl border p-3" aria-label="Conversion type">
            <option>JPG to PNG</option><option>PNG to JPG</option><option>PNG to WEBP</option><option>WEBP to PNG</option><option>BMP to PNG</option>
          </select>
          <button className="mt-4 rounded-full bg-archive-ink px-4 py-2 text-white" type="button">Convert & Download</button>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Image Compressor</h2>
          <input type="file" className="mt-4" />
          <input type="range" min="10" max="95" value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="mt-5 w-full" />
          <p className="text-archive-muted">Compression: {quality}% · Estimated 48% smaller</p>
          <div className="mt-4 rounded-2xl bg-archive-bg p-8 text-center">Preview size reduction</div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Metadata Viewer</h2>
          <input type="file" className="mt-4" />
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><dt>Resolution</dt><dd>2400×1600</dd><dt>Format</dt><dd>PNG</dd><dt>File size</dt><dd>1.4 MB</dd><dt>Creation date</dt><dd>2026-08-09</dd></dl>
        </Card>

        {comingSoonTools.map((tool) => (
          <Card key={tool}>
            <span className="rounded-full bg-archive-bg px-3 py-1 text-xs font-black">Coming Soon</span>
            <h2 className="mt-4 text-2xl font-black">{tool}</h2>
            <p className="mt-2 text-archive-muted">Placeholder for future utility modules.</p>
          </Card>
        ))}
      </section>
    </>
  );
}
