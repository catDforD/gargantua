import { useRef } from 'react';
import { galleryItems } from '@/data/content';

const tagColor: Record<string, string> = {
  ROCKY: 'border-amber-300/40 text-amber-200/90',
  GRACE: 'border-sky-300/40 text-sky-200/80',
  'HAIL MARY': 'border-white/25 text-white/60',
  SPACEWALK: 'border-violet-300/40 text-violet-200/80',
  ASTROPHAGE: 'border-orange-400/40 text-orange-200/90',
  TEARJERKER: 'border-rose-300/40 text-rose-200/90',
  ENDING: 'border-emerald-300/40 text-emerald-200/80',
  COSMOS: 'border-fuchsia-300/40 text-fuchsia-200/80',
};

export default function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 460, behavior: 'smooth' });
  };

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-en text-xs tracking-[0.4em] text-amber-300/60 uppercase">
              Frames Worth Replaying
            </p>
            <h2 className="font-en mt-3 text-3xl font-medium text-white md:text-5xl">
              Iconic Scenes
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/55">
              The vastness, the heartbreak, the friend made of stone — film
              stills, kept like specimens in a cabinet of memory.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="向左滑动"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-amber-300/50 hover:text-amber-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="向右滑动"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-amber-300/50 hover:text-amber-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 横向滑动轨道 */}
      <div
        ref={trackRef}
        className="gallery-track reveal mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
      >
        {galleryItems.map((item, i) => (
          <figure
            key={i}
            className="gallery-card group relative w-[300px] flex-shrink-0 snap-start overflow-hidden rounded-lg border border-white/8 bg-white/[0.02] md:w-[430px]"
          >
            <div className="overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="aspect-video w-full object-cover"
                loading="lazy"
              />
            </div>
            <figcaption className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-en text-base font-medium text-white/90">{item.title}</h3>
                <span
                  className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] tracking-widest ${tagColor[item.tag] ?? 'border-white/20 text-white/60'}`}
                >
                  {item.tag}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{item.quote}</p>
            </figcaption>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-amber-500/0 to-transparent opacity-0 transition-opacity duration-700 group-hover:from-amber-500/10 group-hover:opacity-100" />
          </figure>
        ))}
      </div>

      <p className="gallery-caption mt-2 text-xs tracking-widest text-white/30">
        ← DRAG OR USE ARROWS · STILLS FROM THE FILM →
      </p>
    </section>
  );
}
