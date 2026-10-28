// Certificate wheel: cards sit on the rim of a large wheel; turning it brings one to the top.
// Buttons, arrow keys and drag (with momentum and rubber-banding at the ends) all turn it.
const stage = document.querySelector<HTMLElement>("[data-wheel-stage]");
const wheel = stage?.querySelector<HTMLElement>("[data-wheel]");

if (stage && wheel) {
  const cards = Array.from(wheel.querySelectorAll<HTMLButtonElement>(".wheel-card"));
  const caption = document.querySelector<HTMLElement>("[data-wheel-caption]")!;
  const field = (name: string) => caption.querySelector<HTMLElement>(`[data-field="${name}"]`)!;
  const prev = document.querySelector<HTMLButtonElement>("[data-wheel-prev]")!;
  const next = document.querySelector<HTMLButtonElement>("[data-wheel-next]")!;
  const open = document.querySelector<HTMLButtonElement>("[data-wheel-open]")!;
  const dialog = document.querySelector<HTMLDialogElement>("[data-cert-dialog]")!;
  const dialogImg = dialog.querySelector<HTMLImageElement>("[data-cert-dialog-img]")!;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Geometry lives in CSS (--step, --k); read it so both stay in sync.
  const styles = getComputedStyle(stage);
  const STEP = parseFloat(styles.getPropertyValue("--step")); // degrees between cards
  const K = parseFloat(styles.getPropertyValue("--k")); // radius as a multiple of card width
  const VISIBLE = 2; // cards further than this from the front are hidden, so long lists never overlap
  const last = cards.length - 1;
  const max = last * STEP;
  let index = -1;
  let angle = 0;

  const setAngle = (a: number) => {
    angle = a;
    wheel.style.transform = `rotate(${-a}deg)`;
  };

  function goTo(i: number, focus = false) {
    const nextIndex = Math.min(last, Math.max(0, i));
    const changed = nextIndex !== index;
    index = nextIndex;
    setAngle(index * STEP);

    cards.forEach((card, n) => {
      if (n === index) card.setAttribute("aria-current", "true");
      else card.removeAttribute("aria-current");
      card.toggleAttribute("data-far", Math.abs(n - index) > VISIBLE);
      card.tabIndex = n === index ? 0 : -1;
    });
    if (focus) cards[index].focus({ preventScroll: true });

    prev.disabled = index === 0;
    next.disabled = index === last;

    if (!changed) return;
    const card = cards[index];
    for (const name of ["tag", "position", "title", "meta"]) field(name).textContent = card.dataset[name]!;
    if (!reduceMotion && angle !== 0) {
      caption.animate(
        [{ opacity: 0.3, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
        { duration: 240, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
      );
    }
  }

  function openDialog() {
    const card = cards[index];
    dialogImg.src = card.dataset.image!;
    dialogImg.width = Number(card.dataset.width);
    dialogImg.height = Number(card.dataset.height);
    dialogImg.alt = card.dataset.title!;
    dialog.setAttribute("aria-label", card.dataset.title!);
    dialog.showModal();
  }

  prev.addEventListener("click", () => goTo(index - 1));
  next.addEventListener("click", () => goTo(index + 1));
  open.addEventListener("click", openDialog);
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close(); // click on the backdrop
  });

  stage.addEventListener("keydown", (e) => {
    const keys: Record<string, number> = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: last };
    if (!(e.key in keys)) return;
    e.preventDefault();
    goTo(keys[e.key], true);
  });

  // Drag: the wheel follows the pointer 1:1, then the release velocity picks where it lands.
  const rubberband = (over: number) => (over * STEP * 0.55) / (STEP + 0.55 * Math.abs(over));
  let drag: { x: number; angle: number; radius: number; moved: boolean; samples: [number, number][] } | null =
    null;

  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, angle, radius: cards[0].offsetWidth * K, moved: false, samples: [[e.timeStamp, angle]] };
  });

  stage.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < 8) return;
      drag.moved = true;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("is-dragging");
    }
    let a = drag.angle - (dx / drag.radius) * (180 / Math.PI);
    if (a < 0) a = -rubberband(-a);
    if (a > max) a = max + rubberband(a - max);
    setAngle(a);
    drag.samples.push([e.timeStamp, a]);
    if (drag.samples.length > 5) drag.samples.shift();
  });

  const release = () => {
    if (!drag) return;
    if (drag.moved) {
      const [t0, a0] = drag.samples[0];
      const [t1, a1] = drag.samples[drag.samples.length - 1];
      const velocity = t1 > t0 ? ((a1 - a0) / (t1 - t0)) * 1000 : 0; // deg/s
      const projected = angle + (velocity / 1000) * (0.99 / (1 - 0.99));
      stage.classList.remove("is-dragging");
      goTo(Math.round(projected / STEP));
      // Swallow the click that follows a drag, and only that one.
      const swallow = (e: Event) => e.stopPropagation();
      stage.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => stage.removeEventListener("click", swallow, { capture: true }), 0);
    }
    drag = null;
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  cards.forEach((card, i) => card.addEventListener("click", () => (i === index ? openDialog() : goTo(i))));

  goTo(0);
}

export {};
