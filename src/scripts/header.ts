const header = document.querySelector<HTMLElement>("[data-header]");
const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const panel = document.getElementById("mobile-nav");
const hero = document.querySelector<HTMLElement>("[data-hero]");

// Transparent over the hero footage, solid once the page moves past it or the menu opens.
function updateSolid() {
  if (!header) return;
  const pastHero = !hero || window.scrollY > hero.offsetHeight - header.offsetHeight;
  header.toggleAttribute("data-solid", pastHero || !panel?.hidden);
}

function setOpen(open: boolean) {
  if (!toggle || !panel) return;
  panel.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? toggle.dataset.closeLabel! : toggle.dataset.openLabel!;
  updateSolid();
}

toggle?.addEventListener("click", () => setOpen(panel?.hidden ?? false));
panel?.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("a")) setOpen(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && panel && !panel.hidden) {
    setOpen(false);
    toggle?.focus();
  }
});
matchMedia("(min-width: 64rem)").addEventListener("change", () => setOpen(false));

updateSolid();
window.addEventListener("scroll", updateSolid, { passive: true });

// The bar stays out of the way until the intro has opened onto the hero (scripts/intro.ts sets
// data-revealed). Keyboard focus still brings it back (see :focus-within in Header.astro).
if (header && hero) {
  const syncAway = () => header.toggleAttribute("data-away", !hero.hasAttribute("data-revealed"));
  syncAway();
  new MutationObserver(syncAway).observe(hero, { attributes: true, attributeFilter: ["data-revealed"] });
}

// Mark the link of the section in view.
const navLinks = document.querySelectorAll<HTMLAnchorElement>("[data-nav]");
const spy = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        if (link.dataset.nav === entry.target.id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }),
  { rootMargin: "-45% 0px -50% 0px" },
);
navLinks.forEach((link) => {
  const section = document.getElementById(link.dataset.nav!);
  if (section) spy.observe(section);
});

export {};
