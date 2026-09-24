import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
} from "@angular/core";
import { ButtonComponent } from "../../../buttons/button/button.component";
import { IconComponent } from "../../../base/icon/icon.component";
import { DropdownComponent } from "../../../overlay/dropdown/dropdown.component";
import { DropdownTriggerDirective } from "../../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "../../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../../../overlay/dropdown/dropdown-item/dropdown-item.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import {
  DatePickerSelectorMode,
  DatePickerView,
} from "../date-picker.component";

@Component({
  standalone: true,
  selector: "tedi-date-picker-header",
  templateUrl: "./date-picker-header.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    IconComponent,
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
  ],
})
export class DatePickerHeaderComponent {
  /** Unique ID for ARIA controls */
  readonly uniqueId = input.required<string>();

  /** Current view mode */
  readonly currentView = input.required<DatePickerView>();

  /** Currently displayed month */
  readonly month = input.required<Date>();

  /** Month selector mode */
  readonly monthMode = input<DatePickerSelectorMode>("dropdown");

  /** Year selector mode */
  readonly yearMode = input<DatePickerSelectorMode>("dropdown");

  /** Whether to show navigation buttons */
  readonly showNavigation = input(true);

  /** Whether previous month navigation is enabled */
  readonly canGoPrev = input(true);

  /** Whether next month navigation is enabled */
  readonly canGoNext = input(true);

  /** Selected year for display */
  readonly selectedYear = input.required<number>();

  /** List of available years for dropdown */
  readonly years = input.required<number[]>();

  /** Paged years for year grid navigation */
  readonly pagedYears = input.required<number[]>();

  /** Whether there's a previous year page */
  readonly hasPrevYearPage = input(true);

  /** Whether there's a next year page */
  readonly hasNextYearPage = input(true);

  /** Set of disabled month indices (0-11) */
  readonly disabledMonths = input<Set<number>>(new Set());

  /** Set of disabled years */
  readonly disabledYears = input<Set<number>>(new Set());

  readonly prevMonth = output<void>();
  readonly nextMonth = output<void>();
  readonly monthSelect = output<string>();
  readonly yearSelect = output<string>();
  readonly monthClick = output<void>();
  readonly yearClick = output<void>();
  readonly prevYearPage = output<void>();
  readonly nextYearPage = output<void>();

  readonly translationService = inject(TediTranslationService);

  readonly monthNames = [
    this.translationService.track("date-picker.january"),
    this.translationService.track("date-picker.february"),
    this.translationService.track("date-picker.march"),
    this.translationService.track("date-picker.april"),
    this.translationService.track("date-picker.may"),
    this.translationService.track("date-picker.june"),
    this.translationService.track("date-picker.july"),
    this.translationService.track("date-picker.august"),
    this.translationService.track("date-picker.september"),
    this.translationService.track("date-picker.october"),
    this.translationService.track("date-picker.november"),
    this.translationService.track("date-picker.december"),
  ];

  onPrevMonth() {
    this.prevMonth.emit();
  }

  onNextMonth() {
    this.nextMonth.emit();
  }

  onMonthSelect(value?: string) {
    if (value) this.monthSelect.emit(value);
  }

  onYearSelect(value?: string) {
    if (value) this.yearSelect.emit(value);
  }

  onMonthClick() {
    this.monthClick.emit();
  }

  onYearClick() {
    this.yearClick.emit();
  }

  onPrevYearPage() {
    this.prevYearPage.emit();
  }

  onNextYearPage() {
    this.nextYearPage.emit();
  }
}
