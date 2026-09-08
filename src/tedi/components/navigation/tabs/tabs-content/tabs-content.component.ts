import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from "@angular/core";
import { TabsComponent } from "../tabs.component";

/**
 * A tab panel. When `id` matches a trigger, the panel is only shown while that
 * tab is active. When `id` is omitted the content is always rendered (useful
 * for router outlets).
 */
@Component({
  selector: "tedi-tabs-content",
  standalone: true,
  templateUrl: "./tabs-content.component.html",
  styleUrl: "./tabs-content.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-tabs-content",
    role: "tabpanel",
    "[attr.id]": "id() ? id() + '-panel' : null",
    "[attr.aria-labelledby]": "id() ?? null",
    "[attr.data-name]": "'tabs-content'",
    "[hidden]": "!isActive()",
  },
})
export class TabsContentComponent {
  private readonly tabs = inject(TabsComponent);

  /** Unique identifier matching the corresponding trigger id. */
  readonly id = input<string>();

  readonly isActive = computed(() => {
    const id = this.id();
    return !id || this.tabs.activeTab() === id;
  });
}
