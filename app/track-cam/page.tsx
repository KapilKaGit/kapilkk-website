'use client';

import { useEffect, useRef, useState } from 'react';

const ORANGE = '255,88,24';
const W = 480;
const H = 640;
const EDGE_GRID = 20;
const SKIN_GRID = 16;
const MISS_LIMIT = 8;

type Box = { x: number; y: number; w: number; h: number; weight?: number };
type Point = [number, number];

function fmtClock(startTime: number) {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function isSkinPixel(r: number, g: number, b: number) {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  return y > 45 && y < 245 && cb > 82 && cb < 128 && cr > 136 && cr < 172 && sat > 18;
}

function findSkinClusters(imgData: ImageData) {
  const d = imgData.data;
  const cols = Math.ceil(W / SKIN_GRID);
  const rows = Math.ceil(H / SKIN_GRID);
  const density = new Float32Array(cols * rows);

  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const idx = (y * W + x) * 4;
      if (isSkinPixel(d[idx], d[idx + 1], d[idx + 2])) {
        density[Math.min(rows - 1, Math.floor(y / SKIN_GRID)) * cols + Math.min(cols - 1, Math.floor(x / SKIN_GRID))]++;
      }
    }
  }

  const visited = new Uint8Array(cols * rows);
  const clusters: Box[] = [];

  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const i = cy * cols + cx;
      if (visited[i] || density[i] < 10) continue;
      const stack: Point[] = [[cx, cy]];
      visited[i] = 1;
      let minX = cx;
      let maxX = cx;
      let minY = cy;
      let maxY = cy;
      let count = 0;
      let weight = 0;

      while (stack.length) {
        const [ccx, ccy] = stack.pop()!;
        count++;
        weight += density[ccy * cols + ccx];
        minX = Math.min(minX, ccx);
        maxX = Math.max(maxX, ccx);
        minY = Math.min(minY, ccy);
        maxY = Math.max(maxY, ccy);

        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as Point[]) {
          const nx = ccx + dx;
          const ny = ccy + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const ni = ny * cols + nx;
          if (!visited[ni] && density[ni] >= 10) {
            visited[ni] = 1;
            stack.push([nx, ny]);
          }
        }
      }

      const boxWpx = (maxX - minX + 1) * SKIN_GRID;
      const boxHpx = (maxY - minY + 1) * SKIN_GRID;
      const compactness = count / ((maxX - minX + 1) * (maxY - minY + 1));
      if (count >= 2 && compactness > 0.4 && boxWpx <= W * 0.5 && boxHpx <= H * 0.5 && boxWpx >= W * 0.05 && boxHpx >= H * 0.05) {
        clusters.push({ x: minX * SKIN_GRID, y: minY * SKIN_GRID, w: boxWpx, h: boxHpx, weight });
      }
    }
  }

  return clusters.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
}

function lerpBox(cur: Box | null, target: Box | null, k: number) {
  if (!cur) return target;
  if (!target) return cur;
  return {
    x: cur.x + (target.x - cur.x) * k,
    y: cur.y + (target.y - cur.y) * k,
    w: cur.w + (target.w - cur.w) * k,
    h: cur.h + (target.h - cur.h) * k,
  };
}

