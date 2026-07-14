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
  monthYearSelectType: "dropdown" | "grid";
  required: boolean;
  disabledMatchers: Matcher[];
  availableDays: DayAvailabilityInput;
  unavailableDays: DayAvailabilityInput;
  shouldDisableMonth: MonthPredicate | undefined;
  shouldDisableYear: YearPredicate | undefined;
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
  template: `
    <tedi-modal class="tedi-date-field-modal">
      <tedi-modal-header>
        <h2>{{ "date-field.modal-title" | tediTranslate }}</h2>
      </tedi-modal-header>
      <tedi-modal-content class="tedi-date-field-modal__content">
        <tedi-calendar
          [bordered]="false"
          [value]="draft()"
          [currentMonth]="month()"
          [mode]="data.mode"
          [selectionLevel]="data.selectionLevel"
          [localeCode]="data.localeCode"
          [showOutsideDays]="data.showOutsideDays"
          [showWeekNumbers]="data.showWeekNumbers"
          [numberOfMonths]="data.numberOfMonths"
          [monthYearSelectType]="data.monthYearSelectType"
          [required]="data.required"
          [disabledMatchers]="data.disabledMatchers"
          [availableDays]="data.availableDays"
          [unavailableDays]="data.unavailableDays"
          [shouldDisableMonth]="data.shouldDisableMonth"
          [shouldDisableYear]="data.shouldDisableYear"
          (valueChange)="draft.set($event)"
          (currentMonthChange)="month.set($event)"
          (select)="handleSelect()"
        />
      </tedi-modal-content>
      <tedi-modal-footer>
        <button
          tedi-button
          type="button"
          variant="secondary"
          (click)="cancel()"
        >
          {{ "date-field.cancel" | tediTranslate }}
        </button>
        <button tedi-button type="button" (click)="confirm()">
          {{ "date-field.confirm" | tediTranslate }}
        </button>
      </tedi-modal-footer>
    </tedi-modal>
  `,
  styles: [
    `
      .tedi-date-field-modal {
        --_tedi-modal-body-padding: 0;
      }
      .tedi-date-field-modal__content {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
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
