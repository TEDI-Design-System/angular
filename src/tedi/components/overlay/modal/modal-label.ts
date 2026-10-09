import { _IdGenerator } from "@angular/cdk/a11y";

/** Any heading level: the right one depends on the page, not on the modal. */
const HEADING_SELECTOR = ["h1", "h2", "h3", "h4", "h5", "h6"]
  .map((tag) => `tedi-modal-header ${tag}`)
  .join(", ");

/**
 * Finds the heading that names the dialog inside `root`, giving it an id if it
 * has none. `null` when there is none, so the caller writes no dangling
 * `aria-labelledby`. Shared by both modal modes so the rule cannot drift.
 */
export function resolveModalHeadingId(
  root: HTMLElement,
  idGenerator: _IdGenerator,
): string | null {
  const heading = root.querySelector<HTMLElement>(HEADING_SELECTOR);

  if (!heading) return null;

  if (!heading.id) {
    heading.id = idGenerator.getId("tedi-modal-title-");
  }

  return heading.id;
}