export default function TrackCamPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const offRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const faceRaw = useRef<Box | null>(null);
  const handRaw = useRef<Box | null>(null);
  const faceSmooth = useRef<Box | null>(null);
  const handSmooth = useRef<Box | null>(null);
  const miss = useRef({ face: 0, hand: 0 });
  const bgPoints = useRef<Point[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [status, setStatus] = useState('initializing camera…');
  const [clock, setClock] = useState('00:00:00');
  const [points, setPoints] = useState(0);
  const [scanMode, setScanMode] = useState<'classic' | 'thermal' | 'xray'>('classic');
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const timer = window.setInterval(() => setClock(fmtClock(start)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    offRef.current = document.createElement('canvas');
    offRef.current.width = W;
    offRef.current.height = H;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setStatus('initializing camera…');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode, width: { ideal: 720 }, height: { ideal: 960 } }, audio: false });
        if (cancelled) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus('');
        frameRef.current = 0;
      } catch (error) {
        setStatus(`camera unavailable: ${error instanceof Error ? error.message : 'permission denied'} — grant camera permission and reload.`);
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const off = offRef.current;
    if (!canvas || !video || !off) return;
    const liveVideo = video;
    const offscreen = off;
    const maybeContext = canvas.getContext('2d', { willReadFrequently: true });
    const maybeOffscreenCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!maybeContext || !maybeOffscreenCtx) return;
    const context = maybeContext;
    const offscreenCtx = maybeOffscreenCtx;
    canvas.width = W;
    canvas.height = H;

    function drawVideoFrameCropped() {
      const vw = liveVideo.videoWidth;
      const vh = liveVideo.videoHeight;
      if (!vw || !vh) return false;
      const targetRatio = W / H;
      let sw = vw;
      let sh = vh;
      let sx = 0;
      let sy = 0;
      if (vw / vh > targetRatio) {
        sw = vh * targetRatio;
        sx = (vw - sw) / 2;
      } else {
        sh = vw / targetRatio;
        sy = (vh - sh) / 2;
      }
      offscreenCtx.save();
      if (facingMode === 'user') {
        offscreenCtx.translate(W, 0);
        offscreenCtx.scale(-1, 1);
      }
      offscreenCtx.drawImage(liveVideo, sx, sy, sw, sh, 0, 0, W, H);
      offscreenCtx.restore();
      return true;
    }

    function updateDetections() {
      const clusters = findSkinClusters(offscreenCtx.getImageData(0, 0, W, H));
      if (!clusters.length) {
        faceRaw.current = null;
        handRaw.current = null;
        return;
      }
      const faceCand = clusters.find((c) => c.y < H * 0.7) ?? clusters[0];
      faceRaw.current = { x: faceCand.x - faceCand.w * 0.35, y: faceCand.y - faceCand.h * 0.45, w: faceCand.w * 1.7, h: faceCand.h * 1.9 };
      const overlaps = (a: Box, b: Box) => !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
      handRaw.current = null;
      for (const c of clusters) {
        if (c === faceCand || (c.weight ?? 0) <= 8) continue;
        const padded = { x: c.x - c.w * 0.4, y: c.y - c.h * 0.4, w: c.w * 1.8, h: c.h * 1.8 };
        if (!overlaps(faceRaw.current, padded)) {
          handRaw.current = padded;
          break;
        }
      }
    }

    function computeBgPoints(gray: Float32Array, minMag: number, grid: number) {
      const pts: Point[] = [];
      for (let y = grid; y < H - grid; y += grid) {
        for (let x = grid; x < W - grid; x += grid) {
          const gx = gray[y * W + (x + 2)] - gray[y * W + (x - 2)];
          const gy = gray[(y + 2) * W + x] - gray[(y - 2) * W + x];
          if (Math.sqrt(gx * gx + gy * gy) > minMag) pts.push([x + (Math.random() * 6 - 3), y + (Math.random() * 6 - 3)]);
        }
      }
      return pts;
    }

    function processFrame() {
      const imgData = offscreenCtx.getImageData(0, 0, W, H);
      const d = imgData.data;
      const cleanLum = new Float32Array(W * H);
      let lo = 255;
      let hi = 0;

      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        cleanLum[p] = lum;
        lo = Math.min(lo, lum);
        hi = Math.max(hi, lum);
      }
      const range = Math.max(1, hi - lo);
      for (let p = 0; p < cleanLum.length; p++) cleanLum[p] = ((cleanLum[p] - lo) / range) * 255;

      for (let i = 0; i < d.length; i += 4) {
        let lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        lum *= scanMode === 'xray' ? 0.48 : 0.62;
        lum += (Math.random() - 0.5) * (scanMode === 'thermal' ? 46 : 34);
        if (scanMode === 'thermal') {
          d[i] = Math.max(0, Math.min(255, lum * 1.35));
          d[i + 1] = Math.max(0, Math.min(255, lum * 0.38));
          d[i + 2] = Math.max(0, Math.min(255, lum * 0.08));
        } else {
          d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, lum));
        }
      }

      const bandSeed = frameRef.current * 0.7;
      for (let y = 0; y < H; y++) {
        const band = Math.sin((y + bandSeed) * 0.045) > 0.3 ? 14 : 0;
        if (!band) continue;
        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          d[idx] = Math.min(255, d[idx] + band);
          d[idx + 1] = Math.min(255, d[idx + 1] + band);
          d[idx + 2] = Math.min(255, d[idx + 2] + band);
        }
      }

      context.putImageData(imgData, 0, 0);
      if (frameRef.current % 4 === 0) bgPoints.current = computeBgPoints(cleanLum, 16, EDGE_GRID);
      if (frameRef.current % 6 === 0) updateDetections();

      context.fillStyle = `rgba(${ORANGE},0.55)`;
      for (const [x, y] of bgPoints.current) {
        context.beginPath();
        context.arc(x, y, 1.3, 0, Math.PI * 2);
        context.fill();
      }

      function drawDenseDotsIn(box: Box | null, alpha: number) {
        if (!box) return;
        const x0 = Math.max(2, box.x);
        const y0 = Math.max(2, box.y);
        const x1 = Math.min(W - 2, box.x + box.w);
        const y1 = Math.min(H - 2, box.y + box.h);
        context.fillStyle = `rgba(${ORANGE},${alpha})`;
        for (let y = y0; y < y1; y += 7) {
          for (let x = x0; x < x1; x += 7) {
            const yi = Math.min(H - 3, Math.max(2, Math.round(y)));
            const xi = Math.min(W - 3, Math.max(2, Math.round(x)));
            const gx = cleanLum[yi * W + (xi + 2)] - cleanLum[yi * W + (xi - 2)];
            const gy = cleanLum[Math.min(H - 3, yi + 2) * W + xi] - cleanLum[Math.max(2, yi - 2) * W + xi];
            if (Math.sqrt(gx * gx + gy * gy) > 20) {
              context.beginPath();
              context.arc(x + (Math.random() * 3 - 1.5), y + (Math.random() * 3 - 1.5), 1.4, 0, Math.PI * 2);
              context.fill();
            }
          }
        }
      }

      faceSmooth.current = lerpBox(faceSmooth.current, faceRaw.current, 0.3);
      handSmooth.current = lerpBox(handSmooth.current, handRaw.current, 0.35);
      miss.current.face = faceRaw.current ? 0 : miss.current.face + 1;
      miss.current.hand = handRaw.current ? 0 : miss.current.hand + 1;
      if (miss.current.face > MISS_LIMIT) faceSmooth.current = null;
      if (miss.current.hand > MISS_LIMIT) handSmooth.current = null;
      const faceAlpha = Math.max(0, 1 - miss.current.face / MISS_LIMIT);
      const handAlpha = Math.max(0, 1 - miss.current.hand / MISS_LIMIT);

      drawDenseDotsIn(faceSmooth.current, 0.9 * faceAlpha);
      drawDenseDotsIn(handSmooth.current, 0.9 * handAlpha);

      function drawBox(box: Box, label: string, alpha: number) {
        const { x, y, w, h } = box;
        context.strokeStyle = `rgba(${ORANGE},${alpha})`;
        context.lineWidth = 2;
        context.strokeRect(x, y, w, h);
        context.font = '12px Courier New';
        context.fillStyle = `rgba(${ORANGE},${alpha})`;
        context.fillText(label, x + 8, Math.max(16, y - 8));
        const tick = 14;
        context.beginPath();
        context.moveTo(x, y + tick); context.lineTo(x, y); context.lineTo(x + tick, y);
        context.moveTo(x + w - tick, y); context.lineTo(x + w, y); context.lineTo(x + w, y + tick);
        context.moveTo(x, y + h - tick); context.lineTo(x, y + h); context.lineTo(x + tick, y + h);
        context.moveTo(x + w - tick, y + h); context.lineTo(x + w, y + h); context.lineTo(x + w, y + h - tick);
        context.stroke();
      }

      if (faceSmooth.current) drawBox(faceSmooth.current, 'FACE LOCK', faceAlpha);
      if (handSmooth.current) drawBox(handSmooth.current, 'HAND TRACE', handAlpha);
      setPoints(bgPoints.current.length);
      frameRef.current++;
    }

    function loop() {
      if (!paused && drawVideoFrameCropped()) processFrame();
      animationRef.current = requestAnimationFrame(loop);
    }

    loop();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [facingMode, paused, scanMode]);

  function capture() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `track_cam_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function flipCamera() {
    faceRaw.current = null;
    handRaw.current = null;
    faceSmooth.current = null;
    handSmooth.current = null;
    setFacingMode((mode) => (mode === 'user' ? 'environment' : 'user'));
  }

  return (
    <div className="min-h-[calc(100vh-9rem)] bg-[#050505] px-4 py-8 text-[#ff5818] md:py-12">
      {status && <div className="fixed left-1/2 top-24 z-50 max-w-[90vw] -translate-x-1/2 text-center font-mono text-xs tracking-[0.2em] text-[#a8420f]">{status}</div>}
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-6 font-mono">
          <p className="inline-flex rounded-full border border-[#a8420f] bg-[#120804] px-4 py-2 text-xs font-bold uppercase tracking-[0.28em]">Browser-native vision lab</p>
          <h1 className="text-5xl font-black uppercase leading-none tracking-[-0.08em] text-[#ff5818] md:text-7xl">TRACK//CAM</h1>
          <p className="max-w-xl text-sm leading-7 text-[#ff9b74] md:text-base">A next-level cyberpunk camera scanner with local-only canvas processing, face and hand skin-cluster tracking, edge-density point clouds, scan modes, and instant frame capture.</p>
          <div className="grid max-w-xl gap-3 sm:grid-cols-3">
            {(['classic', 'thermal', 'xray'] as const).map((mode) => (
              <button className={`border px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] ${scanMode === mode ? 'border-[#ff5818] bg-[#2a0e05]' : 'border-[#a8420f] bg-[#0d0d0d]'}`} key={mode} type="button" onClick={() => setScanMode(mode)}>{mode}</button>
            ))}
          </div>
        </div>

        <div className="relative mx-auto aspect-[3/4] w-full max-w-[480px] overflow-hidden bg-black shadow-[0_0_80px_rgba(255,88,24,0.22)]">
          <canvas ref={canvasRef} className="size-full [image-rendering:pixelated]" />
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 font-mono text-[11px] uppercase tracking-[0.18em]">
            <div className="flex justify-between"><span className="animate-pulse">● REC</span><span>{clock}</span></div>
            <div className="pointer-events-auto mx-auto flex flex-wrap justify-center gap-2">
              <button className="border border-[#a8420f] bg-[#0d0d0d] px-4 py-2 hover:border-[#ff5818] hover:bg-[#1a0d05]" type="button" onClick={flipCamera}>Flip cam</button>
              <button className="border border-[#a8420f] bg-[#0d0d0d] px-4 py-2 hover:border-[#ff5818] hover:bg-[#1a0d05]" type="button" onClick={() => setPaused((value) => !value)}>{paused ? 'Resume' : 'Pause'}</button>
              <button className="border border-[#a8420f] bg-[#0d0d0d] px-4 py-2 hover:border-[#ff5818] hover:bg-[#1a0d05]" type="button" onClick={capture}>Capture</button>
            </div>
            <div className="flex justify-between"><span>PTS {points}</span><span>TRK-ID 68312</span></div>
          </div>
        </div>
      </section>
      <video ref={videoRef} autoPlay muted playsInline className="hidden" />
    </div>
  );
}
