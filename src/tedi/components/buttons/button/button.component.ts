import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  Renderer2,
  untracked,
  ViewEncapsulation,
} from "@angular/core";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { BaseButtonDirective } from "./base-button.directive";
import { SpinnerComponent } from "../../loader/spinner/spinner.component";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "neutral"
  | "success"
  | "danger"
  | "danger-neutral"
  | "primary-inverted"
  | "secondary-inverted"
  | "neutral-inverted"
  | "primary-button-group"
  | "secondary-button-group";

export type ButtonSize = "default" | "small";

let loadingDescriptionCounter = 0;

@Component({
  selector: "[tedi-button]",
  standalone: true,
  imports: [SpinnerComponent, TediTranslationPipe],
  template: `
    @if (loading()) {
      <tedi-spinner class="tedi-button__spinner" [size]="16" />
    }
    <ng-content />
    @if (loading()) {
      <!-- aria-hidden keeps it out of the name and browse mode; aria-describedby still reads it. -->
      <span
        class="tedi-button__loading-description"
        aria-hidden="true"
        [id]="loadingDescriptionId"
        >{{ loadingLabel() || ("loading" | tediTranslate) }}</span
      >
    }
  `,
  styleUrl: "./button.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [
    {
      directive: BaseButtonDirective,
    },
  ],
  host: {
    "[class]": "classes()",
  },
})
export class ButtonComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);

  /**
   * Specifies the color theme of the button. The color should meet accessibility standards for color contrast.
   *
   * `primary-button-group` and `secondary-button-group` are intended for items inside
   * `tedi-button-group`: they use the small (`button-radius-sm`) corner radius and show
   * their selected state via `aria-pressed`.
   * @default primary
   */
  variant = input<ButtonVariant>("primary");
  /**
   * Defines the size of the button.
   * @default default
   */
  size = input<ButtonSize>("default");
  /**
   * Shows a spinner in place of the icons and blocks activation: clicks don't reach `(click)`
   * handlers, forms don't submit and links don't navigate. Unlike `disabled`, the button
   * keeps focus. Screen readers hear "Loading" when the focused button switches into this
   * state, and as the button's description when it is focused while loading.
   * @default false
   */
  loading = input<boolean>(false);
  /**
   * What screen readers hear while `loading`. Say what is happening, e.g. "Saving".
   * @default the translated `loading` label
   */
  loadingLabel = input<string>();

  classes = computed(() => {
    const classList = [
      "tedi-button",
      `tedi-button--${this.variant()}`,
      `tedi-button--${this.size()}`,
    ];

    if (this.loading()) {
      classList.push("tedi-button--loading");
    }

    return classList.join(" ");
  });

  protected readonly loadingDescriptionId = `tedi-button-loading-${++loadingDescriptionCounter}`;
  private wasLoading = false;
  private initialized = false;
  private consumerAriaDisabled: string | null = null;

  constructor() {
    // Capture phase: at the target it runs before the consumer's `(click)`,
    // which Angular registers first.
    const element = this.elementRef.nativeElement;
    element.addEventListener("click", this.handleClick, true);
    // A middle-click opens a link without firing `click`.
    element.addEventListener("auxclick", this.handleClick, true);
    inject(DestroyRef).onDestroy(() => {
      element.removeEventListener("click", this.handleClick, true);
      element.removeEventListener("auxclick", this.handleClick, true);
    });

    // Set imperatively rather than as host bindings, so a consumer's own
    // `aria-disabled` survives while the button isn't loading and is restored after.
    effect(() => {
      const loading = this.loading();
      untracked(() => this.applyLoadingState(loading));
    });
  }

  private handleClick = (event: Event): void => {
    if (!this.loading()) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private applyLoadingState(loading: boolean): void {
    // Only a switch into loading is announced, not a button that renders loading.
    const isSwitch = this.initialized;
    this.initialized = true;

    if (loading === this.wasLoading) {
      return;
    }

    this.wasLoading = loading;
    const element = this.elementRef.nativeElement;

    // Other ids (e.g. a tooltip's) can share `aria-describedby`, so only this id is toggled.
    const describedBy = (element.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter((id) => id && id !== this.loadingDescriptionId);

    if (!loading) {
      if (this.consumerAriaDisabled === null) {
        this.renderer.removeAttribute(element, "aria-disabled");
      } else {
        this.renderer.setAttribute(
          element,
          "aria-disabled",
          this.consumerAriaDisabled,
        );
      }
      this.setDescribedBy(element, describedBy);
      return;
    }

    this.consumerAriaDisabled = element.getAttribute("aria-disabled");

    // No `aria-busy`: screen readers don't announce it on a button, and JAWS may
    // suppress the busy element's own name and description (TEDI-Design-System/react#70).
    this.renderer.setAttribute(element, "aria-disabled", "true");
    this.setDescribedBy(element, [...describedBy, this.loadingDescriptionId]);

    // Assertive: a polite message is dropped while the screen reader reads the focused
    // button's own changes. Focus-only, so buttons loading elsewhere don't interrupt.
    if (isSwitch && element.ownerDocument.activeElement === element) {
      // Resolved lazily so buttons that never load don't require translation providers.
      this.injector
        .get(LiveAnnouncer)
        .announce(
          this.loadingLabel() ||
            this.injector.get(TediTranslationService).translate("loading"),
          "assertive",
        );
    }
  }

  private setDescribedBy(element: HTMLElement, ids: string[]): void {
    if (ids.length) {
      this.renderer.setAttribute(element, "aria-describedby", ids.join(" "));
    } else {
      this.renderer.removeAttribute(element, "aria-describedby");
    }
  }
}
