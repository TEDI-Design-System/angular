export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    "a[href]",
    "area[href]",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "button:not([disabled])",
    "summary",
    "iframe",
    "audio[controls]",
    "video[controls]",
    "[contenteditable]:not([contenteditable='false'])",
    "[tabindex]:not([tabindex='-1'])",
  ];
  const elements = Array.from(container.querySelectorAll(selectors.join(",")));

  if (typeof window === "undefined") {
    return elements.filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
  }

  return elements.filter((el): el is HTMLElement => {
    if (!(el instanceof HTMLElement)) return false;

    const style = window.getComputedStyle(el);

    if (style.display === "none" || style.visibility === "hidden") return false;
    if (el.hasAttribute("hidden")) return false;
    if (el.closest("[inert]")) return false;

    const fieldset = el.closest("fieldset[disabled]");

    if (fieldset) {
      const firstLegend = fieldset.querySelector("legend");
      if (!firstLegend || !firstLegend.contains(el)) return false;
    }

    if (el.tagName !== "SUMMARY") {
      const closedDetails = el.closest("details:not([open])");
      if (closedDetails) return false;
    }

    return true;
  });
}
