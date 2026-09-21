const NAVIGATION_KEYS = ["ArrowLeft", "ArrowRight", "Home", "End"];

const nextTabIndex = (
  key: string,
  currentIndex: number,
  count: number,
): number => {
  switch (key) {
    case "ArrowLeft":
      return currentIndex === 0 ? count - 1 : currentIndex - 1;
    case "ArrowRight":
      return currentIndex === count - 1 ? 0 : currentIndex + 1;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return -1;
  }
};

/**
 * Navigates to a sibling tab in the tablist using ArrowLeft/ArrowRight/Home/End
 * keys. Returns the target tab element if navigation occurred, or null otherwise.
 */
export const navigateTablist = (event: KeyboardEvent): HTMLElement | null => {
  if (!NAVIGATION_KEYS.includes(event.key)) return null;

  const current = event.currentTarget as HTMLElement;
  const tablist = current.closest('[role="tablist"]');
  if (!tablist) return null;

  const tabs = Array.from(
    tablist.querySelectorAll<HTMLElement>(
      '[role="tab"]:not([disabled]):not([aria-disabled="true"])',
    ),
  ).filter((tab) => getComputedStyle(tab).display !== "none");
  const currentIndex = tabs.indexOf(current);
  if (tabs.length === 0 || currentIndex === -1) return null;

  const newIndex = nextTabIndex(event.key, currentIndex, tabs.length);
  if (newIndex === -1) return null;

  event.preventDefault();
  tabs[newIndex].focus();
  tabs[newIndex].scrollIntoView({ block: "nearest", inline: "nearest" });
  return tabs[newIndex];
};
