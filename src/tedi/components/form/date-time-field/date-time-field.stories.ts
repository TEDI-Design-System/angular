import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { DateTimeFieldComponent } from "./date-time-field.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { LabelComponent } from "../../content/label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import type { DateTimeFieldValue } from "./date-time-field.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.65.80?node-id=9938-87564&m=dev" target="_blank">Figma ↗</a>
 *
 * DateTimeField pairs a typed text input with a popover that holds the Calendar and a
 * TimePicker. `side-by-side` shows both together; `multi-step` picks the date first, then
 * advances to a time step. Set `availableTimes` to swap the scroll-wheel for a grid of slots.
 * It supports `single` and `range` modes, a native `datetime-local` fallback, and a mobile modal.
 * Like DateField it owns no label — compose it with `tedi-form-field` + `tedi-label`.
 */

type DateTimeFieldStoryArgs = DateTimeFieldComponent & {
  /** Story-only: text rendered in the sibling `<label tedi-label>`. */
  label?: string;
  /** Story-only: text rendered in a `tedi-feedback-text` below the field. */
  feedback?: string;
  /** Story-only: initial value seeded into the field's form control. */
  initialValue?: DateTimeFieldValue;
};

const renderSingle: NonNullable<StoryObj<DateTimeFieldStoryArgs>["render"]> = (
  args,
) => {
  const control = new FormControl<DateTimeFieldValue>(
    args.initialValue ?? null,
  );
  return {
    props: { ...args, control },
    template: `
      <tedi-form-field [size]="size">
        <label tedi-label [for]="inputId" [required]="required">{{ label }}</label>
        <tedi-date-time-field
          [inputId]="inputId"
          [formControl]="control"
          [mode]="mode"
          [layout]="layout"
          [size]="size"
          [placeholder]="placeholder"
          [availableTimes]="availableTimes"
          [timeGridVariant]="timeGridVariant"
          [useNativeTimePicker]="useNativeTimePicker"
          [minuteStep]="minuteStep"
          [slotColumns]="slotColumns"
          [numberOfMonths]="numberOfMonths"
          [selectionLevel]="selectionLevel"
          [monthYearSelectType]="monthYearSelectType"
          [localeCode]="localeCode"
          [inputDisabled]="inputDisabled"
          [readOnly]="readOnly"
          [required]="required"
          [clearable]="clearable"
          [disablePast]="disablePast"
          [disableFuture]="disableFuture"
          [minDate]="minDate"
          [maxDate]="maxDate"
          [showOutsideDays]="showOutsideDays"
          [useNativePicker]="useNativePicker"
          [modal]="modal"
          [fullscreen]="fullscreen"
        />
        @if (feedback) {
          <tedi-feedback-text [text]="feedback" />
        }
      </tedi-form-field>
    `,
  };
};

