import {
  AfterViewInit,
  booleanAttribute,
  ComponentRef,
  computed,
  Directive,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  Renderer2,
  ViewContainerRef,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import { BaseButtonDirective } from "../../button/base-button.directive";
import { ButtonSize, ButtonVariant } from "../../button/button.component";
import { ButtonGroupComponent } from "../button-group.component";

type IconSlot = "left" | "right" | "only";

/**
 * Turns a `<button>` inside `tedi-button-group` into a styled, selectable item.
 * Extends `tedi-button` (composes `BaseButtonDirective` and applies the
 * `tedi-button` variant classes), inherits `variant`/`size` from the parent
 * group (overridable per item), and derives its selected state from the group's
 * `value`. The `iconLeft`/`iconRight`/`icon` inputs are auto-rendered as
 * `tedi-icon` elements and reused by the mobile dropdown.
 */
@Directive({
  selector: "button[tedi-button-group-button]",
  standalone: true,
  hostDirectives: [BaseButtonDirective],
  host: {
    "[class]": "hostClasses()",
    "[attr.disabled]": "disabled() ? '' : null",
    "[attr.aria-pressed]": "selected()",
    "[attr.aria-label]": "icon() ? label() : null",
  },
})
export class ButtonGroupButtonDirective implements AfterViewInit {
  /** Identity contributing to the group's selected value. */
  readonly value = input.required<string>();

  /** Visible text; used by the mobile dropdown and as the accessible name in icon-only mode. */
  readonly label = input.required<string>();

  /** Disables interaction via the native `disabled` attribute. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Icon rendered before the label (and in the dropdown item). */
  readonly iconLeft = input<string>();

  /** Icon rendered after the label (and in the dropdown item). */
  readonly iconRight = input<string>();

  /** Icon-only mode: icon for the button, dropdown trigger and dropdown item. */
  readonly icon = input<string>();

  /** Overrides the group's `variant` for this item. */
  readonly variant = input<ButtonVariant>();

  /** Overrides the group's `size` for this item. */
  readonly size = input<ButtonSize>();

  /** Fires on user activation (click). Disabled items don't emit. */
  readonly clicked = output<MouseEvent>();

  private readonly host = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);
  private readonly parent = inject(ButtonGroupComponent);

  private readonly iconRefs = new Map<IconSlot, ComponentRef<IconComponent>>();

  readonly effectiveVariant = computed(
    () => this.variant() ?? this.parent.variant(),
  );
  readonly effectiveSize = computed(() => this.size() ?? this.parent.size());
  readonly selected = computed(() => this.parent.isSelected(this.value()));

  protected readonly hostClasses = computed(() =>
    [
      "tedi-button",
      "tedi-button-group-button",
      `tedi-button--${this.effectiveVariant()}`,
      `tedi-button--${this.effectiveSize()}`,
    ].join(" "),
  );

  constructor() {
    effect(() => this.syncIcon("left", this.iconLeft()));
    effect(() => this.syncIcon("right", this.iconRight()));
    effect(() => this.syncIcon("only", this.icon()));
  }

  ngAfterViewInit() {
    this.wrapLabel();
  }

  /** Wraps the projected text in a padded span so the gap to an adjacent icon
   * comes from the label (the icon itself stays flush), matching the design. */
  private wrapLabel() {
    const button = this.host.nativeElement;
    const textNodes = Array.from(button.childNodes).filter(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    );
    if (textNodes.length === 0) return;

    const label = this.renderer.createElement("span");
    this.renderer.addClass(label, "tedi-button-group-button__label");
    this.renderer.insertBefore(button, label, textNodes[0]);
    textNodes.forEach((node) => this.renderer.appendChild(label, node));
  }

  private syncIcon(slot: IconSlot, name: string | undefined) {
    const existing = this.iconRefs.get(slot);

    if (!name) {
      if (existing) {
        existing.destroy();
        this.iconRefs.delete(slot);
      }
      return;
    }

    if (existing) {
      existing.setInput("name", name);
      return;
    }

    const ref = this.viewContainer.createComponent(IconComponent);
    ref.setInput("name", name);
    ref.setInput("color", "inherit");
    ref.setInput("size", 18);

    const button = this.host.nativeElement;
    const iconEl = ref.location.nativeElement;
    if (slot === "right") {
      this.renderer.appendChild(button, iconEl);
    } else {
      this.renderer.insertBefore(button, iconEl, button.firstChild);
    }

    this.iconRefs.set(slot, ref);
  }

  @HostListener("click", ["$event"])
  protected onClick(event: MouseEvent) {
    if (this.disabled()) return;
    this.clicked.emit(event);
    this.parent.toggle(this.value());
  }
}
