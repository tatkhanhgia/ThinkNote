/** Client-safe mood constants — no server imports */

export const BLOG_MOODS = {
  reflective: { icon: '🌸', en: 'Reflective', vi: 'Suy ngẫm' },
  joyful:     { icon: '☀️', en: 'Joyful',     vi: 'Vui vẻ' },
  thoughtful: { icon: '🌙', en: 'Thoughtful', vi: 'Trăn trở' },
  nostalgic:  { icon: '🌿', en: 'Nostalgic',  vi: 'Hoài niệm' },
  grateful:   { icon: '🌻', en: 'Grateful',   vi: 'Biết ơn' },
  inspired:   { icon: '✨', en: 'Inspired',   vi: 'Cảm hứng' },
  melancholic:{ icon: '🌧️', en: 'Melancholic',vi: 'Trầm lắng' },
  excited:    { icon: '🚀', en: 'Excited',    vi: 'Hào hứng' },
} as const;

export type BlogMood = keyof typeof BLOG_MOODS;
