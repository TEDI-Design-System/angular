import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  Signal,
  signal,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { _IdGenerator, LiveAnnouncer } from "@angular/cdk/a11y";
import { NgTemplateOutlet } from "@angular/common";
import { ButtonComponent } from "../../../buttons/button/button.component";
import { IconComponent } from "../../../base/icon/icon.component";
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
import { InputSize } from "../../form-field/field-context.token";
import { CalendarView, DateRange } from "../../../content/calendar/types";
import { Matcher } from "../../../../utils/matchers.util";
import {
  DateTimeFieldLayout,
  DateTimeFieldMode,
  DateTimeFieldRangeTimeLayout,
  DateTimeFieldStep,
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
  RangeEnd,
  RangeParts,
  resolveAvailableTimes,
  toRangeParts,
  toSingle,
  YearPredicate,
} from "../date-time-field.util";
import { DateTimeFieldRangeSwitchComponent } from "../date-time-field-range-switch/date-time-field-range-switch.component";

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
  layout: DateTimeFieldLayout;
  useNativeTimeInput: Signal<boolean>;
  minuteStep: number;
  slotColumns: number;
  gridVariant: DateTimeFieldTimeGridVariant;
  timeHeading: string | undefined;
  rangeTimeLayout: DateTimeFieldRangeTimeLayout;
  rangeTimeAutoSwitch: boolean;
  autoAdvanceToTime: boolean;
  availableTimes: DateTimeFieldAvailableTimes;
  size: InputSize;
}

