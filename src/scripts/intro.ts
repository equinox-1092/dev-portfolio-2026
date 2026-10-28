// Intro: the title is a window cut in a solid layer, with the hero footage showing through the letters.
// Scrolling flies the camera into the stem of the letter nearest the centre until it fills the screen
// and the hero is revealed. Drawn on a 2D canvas (GPU-composited) so every scroll frame is cheap,
// in both directions.
const hero = document.querySelector<HTMLElement>("[data-hero]");
const intro = hero?.querySelector<HTMLElement>("[data-intro]");
const canvas = intro?.querySelector<HTMLCanvasElement>("[data-intro-canvas]");
const ctx = canvas?.getContext("2d");
const foot = hero?.querySelector<HTMLElement>("[data-intro-foot]");

if (hero && intro && canvas && ctx) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    intro.remove();
    hero.toggleAttribute("data-revealed", true);
  } else {
    const wide: string[] = JSON.parse(canvas.dataset.wide!);
    const tall: string[] = JSON.parse(canvas.dataset.tall!);
    const ground = getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim() || "#0e0a0d";
    const STEMS = ["I", "Í", "T"]; // letters whose middle is a solid vertical stem

    let width = 0;
    let height = 0;
    let dpr = 1;
    let lines: { text: string; size: number; x: number; baseline: number }[] = [];
    let anchorX = 0; // the point inside the letter the camera flies into
    let anchorY = 0;
    let maxScale = 1;
    let glyphCap = 1; // largest scale that keeps glyphs under ~3000px; past it the compositor scales
    let lastT = -1;
    let frame = 0;

    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const setFont = (size: number) => {
      ctx!.font = `900 ${size}px Chivo, system-ui, sans-serif`;
      ctx!.letterSpacing = `${-0.04 * size}px`;
    };

    function layout() {
      width = intro!.clientWidth;
      height = intro!.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);

      // Portrait screens use the split title so each line can still fill the width.
      const texts = (height > width * 1.2 ? tall : wide).map((line) => line.toUpperCase());

      // Each line set to fill the width, like a poster block; the block shrinks only if it outgrows the height.
      setFont(100);
      let sizes = texts.map((text) => (width * 0.92 * 100) / ctx!.measureText(text).width);
      // Chivo's capitals are ~0.72em tall, with ~0.12em between lines.
      const blockOf = (s: number[]) => s.reduce((sum, v) => sum + v * 0.72, 0) + (s.length - 1) * s[0] * 0.12;
      const fit = Math.min(1, (height * 0.66) / blockOf(sizes));
      sizes = sizes.map((s) => s * fit);

      let baseline = (height - blockOf(sizes)) / 2;
      lines = texts.map((text, i) => {
        baseline += sizes[i] * 0.72 + (i ? sizes[0] * 0.12 : 0);
        setFont(sizes[i]);
        return { text, size: sizes[i], x: (width - ctx!.measureText(text).width) / 2, baseline };
      });

      // Fly into the stem letter closest to the middle of the screen (the centre itself if there is none).
      let best = { d: Infinity, x: width / 2, y: height / 2, size: sizes[0] };
      for (const line of lines) {
        setFont(line.size);
        [...line.text].forEach((char, i) => {
          if (!STEMS.includes(char)) return;
          const left = line.x + ctx!.measureText(line.text.slice(0, i)).width;
          const x = left + (ctx!.measureText(char).width + 0.04 * line.size) / 2; // undo trailing tracking
          const y = line.baseline - line.size * 0.36;
          const d = Math.hypot(x - width / 2, y - height / 2);
          if (d < best.d) best = { d, x, y, size: line.size };
        });
      }
      anchorX = best.x;
      anchorY = best.y;

      // The stem (~0.22em in Chivo Black) must cover the screen by 72% of the flight, before the hero shows.
      const cover = (width * 1.15) / (best.size * 0.22);
      maxScale = Math.pow(Math.max(cover, 2), 1 / 0.72);
      glyphCap = 3000 / Math.max(...sizes);
      lastT = -1;
    }

    function draw(t: number) {
      // Exponential zoom reads as constant speed; the anchor drifts to the centre on the way in.
      const scale = Math.pow(maxScale, t);
      const drift = clamp(t * 1.6);
      const cx = anchorX + (width / 2 - anchorX) * drift;
      const cy = anchorY + (height / 2 - anchorY) * drift;
      const vector = Math.min(scale, glyphCap);

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.globalCompositeOperation = "source-over";
      ctx!.fillStyle = ground;
      ctx!.fillRect(0, 0, width, height);

      // Cut the letters out of the ground.
      ctx!.globalCompositeOperation = "destination-out";
      ctx!.translate(cx, cy);
      ctx!.scale(vector, vector);
      ctx!.translate(-anchorX, -anchorY);
      for (const line of lines) {
        setFont(line.size);
        ctx!.fillText(line.text, line.x, line.baseline);
      }

      canvas!.style.transformOrigin = `${cx}px ${cy}px`;
      canvas!.style.transform = scale > vector ? `scale(${scale / vector})` : "";
    }

    function update() {
      frame = 0;
      const introPx = Number(hero!.dataset.introScreens) * window.innerHeight;
      const t = clamp(-hero!.getBoundingClientRect().top / introPx);
      if (t === lastT) return; // nothing moved (e.g. scrolling far below the hero)
      lastT = t;

      if (t < 1) draw(t);
      intro!.style.opacity = String(t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15);
      intro!.style.visibility = t >= 1 ? "hidden" : "visible";
      if (foot) {
        const fade = clamp(1 - t * 5);
        foot.style.opacity = String(fade);
        // Once faded, collapse it to screen-reader-only: still announced, never in the way of the hero.
        foot.classList.toggle("sr-only", fade === 0);
      }
      hero!.toggleAttribute("data-revealed", t > 0.8);
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const relayout = () => {
      layout();
      update();
    };

    relayout();
    // Re-measure once Chivo has loaded; the fallback face has different widths.
    document.fonts.load("900 100px Chivo").then(relayout);
    window.addEventListener("resize", relayout);
    window.addEventListener("scroll", schedule, { passive: true });
  }
}

export {};
