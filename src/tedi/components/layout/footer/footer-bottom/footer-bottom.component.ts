import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  Renderer2,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { injectFooter } from "../footer-context";

const DOT_CLASS = "tedi-footer-bottom__dot";

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  selector: "tedi-footer-bottom",
  templateUrl: "./footer-bottom.component.html",
  styleUrl: "./footer-bottom.component.scss",
  host: {
    class: "tedi-footer-bottom",
    "[class.tedi-footer-bottom--mobile]": "isMobile()",
  },
})
export class FooterBottomComponent {
  private readonly renderer = inject(Renderer2);
  private readonly context = injectFooter();

  /**
   * Shows a dot between items.
   * @default false
   */
  readonly separator = input<boolean>(false);

  readonly isMobile = this.context.isMobile;
  readonly maxWidth = this.context.footer?.maxWidthValue;

  private readonly inner = viewChild.required<ElementRef<HTMLElement>>("inner");
  private observer?: MutationObserver;

  constructor() {
    afterRenderEffect(() => this.syncDots(this.separator()));
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  private syncDots(separator: boolean): void {
    const inner = this.inner().nativeElement;
    this.observer ??= new MutationObserver(() =>
      this.syncDots(this.separator()),
    );
    this.observer.disconnect();

    inner
      .querySelectorAll(`:scope > .${DOT_CLASS}`)
      .forEach((dot) => this.renderer.removeChild(inner, dot));

    if (separator) {
      Array.from(inner.children)
        .slice(0, -1)
        .forEach((item) => {
          const dot = this.renderer.createElement("span");
          this.renderer.addClass(dot, DOT_CLASS);
          this.renderer.setAttribute(dot, "aria-hidden", "true");
          this.renderer.insertBefore(inner, dot, item.nextSibling);
        });
    }

    this.observer.observe(inner, { childList: true });
  }
}
