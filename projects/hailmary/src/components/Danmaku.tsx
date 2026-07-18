import { useMemo } from 'react';
import { danmakuLines } from '@/data/content';

interface Line {
  text: string;
  top: string;
  duration: number;
  delay: number;
  opacity: number;
  warm: boolean;
}

/** 漂浮弹幕层：经典台词与观众共鸣从右向左滑过 */
export default function Danmaku({ visible }: { visible: boolean }) {
  const lines = useMemo<Line[]>(() => {
    return danmakuLines.map((text, i) => ({
      text,
      top: `${(i * 53 + 7) % 82 + 4}%`,
      duration: 26 + ((i * 7) % 18),
      delay: -((i * 4.7) % 26),
      opacity: 0.35 + ((i * 13) % 40) / 100,
      warm: i % 3 === 0,
    }));
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden>
      {lines.map((l, i) => (
        <span
          key={i}
          className="danmaku-item absolute text-sm md:text-base"
          style={{
            top: l.top,
            animationDuration: `${l.duration}s`,
            animationDelay: `${l.delay}s`,
            opacity: l.opacity,
            color: l.warm ? '#f5b06a' : '#d8d5cf',
            textShadow: '0 1px 8px rgba(0,0,0,0.8)',
            fontWeight: l.warm ? 500 : 400,
          }}
        >
          {l.text}
        </span>
      ))}
    </div>
  );
}
