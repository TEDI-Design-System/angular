import {
  type Meta,
  type StoryObj,
  moduleMetadata,
} from "@storybook/angular";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DateFieldComponent } from "./date-field.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { TextComponent } from "../../base/text/text.component";
import type { DateRange } from "../../content/calendar/types";

/**
 * <a href="https://www.tedi.ee/1ee8444b7/p/15bd6e-date-field" target="_blank">Zeroheight ↗</a>
 *
 * DateField is the form-control wrapper around the Calendar. It exposes a typed text input
 * paired with a popover (or modal, below the `md` breakpoint by default) that renders the
 * Calendar. It supports `single`, `multiple` and `range` modes, custom `formatDate`/`parseDate`
 * callbacks, native OS picker fallback, and the same selection-level/header options as Calendar.
 */

const today = new Date();
const inThreeDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
const inTenDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);

const pad = (n: number): string => n.toString().padStart(2, "0");

const formatUS = (value: Date | Date[] | DateRange | null): string => {
  if (!value) return "";
  if (value instanceof Date) {
    return `${pad(value.getMonth() + 1)}/${pad(value.getDate())}/${value.getFullYear()}`;
  }
  if (Array.isArray(value)) {
    return value
      .map((d) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`)
      .join(", ");
  }
  const from = `${pad(value.from.getMonth() + 1)}/${pad(value.from.getDate())}/${value.from.getFullYear()}`;
  if (!value.to) return from;
  const to = `${pad(value.to.getMonth() + 1)}/${pad(value.to.getDate())}/${value.to.getFullYear()}`;
  return `${from} – ${to}`;
};

const parseUS = (value: string): Date | undefined => {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return undefined;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
};

export default {
  title: "TEDI-Ready/Components/Form/DateField",
  component: DateFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormFieldComponent,
        LabelComponent,
        FeedbackTextComponent,
        ButtonComponent,
        AlertComponent,
        TextComponent,
        ReactiveFormsModule,
      ],
    }),
  ],
  argTypes: {
    mode: {
      description:
        "Selection mode. `single` selects one date, `multiple` toggles dates in an array, `range` builds a `{ from, to }` range across two clicks.",
      control: { type: "radio" },
      options: ["single", "multiple", "range"],
      table: {
        category: "inputs",
        type: {
          summary: "DateFieldMode",
          detail: "single \nmultiple \nrange",
        },
        defaultValue: { summary: "single" },
      },
    },
    selectionLevel: {
      description:
        "Lowest level the user can commit to. `days` shows the day grid as the final step; `months` and `years` commit at that level instead.",
      control: { type: "radio" },
      options: ["days", "months", "years"],
      table: {
        category: "inputs",
        type: {
          summary: "CalendarView",
          detail: "days \nmonths \nyears",
        },
        defaultValue: { summary: "days" },
      },
    },
    monthYearSelectType: {
      description:
        "How the popover header exposes month/year picking. `dropdown` shows two dropdowns; `grid` drills into a month/year grid when the header label is clicked.",
      control: { type: "radio" },
      options: ["dropdown", "grid"],
      table: {
        category: "inputs",
        type: { summary: '"dropdown" | "grid"' },
        defaultValue: { summary: "dropdown" },
      },
    },
    localeCode: {
      description:
        "BCP-47 locale for weekday/month names, the first day of the week, and the default `formatDate`/`parseDate` behaviour.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "et-EE" },
      },
    },
    placeholder: {
      description: "Placeholder rendered in the input when there is no value.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: '""' },
      },
    },
    inputDisabled: {
      description:
        "Disables the field entirely — input, icon button, and calendar.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    readOnly: {
      description:
        "Blocks typing into the input but leaves the calendar interactive — useful for guided picking.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    required: {
      description:
        "Marks the field as required. In `multiple` mode prevents clearing the last selected date.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disablePast: {
      description: "Disable all dates before today.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disableFuture: {
      description: "Disable all dates after today.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    showOutsideDays: {
      description:
        "Render the trailing/leading days from the adjacent month inside the current month's grid.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    enableCalendar: {
      description:
        "Enables the calendar picker UI. When `false`, hides the icon button and disables the popover/modal — the user can only type a date.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
  },
} as Meta<DateFieldComponent>;

type Story = StoryObj<DateFieldComponent>;

export const Default: Story = {
  args: {
    mode: "single",
    selectionLevel: "days",
    monthYearSelectType: "dropdown",
    localeCode: "et-EE",
    placeholder: "pp.kk.aaaa",
    inputDisabled: false,
    readOnly: false,
    required: false,
    disablePast: false,
    disableFuture: false,
    showOutsideDays: true,
  },
  render: (args) => {
    const control = new FormControl<Date | null>(null);
    return {
      props: { ...args, control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-default">Date</label>
          <tedi-date-field
            inputId="date-default"
            [formControl]="control"
            [mode]="mode"
            [selectionLevel]="selectionLevel"
            [monthYearSelectType]="monthYearSelectType"
            [localeCode]="localeCode"
            [placeholder]="placeholder"
            [inputDisabled]="inputDisabled"
            [readOnly]="readOnly"
            [required]="required"
            [disablePast]="disablePast"
            [disableFuture]="disableFuture"
            [showOutsideDays]="showOutsideDays"
          />
          <tedi-feedback-text text="Pick a date." />
        </tedi-form-field>
      `,
    };
  },
};

