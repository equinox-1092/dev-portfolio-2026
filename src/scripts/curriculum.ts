// Prerequisite map: pick a course, its whole chain of prerequisites lights up, nearest first.
document.querySelectorAll<HTMLElement>("[data-curriculum]").forEach((map) => {
  const buttons = Array.from(map.querySelectorAll<HTMLButtonElement>("[data-course]"));
  const result = map.querySelector<HTMLElement>("[data-result]")!;
  const byId = new Map(buttons.map((b) => [b.dataset.course!, b]));
  const list = new Intl.ListFormat(document.documentElement.lang, { type: "conjunction" });

  // Every course reachable through `requires`, breadth-first so the nearest come first.
  function chain(id: string) {
    const seen: string[] = [];
    const queue = [id];
    while (queue.length) {
      for (const req of byId.get(queue.shift()!)?.dataset.requires?.split(" ").filter(Boolean) ?? []) {
        if (seen.includes(req)) continue;
        seen.push(req);
        queue.push(req);
      }
    }
    return seen;
  }

  function select(button: HTMLButtonElement | null) {
    const required = button ? chain(button.dataset.course!) : [];
    buttons.forEach((b) => {
      const order = required.indexOf(b.dataset.course!);
      b.setAttribute("aria-pressed", String(b === button));
      b.style.transitionDelay = order > 0 ? `${order * 60}ms` : "";
      if (order >= 0) b.dataset.state = "required";
      else delete b.dataset.state;
    });

    if (!button) {
      result.textContent = result.dataset.idle!;
      return;
    }
    const course = button.textContent!.trim();
    // Read the chain in the order it is taken: earliest term first.
    const names = required
      .map((id) => byId.get(id)!)
      .sort((a, b) => Number(a.dataset.cycle) - Number(b.dataset.cycle))
      .map((b) => b.textContent!.trim());
    result.textContent = names.length
      ? result.dataset.template!.replace("{course}", course).replace("{list}", list.format(names))
      : result.dataset.none!.replace("{course}", course);
  }

  buttons.forEach((b) =>
    b.addEventListener("click", () => select(b.getAttribute("aria-pressed") === "true" ? null : b)),
  );
});

export {};
