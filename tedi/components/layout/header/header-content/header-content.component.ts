import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from "@angular/core";

export type HeaderContentAlignment = "flex-start" | "center" | "space-between";

@Component({
  selector: "tedi-header-content",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "./header-content.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
  },
})
export class HeaderContentComponent {
  /**
   * Controls the horizontal alignment of the projected content (`justify-content`).
   * Useful when the center area mixes nav links with another component (e.g. a
   * `<tedi-header-search>`) and you want to push them apart or align them to one edge.
   * @default "center"
   */
  readonly alignment = input<HeaderContentAlignment>("center");

  protected readonly classes = computed(
    () => `tedi-header-content tedi-header-content--${this.alignment()}`,
  );
}
