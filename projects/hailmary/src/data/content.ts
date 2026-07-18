export interface Chapter {
  id: string;
  index: string;
  title: string;
  enTitle: string;
  quote: string;
  quoteCn: string;
  quoteBy: string;
  paragraphs: string[];
  image: string;
  imageCaption: string;
  align: 'left' | 'right';
}

export const chapters: Chapter[] = [
  {
    id: 'prologue',
    index: 'I',
    title: 'Alone in the Dark',
    enTitle: 'PROLOGUE',
    quote: 'I woke up not knowing my own name. Two crewmates lay dead beside me, and outside the window there was nothing but black.',
    quoteCn: '我醒来的时候，不记得自己的名字。',
    quoteBy: 'Ryland Grace · aboard the Hail Mary',
    paragraphs: [
      'A middle-school science teacher wakes up 11.9 light-years from home. No memory, no crew, no way back — just a ship full of instruments and one absurd fact: the Sun is dying, and he is humanity\u2019s last prescription.',
      'Loneliness here is not abstract. It is the cold blink of instrument panels, a window where Earth is no longer visible, and the vertigo of having to relearn the words "who am I".',
    ],
    image: './images/stills/ch1_438.jpg',
    imageCaption: 'The Hail Mary · waking up',
    align: 'left',
  },
  {
    id: 'contact',
    index: 'II',
    title: 'Across the Light-Years',
    enTitle: 'FIRST CONTACT',
    quote: 'Human! You are good human. Good good good.',
    quoteCn: '人！你是好人！',
    quoteBy: 'Rocky · of 40 Eridani',
    paragraphs: [
      'On a cosmic scale, two civilizations meeting should be the miracle astronomers wait their whole lives for. It happened so simply: a stone ship called the Blip-A, an alien engineer who sees with sound, and one haltingly learned word — "human".',
      'Rocky has no eyes, yet he was the first to truly see Grace. Two lives tapped out a shared frequency through a bulkhead — loneliness is not a human patent, and souls willing to reach out will find each other anywhere.',
    ],
    image: './images/stills/ch2_361.jpg',
    imageCaption: 'Reaching out · first contact',
    align: 'right',
  },
  {
    id: 'science',
    index: 'III',
    title: 'Science, Our Shared Tongue',
    enTitle: 'THE LAB BETWEEN WORLDS',
    quote: 'I penetrated the outer cell membrane!',
    quoteCn: '我穿透了它的外细胞膜！',
    quoteBy: 'Rocky · mid-experiment triumph',
    paragraphs: [
      'Astrophage is eating the light of two stars, and two worlds are dying. So a human teacher and a rock-spider engineer built the most impossible laboratory in the universe: petri dishes, centrifuges, clumsy unit conversions, and one more "try again" after every failure.',
      'They could not speak each other\u2019s language, yet they read the same curve. Their very breath could kill one another — and still they cheered the same data from opposite sides of an airlock. Science here is not cold formula; it is a burning bridge between two worlds.',
    ],
    image: './images/stills/ch3_505.jpg',
    imageCaption: 'Two species · one whiteboard',
    align: 'left',
  },
  {
    id: 'choice',
    index: 'IV',
    title: 'The Turn',
    enTitle: 'GOING BACK FOR A FRIEND',
    quote: 'Going home is instinct. Turning back is love.',
    quoteCn: '回家是本能，回头是爱。',
    quoteBy: 'before Grace turned the ship around',
    paragraphs: [
      'There was enough fuel for one trip home. Earth was right there on the flight path — blue sky, the ocean, his students, an entire world waiting to be saved.',
      'But another world was falling into darkness, and that world had Rocky. So Grace turned the ship around — no longer a hero drafted onto a mission, but a friend making the quietest, greatest decision in deep space. This is where I cried.',
    ],
    image: './images/stills/ch4_484.jpg',
    imageCaption: 'The long way back · the turn',
    align: 'right',
  },
  {
    id: 'epilogue',
    index: 'V',
    title: 'A Classroom on Erid',
    enTitle: 'EPILOGUE',
    quote: 'Good, good, good.',
    quoteCn: '好，好，好。',
    quoteBy: 'Grace · to his little Eridian students',
    paragraphs: [
      'The story ends in an amber classroom, where a human teaches physics, math, and the gentle side of this universe to a crowd of small stone children.',
      'He never saw Earth again, but Earth survived. He lost his home, yet eleven light-years away, children call him "teacher". Perhaps that is the best ending of all — not a hero\u2019s return, but two souls who saved each other, passing the light on.',
    ],
    image: './images/stills/ch5_488.jpg',
    imageCaption: 'The golden shore · an ending',
    align: 'left',
  },
];

