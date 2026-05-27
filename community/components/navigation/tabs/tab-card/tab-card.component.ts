import {booleanAttribute, ChangeDetectionStrategy, Component, input, model, output, ViewEncapsulation} from '@angular/core';
import {ButtonComponent, IconComponent} from "@tedi-design-system/angular/tedi";
import {CardComponent, CardContentComponent} from "@tedi-design-system/angular/community";

@Component({
  selector: '[tedi-tab-card]',
  standalone: true,
  imports: [
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    IconComponent
  ],
  templateUrl: './tab-card.component.html',
  styleUrl: './tab-card.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-tab-card]": "true",
    "[class.tedi-tab-card--disabled]": "disabledInput()",
    "[attr.role]": "'tab'",
    "[attr.aria-selected]": "selected()",
    "[attr.aria-disabled]": "disabledInput()",
    "[attr.tabindex]": "selected() ? 0 : -1",
    "[attr.aria-controls]": "tabId() + '-panel'",
    "(click)": "selectTab()",
    "(keydown.enter)": "selectTab()",
    "(keydown.space)": "onSpaceKey($event)",
  },
})
export class TabCardComponent {
  readonly tabId = input.required<string>();
  readonly title = input.required<string>();
  readonly selected = model(false);
  readonly tabSelected = output<string>();

  readonly disabledInput = input(false, {
    transform: booleanAttribute,
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: "disabled",
  });

  selectTab() {
    if (this.disabledInput()) {
      return;
    }

    this.selected.set(true);
    this.tabSelected.emit(this.tabId());
  }

  onSpaceKey(event: Event) {
    event.preventDefault();
    this.selectTab();
  }
}
