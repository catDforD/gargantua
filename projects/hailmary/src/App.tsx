import { useRef, useState } from 'react';
import Starfield from '@/components/Starfield';
import Danmaku from '@/components/Danmaku';
import Hero from '@/sections/Hero';
import ChapterSection from '@/sections/ChapterSection';
import Gallery from '@/sections/Gallery';
import Footer from '@/sections/Footer';
import { chapters } from '@/data/content';
import { useReveal } from '@/hooks/useReveal';

export default function App() {
  const [entered, setEntered] = useState(false);
  const [danmakuOn, setDanmakuOn] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useReveal();

  const enter = () => {
    setEntered(true);
    audioRef.current?.play().catch(() => setMusicOn(false));
  };

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setMusicOn(true)).catch(() => {});
    } else {
      a.pause();
      setMusicOn(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050608]">
      <audio ref={audioRef} src="./audio/bgm.mp3" loop preload="auto" />

      {/* 入场页：点击进入并开启音乐 */}
      {!entered && (
        <button
          onClick={enter}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050608] text-center transition-opacity duration-700"
        >
          <p className="font-en text-xs tracking-[0.5em] text-amber-200/60 uppercase">
            A Tribute to the Film
          </p>
          <p className="font-en mt-6 text-4xl font-medium text-white md:text-6xl">
            Project Hail Mary
          </p>
          <p className="font-serif-sc mt-3 text-base text-white/50">挽救计划</p>
          <span className="glow-pulse mt-14 rounded-full border border-amber-300/40 px-8 py-3 text-sm tracking-[0.25em] text-amber-200">
            CLICK TO ENTER · 点击进入（开启音乐）
          </span>
          <span className="mt-6 text-xs text-white/30">建议佩戴耳机 · Best with sound on</span>
        </button>
      )}

      <Starfield />
      <Danmaku visible={danmakuOn && entered} />

      {/* 浮动控制 */}
      {entered && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2">
          <button
            onClick={toggleMusic}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-xs text-white/70 backdrop-blur-md transition-colors hover:border-amber-300/40 hover:text-amber-200"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full transition-colors ${
                musicOn ? 'bg-amber-400 glow-pulse' : 'bg-white/25'
              }`}
            />
            音乐 {musicOn ? '开' : '关'}
          </button>
          <button
            onClick={() => setDanmakuOn((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-xs text-white/70 backdrop-blur-md transition-colors hover:border-amber-300/40 hover:text-amber-200"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full transition-colors ${
                danmakuOn ? 'bg-amber-400 glow-pulse' : 'bg-white/25'
              }`}
            />
            弹幕 {danmakuOn ? '开' : '关'}
          </button>
        </div>
      )}

      <main className="relative z-10">
        <Hero />

        {/* 引子 */}
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <p className="reveal font-en text-lg italic leading-loose text-white/80 md:text-2xl">
            Some stories leave you sitting in silence
            <br />
            long after the credits roll.
            <br />
            This page is for those ten minutes.
          </p>
        </div>

        {chapters.map((ch) => (
          <ChapterSection key={ch.id} chapter={ch} />
        ))}

        <Gallery />
        <Footer />
      </main>
    </div>
  );
}
