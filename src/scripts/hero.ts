// Scroll-scrubbed footage: the hero section is tall, its inner screen is pinned,
// and the scroll position inside it picks the frame drawn on the canvas.
const hero = document.querySelector<HTMLElement>("[data-hero]");
const canvas = hero?.querySelector("canvas");
const ctx = canvas?.getContext("2d");

if (hero && canvas && ctx) {
  const word = hero.querySelector<HTMLElement>("[data-hero-word]");
  const chapters = Array.from(hero.querySelectorAll<HTMLElement>("[data-chapter]"));
  const copy = hero.querySelector<HTMLElement>(".hero-copy");
  const total = Number(hero.dataset.frames);
  const prefix = hero.dataset.prefix!;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frames: (HTMLImageElement | undefined)[] = new Array(total);

  let target = 0;
  let current = 0;
  let drawn = -1;
  let raf = 0;

  const url = (i: number) => `${prefix}${String(i + 1).padStart(3, "0")}.webp`;

  function nearestLoaded(i: number) {
    for (let d = 0; d < total; d++) {
      if (frames[i - d]) return i - d;
      if (frames[i + d]) return i + d;
    }
    return -1;
  }

  function draw(index: number, force = false) {
    const i = nearestLoaded(index);
    if (i < 0 || (i === drawn && !force)) return;
    const img = frames[i]!;
    const scale = Math.max(canvas!.width / img.naturalWidth, canvas!.height / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx!.drawImage(img, (canvas!.width - w) / 2, (canvas!.height - h) / 2, w, h);
    drawn = i;
  }

  function load(i: number) {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      frames[i] = img;
      // Repaint if this frame is closer to the scroll position than what's on screen.
      if (Math.abs(i - target) < Math.abs(drawn - target)) draw(Math.round(current), true);
    };
    img.src = url(i);
  }

  // Every 8th frame first so scrubbing works early; the gaps fill in after.
  // Reduced motion: no scrubbing, the first frame stays as a still.
  const order = Array.from({ length: total }, (_, i) => i).sort(
    (a, b) => Number(a % 8 !== 0) - Number(b % 8 !== 0) || a - b,
  );
  (reduceMotion ? [0] : order).forEach(load);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas!.width = Math.round(canvas!.clientWidth * dpr);
    canvas!.height = Math.round(canvas!.clientHeight * dpr);
    ctx!.imageSmoothingQuality = "high";
    draw(Math.round(current), true);
  }

  function tick() {
    current += (target - current) * 0.18;
    if (Math.abs(target - current) < 0.05) current = target;
    draw(Math.round(current));
    raf = current === target ? 0 : requestAnimationFrame(tick);
  }

  // Each chapter owns a window of the scroll: it rises in, holds, then lifts away.
  function setChapters(progress: number) {
    const span = 0.8 / chapters.length;
    chapters.forEach((el, i) => {
      const local = (progress - 0.12 - i * span) / span; // 0..1 inside its window
      const visible = local > 0 && local < 1;
      const fade = visible ? Math.min(1, local * 4, (1 - local) * 4) : 0;
      el.style.opacity = String(fade);
      el.style.transform = `translateY(${(0.5 - Math.min(1, Math.max(0, local))) * 48}px)`;
      el.style.visibility = fade > 0 ? "visible" : "hidden";
    });
  }

  function onScroll() {
    const rect = hero!.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    if (reduceMotion) return;
    // The intro (scripts/intro.ts) owns the first stretch of scroll; the footage starts after it.
    const introPx = Number(hero!.dataset.introScreens ?? 0) * window.innerHeight;
    const range = rect.height - window.innerHeight - introPx;
    const progress = Math.min(1, Math.max(0, (-rect.top - introPx) / range));

    // Signature move: the name settles a few percent as the scene plays.
    if (word) word.style.transform = `scale(${1 - progress * 0.07})`;
    // The intro steps aside before the first chapter arrives, and returns at the top.
    if (copy) {
      const fade = Math.min(1, Math.max(0, 1 - (progress - 0.04) / 0.08));
      if (fade === 1) {
        // Fully shown: hand control back to CSS (which also hides it while the intro plays).
        copy.style.removeProperty("opacity");
        copy.style.removeProperty("transform");
        copy.style.removeProperty("visibility");
      } else {
        copy.style.opacity = String(fade);
        copy.style.transform = `translateY(${(fade - 1) * 24}px)`;
        copy.style.visibility = fade > 0 ? "visible" : "hidden";
      }
    }
    setChapters(progress);

    target = progress * (total - 1);
    if (progress === 0) {
      // Back inside the intro: jump straight to the first frame instead of easing back through
      // hundreds of frames while the intro is also animating (that double work made it stutter).
      cancelAnimationFrame(raf);
      raf = 0;
      current = 0;
      draw(0);
      return;
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  resize();
  onScroll();
  window.addEventListener("resize", resize);
  window.addEventListener("scroll", onScroll, { passive: true });
}

export {};
