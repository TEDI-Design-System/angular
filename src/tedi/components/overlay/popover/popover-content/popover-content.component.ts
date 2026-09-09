import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { ClosingButtonComponent } from "../../../buttons/closing-button/closing-button.component";
import { PopoverComponent } from "../popover.component";

export type PopoverWidthPreset = "none" | "small" | "medium" | "large";

/**
 * A preset, or any CSS length (`"20rem"`, `"340px"`, `"min(90vw, 30rem)"`) for
 * a panel the presets don't cover. `(string & {})` keeps the preset
 * autocomplete alive while still accepting an arbitrary length.
 */
export type PopoverWidth = PopoverWidthPreset | (string & {});

let popoverTitleId = 0;

@Component({
  standalone: true,
  selector: "tedi-popover-content",
  templateUrl: "./popover-content.component.html",
  styleUrl: "../popover.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, ClosingButtonComponent],
  host: {
    "[class]": "classes()",
    "[style.width]": "customWidth()",
  },
})
export class PopoverContentComponent {
  /**
   * The width of the popover: a preset ('none', 'small', 'medium', 'large') or
   * any CSS length ('20rem'). 'none' sizes the panel to its content.
   * @default small
   */
  maxWidth = input<PopoverWidth>("small");
  /**
   * Heading title of the content
   */
  title = input("");
  /**
   * Should content show close button?
   * @default false
   */
  showClose = input(false);

  private readonly popover = inject(PopoverComponent);
  titleId = `popover-title-${popoverTitleId++}`;

  private readonly isPresetWidth = computed(() =>
    (["none", "small", "medium", "large"] as string[]).includes(
      this.maxWidth(),
    ),
  );

  /** Widths outside the preset scale are applied inline. */
  readonly customWidth = computed(() =>
    this.isPresetWidth() ? null : this.maxWidth(),
  );

  classes = computed(() => {
    const classList = ["tedi-popover-content"];
    const maxWidth = this.maxWidth();
    if (this.isPresetWidth() && maxWidth !== "none") {
      classList.push(`tedi-popover-content--${maxWidth}`);
    }
    return classList.join(" ");
  });

  handleClose() {
    this.popover.hidePopover(true);
  }
}
