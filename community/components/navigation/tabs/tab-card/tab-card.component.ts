import {booleanAttribute, ChangeDetectionStrategy, Component, input, model, ViewEncapsulation} from '@angular/core';
import {ButtonComponent, IconComponent} from "@tedi-design-system/angular/tedi";
import {CardComponent, CardContentComponent} from "@tedi-design-system/angular/community";

@Component({
  selector: '[tedi-tab-card]',
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
    "(click)": "selectTab()",
  },
})
export class TabCardComponent {
  readonly tabId = input.required<string>();
  readonly title = input.required<string>();
  readonly selected = model(false);

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
  }
}
