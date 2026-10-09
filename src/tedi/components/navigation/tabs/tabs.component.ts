import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  effect,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";

/**
 * Root of the Tabs compound component. Wraps `tedi-tabs-list` and
 * `tedi-tabs-content` elements and owns the active-tab state, which the list,
 * triggers and panels read by injecting this component.
 *
 * Use `defaultValue` for uncontrolled usage, or bind `[(value)]`
 * (or `[value]` + `(valueChange)`) for controlled usage.
 */
@Component({
  selector: "tedi-tabs",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "./tabs.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-tabs",
    "[attr.data-name]": "'tabs'",
  },
})
export class TabsComponent {
  /** Controlled active tab id. Use with `(valueChange)` or `[(value)]`. */
  readonly value = input<string>();
  /** Initial active tab id for uncontrolled usage. */
  readonly defaultValue = input<string>("");
  /** Emitted when the active tab changes. */
  readonly valueChange = output<string>();

  /** Currently active tab id, read by the list, triggers and panels. */
  readonly activeTab = signal<string>("");

  private initialized = false;

  constructor() {
    effect(() => {
      const value = this.value();
      const defaultValue = this.defaultValue();

      untracked(() => {
        if (value !== undefined) {
          this.activeTab.set(value);
        } else if (!this.initialized) {
          this.activeTab.set(defaultValue);
        }
        this.initialized = true;
      });
    });
  }

  /**
   * Requests activation of a tab. In uncontrolled mode the active tab updates
   * immediately; in controlled mode only `valueChange` fires and the consumer
   * is expected to update the bound value.
   */
  select(id: string): void {
    if (id === this.activeTab()) return;
    if (this.value() === undefined) {
      this.activeTab.set(id);
    }
    this.valueChange.emit(id);
  }
}
