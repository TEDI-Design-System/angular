import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  OnInit,
  output,
  Renderer2,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import {
  CdkConnectedOverlay,
  ConnectedPosition,
  OverlayModule,
} from "@angular/cdk/overlay";
import { A11yModule } from "@angular/cdk/a11y";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  DateInputComponent,
  DateInputTag,
} from "./date-input/date-input.component";
import { TagEllipsis } from "../../tags/tag/tag.component";
import { CalendarComponent } from "../../content/calendar/calendar.component";
import {
  CalendarView,
  DateFieldMode,
  DateRange,
} from "../../content/calendar/types";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "../form-field/form-field-control";
import {
  FieldContext,
  InputSize,
  TEDI_FIELD_CONTEXT,
} from "../form-field/field-context.token";
import { deriveControlState } from "../form-field/derive-control-state";
import {
  breakpointInput,
  BreakpointInput,
  BreakpointObject,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import {
  formatLocaleDate,
  formatLocaleDateHint,
  isSameDay,
  parseLocaleDate,
  startOfMonth,
} from "../../../utils/date.util";
import { matchAny, Matcher } from "../../../utils/matchers.util";
import { ModalService } from "../../overlay/modal/modal.service";
import { ModalRef } from "../../overlay/modal/modal-ref";
import { ModalFullscreen } from "../../overlay/modal/modal.types";
import {
  DateFieldModalComponent,
  DateFieldModalData,
} from "./date-field-modal/date-field-modal.component";
import { ButtonComponent } from "../../buttons";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";

type DateFieldValue = Date | Date[] | DateRange | null;
type DateFieldFormatter = (value: DateFieldValue) => string;
type DateFieldParser = (value: string) => DateFieldValue | undefined;
type DayAvailabilityInput = Date[] | ((d: Date) => boolean) | undefined;
type MonthPredicate = (month: Date) => boolean;
type YearPredicate = (year: Date) => boolean;
type DateFieldCalendarTrigger = "input" | "button";
type DateFieldModalInput = boolean | "sm" | "md" | "lg" | "xl";
export type DateFieldUseNativePicker = boolean | "sm" | "md" | "lg" | "xl";
export type DateFieldSize = "default" | "small";

@Component({
  selector: "tedi-date-field",
  standalone: true,
  templateUrl: "./date-field.component.html",
  styleUrl: "./date-field.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CalendarComponent,
    DateInputComponent,
    ButtonComponent,
    OverlayModule,
    A11yModule,
    TediTranslationPipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateFieldComponent),
      multi: true,
    },
    {
      provide: TEDI_FORM_FIELD_CONTROL,
      useExisting: forwardRef(() => DateFieldComponent),
    },
    {
      provide: TEDI_FIELD_CONTEXT,
      useFactory: (field: DateFieldComponent) => field.childContext,
      deps: [forwardRef(() => DateFieldComponent)],
    },
  ],
  host: {
    class: "tedi-date-field",
    "[class.tedi-field-surface]": "paintsSurface()",
    "[class.tedi-field-surface--invalid]": "paintsSurface() && invalid()",
    "[class.tedi-field-surface--valid]": "paintsSurface() && valid()",
    "[class.tedi-field-surface--disabled]": "paintsSurface() && disabled()",
    "[class.tedi-date-field--small]": "resolvedSize() === 'small'",
    "[class.tedi-date-field--large]": "resolvedSize() === 'large'",
  },
})
export class DateFieldComponent
  implements OnInit, ControlValueAccessor, FormFieldControl<DateFieldValue>
{
  private readonly fieldContext = inject(TEDI_FIELD_CONTEXT, {
    optional: true,
    skipSelf: true,
  });
  private readonly derived = deriveControlState();
  /**
   * Unique ID for label association and accessibility. Bind the sibling
   * `<label tedi-label [for]>` to the same value.
   */
  readonly inputId = input.required<string>();
  /**
   * The selected value (two-way / `ControlValueAccessor`). Shape follows `mode`:
   * `single` → `Date | null`, `multiple` → `Date[]`, `range` → `{ from, to }`.
   */
  readonly value = model<DateFieldValue>(null);
  /**
   * Selection mode. `single` selects one date, `multiple` toggles dates in an
   * array (rendered as tags), `range` builds a `{ from, to }` range across two
   * clicks.
   */
  readonly mode = input<DateFieldMode>("single");
  /**
   * `multiple` mode tag layout. `true` (default) wraps tags across rows and
   * grows the field height; `false` keeps a single row and collapses overflow
   * into a "+N" counter.
   */
  readonly multiRow = input<boolean>(true);
  /**
   * Which end the `multiple`-mode tags truncate from when a label doesn't fit.
   * `false` (default) never truncates; `end` → `05.06…`; `start` → `…06.2026`
   * (keeps the year visible).
   */
  readonly tagEllipsis = input<TagEllipsis>(false);
  /**
   * Whether `multiple`-mode tags show a remove button. `true` (default) lets
   * users remove a selected date by closing its tag; `false` renders them as
   * read-only chips.
   */
  readonly isTagRemovable = input<boolean>(true);
  /** Placeholder rendered in the input when there is no value. */
  readonly placeholder = input<string>("");
  /**
   * Disables specific days via matchers (does not disable the whole field).
   * Accepts a `Date`, `Date[]`, `{ before }`, `{ after }`, `{ from, to? }`,
   * `{ dayOfWeek: number[] }`, or a `(date) => boolean` predicate (single or
   * array). Named `disabledMatchers` (not `disabled`) so it doesn't clash with
   * `FormControlDirective`'s boolean `disabled` when used with `[formControl]`.
   */
  readonly disabledMatchers = input<Matcher | Matcher[] | undefined>(undefined);
  /** Disables the field entirely — text input, icon button, and calendar. */
  readonly inputDisabled = input<boolean>(false);
  /**
   * Blocks typing into the input but leaves the calendar interactive — useful
   * for guided picking.
   */
  readonly readOnly = input<boolean>(false);
  /**
   * Marks the input as required (sets the native `required` attribute). In
   * `multiple` mode it also prevents clearing the last selected date. The
   * asterisk indicator lives on the sibling `<label tedi-label [required]>` —
   * bind it there too, since DateField owns no label.
   */
  readonly required = input<boolean>(false);
  /**
   * Field size. Falls back to the size of a wrapping `tedi-form-field` when not
   * set here.
   */
  readonly size = input<DateFieldSize | undefined>();
  /**
   * Forces the error state on, or off, regardless of the reactive-forms state.
   * Leave unset to let the control derive it.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly invalidInput = input<boolean>(false, { alias: "invalid" });
  /** Disables all dates before this date (inclusive boundary stays enabled). */
  readonly minDate = input<Date | undefined>(undefined);
  /** Disables all dates after this date (inclusive boundary stays enabled). */
  readonly maxDate = input<Date | undefined>(undefined);
  /** Disable all dates before today. */
  readonly disablePast = input<boolean>(false);
  /** Disable all dates after today. */
  readonly disableFuture = input<boolean>(false);
  /**
   * Predicate `(month) => boolean` returning `true` to disable a whole month in
   * the calendar's month navigation/grid. Leave `undefined` to disable nothing.
   */
  readonly shouldDisableMonth = input<MonthPredicate | undefined>(undefined);
  /**
   * Predicate `(year) => boolean` returning `true` to disable a whole year in
   * the calendar's year navigation/grid. Leave `undefined` to disable nothing.
   */
  readonly shouldDisableYear = input<YearPredicate | undefined>(undefined);
  /**
   * Earliest year offered in the calendar's year grid/dropdown. Defaults to 100
   * years before the current year when `null`.
   */
  readonly minYear = input<number | null>(null);
  /**
   * Latest year offered in the calendar's year grid/dropdown. Defaults to 20
   * years after the current year when `null`.
   */
  readonly maxYear = input<number | null>(null);
  /**
   * Whitelist of selectable days — an explicit `Date[]` or a predicate
   * `(date) => boolean`. Every other day is disabled.
   */
  readonly availableDays = input<DayAvailabilityInput>(undefined);
  /**
   * Blacklist of unavailable days — a `Date[]` or a predicate `(date) => boolean`.
   * Takes precedence over `availableDays`.
   */
  readonly unavailableDays = input<DayAvailabilityInput>(undefined);
  /**
   * Lowest level the user can commit to. `days` shows the day grid as the final
   * step; `months` and `years` commit at that level instead.
   */
  readonly selectionLevel = input<CalendarView>("days");
  /**
   * How the calendar header exposes month/year picking. `dropdown` shows two
   * dropdowns; `grid` drills into a month/year grid when the header label is
   * clicked.
   */
  readonly monthYearSelectType = input<"dropdown" | "grid">("dropdown");
  /**
   * Month the calendar opens on when there is no value. Ignored once a value is
   * set (the calendar anchors to the selected date).
   */
  readonly initialMonth = input<Date | undefined>(undefined);
  /**
   * BCP-47 locale for weekday/month names, the first day of the week, and the
   * default `formatDate`/`parseDate` behaviour.
   */
  readonly localeCode = input<string>("et-EE");
  /**
   * Whether to close the picker after a selection. Defaults to `true` in
   * `single` mode and `false` in `multiple`/`range` when left `undefined`.
   */
  readonly closeOnSelect = input<boolean | undefined>(undefined);
  /**
   * Render the trailing/leading days from the adjacent month inside the current
   * month's grid.
   */
  readonly showOutsideDays = input<boolean>(true);
  /** Render an ISO week-number column on the left of the day grid. */
  readonly showWeekNumbers = input<boolean>(false);
  /**
   * Number of month grids shown side by side. Accepts a `BreakpointInput<number>`:
   * a plain number (e.g. `2`) applies at every breakpoint; pass a per-breakpoint
   * object (e.g. `{ xs: 1, lg: 2 }`) to narrow it on small screens.
   */
  readonly numberOfMonths = input(
    { xs: 1 },
    { transform: (v: BreakpointInput<number>) => breakpointInput(v) },
  );
  /**
   * Enables the calendar picker UI. When resolved to `false`, hides the icon
   * button and disables the popover/modal — the user can only type a date.
   * Accepts a `BreakpointInput<boolean>` for per-breakpoint behaviour.
   */
  readonly enableCalendar = input(
    { xs: true },
    { transform: (v: BreakpointInput<boolean>) => breakpointInput(v) },
  );
  /**
   * What opens the calendar. `button` opens it from the icon button; `input`
   * also opens it when the text input is clicked (and blocks typing). Accepts a
   * `BreakpointInput` for per-breakpoint behaviour.
   */
  readonly calendarTrigger = input(
    { xs: "button" as DateFieldCalendarTrigger },
    {
      transform: (v: BreakpointInput<DateFieldCalendarTrigger>) =>
        breakpointInput(v),
    },
  );
  /**
   * Use the OS native date picker instead of the custom popover (single mode only).
   * `true` always, `false` never, breakpoint name → native below that breakpoint
   * (custom popover from that breakpoint up).
   */
  readonly useNativePicker = input<DateFieldUseNativePicker>(false);
  /**
   * Close the calendar popover when the page (or a scrollable ancestor) scrolls.
   * Scrolling inside the calendar itself — or its nested year/month dropdown —
   * keeps it open. Only applies to the popover; the modal is unaffected.
   */
  readonly hideOnScroll = input(false);
  /** Open the calendar in a modal: `true` always, `false` never, breakpoint name → modal below that breakpoint. */
  readonly modal = input<DateFieldModalInput>(false);
  /** Make the modal fullscreen: `true` always, `false` never, breakpoint name → fullscreen below that breakpoint. Only applies when the calendar actually opens as a modal. */
  readonly fullscreen = input<ModalFullscreen>(false);
  /**
   * Custom formatter for the input's display string. Overrides the locale-aware
   * default. Receives the `DateFieldValue` and returns a string.
   */
  readonly formatDate = input<DateFieldFormatter | undefined>(undefined);
  /**
   * Custom parser for turning typed input into a value. Overrides the
   * locale-aware default. Receives the raw string and returns a `DateFieldValue`,
   * or `undefined` when the input can't be parsed.
   */
  readonly parseDate = input<DateFieldParser | undefined>(undefined);

  /** Emitted whenever the picker (popover/modal) open state changes. */
  readonly openChange = output<boolean>();

  private readonly breakpointService = inject(BreakpointService);
  private readonly modalService = inject(ModalService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);

  readonly calendar = viewChild<CalendarComponent>("calendar");
  readonly dateInput = viewChild.required<DateInputComponent>("dateInput");
  private readonly connectedOverlay = viewChild(CdkConnectedOverlay);

  readonly currentMonth = signal<Date>(new Date());
  readonly overlayOpen = signal<boolean>(false);

  private readonly openedBy = signal<DateFieldCalendarTrigger>("button");

  readonly overlayPositions = computed<ConnectedPosition[]>(() => {
    const aligned: Pick<ConnectedPosition, "originX" | "overlayX"> =
      this.openedBy() === "button"
        ? { originX: "end", overlayX: "end" }
        : { originX: "start", overlayX: "start" };
    const opposite: Pick<ConnectedPosition, "originX" | "overlayX"> =
      this.openedBy() === "button"
        ? { originX: "start", overlayX: "start" }
        : { originX: "end", overlayX: "end" };
    return [
      { ...aligned, originY: "bottom", overlayY: "top", offsetY: 4 },
      { ...aligned, originY: "top", overlayY: "bottom", offsetY: -4 },
      { ...opposite, originY: "bottom", overlayY: "top", offsetY: 4 },
      { ...opposite, originY: "top", overlayY: "bottom", offsetY: -4 },
    ];
  });

  private readonly cvaDisabled = signal(false);
  private modalRef: ModalRef<DateFieldValue> | null = null;
  private scrollListener?: () => void;

  private onChange: (value: DateFieldValue) => void = () => {};
  private onTouched: () => void = () => {};

  readonly fieldDisabled = computed(
    () =>
      this.inputDisabled() ||
      this.cvaDisabled() ||
      (this.fieldContext?.disabled() ?? false),
  );

  readonly disabled = computed(() => this.fieldDisabled());

  readonly touched = this.derived.touched;

  readonly dirty = this.derived.dirty;

  readonly invalid = computed(
    () =>
      this.invalidInput() ||
      this.derived.invalid() ||
      (this.fieldContext?.invalid() ?? false),
  );

  readonly resolvedSize = computed<InputSize>(
    () => this.size() ?? this.fieldContext?.size() ?? "default",
  );

  readonly paintsSurface = computed(
    () => !(this.fieldContext?.ownsSurface() ?? false),
  );

  readonly valid = computed(() => this.fieldContext?.valid() ?? false);

  readonly childContext: FieldContext = {
    size: computed(() => this.resolvedSize()),
    ownsSurface: computed(() => true),
    invalid: computed(() => this.invalid()),
    valid: computed(() => this.valid()),
    disabled: computed(() => this.disabled()),
  };

  ngOnInit(): void {
    this.derived.connect();
  }

  readonly resolvedDisabledMatchers = computed<Matcher[]>(() => {
    const result: Matcher[] = [];
    const explicit = this.disabledMatchers();
    if (Array.isArray(explicit)) {
      result.push(...explicit);
    } else if (explicit !== undefined) {
      result.push(explicit);
    }
    const min = this.minDate();
    if (min) result.push({ before: min });
    const max = this.maxDate();
    if (max) result.push({ after: max });
    if (this.disablePast()) {
      result.push({ before: this.startOfToday() });
    }
    if (this.disableFuture()) {
      result.push({ after: this.startOfToday() });
    }
    return result;
  });

  readonly useNativePickerResolved = computed(() => {
    const v = this.useNativePicker();
    return typeof v === "boolean"
      ? v
      : this.breakpointService.isBelowBreakpoint(v)();
  });

  readonly useNativePickerEffective = computed(
    () =>
      this.useNativePickerResolved() &&
      this.mode() === "single" &&
      !this.modalEnabled(),
  );

  readonly numberOfMonthsResolved = computed(() =>
    Math.max(1, this.resolveBreakpointInput(this.numberOfMonths())),
  );

  readonly enableCalendarResolved = computed(() =>
    this.resolveBreakpointInput(this.enableCalendar()),
  );

  readonly calendarTriggerResolved = computed<DateFieldCalendarTrigger>(() =>
    this.resolveBreakpointInput(this.calendarTrigger()),
  );

  readonly modalEnabled = computed(() => {
    const m = this.modal();
    return typeof m === "boolean"
      ? m
      : this.breakpointService.isBelowBreakpoint(m)();
  });

  readonly closeOnSelectEffective = computed(() => {
    const explicit = this.closeOnSelect();
    if (typeof explicit === "boolean") return explicit;
    return this.mode() === "single";
  });

  readonly showCalendar = computed(
    () => this.enableCalendarResolved() && !this.useNativePickerEffective(),
  );

  readonly useModal = computed(
    () => this.showCalendar() && this.modalEnabled(),
  );

  readonly usePopover = computed(
    () => this.showCalendar() && !this.modalEnabled(),
  );

  readonly nativeIsoValue = computed(() => {
    if (!this.useNativePickerEffective()) return "";
    const v = this.value();
    if (!(v instanceof Date)) return "";
    return this.toIsoDate(v);
  });

  readonly effectivePlaceholder = computed(() => {
    const explicit = this.placeholder();
    if (explicit) return explicit;
    if (this.mode() !== "single") return "";
    if (this.useNativePickerEffective()) return "";
    return formatLocaleDateHint(this.localeCode());
  });

  readonly displayValue = computed(() => {
    const v = this.value();
    if (this.mode() === "multiple") return "";
    if (v === null || v === undefined) return "";
    const customFormat = this.formatDate();
    if (customFormat) return customFormat(v);
    return this.defaultFormat(v);
  });

  readonly tagsForMultipleMode = computed<DateInputTag[]>(() => {
    if (this.mode() !== "multiple") return [];
    const v = this.value();
    if (!Array.isArray(v)) return [];
    const customFormat = this.formatDate();
    return v.map((d, index) => ({
      id: `${d.getTime()}-${index}`,
      label: customFormat ? customFormat(d) : this.defaultFormat(d),
    }));
  });

  readonly canClear = computed(
    () => !!this.value() && !this.fieldDisabled() && !this.readOnly(),
  );

  readonly inputIsTrigger = computed(
    () => this.showCalendar() && this.calendarTriggerResolved() === "input",
  );

  private initialOpenEmit = true;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cleanupScrollListener());

    effect(() => {
      const v = this.value();
      const anchor = this.deriveAnchor(v) ?? this.initialMonth() ?? null;
      if (anchor) {
        this.currentMonth.set(startOfMonth(anchor));
      }
    });

    effect(() => {
      const open = this.overlayOpen();
      if (this.initialOpenEmit) {
        this.initialOpenEmit = false;
        return;
      }
      this.openChange.emit(open);
    });

    effect(() => {
      // Track the active picker strategy. Crossing a breakpoint can flip
      // between popover, modal and native picker — if the picker is open when
      // that happens the popover and modal would render simultaneously (double
      // calendar) or the overlay would get wedged open. Close it on any flip.
      this.usePopover();
      this.useModal();
      this.useNativePickerEffective();
      untracked(() => {
        if (!this.overlayOpen()) return;
        this.modalRef?.close();
        this.modalRef = null;
        this.overlayOpen.set(false);
      });
    });
  }

  writeValue(value: DateFieldValue): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: DateFieldValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  focus(): void {
    if (this.fieldDisabled()) return;
    this.dateInput().focusInput();
  }

  reset(): void {
    if (this.fieldDisabled() || this.readOnly()) return;
    this.commitValue(null);
  }

  handleClear(): void {
    this.reset();
  }

  handleIconClick(): void {
    this.togglePicker("button");
  }

  private togglePicker(trigger: DateFieldCalendarTrigger): void {
    if (this.fieldDisabled()) return;
    if (!this.enableCalendarResolved()) return;

    if (this.useNativePickerEffective()) {
      this.openNativePicker();
      return;
    }

    if (!this.showCalendar()) return;

    if (this.useModal()) {
      if (!this.overlayOpen()) {
        this.openModal();
      }
      return;
    }

    if (this.overlayOpen()) {
      this.overlayOpen.set(false);
      this.onTouched();
    } else {
      this.openedBy.set(trigger);
      this.overlayOpen.set(true);
    }
  }

  handleInputChange(value: string): void {
    if (this.readOnly() || this.fieldDisabled()) return;

    if (this.useNativePickerEffective()) {
      this.handleNativeInputChange(value);
      return;
    }

    if (value === "") {
      this.commitValue(null);
      return;
    }

    if (this.mode() === "single") {
      this.handleSingleParseInput(value);
      return;
    }

    const customParse = this.parseDate();
    if (!customParse) return;
    const parsed = customParse(value);
    if (parsed === undefined) return;
    if (this.parsedValueIsDisabled(parsed)) return;
    this.commitValue(parsed);
  }

  handleTagRemove(id: string): void {
    if (this.fieldDisabled() || this.readOnly()) return;
    const v = this.value();
    if (!Array.isArray(v)) return;

    const time = Number(id.split("-")[0]);
    if (!Number.isFinite(time)) return;

    const target = new Date(time);
    const next = v.filter((d) => !isSameDay(d, target));
    this.commitValue(next);
  }

  handleInputClick(event: Event): void {
    if (this.fieldDisabled()) return;
    if (!this.inputIsTrigger()) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (!target.matches(".tedi-date-input__input")) return;
    this.togglePicker("input");
  }

  handleCalendarSelect(): void {
    const calendar = this.calendar();
    if (!calendar) return;
    const newValue = calendar.value();
    this.value.set(newValue);
    this.onChange(newValue);
    this.onTouched();
    if (this.closeOnSelectEffective()) {
      this.closeOverlay();
    }
  }

  handleCurrentMonthChange(month: Date): void {
    this.currentMonth.set(month);
  }

  closeOverlay(): void {
    if (!this.overlayOpen()) return;
    this.overlayOpen.set(false);
    this.onTouched();
    this.focusIconButton();
  }

  handleOverlayOutsideClick(event: MouseEvent): void {
    if (!this.overlayOpen()) return;
    const host = this.hostEl.nativeElement as HTMLElement;
    const target = event.target as Node | null;
    if (target && host.contains(target)) return;
    this.overlayOpen.set(false);
    this.onTouched();
  }

  handleOverlayAttached(): void {
    this.calendar()?.focusActiveCell();
    if (this.hideOnScroll()) {
      this.setupScrollListener();
    }
  }

  handleOverlayDetached(): void {
    this.cleanupScrollListener();
    this.closeOverlay();
  }

  handleOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.closeOverlay();
    }
  }

  private focusIconButton(): void {
    const host = this.hostEl.nativeElement as HTMLElement;
    const icon = host.querySelector<HTMLElement>(".tedi-date-input__icon");
    icon?.focus();
  }

  private setupScrollListener(): void {
    this.cleanupScrollListener();

    this.scrollListener = this.renderer.listen(
      this.document,
      "scroll",
      (event: Event) => {
        if (!this.overlayOpen()) return;
        if (this.isInsideOverlay(event.target as Node | null)) return;
        this.overlayOpen.set(false);
        this.onTouched();
      },
      { capture: true, passive: true },
    );
  }

  private cleanupScrollListener(): void {
    if (this.scrollListener) {
      this.scrollListener();
      this.scrollListener = undefined;
    }
  }

  /**
   * Whether the scroll target is inside this field's own calendar overlay or a
   * nested overlay opened from within it (e.g. the year/month dropdown). Nested
   * overlays share the CDK overlay container but render in their own pane
   * stacked after this one in DOM order, so a `DOCUMENT_POSITION_FOLLOWING`
   * check distinguishes them from unrelated ancestors that should dismiss.
   */
  private isInsideOverlay(target: Node | null): boolean {
    if (!target || !(target instanceof Element)) return false;

    const overlayEl = this.connectedOverlay()?.overlayRef?.overlayElement;
    if (!overlayEl) return false;
    if (overlayEl.contains(target)) return true;

    if (!target.closest(".cdk-overlay-container")) return false;

    return !!(
      overlayEl.compareDocumentPosition(target) &
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  }

  private openNativePicker(): void {
    const inputEl = this.queryNativeInput();
    if (!inputEl) return;
    if (typeof inputEl.showPicker === "function") {
      try {
        inputEl.showPicker();
        return;
      } catch {
        /* showPicker may throw outside a user gesture — fall through */
      }
    }
    inputEl.focus();
  }

  private openModal(): void {
    this.overlayOpen.set(true);
    const data: DateFieldModalData = {
      value: this.value(),
      currentMonth: this.currentMonth(),
      mode: this.mode(),
      selectionLevel: this.selectionLevel(),
      localeCode: this.localeCode(),
      showOutsideDays: this.showOutsideDays(),
      showWeekNumbers: this.showWeekNumbers(),
      numberOfMonths: this.numberOfMonthsResolved(),
      monthYearSelectType: this.monthYearSelectType(),
      required: this.required(),
      disabledMatchers: this.resolvedDisabledMatchers(),
      availableDays: this.availableDays(),
      unavailableDays: this.unavailableDays(),
      shouldDisableMonth: this.shouldDisableMonth(),
      shouldDisableYear: this.shouldDisableYear(),
      minYear: this.minYear(),
      maxYear: this.maxYear(),
      closeOnSelect: this.closeOnSelectEffective(),
    };

    const ref = this.modalService.open<DateFieldValue, DateFieldModalData>(
      DateFieldModalComponent,
      {
        data,
        size: "small",
        width: "sm",
        position: "center",
        fullscreen: this.fullscreen(),
        // containers-03 is one month grid's exact width; scale by the resolved
        // month count so a multi-month calendar fits side by side, and add the
        // modal's two outer borders so the border-box content leaves room for
        // it without a 2px horizontal scroll.
        maxWidth: `calc(${this.numberOfMonthsResolved()} * var(--tedi-containers-03) + 2 * var(--tedi-borders-01))`,
      },
    );
    this.modalRef = ref;

    ref.closed.subscribe((result) => {
      this.modalRef = null;
      this.overlayOpen.set(false);
      this.onTouched();
      if (result === undefined) return;
      this.commitValue(result);
    });
  }

  private handleNativeInputChange(value: string): void {
    if (value === "") {
      this.commitValue(null);
      return;
    }
    const parts = value.split("-");
    if (parts.length !== 3) return;
    const [yearStr, monthStr, dayStr] = parts;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day)
    ) {
      return;
    }
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return;
    }
    if (this.parsedValueIsDisabled(parsed)) return;
    this.commitValue(parsed);
  }

  private handleSingleParseInput(value: string): void {
    const customParse = this.parseDate();
    const parsed = customParse
      ? customParse(value)
      : parseLocaleDate(value, this.localeCode());
    if (parsed === undefined || parsed === null) return;
    if (this.parsedValueIsDisabled(parsed)) return;
    this.commitValue(parsed);
  }

  private parsedValueIsDisabled(value: DateFieldValue): boolean {
    if (value === null) return false;
    const matchers = this.resolvedDisabledMatchers();
    if (matchers.length === 0) return false;
    if (value instanceof Date) return matchAny(value, matchers);
    if (Array.isArray(value)) return value.some((d) => matchAny(d, matchers));
    if (matchAny(value.from, matchers)) return true;
    if (value.to && matchAny(value.to, matchers)) return true;
    return false;
  }

  private commitValue(next: DateFieldValue): void {
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
    const anchor = this.deriveAnchor(next);
    if (anchor) {
      this.currentMonth.set(startOfMonth(anchor));
    }
  }

  private defaultFormat(value: Date | Date[] | DateRange): string {
    const locale = this.localeCode();
    if (value instanceof Date) return formatLocaleDate(value, locale);
    if (Array.isArray(value)) {
      return value.map((d) => formatLocaleDate(d, locale)).join(", ");
    }
    if (value.to === undefined) return formatLocaleDate(value.from, locale);
    return `${formatLocaleDate(value.from, locale)} – ${formatLocaleDate(value.to, locale)}`;
  }

  private deriveAnchor(value: DateFieldValue): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (Array.isArray(value)) return value.length > 0 ? value[0] : null;
    return value.from;
  }

  private resolveBreakpointInput<T>(v: BreakpointObject<T>): T {
    if (
      v.xxl !== undefined &&
      this.breakpointService.isAboveBreakpoint("xxl")()
    )
      return v.xxl;
    if (v.xl !== undefined && this.breakpointService.isAboveBreakpoint("xl")())
      return v.xl;
    if (v.lg !== undefined && this.breakpointService.isAboveBreakpoint("lg")())
      return v.lg;
    if (v.md !== undefined && this.breakpointService.isAboveBreakpoint("md")())
      return v.md;
    if (v.sm !== undefined && this.breakpointService.isAboveBreakpoint("sm")())
      return v.sm;
    return v.xs;
  }

  // Note: 'today' is captured per-getter call but resolvedDisabledMatchers is a
  // computed() — it will not re-evaluate at midnight rollover. For sessions
  // spanning midnight the past/future windows may become stale until any
  // other dependency changes.
  private startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private toIsoDate(date: Date): string {
    const y = date.getFullYear().toString().padStart(4, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  private queryNativeInput(): HTMLInputElement | null {
    const host = this.hostEl.nativeElement as HTMLElement;
    return host.querySelector<HTMLInputElement>(".tedi-date-input__input");
  }
}
