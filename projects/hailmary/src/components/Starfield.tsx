import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  speed: number;
  phase: number;
}

/** 全屏微光星空画布，固定在底层 */
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Star[] = [];
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(220, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.2,
        baseAlpha: Math.random() * 0.55 + 0.15,
        speed: Math.random() * 0.9 + 0.3,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const alpha =
          s.baseAlpha * (0.6 + 0.4 * Math.sin(t * 0.0006 * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 235, 210, ${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}