export const Multiple: Story = {
  render: () => {
    const control = new FormControl<Date[] | null>([inThreeDays, inTenDays]);
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-multiple">Dates</label>
          <tedi-date-field
            inputId="date-multiple"
            mode="multiple"
            [formControl]="control"
          />
          <tedi-feedback-text text="Pick one or more dates." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`mode='multiple'` renders selected dates as removable chips inside the input. Clicking a chip's close icon removes that date from the array.",
      },
    },
  },
};

export const Range: Story = {
  render: () => {
    const control = new FormControl<DateRange | null>({
      from: inThreeDays,
      to: inTenDays,
    });
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-range">Date range</label>
          <tedi-date-field
            inputId="date-range"
            mode="range"
            [formControl]="control"
          />
          <tedi-feedback-text text="Pick a start and end date." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`mode='range'` builds a `{ from, to }` value. The first click sets `from`; the second click sets `to` (or replaces `from` if it falls earlier).",
      },
    },
  },
};

export const DisabledDates: Story = {
  render: () => {
    const pastControl = new FormControl<Date | null>(null);
    const futureControl = new FormControl<Date | null>(null);
    const minMaxControl = new FormControl<Date | null>(null);
    const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      props: { pastControl, futureControl, minMaxControl, minDate, maxDate },
      template: `
        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
          <tedi-form-field>
            <label tedi-label for="date-disable-past">Disable past</label>
            <tedi-date-field
              inputId="date-disable-past"
              [formControl]="pastControl"
              [disablePast]="true"
            />
            <tedi-feedback-text text="Only today and future dates are selectable." />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="date-disable-future">Disable future</label>
            <tedi-date-field
              inputId="date-disable-future"
              [formControl]="futureControl"
              [disableFuture]="true"
            />
            <tedi-feedback-text text="Only today and past dates are selectable." />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="date-min-max">Min/max window</label>
            <tedi-date-field
              inputId="date-min-max"
              [formControl]="minMaxControl"
              [minDate]="minDate"
              [maxDate]="maxDate"
            />
            <tedi-feedback-text text="Pick a date in the current month." />
          </tedi-form-field>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "Three ways to restrict the selectable window. `disablePast` blocks every date strictly before today (date-of-birth-style fields); `disableFuture` blocks every date strictly after today (historical-event fields); `minDate`/`maxDate` clamp the window to an explicit inclusive range. Typed values outside the constraint are rejected on commit.",
      },
    },
  },
};

export const CustomFormatAndParse: Story = {
  render: () => {
    const control = new FormControl<Date | null>(inThreeDays);
    return {
      props: { control, formatUS, parseUS },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-custom-format">Date (MM/dd/yyyy)</label>
          <tedi-date-field
            inputId="date-custom-format"
            [formControl]="control"
            [formatDate]="formatUS"
            [parseDate]="parseUS"
            placeholder="mm/dd/yyyy"
          />
          <tedi-feedback-text text="Try typing 12/24/2026." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pass `formatDate` and `parseDate` callbacks to override the locale-driven default. Here the field uses US-style `MM/dd/yyyy` regardless of `localeCode`.",
      },
    },
  },
};

export const NativePicker: Story = {
  render: () => {
    const allControl = new FormControl<Date | null>(null);
    const bpControl = new FormControl<Date | null>(null);
    return {
      props: {
        allControl,
        bpControl,
        useNativeBp: { xs: true, md: false },
      },
      template: `
        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
          <tedi-form-field>
            <label tedi-label for="date-native">Always native</label>
            <tedi-date-field
              inputId="date-native"
              [formControl]="allControl"
              [useNativePicker]="true"
            />
            <tedi-feedback-text text="Uses the OS-native date picker on every viewport." />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="date-native-bp">Native below md</label>
            <tedi-date-field
              inputId="date-native-bp"
              [formControl]="bpControl"
              [useNativePicker]="useNativeBp"
            />
            <tedi-feedback-text text="Native picker on phones, custom popover from md upward." />
          </tedi-form-field>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`useNativePicker=true` swaps the popover for the browser's built-in `<input type=\"date\">` UI (single mode only). The prop accepts a `BreakpointInput<boolean>`, so passing `{ xs: true, md: false }` keeps the native picker on phones and the custom popover from `md` upward.",
      },
    },
  },
};