@Component({
  selector: "tedi-date-time-field-modal",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgTemplateOutlet,
    ButtonComponent,
    IconComponent,
    CalendarComponent,
    TimePickerComponent,
    TimeFieldComponent,
    FormFieldComponent,
    DateTimeFieldRangeSwitchComponent,
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

  readonly calendar = viewChild<CalendarComponent>("calendar");
  readonly timePicker = viewChild(TimePickerComponent);
  private readonly injector = inject(Injector);
  readonly content = viewChild("content", { read: ElementRef<HTMLElement> });

  readonly draft = signal<DateTimeFieldValue>(this.data.value);
  readonly month = signal<Date>(this.data.currentMonth);

  readonly isRange = this.data.mode === "range";
  readonly multiStep = this.data.layout === "multi-step";
  readonly singleMonthRange = this.isRange && this.data.numberOfMonths === 1;
  readonly wideStep = this.isRange && this.data.numberOfMonths > 1;
  readonly step = signal<DateTimeFieldStep>("date");
  readonly dateStepWidth = signal<string | null>(null);
  readonly rangeSwitch = this.data.rangeTimeLayout === "button-group";
  readonly activeRangeEnd = signal<RangeEnd>("from");
  readonly rangePanelId = inject(_IdGenerator).getId(
    "tedi-date-time-field-modal-range-time-",
  );
  readonly titleKey = computed(() => {
    if (!this.multiStep) return "date-time-field.modal-title";
    return this.step() === "date"
      ? "date-field.modal-title"
      : "date-time-field.time-heading";
  });
  readonly canAdvance = computed(() =>
    this.isRange ? !!this.rangeValue().to : !!this.singleValue(),
  );

  readonly singleValue = computed(() => toSingle(this.draft()));
  readonly rangeValue = computed<RangeParts>(() => toRangeParts(this.draft()));

  readonly singleTime = computed(() => getTimeOf(this.singleValue()));
  readonly fromTime = computed(() => getTimeOf(this.rangeValue().from));
  readonly toTime = computed(() => getTimeOf(this.rangeValue().to));

  readonly fromDateLabel = computed(() =>
    this.formatRangeEnd(this.rangeValue().from),
  );
  readonly toDateLabel = computed(() =>
    this.formatRangeEnd(this.rangeValue().to),
  );

  readonly singleSlots = computed(() =>
    resolveAvailableTimes(this.data.availableTimes, this.singleValue()),
  );
  readonly fromSlots = computed(() =>
    resolveAvailableTimes(this.data.availableTimes, this.rangeValue().from),
  );
  // Until an end date is picked, the end time lands on the start day.
  readonly toSlots = computed(() =>
    resolveAvailableTimes(
      this.data.availableTimes,
      this.rangeValue().to ?? this.rangeValue().from,
    ),
  );

  readonly fromShortDate = computed(() =>
    this.formatShortDate(this.rangeValue().from),
  );
  readonly toShortDate = computed(() =>
    this.formatShortDate(this.rangeValue().to),
  );

  confirm(): void {
    this.ref.close(this.draft());
  }

  goToTimeStep(): void {
    const width = this.content()?.nativeElement.offsetWidth;
    this.dateStepWidth.set(width ? `${width}px` : null);
    this.step.set("time");
    // The control that led here is gone after the swap.
    afterNextRender(() => this.focusTimeStep(), { injector: this.injector });
  }

  goToDateStep(): void {
    this.step.set("date");
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
    if (!this.rangeValue().to) this.activeRangeEnd.set("from");
    if (this.multiStep && this.data.autoAdvanceToTime && this.canAdvance()) {
      this.goToTimeStep();
      // The calendar is swapped out without warning; the moved focus alone
      // doesn't say why.
      this.liveAnnouncer.announce(
        this.translationService.translate("date-time-field.select-time"),
        "polite",
      );
    }
  }

  // Native time inputs have no picker instance, hence the DOM fallback.
  private focusTimeStep(): void {
    const picker = this.timePicker();
    if (picker) {
      picker.focusActiveItem();
      return;
    }
    const content = this.content()?.nativeElement as HTMLElement | undefined;
    content?.querySelector("input")?.focus();
  }

  handleTimeSelect(time: string | null): void {
    if (!time) return;
    const base = this.singleValue() ?? new Date();
    this.draft.set(combineDateTime(base, time));
  }

  handleRangeTimeSelect(kind: RangeEnd, time: string | null): void {
    if (!time) return;
    this.draft.set(
      applyRangeTime(kind, time, this.rangeValue(), new Date()) as DateRange,
    );
  }

  // Radio arrow keys select as they move, so only a pointer pick counts as
  // a decision that may switch to the end time (WCAG 3.2.2).
  slotPickedByPointer = false;
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly translationService = inject(TediTranslationService);

  // A method, not an inline assignment: a binding that evaluates to `false`
  // makes Angular call preventDefault, which would swallow arrow keys and Tab.
  setSlotPickSource(byPointer: boolean): void {
    this.slotPickedByPointer = byPointer;
  }

  // Read once: a pick with neither a pointer nor a key event before it
  // (screen reader browse mode, voice control) must not reuse a stale value.
  private takePointerPick(): boolean {
    const byPointer = this.slotPickedByPointer;
    this.slotPickedByPointer = false;
    return byPointer;
  }

  handleRangeSlotSelect(kind: RangeEnd, time: string | null): void {
    this.handleRangeTimeSelect(kind, time);
    if (
      this.takePointerPick() &&
      time &&
      kind === "from" &&
      this.rangeSwitch &&
      this.data.rangeTimeAutoSwitch &&
      this.rangeValue().to
    ) {
      this.activeRangeEnd.set("to");
      // The end day may lack the clicked slot, which would take focus with it.
      afterNextRender(() => this.focusTimeStep(), { injector: this.injector });
      // The panel swap is silent otherwise; touch screen reader users trigger it too.
      this.liveAnnouncer.announce(
        this.translationService.translate("date-time-field.range-end-active"),
        "polite",
      );
    }
  }

  private readonly shortDateFormatter = new Intl.DateTimeFormat(
    this.data.localeCode,
    { day: "2-digit", month: "2-digit", year: "2-digit" },
  );

  private formatShortDate(date: Date | undefined): string {
    return date ? this.shortDateFormatter.format(date) : "";
  }

  private formatRangeEnd(date: Date | undefined): string {
    return date
      ? `${this.shortDateFormatter.format(date)} - ${getTimeOf(date)}`
      : "";
  }
}
