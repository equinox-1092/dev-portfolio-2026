// Section entrances: each [data-reveal] group plays once when it scrolls in.
// Children get a --i index for the stagger; the hidden state only exists under .js (see global.css).
const groups = document.querySelectorAll<HTMLElement>("[data-reveal]");

groups.forEach((group) =>
  Array.from(group.children).forEach((child, i) =>
    (child as HTMLElement).style.setProperty("--i", String(i)),
  ),
);

if (!("IntersectionObserver" in window)) {
  groups.forEach((g) => g.classList.add("is-in"));
} else {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }),
    { rootMargin: "0px 0px -12% 0px" },
  );
  groups.forEach((g) => io.observe(g));
}

export {};
