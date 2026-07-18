export default function Footer() {
  return (
    <>
      {/* 结尾语 */}
      <section className="relative px-6 py-32 text-center md:py-44">
        <div className="reveal mx-auto max-w-4xl">
          <p className="font-en text-xs tracking-[0.5em] text-amber-300/50 uppercase">
            One Last Thought
          </p>
          <p className="font-en mt-10 text-2xl italic leading-relaxed text-white/90 md:text-4xl md:leading-snug">
            “If we ever meet a friend from the stars,
            <br className="hidden md:block" />
            and our first instinct is to fear bringing them home —
            <br className="hidden md:block" />
            afraid of what our own kind might do to them —
            <br className="hidden md:block" />
            that, perhaps, is humanity&rsquo;s quietest tragedy.”
          </p>
          <p className="font-serif-sc reveal reveal-delay-1 mt-8 text-sm leading-relaxed text-white/40">
            如果有一天遇见很好的外星朋友，却因为害怕它受到伤害
            <br className="hidden md:block" />
            而不敢带它回地球做客——这是人类的悲哀。
          </p>
          <div className="reveal reveal-delay-2 mx-auto mt-12 h-px w-16 bg-amber-400/40" />
          <p className="reveal reveal-delay-2 font-en mt-10 text-sm italic text-white/40">
            Good, good, good.
          </p>
        </div>
      </section>

      <footer className="relative border-t border-white/8 px-6 py-12 text-center">
        <p className="text-xs leading-relaxed text-white/35">
          A non-commercial fan tribute to <span className="font-en italic">Project Hail Mary</span>
          {' '}· Original novel by Andy Weir
          <br />
          Film stills via Stillslab &amp; TMDB · Danmaku from real Bilibili viewers · Music: fan-edit BGM
        </p>
      </footer>
    </>
  );
}
