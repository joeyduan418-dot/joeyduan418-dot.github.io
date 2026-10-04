// Warm only the first view, not the videos or entire galleries.
const images = new Map<string, Promise<void>>();
export function preloadImage(src: string) {
  if (!images.has(src)) {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    const task = image.decode().catch(() => {images.delete(src);});
    images.set(src, task);
  }
  return images.get(src)!;
}
export function warmExperience(id: string) {
  if (id === 'stage') {
    void import('three').catch(() => {});
    for (const name of ['silk','opera','rural','snake']) void preloadImage(`/dossier/ticket-user-${name}-transparent.webp`);
  } else if (id === 'interior') {
    void import('three').catch(() => {});
    void import('./interior-house-geometry').catch(() => {});
    void preloadImage('/dossier/room-7.webp');
  } else if (id === 'ip') {
    for (let i = 0; i < 5; i++) void preloadImage(`/dossier/poster-original-${i}.webp`);
  } else if (id === 'brand') void preloadImage('/dossier/brand-premiere-enhanced.webp');
  else if (id === 'ai') void preloadImage('/dossier/ai-television-mockup.webp');
}
