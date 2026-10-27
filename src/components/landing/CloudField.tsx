"use client";

import { useEffect, useRef } from "react";

/**
 * Fundo do hero em blocos (estilo ASCII): nuvens de fumaça passando com o vento
 * e o "M" do Moven surgindo acima delas. Brilho em níveis fixos = cara de ASCII.
 */

const LOGO_SRC = "/MovenLogo.png";
const SAMPLE = 120;
const LEVELS = 6; // níveis de brilho dos blocos

// Ruído de valor 2D (hash inteiro + interpolação suave), saída em [0, 1]
function hash(x: number, y: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number, octaves: number) {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x, y);
    norm += amp;
    x *= 2;
    y *= 2;
    amp *= 0.5;
  }
  return sum / norm;
}
const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
const quant = (v: number) => Math.round(Math.min(1, v) * LEVELS) / LEVELS;

function sampleLogo(img: HTMLImageElement) {
  const c = document.createElement("canvas");
  c.width = SAMPLE;
  c.height = SAMPLE;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
  const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);
  const out = new Float32Array(SAMPLE * SAMPLE);
  for (let i = 0; i < out.length; i++) {
    const [r, g, b] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
    // Logo azul sobre branco: "azulidade" = máscara; tom mais escuro = mais forte.
    const blue = Math.min(1, Math.max(0, (b - r) / 170));
    out[i] = blue * (0.55 + 0.75 * (1 - (r + g + b) / 765));
  }
  return out;
}

/** `ambient`: versão de fundo (sem o M, mais fraca, com holofote do cursor). */
export function CloudField({
  ambient = false,
  spotlight = true, // holofote azul do cursor (só no modo ambiente)
}: {
  ambient?: boolean;
  spotlight?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const brand =
      getComputedStyle(canvas).getPropertyValue("--mv-brand").trim() || "#1463ff";

    let logo: Float32Array | null = null;
    let w = 0;
    let h = 0;
    let step = 10;
    let mask = new Float32Array(0); // força do "M" em cada bloco
    let cols = 0;
    let raf = 0;
    let last = 0;
    let visible = true;
    const pointer = { x: -9999, y: -9999 };
    const REACH = 110; // raio do holofote do cursor (só no modo ambiente)

    const layout = () => {
      cols = Math.ceil(w / step);
      const rows = Math.ceil(h / step);
      mask = new Float32Array(cols * rows);
      if (!logo) return;
      // O "M" grande, embaixo e centralizado, cortado pela borda como um pico
      // Área alta e estreita (hero no celular): M maior em relação à largura;
      // pode encostar atrás dos botões, mas fica inteiro acima da névoa
      const tall = h > w * 1.6;
      const size = tall ? Math.min(h * 0.4, w * 0.8) : Math.min(h * 0.62, w * 0.45);
      const left = w / 2 - size / 2;
      const top = h * (tall ? 0.6 : 0.56);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const u = Math.floor(((c * step - left) / size) * SAMPLE);
          const v = Math.floor(((r * step - top) / size) * SAMPLE);
          if (u >= 0 && v >= 0 && u < SAMPLE && v < SAMPLE) {
            mask[r * cols + c] = logo[v * SAMPLE + u];
          }
        }
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      // O fundo ambiente é fraco e fica atrás de tudo: blocos maiores = menos custo
      step = (w < 640 ? 8 : 10) * (ambient ? 1.4 : 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
      draw(reduced ? 0 : performance.now());
    };

    const draw = (now: number) => {
      const t = now / 1000;
      const cell = step * 0.62;
      // Lido a cada quadro: acompanha a troca de tema claro/escuro sem remontar
      const style = getComputedStyle(canvas);
      const cloudColor = style.getPropertyValue("--mv-cloud").trim() || "#e7ecf5";
      // intensidade do modo ambiente; quem usa pode subir via --mv-ambient-alpha (ex.: sidebar)
      const ambientAlpha = parseFloat(style.getPropertyValue("--mv-ambient-alpha")) || 0.2;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < mask.length; i++) {
        const c = i % cols;
        const r = (i / cols) | 0;
        const px = (c * step) / w;
        const py = (r * step) / h;
        const aspect = w / h;

        // Duas camadas de ruído andando com o vento = fumaça que se deforma
        const n =
          0.65 * fbm(px * 2.4 * aspect - t * 0.045, py * 2.4, 3) +
          0.35 * fbm(px * 6 * aspect - t * 0.11, py * 6 + t * 0.03, 2);
        // No fundo ambiente o limiar é menor = mais nuvens
        let cloud = ambient ? smooth(0.42, 0.78, n) : smooth(0.55, 0.82, n);
        if (ambient) {
          const k = Math.max(0, 1 - Math.hypot(c * step - pointer.x, r * step - pointer.y) / REACH);
          const p = k * k * (3 - 2 * k);
          if (p > 0.05) {
            ctx.fillStyle = brand;
            ctx.globalAlpha = 0.08 + 0.4 * p;
            ctx.fillRect(c * step, r * step, cell, cell);
            continue;
          }
        } else {
          // Névoa irregular embaixo (cobre a base do M) e miolo limpo pro texto
          cloud = Math.max(cloud, smooth(0.84, 1.04, py) * smooth(0.3, 0.6, n));
          const center = Math.exp(-(((px - 0.5) / 0.3) ** 2 + ((py - 0.38) / 0.2) ** 2));
          cloud *= 1 - 0.92 * center;
        }

        const m = mask[i];
        let alpha: number;
        if (cloud > 0.12 && (m < 0.08 || cloud > 0.4)) {
          // Nuvem: cinza, com raros blocos na cor da marca piscando
          const spark = hash(c, r) < 0.012 && Math.sin(t * 2 + hash(r, c) * 20) > 0.4;
          ctx.fillStyle = spark ? brand : cloudColor;
          alpha = spark ? 0.9 : quant(cloud) * (ambient ? ambientAlpha : 0.55);
        } else if (m >= 0.08) {
          // Tons do relevo do logo viram níveis de brilho (dá forma ao M)
          ctx.fillStyle = brand;
          alpha = quant(0.15 + m * 0.65) * (0.85 + 0.15 * Math.sin(t * 1.5 + c * 0.2));
        } else {
          continue;
        }
        if (alpha <= 0) continue;
        ctx.globalAlpha = alpha;
        ctx.fillRect(c * step, r * step, cell, cell);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden || now - last < (ambient ? 50 : 33)) return; // ~20/30fps
      last = now;
      draw(now);
    };

    if (!ambient) {
      const img = new Image();
      img.onload = () => {
        logo = sampleLogo(img);
        layout();
        if (reduced) draw(0);
      };
      img.src = LOGO_SRC;
    }

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    resize();
    if (!reduced) {
      if (ambient && spotlight) window.addEventListener("pointermove", onPointer, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [ambient, spotlight]);

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}
