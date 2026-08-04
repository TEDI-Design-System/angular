import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../base/icon/icon.component";
import { SpinnerComponent } from "../../loader/spinner/spinner.component";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import { ClosingButtonComponent } from "../../buttons/closing-button/closing-button.component";
import { EllipsisComponent, EllipsisPosition } from "../../helpers/ellipsis";
import { NgTemplateOutlet } from "@angular/common";
import { _IdGenerator } from '@angular/cdk/a11y';

export type TagType = "primary" | "secondary" | "danger";
export type TagEllipsis = "start" | "end" | false;

@Component({
  selector: "tedi-tag",
  imports: [
    SpinnerComponent,
    IconComponent,
    ClosingButtonComponent,
    TediTranslationPipe,
    EllipsisComponent,
    NgTemplateOutlet,
  ],
  templateUrl: "./tag.component.html",
  styleUrl: "./tag.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-tag]": "true",
    "[class.tedi-tag--loading]": "loading()",
    "[class.tedi-tag--closable]": "closable()",
    "[class.tedi-tag--ellipsis]": "ellipsis() !== false",
    "[class]": "classes()",
  },
})
export class TagComponent {
  readonly idGenerator = inject(_IdGenerator);
  readonly uniqueId = this.idGenerator.getId('tedi-tag');
  readonly removeLabelId = this.idGenerator.getId('tedi-tag-remove');
  /**
   * Whether the tag is in loading state.
   * When true, a spinner will be displayed inside the tag.
   * @default false
   */
  loading = input(false);

  /**
   * Whether the tag can be closed.
   * When true, a close button will be displayed that emits the 'closed' event when clicked.
   * @default false
   */
  closable = input(false);

  /**
   * The visual style of the tag.
   * Possible values: 'primary', 'secondary', 'danger'
   * @default "primary"
   */
  type = input<TagType>("primary");

  /**
   * Which end the label truncates from when it doesn't fit. `false` (default)
   * never truncates — the label wraps and the tag keeps its full width. `end`
   * shows an ellipsis at the end (`Long label…`); `start` shows it at the start
   * (`…label`), which keeps the most significant part of values like dates
   * visible. Truncation only kicks in when the tag is width-constrained, and the
   * full label is revealed in a tooltip on hover/focus.
   * @default false
   */
  ellipsis = input<TagEllipsis>(false);

  /**
   * Event emitted when the close button is clicked.
   */
  closed = output<Event>();

  classes = computed(() => {
    const classList = [];
    if (this.type()) {
      classList.push(`tedi-tag--${this.type()}`);
    }
    return classList.join(" ");
  });

  ellipsisPosition = computed<EllipsisPosition>(() =>
    this.ellipsis() === "start" ? "start" : "end",
  );

  handleClose(event: Event) {
    this.closed.emit(event);
  }
}