const meta: Meta<DateTimeFieldStoryArgs> = {
  title: "TEDI-Ready/Components/Form/DateTimeField",
  component: DateTimeFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormFieldComponent,
        LabelComponent,
        FeedbackTextComponent,
        RowComponent,
        ColComponent,
        ReactiveFormsModule,
      ],
    }),
  ],
  parameters: {
    status: {
      type: ["breakpointSupport"],
    },
  },
  render: renderSingle,
  args: {
    inputId: "date-time-field",
    label: "Kuupäev ja kellaaeg",
    mode: "single",
    layout: "side-by-side",
    size: "default",
    placeholder: "pp.kk.aaaa tt:mm",
    minuteStep: 1,
    slotColumns: 4,
    numberOfMonths: { xs: 1, md: 2 },
    selectionLevel: "days",
    monthYearSelectType: "dropdown",
    localeCode: "et-EE",
    inputDisabled: false,
    readOnly: false,
    required: false,
    disablePast: false,
    disableFuture: false,
    showOutsideDays: true,
    useNativePicker: false,
    modal: false,
    fullscreen: false,
  },
  argTypes: {
    mode: {
      control: { type: "radio" },
      options: ["single", "range"],
      description: "Selection mode — one date+time or a `{ from, to }` pair.",
    },
    layout: {
      control: { type: "radio" },
      options: ["side-by-side", "multi-step"],
      description:
        "`side-by-side` shows the calendar and time together; `multi-step` picks the date first. Accepts a `BreakpointInput`.",
    },
    useNativeTimePicker: {
      control: { type: "boolean" },
      description:
        "Native time input instead of the scroll-wheel. When unset, native below `md` in `side-by-side` only.",
    },
    numberOfMonths: {
      control: { type: "object" },
      description:
        "Months shown in `range` mode. With one month from `md` up, the times sit beside the calendar.",
    },
    timeGridVariant: {
      control: { type: "radio" },
      options: ["button", "radio"],
      description:
        "Slot grid style when `availableTimes` is set. Defaults per layout when unset.",
    },
    minuteStep: {
      control: { type: "number" },
      description:
        "Minute interval for the scroll-wheel and the native inputs' `step`. Ignored with `availableTimes`.",
    },
    clearable: {
      control: { type: "boolean" },
      description:
        "Shows the clear button once there is a value. When unset, follows the wrapping `tedi-form-field`.",
    },
    availableTimes: { control: false },
    minDate: { control: false },
    maxDate: { control: false },
    label: { table: { disable: true } },
    feedback: { table: { disable: true } },
    initialValue: { table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<DateTimeFieldStoryArgs>;

export const Default: Story = {};

export const Size: Story = {
  render: (args) => {
    const controlDefault = new FormControl<DateTimeFieldValue>(null);
    const controlSmall = new FormControl<DateTimeFieldValue>(null);
    return {
      props: { ...args, controlDefault, controlSmall },
      template: `
        <tedi-row [cols]="1" [gap]="5">
          <tedi-col>
            <tedi-form-field size="default">
              <label tedi-label for="dtf-size-default">Default</label>
              <tedi-date-time-field inputId="dtf-size-default" size="default"
                [formControl]="controlDefault" placeholder="pp.kk.aaaa tt:mm" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field size="small">
              <label tedi-label for="dtf-size-small">Small</label>
              <tedi-date-time-field inputId="dtf-size-small" size="small"
                [formControl]="controlSmall" placeholder="pp.kk.aaaa tt:mm" />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
};

export const States: Story = {
  render: (args) => {
    const enabled = new FormControl<DateTimeFieldValue>(null);
    const disabled = new FormControl<DateTimeFieldValue>({
      value: null,
      disabled: true,
    });
    const invalidControl = new FormControl<DateTimeFieldValue>(
      null,
      Validators.required,
    );
    invalidControl.markAsTouched();
    return {
      props: { ...args, enabled, disabled, invalidControl },
      template: `
        <tedi-row [cols]="1" [gap]="5">
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="dtf-state-default">Default</label>
              <tedi-date-time-field inputId="dtf-state-default" [formControl]="enabled"
                placeholder="pp.kk.aaaa tt:mm" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="dtf-state-disabled">Disabled</label>
              <tedi-date-time-field inputId="dtf-state-disabled" [formControl]="disabled"
                placeholder="pp.kk.aaaa tt:mm" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="dtf-state-error">Error</label>
              <tedi-date-time-field inputId="dtf-state-error" [formControl]="invalidControl"
                placeholder="pp.kk.aaaa tt:mm" />
              <tedi-feedback-text text="Tagasiside tekst" type="error" />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
};

/** Calendar + grid of predefined slots, rendered as bordered buttons. */
export const PredefinedTimeSlots: Story = {
  args: {
    inputId: "date-time-predefined",
    label: "Vastuvõtuaeg",
    availableTimes: ["09:30", "10:00", "11:30", "15:30", "18:30", "20:30"],
    timeGridVariant: "button",
  },
};

/**
 * `availableTimes` accepts a `(date) => string[]` evaluated with the selected date — use it
 * when the slot list depends on the day (e.g. different weekday vs. weekend hours).
 */
export const PerDayTimeSlots: Story = {
  args: {
    inputId: "date-time-per-day",
    label: "Vastuvõtuaeg",
    availableTimes: (date: Date) => {
      const day = date.getDay();
      if (day === 0) return ["10:00", "11:00", "12:00"];
      if (day === 6) return ["09:00", "10:00", "11:00", "12:00", "13:00"];
      return ["08:30", "09:30", "10:30", "11:30", "13:00", "14:00", "15:00"];
    },
    timeGridVariant: "button",
  },
};

/** Pick the date first, then advance to a separate time step with radio slots. */
export const MultiSteps: Story = {
  args: {
    inputId: "date-time-multi-step",
    label: "Kellaaeg",
    layout: "multi-step",
    availableTimes: ["09:30", "10:00", "11:30", "15:30", "18:30", "20:30"],
    timeGridVariant: "radio",
  },
};

export const Range: Story = {
  args: {
    mode: "range",
    placeholder: "pp.kk.aaaa tt:mm – pp.kk.aaaa tt:mm",
    layout: { xs: "multi-step", md: "side-by-side" },
    modal: "md",
  },
  render: (args) => {
    const examples = [
      { id: "dtf-range-default", label: "Kaks kuud" },
      { id: "dtf-range-one-month", label: "Üks kuu", numberOfMonths: 1 },
      {
        id: "dtf-range-slots",
        label: "Etteantud ajad",
        numberOfMonths: 1,
        availableTimes: [
          "08:00",
          "08:30",
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "13:00",
          "14:30",
          "15:30",
          "16:00",
          "17:30",
          "18:30",
          "20:30",
        ],
      },
      {
        id: "dtf-range-native",
        label: "Natiivne kellaaja valik",
        useNativeTimePicker: true,
      },
      {
        id: "dtf-range-multi-step",
        label: "Mitmesammuline kõigil ekraanidel",
        layout: "multi-step",
      },
    ].map((example) => ({
      ...example,
      control: new FormControl<DateTimeFieldValue>(null),
    }));
    return {
      props: { ...args, examples },
      template: `
        <tedi-row [cols]="1" [gap]="5">
          @for (example of examples; track example.id) {
            <tedi-col>
              <tedi-form-field [size]="size">
                <label tedi-label [for]="example.id">{{ example.label }}</label>
                <tedi-date-time-field
                  [inputId]="example.id"
                  [formControl]="example.control"
                  mode="range"
                  [layout]="example.layout ?? layout"
                  [numberOfMonths]="example.numberOfMonths ?? numberOfMonths"
                  [availableTimes]="example.availableTimes ?? availableTimes"
                  [useNativeTimePicker]="example.useNativeTimePicker ?? useNativeTimePicker"
                  [size]="size"
                  [placeholder]="placeholder"
                  [timeGridVariant]="timeGridVariant"
                  [minuteStep]="minuteStep"
                  [slotColumns]="slotColumns"
                  [monthYearSelectType]="monthYearSelectType"
                  [localeCode]="localeCode"
                  [inputDisabled]="inputDisabled"
                  [readOnly]="readOnly"
                  [required]="required"
                  [clearable]="clearable"
                  [disablePast]="disablePast"
                  [disableFuture]="disableFuture"
                  [showOutsideDays]="showOutsideDays"
                  [modal]="modal"
                  [fullscreen]="fullscreen"
                />
              </tedi-form-field>
            </tedi-col>
          }
        </tedi-row>
      `,
    };
  },
};

/**
 * Calendar constraints (`disablePast` / `disableFuture` / `minDate` / `maxDate`) gate the
 * calendar grid. The time picker is not time-of-day bounded — every minute inside an allowed
 * day is selectable.
 */
export const DateConstraints: Story = {
  args: {
    inputId: "date-time-disable-past",
    label: "Ainult tulevikus",
    disablePast: true,
  },
};

/** Header month/year picking rendered as a grid instead of dropdowns. */
export const YearGrid: Story = {
  args: {
    inputId: "date-time-year-grid",
    label: "Kuupäev ja kellaaeg",
    monthYearSelectType: "grid",
  },
};

/**
 * Renders `<input type="datetime-local">` and skips the custom popover — the browser's native
 * date+time picker opens from the icon. Single mode only; range silently falls back to custom.
 */
export const Native: Story = {
  args: {
    inputId: "date-time-native",
    label: "Kuupäev ja kellaaeg",
    useNativePicker: true,
  },
};

/**
 * Opens the calendar and time picker in a centered modal instead of a popover. Set `modal` to a
 * breakpoint name (e.g. `md`) to use the modal only below that breakpoint — the
 * platform-idiomatic choice on phones.
 */
export const Modal: Story = {
  args: {
    inputId: "date-time-modal",
    label: "Kuupäev ja kellaaeg",
    modal: true,
  },
};
