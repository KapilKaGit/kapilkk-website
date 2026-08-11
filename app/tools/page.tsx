'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Card, PageHeader } from '@/components/UI';

type SavedPicture = {
  id: string;
  name: string;
  savedAt: string;
  dataUrl: string;
};

type ImageInfo = {
  file: File;
  url: string;
  width: number;
  height: number;
};

const toolTabs = [
  'Resize',
  'Convert',
  'Compress',
  'RGB565',
  'Video ASCII',
  'Saved pictures',
];

const apiPlaceholders = {
  rgb565: '/api/image/rgb565',
  ascii: '/api/video/ascii',
};

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** power).toFixed(power ? 1 : 0)} ${units[power]}`;
}

function toRgb565Hex(red: number, green: number, blue: number) {
  const value = ((red & 0xf8) << 8) | ((green & 0xfc) << 3) | (blue >> 3);
  return `0x${value.toString(16).padStart(4, '0').toUpperCase()}`;
}

export default function Tools() {
  const [activeTool, setActiveTool] = useState('Resize');
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [quality, setQuality] = useState(72);
  const [targetWidth, setTargetWidth] = useState(320);
  const [targetHeight, setTargetHeight] = useState(240);
  const [format, setFormat] = useState('image/png');
  const [serverUrl, setServerUrl] = useState('http://127.0.0.1:8080');
  const [savedPictures, setSavedPictures] = useState<SavedPicture[]>([]);
  const [rgbPreview, setRgbPreview] = useState<string[]>([]);
  const [asciiStatus, setAsciiStatus] = useState('Upload a video, then send it to your Termux backend for rendering.');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('kapil-tool-pictures');
    if (saved) setSavedPictures(JSON.parse(saved));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('kapil-tool-pictures', JSON.stringify(savedPictures));
  }, [savedPictures]);

  useEffect(() => {
    return () => {
      if (imageInfo) URL.revokeObjectURL(imageInfo.url);
    };
  }, [imageInfo]);

  const outputName = useMemo(() => {
    const base = imageInfo?.file.name.replace(/\.[^/.]+$/, '') || 'kapil-tool-output';
    const extension = format === 'image/jpeg' ? 'jpg' : format.split('/')[1];
    return `${base}-${activeTool.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
  }, [activeTool, format, imageInfo]);

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImageInfo((previous) => {
        if (previous) URL.revokeObjectURL(previous.url);
        return { file, url, width: image.naturalWidth, height: image.naturalHeight };
      });
      setTargetWidth(image.naturalWidth);
      setTargetHeight(image.naturalHeight);
    };
    image.src = url;
  }

  function renderImage(mode: 'resize' | 'convert' | 'compress' | 'rgb565' = 'resize') {
    if (!imageInfo || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return null;
    const width = mode === 'resize' ? targetWidth : imageInfo.width;
    const height = mode === 'resize' ? targetHeight : imageInfo.height;
    canvas.width = width;
    canvas.height = height;
    const image = new Image();
    image.src = imageInfo.url;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    if (mode === 'rgb565') {
      const sample = context.getImageData(0, 0, Math.min(width, 8), Math.min(height, 8)).data;
      const values = [];
      for (let index = 0; index < sample.length; index += 4) {
        values.push(toRgb565Hex(sample[index], sample[index + 1], sample[index + 2]));
      }
      setRgbPreview(values.slice(0, 32));
    }

    return canvas.toDataURL(format, mode === 'compress' ? quality / 100 : 0.92);
  }

  function handleDownload(mode: 'resize' | 'convert' | 'compress' | 'rgb565') {
    const dataUrl = renderImage(mode);
    if (dataUrl) downloadDataUrl(dataUrl, outputName);
  }

  function handleSave(mode: 'resize' | 'convert' | 'compress' | 'rgb565') {
    const dataUrl = renderImage(mode);
    if (!dataUrl) return;
    setSavedPictures((pictures) => [
      { id: crypto.randomUUID(), name: outputName, savedAt: new Date().toISOString(), dataUrl },
      ...pictures,
    ].slice(0, 24));
  }

  function prepareVideoForTermux(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setAsciiStatus(`Ready to POST ${file.name} to ${serverUrl}${apiPlaceholders.ascii}.`);
  }

  async function sendVideoToTermux() {
    if (!videoFile) {
      setAsciiStatus('Choose a video first.');
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);
    setAsciiStatus(`Sending ${videoFile.name} to your Termux server...`);

    try {
      const response = await fetch(`${serverUrl}${apiPlaceholders.ascii}`, {
        method: 'POST',
        body: formData,
      });
      setAsciiStatus(response.ok ? 'Termux backend accepted the video. Download the ASCII result from your phone server.' : `Termux backend returned ${response.status}.`);
    } catch {
      setAsciiStatus('Could not reach the Termux backend. Check that your phone server, IP address, port, and CORS settings are correct.');
    }
  }

  return (
    <>
      <PageHeader eyebrow="Pocket media lab" title="Photo + video converters">
        A filing-cabinet style toolbox for image conversion, RGB565 export, saved pictures, and Termux-powered video to ASCII rendering.
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-archive-line bg-white/70 p-4 shadow-soft">
          <div className="flex flex-wrap gap-2">
            {toolTabs.map((tab) => (
              <button key={tab} className={`rounded-t-2xl border px-4 py-3 font-black ${activeTool === tab ? 'border-archive-ink bg-archive-ink text-white' : 'border-archive-line bg-archive-paper'}`} type="button" onClick={() => setActiveTool(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <Card className="min-h-[520px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-black">{activeTool}</h2>
            <span className="rounded-full bg-archive-bg px-3 py-1 text-xs font-black uppercase tracking-widest">Browser first</span>
          </div>

          {activeTool !== 'Video ASCII' && activeTool !== 'Saved pictures' && (
            <div className="mt-5 space-y-4">
              <input accept="image/*" className="w-full rounded-2xl border border-archive-line bg-white p-3" type="file" onChange={handleImageUpload} />
              {imageInfo && <p className="text-sm text-archive-muted">{imageInfo.file.name} · {imageInfo.width}×{imageInfo.height} · {formatBytes(imageInfo.file.size)}</p>}

              {activeTool === 'Resize' && <div className="grid gap-3 sm:grid-cols-2"><input className="rounded-xl border p-3" min="1" type="number" value={targetWidth} onChange={(event) => setTargetWidth(Number(event.target.value))} /><input className="rounded-xl border p-3" min="1" type="number" value={targetHeight} onChange={(event) => setTargetHeight(Number(event.target.value))} /></div>}
              {(activeTool === 'Convert' || activeTool === 'Compress' || activeTool === 'Resize') && <select className="w-full rounded-xl border p-3" value={format} onChange={(event) => setFormat(event.target.value)}><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WEBP</option></select>}
              {activeTool === 'Compress' && <><input className="w-full" max="95" min="10" type="range" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /><p className="text-archive-muted">Quality: {quality}%</p></>}
              {activeTool === 'RGB565' && <p className="rounded-2xl bg-archive-bg p-4 text-sm text-archive-muted">Export a sampled RGB565 hex table locally, or point your Termux server at <code>{apiPlaceholders.rgb565}</code> for full binary output.</p>}
              <div className="flex flex-wrap gap-3"><button className="rounded-full bg-archive-ink px-5 py-3 font-bold text-white" type="button" onClick={() => handleDownload(activeTool === 'RGB565' ? 'rgb565' : activeTool.toLowerCase() as 'resize' | 'convert' | 'compress')}>Download</button><button className="rounded-full border border-archive-line px-5 py-3 font-bold" type="button" onClick={() => handleSave(activeTool === 'RGB565' ? 'rgb565' : activeTool.toLowerCase() as 'resize' | 'convert' | 'compress')}>Save picture here</button></div>
              {rgbPreview.length > 0 && <pre className="max-h-40 overflow-auto rounded-2xl bg-black p-4 text-xs text-green-300">{rgbPreview.join(', ')}</pre>}
            </div>
          )}

          {activeTool === 'Video ASCII' && <div className="mt-5 space-y-4"><input className="w-full rounded-2xl border border-archive-line bg-white p-3" type="url" value={serverUrl} onChange={(event) => setServerUrl(event.target.value)} aria-label="Termux server URL" /><input accept="video/*" className="w-full rounded-2xl border border-archive-line bg-white p-3" type="file" onChange={prepareVideoForTermux} /><p className="rounded-2xl bg-archive-bg p-4 text-archive-muted">{asciiStatus}</p><button className="rounded-full bg-archive-ink px-5 py-3 font-bold text-white" type="button" onClick={sendVideoToTermux}>Send to Termux backend</button></div>}

          {activeTool === 'Saved pictures' && <div className="mt-5 grid gap-4 sm:grid-cols-2">{savedPictures.map((picture) => <button className="text-left" key={picture.id} type="button" onClick={() => downloadDataUrl(picture.dataUrl, picture.name)}><img className="aspect-video rounded-2xl border object-cover" src={picture.dataUrl} alt={picture.name} /><p className="mt-2 font-bold">{picture.name}</p><p className="text-xs text-archive-muted">Saved {new Date(picture.savedAt).toLocaleString()}</p></button>)}{savedPictures.length === 0 && <p className="text-archive-muted">No saved pictures yet. Use “Save picture here” in an image tool.</p>}</div>}
        </Card>

        <Card className="overflow-hidden bg-[#fbfaf5]">
          <div className="relative mx-auto max-w-sm pt-8">
            {['RGB565', 'ASCII VIDEO', 'COMPRESS', 'CONVERT', 'RESIZE'].map((label, index) => <div className="-mb-3 ml-4 rounded-t-2xl border border-archive-ink bg-white px-8 py-3 font-mono text-sm shadow-sm" style={{ width: `${92 - index * 5}%` }} key={label}>{label}</div>)}
            <div className="rounded-3xl border-2 border-archive-ink bg-white p-6 shadow-xl">
              {imageInfo ? <img className="max-h-80 w-full rounded-2xl object-contain" src={imageInfo.url} alt="Selected preview" /> : <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-archive-line bg-archive-bg p-8 text-center font-mono text-archive-muted">UPLOAD IMAGE / VIDEO</div>}
              <div className="mt-5 grid grid-cols-3 gap-2 text-center font-mono text-xs"><span>TERMUX</span><span>LOCAL SAVE</span><span>CANVAS</span></div>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </Card>
      </section>
    </>
  );
}