export const Modal: Story = {
  render: () => {
    const alwaysControl = new FormControl<Date | null>(null);
    const bpControl = new FormControl<Date | null>(null);
    return {
      props: { alwaysControl, bpControl },
      template: `
        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
          <tedi-form-field>
            <label tedi-label for="date-modal">Always modal</label>
            <tedi-date-field
              inputId="date-modal"
              [formControl]="alwaysControl"
              [modal]="true"
            />
            <tedi-feedback-text text="Calendar always opens in a centered modal." />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="date-modal-md">Modal below md</label>
            <tedi-date-field
              inputId="date-modal-md"
              [formControl]="bpControl"
              modal="md"
            />
            <tedi-feedback-text text="Popover from md upward, modal below md." />
          </tedi-form-field>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`[modal]=\"true\"` forces the calendar into a centered modal with explicit Cancel/Confirm buttons. `modal=\"md\"` (the default) renders a modal below the `md` breakpoint and a popover above it — pass a different breakpoint name to shift the threshold.",
      },
    },
  },
};

export const EnableCalendarFalse: Story = {
  render: () => {
    const control = new FormControl<Date | null>(null);
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-no-calendar">Date</label>
          <tedi-date-field
            inputId="date-no-calendar"
            [formControl]="control"
            [enableCalendar]="false"
            placeholder="pp.kk.aaaa"
          />
          <tedi-feedback-text text="Typing only — no picker UI." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`enableCalendar=false` hides the icon button and disables the popover/modal. The user can only type — typed input is parsed using the locale-aware default (or your `parseDate`).",
      },
    },
  },
};

export const CalendarTriggerInput: Story = {
  render: () => {
    const control = new FormControl<Date | null>(null);
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-trigger-input">Date</label>
          <tedi-date-field
            inputId="date-trigger-input"
            [formControl]="control"
            calendarTrigger="input"
          />
          <tedi-feedback-text text="Clicking the input also opens the calendar." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`calendarTrigger=\"input\"` makes the entire input clickable to open the calendar — typing is still blocked by `readOnly`. Useful when the user is not expected to type a date.",
      },
    },
  },
};

export const ReadOnly: Story = {
  render: () => {
    const control = new FormControl<Date | null>(inThreeDays);
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-readonly">Date</label>
          <tedi-date-field
            inputId="date-readonly"
            [formControl]="control"
            [readOnly]="true"
          />
          <tedi-feedback-text text="Typing is blocked but the calendar still works." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`readOnly=true` blocks typing into the input but keeps the icon button and calendar interactive — value can only be changed via the picker.",
      },
    },
  },
};

export const InputDisabled: Story = {
  render: () => {
    const control = new FormControl<Date | null>(inThreeDays);
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-disabled">Date</label>
          <tedi-date-field
            inputId="date-disabled"
            [formControl]="control"
            [inputDisabled]="true"
          />
          <tedi-feedback-text text="Field is fully disabled." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`inputDisabled=true` disables the entire field — input, icon button, and calendar. Combines with the reactive-forms `disabled` state.",
      },
    },
  },
};

