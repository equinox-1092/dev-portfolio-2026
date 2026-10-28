// Contact form: posts to Web3Forms; every message comes from the form's data-* attributes (i18n).
const form = document.getElementById("contact-form") as HTMLFormElement | null;

if (form) {
  const status = form.querySelector<HTMLElement>("[data-status]")!;
  const submit = form.querySelector<HTMLButtonElement>("[data-submit]")!;
  const label = form.querySelector<HTMLElement>("[data-submit-label]")!;
  const sendText = label.textContent;

  const show = (type: "success" | "error", message: string) => {
    status.dataset.type = type;
    status.textContent = message;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    delete status.dataset.type;

    const data = new FormData(form);
    if (!data.get("access_key")) {
      show("error", form.dataset.notConfigured!);
      return;
    }

    submit.disabled = true;
    label.textContent = form.dataset.sending!;
    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
      const result = await response.json();
      if (response.ok && result.success) {
        show("success", form.dataset.success!);
        form.reset();
      } else {
        show("error", form.dataset.error!);
      }
    } catch {
      show("error", form.dataset.network!);
    } finally {
      submit.disabled = false;
      label.textContent = sendText;
    }
  });
}

export {};
