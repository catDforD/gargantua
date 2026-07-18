import type { Chapter } from '@/data/content';

export default function ChapterSection({ chapter }: { chapter: Chapter }) {
  const isLeft = chapter.align === 'left';

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24 md:py-36">
      {/* 章节序号水印 */}
      <span
        className="font-serif-sc pointer-events-none absolute top-8 select-none text-[10rem] font-black leading-none text-white/[0.04] md:text-[16rem]"
        style={isLeft ? { right: '1rem' } : { left: '1rem' }}
        aria-hidden
      >
        {chapter.index}
      </span>

      <div
        className={`relative grid items-center gap-10 md:grid-cols-2 md:gap-16 ${
          isLeft ? '' : 'md:[direction:rtl]'
        }`}
      >
        {/* 图片 */}
        <figure className="reveal md:[direction:ltr]">
          <div className="overflow-hidden rounded-lg">
            <img
              src={chapter.image}
              alt={chapter.imageCaption}
              className="chapter-img w-full object-cover shadow-2xl"
              loading="lazy"
            />
          </div>
          <figcaption className="mt-3 flex items-center gap-2 text-xs tracking-widest text-white/40">
            <span className="inline-block h-px w-6 bg-amber-400/50" />
            {chapter.imageCaption}
          </figcaption>
        </figure>

        {/* 文字 */}
        <div className="md:[direction:ltr]">
          <p className="reveal font-en text-xs tracking-[0.4em] text-amber-300/60 uppercase">
            {chapter.enTitle}
          </p>
          <h2 className="reveal reveal-delay-1 font-serif-sc mt-3 text-3xl font-bold text-white md:text-4xl">
            {chapter.title}
          </h2>

          <blockquote className="reveal reveal-delay-2 relative mt-8 border-l-2 border-amber-400/60 pl-5">
            <span className="quote-mark absolute -left-1 -top-4 text-5xl text-amber-400/40" aria-hidden>
              “
            </span>
            <p className="font-en text-lg italic leading-relaxed text-amber-100/90 md:text-xl">
              {chapter.quote}
            </p>
            <p className="font-serif-sc mt-2 text-sm text-white/45">{chapter.quoteCn}</p>
            <footer className="mt-3 text-xs tracking-wider text-white/40">
              —— {chapter.quoteBy}
            </footer>
          </blockquote>

          {chapter.paragraphs.map((p, i) => (
            <p
              key={i}
              className={`reveal ${i === 0 ? 'reveal-delay-2' : 'reveal-delay-3'} mt-6 text-sm leading-loose text-white/70 md:text-base`}
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
