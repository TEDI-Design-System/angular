import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { ButtonComponent } from "../../../buttons/button/button.component";
import { ModalComponent } from "../../../overlay/modal/modal.component";
import { ModalContentComponent } from "../../../overlay/modal/modal-content/modal-content.component";
import { ModalFooterComponent } from "../../../overlay/modal/modal-footer/modal-footer.component";
import { ModalHeaderComponent } from "../../../overlay/modal/modal-header/modal-header.component";
import { ModalRef } from "../../../overlay/modal/modal-ref";
import { MODAL_DATA } from "../../../overlay/modal/modal.types";
import { TediTranslationPipe } from "../../../../services/translation/translation.pipe";
import { CalendarComponent } from "../../../content/calendar/calendar.component";
import { TimePickerComponent } from "../../time-picker/time-picker.component";
import { TimeFieldComponent } from "../../time-field/time-field.component";
import { FormFieldComponent } from "../../form-field/form-field.component";
import { BreakpointService } from "../../../../services/breakpoint/breakpoint.service";
import {
  CalendarView,
  DateRange,
} from "../../../content/calendar/types";
import { Matcher } from "../../../../utils/matchers.util";
import { formatLocaleDate } from "../../../../utils/date.util";
import {
  DateTimeFieldMode,
  DateTimeFieldTimeGridVariant,
  DateTimeFieldValue,
} from "../date-time-field.component";
import {
  applyRangeTime,
  combineCalendarSelection,
  combineDateTime,
  DateTimeFieldAvailableTimes,
  DayAvailabilityInput,
  getTimeOf,
  MonthPredicate,
  RangeParts,
  resolveAvailableTimes,
  toRangeParts,
  toSingle,
  YearPredicate,
} from "../date-time-field.util";

export interface DateTimeFieldModalData {
  value: DateTimeFieldValue;
  currentMonth: Date;
  mode: DateTimeFieldMode;
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
  minuteStep: number;
  slotColumns: number;
  gridVariant: DateTimeFieldTimeGridVariant;
  timeHeading: string | undefined;
  availableTimes: DateTimeFieldAvailableTimes;
  size: "default" | "small";
}

@Component({
  selector: "tedi-date-time-field-modal",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgTemplateOutlet,
    ButtonComponent,
    CalendarComponent,
    TimePickerComponent,
    TimeFieldComponent,
    FormFieldComponent,
    ModalComponent,
    ModalContentComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    TediTranslationPipe,
  ],
  templateUrl: "./date-time-field-modal.component.html",
  styleUrl: "./date-time-field-modal.component.scss",
})
export class DateTimeFieldModalComponent {
  readonly data = inject(MODAL_DATA) as DateTimeFieldModalData;
  private readonly ref = inject(ModalRef<DateTimeFieldValue>);
  private readonly breakpointService = inject(BreakpointService);

  readonly calendar = viewChild<CalendarComponent>("calendar");

  // See date-time-field.component.ts: swap the scroll wheels for a native
  // `type="time"` input on phones/small tablets.
  readonly useNativeTimeInput = this.breakpointService.isBelowBreakpoint("md");

  readonly draft = signal<DateTimeFieldValue>(this.data.value);
  readonly month = signal<Date>(this.data.currentMonth);

  readonly isRange = this.data.mode === "range";

  readonly singleValue = computed(() => toSingle(this.draft()));
  readonly rangeValue = computed<RangeParts>(() => toRangeParts(this.draft()));

  readonly singleTime = computed(() => getTimeOf(this.singleValue()));
  readonly fromTime = computed(() => getTimeOf(this.rangeValue().from));
  readonly toTime = computed(() => getTimeOf(this.rangeValue().to));

  readonly fromDateLabel = computed(() =>
    this.formatRangeDate(this.rangeValue().from),
  );
  readonly toDateLabel = computed(() =>
    this.formatRangeDate(this.rangeValue().to),
  );

  readonly singleSlots = computed(() =>
    resolveAvailableTimes(this.data.availableTimes, this.singleValue()),
  );
  readonly fromSlots = computed(() =>
    resolveAvailableTimes(this.data.availableTimes, this.rangeValue().from),
  );
  readonly toSlots = computed(() =>
    resolveAvailableTimes(this.data.availableTimes, this.rangeValue().to),
  );

  cancel(): void {
    this.ref.close(undefined);
  }

  confirm(): void {
    this.ref.close(this.draft());
  }

  handleCalendarSelect(): void {
    const calendar = this.calendar();
    if (!calendar) return;
    this.draft.set(
      combineCalendarSelection(
        calendar.value() as Date | RangeParts | null,
        this.isRange,
        this.draft(),
        this.data.availableTimes,
      ) as DateTimeFieldValue,
    );
  }

  handleTimeSelect(time: string | null): void {
    if (!time) return;
    const base = this.singleValue() ?? new Date();
    this.draft.set(combineDateTime(base, time));
  }

  handleRangeTimeSelect(kind: "from" | "to", time: string | null): void {
    if (!time) return;
    this.draft.set(
      applyRangeTime(kind, time, this.rangeValue(), new Date()) as DateRange,
    );
  }

  private formatRangeDate(date: Date | undefined): string {
    return date ? formatLocaleDate(date, this.data.localeCode) : "";
  }
}
