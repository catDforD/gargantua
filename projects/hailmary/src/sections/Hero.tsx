export default function Hero() {
  return (
    <header className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* 背景主视觉：电影剧照 */}
      <div className="absolute inset-0">
        <img
          src="./images/stills/P_09.jpg"
          alt="The Hail Mary"
          className="hero-drift h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-[#050608]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
      </div>

      {/* 标题 */}
      <div className="relative z-10 px-6 text-center">
        <p className="reveal font-en text-sm tracking-[0.5em] text-amber-200/70 uppercase md:text-base">
          A Tribute to the Film
        </p>
        <h1 className="reveal reveal-delay-1 font-en mt-6 text-5xl font-medium tracking-wide text-white md:text-8xl">
          Project Hail Mary
        </h1>
        <p className="reveal reveal-delay-2 font-serif-sc mt-4 text-lg text-white/60 md:text-2xl">
          挽救计划
        </p>
        <div className="reveal reveal-delay-2 mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
        <p className="reveal reveal-delay-3 font-en mx-auto mt-8 max-w-2xl text-base italic leading-relaxed text-white/75 md:text-xl">
          11.9 light-years from home, a teacher who forgot his own name —
          <br className="hidden md:block" />
          and an alien made of stone — saved two suns.
        </p>
      </div>

      {/* 滚动提示 */}
      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-center">
        <p className="mb-3 text-xs tracking-[0.3em] text-white/50 uppercase">Scroll to remember</p>
        <svg
          className="scroll-hint mx-auto h-6 w-6 text-amber-300/80"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </header>
  );
}
