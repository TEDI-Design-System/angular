import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import type { Column } from "@tanstack/angular-table";
import { ButtonComponent } from "../../../buttons/button/button.component";
import { IconComponent } from "../../../base/icon/icon.component";
import { DropdownComponent } from "../../../overlay/dropdown/dropdown.component";
import { DropdownContentComponent } from "../../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../../../overlay/dropdown/dropdown-item/dropdown-item.component";
import { DropdownTriggerDirective } from "../../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DropdownItemValueComponent } from "../../../overlay/dropdown/dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "../../../overlay/dropdown/dropdown-item-value/dropdown-item-value-label.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TABLE_CONTEXT } from "../table.context";
import type { TediTableContextValue } from "../table.types";

@Component({
  standalone: true,
  selector: "tedi-table-columns-menu",
  imports: [
    ButtonComponent,
    IconComponent,
    DropdownComponent,
    DropdownContentComponent,
    DropdownItemComponent,
    DropdownTriggerDirective,
    DropdownItemValueComponent,
    DropdownItemValueLabelComponent,
  ],
  templateUrl: "./table-columns-menu.component.html",
  styleUrl: "./table-columns-menu.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-table-columns-menu",
    "data-name": "tedi-table-columns-menu",
  },
})
export class TediTableColumnsMenuComponent {
  /**
   * Trigger label. Falls back to the localised `table.columns` translation.
   */
  readonly triggerLabel = input<string | undefined>(undefined);

  private readonly context = inject<TediTableContextValue>(TEDI_TABLE_CONTEXT);
  private readonly translation = inject(TediTranslationService);

  protected readonly defaultLabel = this.translation.track("table.columns");

  protected readonly hideableColumns = computed(() => {
    void this.context.state();
    return this.context
      .table()
      .getAllLeafColumns()
      .filter((column) => column.getCanHide());
  });

  protected readonly visibleCount = computed(
    () =>
      this.hideableColumns().filter((column) => column.getIsVisible()).length,
  );

  protected readonly tableId = computed(() => this.context.id());

  protected resolveHeader(column: Column<unknown, unknown>): string {
    const header = column.columnDef.header;
    return typeof header === "string" ? header : column.id;
  }

  protected handleToggle(column: Column<unknown, unknown>): void {
    column.toggleVisibility();
  }
}