export const Required: Story = {
  render: () => {
    const control = new FormControl<Date | null>(null, {
      validators: [Validators.required],
    });
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-required" [required]="true">Date</label>
          <tedi-date-field
            inputId="date-required"
            [formControl]="control"
            [required]="true"
          />
          <tedi-feedback-text text="This field is required." type="error" />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`required=true` plus `Validators.required` on the control surfaces the form-field invalid state once the control is touched.",
      },
    },
  },
};

export const SelectionLevel: Story = {
  render: () => {
    const monthControl = new FormControl<Date | null>(null);
    const yearControl = new FormControl<Date | null>(null);
    return {
      props: { monthControl, yearControl },
      template: `
        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
          <tedi-form-field>
            <label tedi-label for="date-months">Month</label>
            <tedi-date-field
              inputId="date-months"
              [formControl]="monthControl"
              selectionLevel="months"
            />
            <tedi-feedback-text text="Pick a month — the calendar commits at month granularity." />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="date-years">Year</label>
            <tedi-date-field
              inputId="date-years"
              [formControl]="yearControl"
              selectionLevel="years"
            />
            <tedi-feedback-text text="Pick a year — the calendar commits at year granularity." />
          </tedi-form-field>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`selectionLevel` controls the lowest committable granularity. `months` makes the month grid the final step; `years` makes the year grid the final step.",
      },
    },
  },
};

export const HeaderGrid: Story = {
  render: () => {
    const control = new FormControl<Date | null>(null);
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-header-grid">Date</label>
          <tedi-date-field
            inputId="date-header-grid"
            [formControl]="control"
            monthYearSelectType="grid"
          />
          <tedi-feedback-text text="Click the header label to drill into a month or year grid." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`monthYearSelectType=\"grid\"` replaces the header dropdowns with a clickable label that drills the body into a month or year grid.",
      },
    },
  },
};

export const WithReactiveForms: Story = {
  render: () => {
    const form = new FormGroup({
      start: new FormControl<Date | null>(inThreeDays, {
        validators: [Validators.required],
      }),
      end: new FormControl<Date | null>(inTenDays),
    });

    return {
      props: { form },
      template: `
        <form [formGroup]="form" style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
          <tedi-form-field>
            <label tedi-label for="date-form-start" [required]="true">Start date</label>
            <tedi-date-field inputId="date-form-start" formControlName="start" [required]="true" />
            <tedi-feedback-text text="Pick a start date." />
          </tedi-form-field>
          <tedi-form-field>
            <label tedi-label for="date-form-end">End date</label>
            <tedi-date-field inputId="date-form-end" formControlName="end" />
            <tedi-feedback-text text="Pick an end date." />
          </tedi-form-field>

          <tedi-alert type="info" [showClose]="false">
            <pre tedi-text modifiers="small">{{ form.value | json }}</pre>
          </tedi-alert>
        </form>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "DateField implements `ControlValueAccessor`, so it slots into a `FormGroup` like any reactive control. The block below the fields echoes the live `form.value`.",
      },
    },
  },
};

export const WithFooter: Story = {
  render: () => {
    const control = new FormControl<Date | null>(inThreeDays);
    const clear = (): void => control.setValue(null);
    return {
      props: { control, clear },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-footer">Date</label>
          <tedi-date-field inputId="date-footer" [formControl]="control">
            <div tediCalendarFooter style="display: flex; justify-content: flex-end; padding: 8px 12px;">
              <button tedi-button variant="link" (click)="clear()">Clear</button>
            </div>
          </tedi-date-field>
          <tedi-feedback-text text="The footer projection renders below the calendar body." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "Anything projected with the `tediCalendarFooter` attribute renders below the calendar body — useful for clear/today shortcuts. Footer projection works in popover mode; the modal variant does not currently receive projected footers.",
      },
    },
  },
};

export const CustomLocale: Story = {
  render: () => {
    const control = new FormControl<Date | null>(inThreeDays);
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-locale">Date</label>
          <tedi-date-field
            inputId="date-locale"
            [formControl]="control"
            localeCode="en-US"
          />
          <tedi-feedback-text text="Switches month names, weekday names and first day of the week." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "Override `localeCode` (BCP-47) to switch month/weekday names, the first day of the week, and the default `formatDate`/`parseDate` behaviour. `en-US` starts the week on Sunday.",
      },
    },
  },
};
