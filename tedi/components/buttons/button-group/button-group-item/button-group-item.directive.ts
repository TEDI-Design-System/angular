import {
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
import { ButtonGroupComponent } from "../button-group.component";

type IconSlot = "left" | "right" | "solo";

/**
 * Decorates a `<button>` inside a `tedi-button-group` to participate in the
 * group's strip and mobile-dropdown rendering. Reads `size`/`type` from the
 * parent group and emits selection upward on click.
 *
 * The `iconLeft`/`iconRight`/`icon` inputs are auto-rendered into the button
 * via dynamically created `tedi-icon` components — the consumer doesn't need
 * to project them into the button content. The same inputs feed the mobile
 * dropdown's trigger/items.
 */
@Directive({
  selector: "button[tedi-button-group-item]",
  standalone: true,
  host: {
    "[class]": "hostClasses()",
    "[attr.id]": "id()",
    "[attr.disabled]": "disabled() ? '' : null",
    "[attr.aria-pressed]": "selected()",
    "[attr.aria-label]": "icon() ? label() : null",
  },
})
export class ButtonGroupItemDirective {
  /**
   * Unique identifier emitted via the parent's `selectionChange` output when
   * this item is activated.
   */
  readonly id = input.required<string>();

  /**
   * Display label. Used as the visible text in the mobile dropdown and as the
   * dropdown trigger label when `dropdownLabelMode="selected"`. The item's
   * projected content is what's shown in the strip.
   */
  readonly label = input.required<string>();

  /**
   * Marks this item as currently selected. Drives the `--selected` class and
   * `aria-pressed`.
   * @default false
   */
  readonly selected = input(false, { transform: booleanAttribute });

  /**
   * Disables interaction via the native `disabled` attribute.
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Icon name rendered before the label in both the strip button and the
   * mobile dropdown item.
   */
  readonly iconLeft = input<string>();

  /**
   * Icon name rendered after the label in both the strip button and the
   * mobile dropdown item.
   */
  readonly iconRight = input<string>();

  /**
   * Icon-only mode: icon name used in the dropdown trigger and dropdown item
   * when this item has no inline label.
   */
  readonly icon = input<string>();

  /**
   * Fires on user activation (click or keyboard). Disabled items don't emit.
   */
  readonly clicked = output<MouseEvent>();

  private readonly host = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);
  private readonly parent = inject(ButtonGroupComponent);

  private readonly iconRefs = new Map<IconSlot, ComponentRef<IconComponent>>();

  protected readonly hostClasses = computed(() => {
    const list = [
      "tedi-button-group__item",
      `tedi-button-group__item--size-${this.parent.size()}`,
    ];
    if (this.selected()) list.push("tedi-button-group__item--selected");
    if (this.disabled()) list.push("tedi-button-group__item--disabled");
    return list.join(" ");
  });

  constructor() {
    effect(() => this.syncIcon("left", this.iconLeft()));
    effect(() => this.syncIcon("right", this.iconRight()));
    effect(() => this.syncIcon("solo", this.icon()));
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
    this.parent.emitSelection(this.id());
  }
}