export interface GalleryItem {
  image: string;
  title: string;
  quote: string;
  tag: string;
}

export const galleryItems: GalleryItem[] = [
  { image: './images/stills/u_comet.jpg', title: 'The Long Burn', quote: 'A comet\u2019s tail, eleven light-years from home.', tag: 'COSMOS' },
  { image: './images/stills/g1_5.jpg', title: 'Rocky, Up Close', quote: 'The best engineer in two solar systems.', tag: 'ROCKY' },
  { image: './images/stills/u_ringed.jpg', title: 'The Ringed Giant', quote: 'Somewhere out there, another sun worth saving.', tag: 'COSMOS' },
  { image: './images/stills/g2_129.jpg', title: 'The Console', quote: 'Every light a heartbeat of the ship.', tag: 'HAIL MARY' },
  { image: './images/stills/u_greeneva.jpg', title: 'Adrift in Green', quote: 'Alone between two worlds — and never more alive.', tag: 'SPACEWALK' },
  { image: './images/stills/g3_144.jpg', title: 'Suited Up', quote: 'One man, one suit, one impossible job.', tag: 'GRACE' },
  { image: './images/stills/u_river.jpg', title: 'River of Light', quote: 'The universe writes in color what we cannot say.', tag: 'COSMOS' },
  { image: './images/stills/g4_207.jpg', title: 'Behind the Glass', quote: 'Their breath could kill each other. They stayed anyway.', tag: 'TEARJERKER' },
  { image: './images/stills/u_redship.jpg', title: 'Through the Red', quote: 'The little ship that carried a species\u2019 last hope.', tag: 'HAIL MARY' },
  { image: './images/stills/g5_293.jpg', title: 'Outside the Hull', quote: 'Where no one should ever have to work alone.', tag: 'SPACEWALK' },
  { image: './images/stills/g6_333.jpg', title: 'Hello, Friend', quote: 'A face only a best friend could love.', tag: 'ROCKY' },
  { image: './images/stills/u_fullburn.jpg', title: 'Full Burn', quote: 'Every gram of fuel, spent on a friend.', tag: 'HAIL MARY' },
  { image: './images/stills/g7_414.jpg', title: 'A Rare Laugh', quote: 'For one moment, the mission forgot to be heavy.', tag: 'GRACE' },
  { image: './images/stills/g8_451.jpg', title: 'The Teacher', quote: 'He never stopped being one.', tag: 'GRACE' },
  { image: './images/stills/g9_474.jpg', title: 'The Golden Tunnel', quote: 'Astrophage country — beautiful and lethal.', tag: 'ASTROPHAGE' },
  { image: './images/stills/u_nebula.jpg', title: 'Nebula\u2019s Heart', quote: 'Even dying stars put on a show.', tag: 'COSMOS' },
  { image: './images/stills/g10_479.jpg', title: 'Into the Fire', quote: 'Some doors only open one way.', tag: 'TEARJERKER' },
  { image: './images/stills/g11_515.jpg', title: 'Light in the Dark', quote: 'A flare, a prayer, a friend on the other side.', tag: 'SPACEWALK' },
  { image: './images/stills/g12_520.jpg', title: 'Homeward', quote: 'Every goodbye is also a heading.', tag: 'ENDING' },
];

/** 真实弹幕，来自观众上传的 B 站弹幕文件 */
export const danmakuLines: string[] = [
  '救rocky',
  '救rocky',
  '救rocky',
  '救rocky',
  '救rocky',
  '救rocky',
  '洛基是最好的工程师！！！！！',
  '在电影院直接泪流满面了',
  'Grace，你的脸在漏水',
  'question（敲敲）',
  'amaze amaze amaze',
  'amazing grace',
  '如果他来了地球，会被研究会是悲剧，幸好',
  '“说真的，没人在呼唤你的名字”有啊！！有人在呼唤啊！',
  '不必返航，那里不是家乡',
  '有你的地方才是故乡',
  '地球已经放弃了我，我不能学他们一样放弃朋友。',
  '过命的交情，必须救',
  '跨越文明的双向奔赴，外星人并不是只会侵略',
  '世界会知道挽救计划的伟大',
  '太空童话！！！',
  '温柔大蜘蛛',
  '我一直在哭',
  '友谊万岁',
  'Rocky fix',
  '毫不犹豫救rocky',
];
