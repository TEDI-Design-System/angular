import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { Highlightable } from "@angular/cdk/a11y";
import { TextComponent } from "../../base/text/text.component";
import { highlightParts } from "./search-highlight.util";

@Component({
  selector: "li[tedi-search-suggestion]",
  standalone: true,
  templateUrl: "./search-suggestion.component.html",
  styleUrl: "./search-suggestion.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextComponent],
  host: {
    class: "tedi-search-suggestion",
    role: "option",
    tabindex: "-1",
    "[class.tedi-search-suggestion--active]": "isActive()",
    "[class.tedi-search-suggestion--custom]": "custom()",
    "[class.tedi-search-suggestion--disabled]": "disabledInput()",
    "[attr.aria-selected]": "isActive()",
    "[attr.aria-disabled]": "disabledInput() || null",
  },
})
export class SearchSuggestionComponent implements Highlightable {
  /** Resolved display label. */
  readonly label = input<string>("");

  /** Secondary line under the label. */
  readonly description = input<string>("");

  /** Current field value, used to bold the matching segment. */
  readonly query = input<string>("");

  /** Whether a custom suggestion template supplies the row content. */
  readonly custom = input(false, { transform: booleanAttribute });

  readonly disabledInput = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: "disabled",
    transform: booleanAttribute,
  });

  readonly host = inject<ElementRef<HTMLLIElement>>(ElementRef);

  private readonly active = signal(false);
  readonly isActive = this.active.asReadonly();

  readonly parts = computed(() => highlightParts(this.label(), this.query()));

  /**
   * `Highlightable` requires a plain boolean, so the signal input is aliased and
   * this getter satisfies the CDK contract — a signal would always read truthy.
   */
  get disabled(): boolean {
    return this.disabledInput();
  }

  setActiveStyles(): void {
    this.active.set(true);
  }

  setInactiveStyles(): void {
    this.active.set(false);
  }

  getLabel(): string {
    return this.label();
  }

  scrollIntoView(): void {
    this.host.nativeElement.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }
}
