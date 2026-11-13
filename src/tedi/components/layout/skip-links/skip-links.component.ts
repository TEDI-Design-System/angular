import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  inject,
  ViewEncapsulation,
} from "@angular/core";
import { DOCUMENT, NgTemplateOutlet } from "@angular/common";
import { LinkComponent } from "../../navigation/link/link.component";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import { SkipLinkDirective } from "./skip-link.directive";

// Like the browser's own fragment navigation, so `#%C3%B5ige` finds `id="õige"`.
const decodeId = (id: string) => {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
};

/**
 * Links that let keyboard users bypass repeated content (WCAG 2.4.1). Hidden until a link receives focus.
 * Render it as the first element on the page, before the header.
 */
@Component({
  selector: "tedi-skip-links",
  standalone: true,
  imports: [NgTemplateOutlet, LinkComponent, TediTranslationPipe],
  templateUrl: "./skip-links.component.html",
  styleUrl: "./skip-links.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-skip-links",
    "(click)": "handleClick($event)",
  },
})
export class SkipLinksComponent {
  private readonly document = inject(DOCUMENT);

  /** Without any, a single link to `#main-content` is rendered. */
  readonly links = contentChildren(SkipLinkDirective);

  // Focuses the target directly: an app's <base href="/"> would turn `#id` into a link to the home page.
  handleClick(event: MouseEvent): void {
    if (event.defaultPrevented) {
      return;
    }

    const href = (event.target as Element)
      .closest("a[href^='#']")
      ?.getAttribute("href");
    const target =
      href && this.document.getElementById(decodeId(href.slice(1)));

    if (!target) {
      return;
    }

    event.preventDefault();

    // A non-interactive target takes focus only to move the Tab start point, so it gets no focus ring.
    if (target.tabIndex < 0) {
      const addedTabIndex = !target.hasAttribute("tabindex");
      if (addedTabIndex) {
        target.setAttribute("tabindex", "-1");
      }
      target.classList.add("tedi-skip-links__target");
      target.addEventListener(
        "blur",
        () => {
          target.classList.remove("tedi-skip-links__target");
          if (addedTabIndex) {
            target.removeAttribute("tabindex");
          }
        },
        { once: true },
      );
    }

    target.focus();
  }
}
