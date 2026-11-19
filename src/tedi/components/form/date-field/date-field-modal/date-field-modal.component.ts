import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { ButtonComponent } from "../../../buttons/button/button.component";
import { ModalComponent } from "../../../overlay/modal/modal.component";
import { ModalContentComponent } from "../../../overlay/modal/modal-content/modal-content.component";
import { ModalFooterComponent } from "../../../overlay/modal/modal-footer/modal-footer.component";
import { ModalHeaderComponent } from "../../../overlay/modal/modal-header/modal-header.component";
import { ModalRef } from "../../../overlay/modal/modal-ref";
import { MODAL_DATA } from "../../../overlay/modal/modal.types";
import { TediTranslationPipe } from "../../../../services/translation/translation.pipe";
import { CalendarComponent } from "../../../content/calendar/calendar.component";
import {
  CalendarView,
  DateFieldMode,
  DateRange,
} from "../../../content/calendar/types";
import { Matcher } from "../../../../utils/matchers.util";

type DateFieldValue = Date | Date[] | DateRange | null;
type DayAvailabilityInput = Date[] | ((d: Date) => boolean) | undefined;
type MonthPredicate = (month: Date) => boolean;
type YearPredicate = (year: Date) => boolean;

export interface DateFieldModalData {
  value: DateFieldValue;
  currentMonth: Date;
  mode: DateFieldMode;
  selectionLevel: CalendarView;
  localeCode: string;
  showOutsideDays: boolean;
  showWeekNumbers: boolean;
  numberOfMonths: number;
  calendarFullWidth: boolean;
  monthYearSelectType: "dropdown" | "grid";
  required: boolean;
  disabledMatchers: Matcher[];
  availableDays: DayAvailabilityInput;
  unavailableDays: DayAvailabilityInput;
  shouldDisableMonth: MonthPredicate | undefined;
  shouldDisableYear: YearPredicate | undefined;
  minYear: number | null;
  maxYear: number | null;
  closeOnSelect: boolean;
}

@Component({
  selector: "tedi-date-field-modal",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ButtonComponent,
    CalendarComponent,
    ModalComponent,
    ModalContentComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    TediTranslationPipe,
  ],
  templateUrl: "./date-field-modal.component.html",
  styleUrl: "./date-field-modal.component.scss",
})
export class DateFieldModalComponent {
  readonly data = inject(MODAL_DATA) as DateFieldModalData;
  private readonly ref = inject(ModalRef<DateFieldValue>);

  readonly draft = signal<DateFieldValue>(this.data.value);
  readonly month = signal<Date>(this.data.currentMonth);

  cancel(): void {
    this.ref.close(undefined);
  }

  confirm(): void {
    this.ref.close(this.draft());
  }

  handleSelect(): void {
    if (!this.data.closeOnSelect) return;
    this.confirm();
  }
}
