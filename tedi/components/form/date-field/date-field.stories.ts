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
import { IconComponent } from "../../base/icon/icon.component";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { TextComponent } from "../../base/text/text.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import type { DateRange } from "../../content/calendar/types";
import type { Matcher } from "../../../utils/matchers.util";

/**
 * <a href="https://www.tedi.ee/1ee8444b7/p/15bd6e-date-field" target="_blank">Zeroheight ↗</a>
 *
 * DateField is the form-control wrapper around the Calendar. It exposes a typed text input
 * paired with a popover that renders the Calendar. On phones, single-mode fields default to the
 * native OS date picker; an opt-in modal is also available. It supports `single`, `multiple` and
 * `range` modes, custom `formatDate`/`parseDate` callbacks, and the same selection-level/header
 * options as Calendar.
 */

const today = new Date();
const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
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

/**
 * Inputs that every story binds to its args so the Storybook controls apply
 * across all stories (including the multi-field comparison demos).
 */
const COMMON_INPUTS = [
  "mode",
  "size",
  "selectionLevel",
  "monthYearSelectType",
  "localeCode",
  "placeholder",
  "inputDisabled",
  "readOnly",
  "required",
  "disablePast",
  "disableFuture",
  "showOutsideDays",
  "showWeekNumbers",
  "enableCalendar",
  "multiRow",
  "tagEllipsis",
  "isTagRemovable",
  "useNativePicker",
  "modal",
  "fullscreen",
  "calendarTrigger",
  "numberOfMonths",
];

/**
 * Builds `[input]="input"` template bindings for the common inputs, minus any
 * a story sets literally per field (to avoid binding the same input twice).
 */
const argBindings = (exclude: string[] = []): string =>
  COMMON_INPUTS.filter((name) => !exclude.includes(name))
    .map((name) => `[${name}]="${name}"`)
    .join("\n          ");

type DateFieldStoryArgs = DateFieldComponent & {
  /** Story-only: text rendered in the sibling `<label tedi-label>`. */
  label?: string;
  /** Story-only: text rendered in a `tedi-feedback-text` below the field. */
  feedback?: string;
  /** Story-only: initial value seeded into the field's form control. */
  initialValue?: Date | Date[] | DateRange | null;
  /** Story-only: bound to the date-field's `disabledMatchers` input. */
  disabledMatcher?: Matcher | Matcher[];
};

/**
 * Shared, args-driven renderer for single-field stories. Binds every commonly
 * toggled input to an arg so the Storybook controls work in every story that
 * uses it (e.g. switch `mode` to `range` while `modal` is on).
 */
const renderSingle: NonNullable<StoryObj<DateFieldStoryArgs>["render"]> = (
  args,
) => {
  const control = new FormControl<Date | Date[] | DateRange | null>(
    args.initialValue ?? null,
  );
  return {
    props: { ...args, control },
    template: `
      <tedi-form-field [size]="size">
        <label tedi-label [for]="inputId" [required]="required">{{ label }}</label>
        <tedi-date-field
          [inputId]="inputId"
          [formControl]="control"
          [mode]="mode"
          [size]="size"
          [selectionLevel]="selectionLevel"
          [monthYearSelectType]="monthYearSelectType"
          [localeCode]="localeCode"
          [placeholder]="placeholder"
          [inputDisabled]="inputDisabled"
          [readOnly]="readOnly"
          [required]="required"
          [disablePast]="disablePast"
          [disableFuture]="disableFuture"
          [enableCalendar]="enableCalendar"
          [showOutsideDays]="showOutsideDays"
          [showWeekNumbers]="showWeekNumbers"
          [multiRow]="multiRow"
          [tagEllipsis]="tagEllipsis"
          [isTagRemovable]="isTagRemovable"
          [useNativePicker]="useNativePicker"
          [modal]="modal"
          [fullscreen]="fullscreen"
          [calendarTrigger]="calendarTrigger"
          [numberOfMonths]="numberOfMonths"
          [minDate]="minDate"
          [maxDate]="maxDate"
          [initialMonth]="initialMonth"
          [disabledMatchers]="disabledMatcher"
          [availableDays]="availableDays"
          [unavailableDays]="unavailableDays"
          [formatDate]="formatDate"
          [parseDate]="parseDate"
        />
        @if (feedback) {
          <tedi-feedback-text [text]="feedback" />
        }
      </tedi-form-field>
    `,
  };
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
        IconComponent,
        AlertComponent,
        TextComponent,
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
    inputId: "date-field",
    label: "Kuupäev",
    mode: "single",
    size: "default",
    selectionLevel: "days",
    monthYearSelectType: "dropdown",
    localeCode: "et-EE",
    placeholder: "",
    inputDisabled: false,
    readOnly: false,
    required: false,
    disablePast: false,
    disableFuture: false,
    showOutsideDays: true,
    showWeekNumbers: false,
    enableCalendar: true,
    multiRow: true,
    tagEllipsis: false,
    isTagRemovable: true,
    useNativePicker: false,
    modal: false,
    fullscreen: false,
    calendarTrigger: "button",
    numberOfMonths: 1,
  },
  argTypes: {
    inputId: {
      description:
        "Unique ID for label association and accessibility. Bind the sibling `<label tedi-label [for]>` to the same value.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    label: {
      table: { disable: true },
    },
    feedback: {
      table: { disable: true },
    },
    initialValue: {
      table: { disable: true },
    },
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
    multiRow: {
      description:
        "`multiple` mode tag layout. `true` wraps tags across rows and grows the field height; `false` keeps a single row and collapses overflow into a `+N` counter.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    tagEllipsis: {
      description:
        "Which end a `multiple`-mode tag label truncates from when it doesn't fit. `false` never truncates; `end` → `05.06…`; `start` → `…06.2026` (keeps the year visible).",
      control: { type: "radio" },
      options: [false, "start", "end"],
      table: {
        category: "inputs",
        type: { summary: "TagEllipsis", detail: "false \nstart \nend" },
        defaultValue: { summary: "false" },
      },
    },
    isTagRemovable: {
      description:
        "In `multiple` mode, whether tags show a remove button. `false` renders them as read-only chips.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    size: {
      description:
        "Field size — should match the surrounding `tedi-form-field`'s `size`.",
      control: { type: "radio" },
      options: ["default", "small"],
      table: {
        category: "inputs",
        type: { summary: "DateFieldSize", detail: "default \nsmall" },
        defaultValue: { summary: "default" },
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
        "Marks the input as required (sets the native `required` attribute for validation). In `multiple` mode it also prevents clearing the last selected date. The asterisk indicator lives on the sibling `<label tedi-label [required]>` — bind it there too, since DateField owns no label.",
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
    showWeekNumbers: {
      description:
        "Render an ISO week-number column on the left of the day grid.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
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
    numberOfMonths: {
      description:
        "Number of month grids shown side by side. Accepts a `BreakpointInput<number>` — a plain number (e.g. `2`) is honoured at every breakpoint (including mobile/modal); pass a per-breakpoint object (e.g. `{ xs: 1, lg: 2 }`) to narrow it on small screens yourself.",
      control: { type: "number", min: 1, max: 4 },
      table: {
        category: "inputs",
        type: {
          summary: "BreakpointInput<number>",
          detail: "number \n{ xs: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number }",
        },
        defaultValue: { summary: "1" },
      },
    },
    useNativePicker: {
      description:
        "Swaps the custom popover for the browser's native `<input type=\"date\">` UI (single mode only). `true` always uses native, `false` never; a breakpoint name (`sm | md | lg | xl`) uses native below that breakpoint and the custom popover from it upward. Defaults to `false`.",
      control: { type: "select" },
      options: [true, false, "sm", "md", "lg", "xl"],
      table: {
        category: "inputs",
        type: {
          summary: "DateFieldUseNativePicker",
          detail: "boolean \n\"sm\" | \"md\" | \"lg\" | \"xl\"",
        },
        defaultValue: { summary: "false" },
      },
    },
    modal: {
      description:
        "Opens the calendar in a modal (with explicit Cancel/Confirm) instead of the popover. `true` always uses the modal, `false` never; a breakpoint name (`sm | md | lg | xl`) uses the modal below that breakpoint and the popover from it upward.",
      control: { type: "select" },
      options: [true, false, "sm", "md", "lg", "xl"],
      table: {
        category: "inputs",
        type: {
          summary: "DateFieldModalInput",
          detail: "boolean \n\"sm\" | \"md\" | \"lg\" | \"xl\"",
        },
        defaultValue: { summary: "false" },
      },
    },
    fullscreen: {
      description:
        "Render the calendar modal fullscreen. `true` always, `false` never; a breakpoint name (`sm | md | lg | xl`) makes it fullscreen below that breakpoint. Only applies when the calendar actually opens as a modal (see `modal`).",
      control: { type: "select" },
      options: [true, false, "sm", "md", "lg", "xl"],
      table: {
        category: "inputs",
        type: {
          summary: "ModalFullscreen",
          detail: "boolean \n\"sm\" | \"md\" | \"lg\" | \"xl\"",
        },
        defaultValue: { summary: "false" },
      },
    },
    calendarTrigger: {
      description:
        "What opens the calendar. `button` opens it from the icon button; `input` also opens it when the text input is focused. Accepts a `BreakpointInput` for per-breakpoint behaviour.",
      control: { type: "object" },
      table: {
        category: "inputs",
        type: {
          summary: "BreakpointInput<DateFieldCalendarTrigger>",
          detail: '"input" | "button" \n{ xs: ...; sm?: ...; md?: ... }',
        },
        defaultValue: { summary: '{ xs: "button" }' },
      },
    },
    formatDate: {
      description:
        "Custom formatter for rendering the selected value as the input's display string. Overrides the locale-aware default. Receives the `DateFieldValue` and returns a string.",
      control: false,
      table: {
        category: "inputs",
        type: { summary: "(value: DateFieldValue) => string" },
        defaultValue: { summary: "undefined" },
      },
    },
    parseDate: {
      description:
        "Custom parser for turning typed input into a value. Overrides the locale-aware default. Receives the raw string and returns a `DateFieldValue`, or `undefined` when the input can't be parsed.",
      control: false,
      table: {
        category: "inputs",
        type: { summary: "(value: string) => DateFieldValue | undefined" },
        defaultValue: { summary: "undefined" },
      },
    },
  },
} as Meta<DateFieldStoryArgs>;

type Story = StoryObj<DateFieldStoryArgs>;

export const Default: Story = {
  args: {
    inputId: "date-default",
    feedback: "Vali kuupäev",
  },
};

export const Size: Story = {
  render: (args) => ({
    props: { ...args },
    template: `
      <tedi-row [cols]="1" [gap]="3">
        <tedi-col>
          <tedi-form-field size="default">
            <label tedi-label for="date-size-default">Vaikimisi</label>
            <tedi-date-field inputId="date-size-default" size="default" ${argBindings(["size"])} />
          </tedi-form-field>
        </tedi-col>
        <tedi-col>
          <tedi-form-field size="small">
            <label tedi-label for="date-size-small">Väike</label>
            <tedi-date-field inputId="date-size-small" size="small" ${argBindings(["size"])} />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Set `size` on both the `tedi-form-field` wrapper and the `tedi-date-field` so the input height and the field chrome stay in sync.",
      },
    },
  },
};

export const States: Story = {
  render: (args) => {
    const disabledControl = new FormControl<Date | null>(inThreeDays);
    disabledControl.disable();
    return {
      props: { ...args, disabledControl },
      template: `
        <tedi-row [cols]="1" [gap]="3">
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-state-default">Vaikimisi</label>
              <tedi-date-field inputId="date-state-default" ${argBindings()} />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-state-disabled">Mitteaktiivne</label>
              <tedi-date-field inputId="date-state-disabled" [formControl]="disabledControl" ${argBindings()} />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-state-valid">Õnnestumine</label>
              <tedi-date-field inputId="date-state-valid" ${argBindings()} />
              <tedi-feedback-text text="Tagasiside tekst" type="valid" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-state-error">Viga</label>
              <tedi-date-field inputId="date-state-error" ${argBindings()} />
              <tedi-feedback-text text="Tagasiside tekst" type="error" />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "Persistent field states. Disabled is driven by the form control; the success/error states come from a `tedi-feedback-text` with `type=\"valid\"`/`\"error\"`, which the surrounding `tedi-form-field` reflects on the input border.",
      },
    },
  },
};

export const FieldOptions: Story = {
  render: (args) => {
    const shortcutControl = new FormControl<Date | null>(null);
    const setToday = (): void =>
      shortcutControl.setValue(
        new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      );
    const setTomorrow = (): void => shortcutControl.setValue(tomorrow);
    return {
      props: { ...args, shortcutControl, setToday, setTomorrow },
      template: `
        <tedi-row [cols]="1" [gap]="3">
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-opt-default">Vaikimisi kuupäevaväli</label>
              <tedi-date-field inputId="date-opt-default" ${argBindings(["placeholder"])} />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-opt-hint">Kuupäevaväli vihjega</label>
              <tedi-date-field inputId="date-opt-hint" placeholder="pp.kk.aaaa" ${argBindings(["placeholder"])} />
              <tedi-feedback-text text="pp.kk.aaaa" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-opt-shortcuts">Kuupäevaväli otseteedega</label>
              <tedi-date-field inputId="date-opt-shortcuts" [formControl]="shortcutControl" ${argBindings(["placeholder"])} />
              <div class="flex gap-2">
                <button tedi-button variant="neutral" size="small" type="button" (click)="setToday()">Täna</button>
                <button tedi-button variant="neutral" size="small" type="button" (click)="setTomorrow()">Homme</button>
              </div>
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "Common field add-ons: a plain field, a field with a format hint via `tedi-feedback-text`, and shortcut buttons. Shortcuts are not a DateField input — project them into the `tedi-form-field` (its catch-all slot renders them in the field's column flow, below the input/feedback) and wire them to the same control.",
      },
    },
  },
};

export const ValueType: Story = {
  render: (args) => {
    const single = new FormControl<Date | null>(null);
    const singleWithValue = new FormControl<Date | null>(inThreeDays);
    const multiple = new FormControl<Date[] | null>([inThreeDays, inTenDays]);
    const range = new FormControl<DateRange | null>({
      from: inThreeDays,
      to: inTenDays,
    });
    return {
      props: { ...args, single, singleWithValue, multiple, range },
      template: `
        <tedi-row [cols]="1" [gap]="3">
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-vt-single">Üksik kuupäev</label>
              <tedi-date-field inputId="date-vt-single" [formControl]="single" placeholder="pp.kk.aaaa" ${argBindings(["mode", "placeholder"])} />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-vt-single-value">Üksik kuupäev vaikeväärtusega</label>
              <tedi-date-field inputId="date-vt-single-value" [formControl]="singleWithValue" ${argBindings(["mode", "placeholder"])} />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-vt-multiple">Mitu kuupäeva</label>
              <tedi-date-field inputId="date-vt-multiple" mode="multiple" [formControl]="multiple" ${argBindings(["mode", "placeholder"])} />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-vt-range">Vahemik</label>
              <tedi-date-field inputId="date-vt-range" mode="range" [formControl]="range" ${argBindings(["mode", "placeholder"])} />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "The value type follows `mode`: `single` → `Date`, `multiple` → `Date[]` (rendered as removable tags), `range` → `{ from, to }`.",
      },
    },
  },
};

export const MultipleTagLayout: Story = {
  render: (args) => {
    const dates = Array.from(
      { length: 6 },
      (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i),
    );
    const wrapControl = new FormControl<Date[] | null>(dates);
    const singleRowControl = new FormControl<Date[] | null>(dates);
    return {
      props: { ...args, wrapControl, singleRowControl },
      template: `
        <tedi-row [cols]="1" [gap]="3">
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-tags-wrap">Mitmerealine (vaikimisi)</label>
              <tedi-date-field inputId="date-tags-wrap" mode="multiple" [multiRow]="true" [formControl]="wrapControl" ${argBindings(["mode", "multiRow", "tagEllipsis"])} />
              <tedi-feedback-text text="Sildid murduvad uutele ridadele; välja kõrgus kasvab." />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-tags-single">Üherealine + loendur</label>
              <tedi-date-field inputId="date-tags-single" mode="multiple" [multiRow]="false" tagEllipsis="start" [formControl]="singleRowControl" ${argBindings(["mode", "multiRow", "tagEllipsis"])} />
              <tedi-feedback-text text="Sildid püsivad ühel real; ülejääk koondub +N loendurisse. Kitsad sildid lühenevad algusest (…06.2026)." />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`multiRow` controls how `multiple`-mode tags lay out. `true` (default) wraps them across rows and grows the field height — like the React MultiValueField. `false` keeps a single row and collapses the overflow into a `+N` counter (the overflow count is measured from the available width, like Select).",
      },
    },
  },
};

export const OnClickType: Story = {
  render: (args) => {
    const buttonControl = new FormControl<Date | null>(null);
    const inputControl = new FormControl<Date | null>(null);
    return {
      props: { ...args, buttonControl, inputControl },
      template: `
        <tedi-row [gap]="3" [xs]="{ cols: 1 }" [lg]="{ cols: 2 }">
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-trigger-button">Kalendriikoon on klõpsatav</label>
              <tedi-date-field inputId="date-trigger-button" [formControl]="buttonControl" calendarTrigger="button" ${argBindings(["calendarTrigger"])} />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-trigger-input">Sisestusväli on klõpsatav</label>
              <tedi-date-field inputId="date-trigger-input" [formControl]="inputControl" calendarTrigger="input" ${argBindings(["calendarTrigger"])} />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`calendarTrigger` decides what opens the calendar: `\"button\"` (the icon, default) or `\"input\"` (the whole input — typing is then blocked).",
      },
    },
  },
};

export const Range: Story = {
  args: { mode: "range" },
  render: (args) => {
    const defaultRange = new FormControl<DateRange | null>(null);
    const limitsRange = new FormControl<DateRange | null>(null);
    const startOnly = new FormControl<DateRange | null>({
      from: today,
      to: undefined,
    });
    const disabledPastRange = new FormControl<DateRange | null>(null);
    const multipleMonthsRange = new FormControl<DateRange | null>(null);
    const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    return {
      props: {
        ...args,
        defaultRange,
        limitsRange,
        startOnly,
        disabledPastRange,
        multipleMonthsRange,
        twoMonthsAgo,
        rangeMaxDate: today,
      },
      template: `
        <tedi-row [gap]="3" [xs]="{ cols: 1 }" [lg]="{ cols: 2 }">
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="range-default">Vaikimisi vahemik</label>
              <tedi-date-field inputId="range-default" [formControl]="defaultRange" ${argBindings(["numberOfMonths", "disablePast"])} />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="range-limits">Vahemik min/max piiranguga</label>
              <tedi-date-field inputId="range-limits" [formControl]="limitsRange" [minDate]="twoMonthsAgo" [maxDate]="rangeMaxDate" ${argBindings(["numberOfMonths", "disablePast"])} />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="range-start-only">Ainult alguskuupäev</label>
              <tedi-date-field inputId="range-start-only" [formControl]="startOnly" ${argBindings(["numberOfMonths", "disablePast"])} />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="range-disabled-past">Vahemik keelatud minevikuga</label>
              <tedi-date-field inputId="range-disabled-past" [formControl]="disabledPastRange" [disablePast]="true" ${argBindings(["numberOfMonths", "disablePast"])} />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="range-multiple-months">Vahemik mitme kuuga</label>
              <tedi-date-field inputId="range-multiple-months" [formControl]="multipleMonthsRange" [numberOfMonths]="2" ${argBindings(["numberOfMonths", "disablePast"])} />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`mode='range'` builds a `{ from, to }` value across two clicks. It combines with the same constraint inputs as single mode (`minDate`/`maxDate`, `disablePast`) and with `numberOfMonths` for a multi-month view. All fields honour the shared controls (e.g. set `modal` to open them in a modal).",
      },
    },
  },
};

export const DisabledWeekends: Story = {
  args: {
    inputId: "date-weekends",
    disabledMatcher: { dayOfWeek: [0, 6] },
    feedback: "Nädalavahetused ei ole valitavad.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pass a `{ dayOfWeek: number[] }` matcher to `disabledMatchers` (0 = Sunday … 6 = Saturday) to grey out recurring weekdays. The `disabledMatchers` input also accepts single dates, ranges and predicate functions.",
      },
    },
  },
};

export const ShowWeekCount: Story = {
  args: {
    inputId: "date-week-count",
    showWeekNumbers: true,
    feedback: "ISO nädalanumbrid kuvatakse vasakul.",
  },
  parameters: {
    docs: {
      description: {
        story: "`showWeekNumbers` adds an ISO week-number column to the day grid.",
      },
    },
  },
};

export const MultipleMonths: Story = {
  args: {
    inputId: "date-multiple-months",
    numberOfMonths: 2,
    feedback: "Kaks kuud kuvatakse kõrvuti igal ekraanilaiusel.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`numberOfMonths` shows several months side by side. A plain number is honoured at every breakpoint — `2` stays two months even on a phone or in a modal. To narrow it on small screens, pass a per-breakpoint object instead, e.g. `[numberOfMonths]=\"{ xs: 1, lg: 2 }\"`.",
      },
    },
  },
};

export const YearGrid: Story = {
  args: {
    inputId: "date-year-grid",
    label: "Aasta",
    monthYearSelectType: "grid",
    selectionLevel: "years",
    placeholder: "aaaa",
    formatDate: (value: Date | Date[] | DateRange | null): string =>
      value instanceof Date ? `${value.getFullYear()}` : "",
    feedback: "Vali aasta — väli näitab ainult aastanumbrit.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`monthYearSelectType=\"grid\"` replaces the header dropdowns with a clickable label that drills into a year/month grid; `selectionLevel=\"years\"` commits at year granularity. A custom `formatDate` collapses the committed `Date` (Jan 1 of the year) to just the year number.",
      },
    },
  },
};

export const WithFooter: Story = {
  render: (args) => {
    const timeControl = new FormControl<Date | null>(null);
    const saveControl = new FormControl<Date | null>(null);
    return {
      props: { ...args, timeControl, saveControl },
      template: `
        <tedi-row [gap]="3" [xs]="{ cols: 1 }" [lg]="{ cols: 2 }">
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-footer-time">Kellaaeg</label>
              <tedi-date-field inputId="date-footer-time" [formControl]="timeControl" ${argBindings()}>
                <tedi-row tediCalendarFooter justifyItems="center">
                  <tedi-col>
                    <button tedi-button variant="neutral" size="small" type="button">
                      <tedi-icon name="schedule" [size]="18" />
                      Vali kellaaeg
                    </button>
                  </tedi-col>
                </tedi-row>
              </tedi-date-field>
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field [size]="size">
              <label tedi-label for="date-footer-save">Kuupäev</label>
              <tedi-date-field inputId="date-footer-save" [formControl]="saveControl" ${argBindings()}>
                <tedi-row tediCalendarFooter [cols]="2" [gapX]="2">
                  <tedi-col>
                    <button tedi-button class="w-100" variant="secondary" size="small" type="button">Tühista</button>
                  </tedi-col>
                  <tedi-col>
                    <button tedi-button class="w-100" size="small" type="button">Salvesta</button>
                  </tedi-col>
                </tedi-row>
              </tedi-date-field>
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "Anything projected with the `tediCalendarFooter` attribute renders below the calendar body. Two common patterns: a link to a sibling picker (icon on the left, per Figma) and a full-width Cancel + Save pair. Footer projection works in popover mode; the modal variant does not currently receive projected footers.",
      },
    },
  },
};

export const AvailableDays: Story = {
  args: {
    inputId: "date-available",
    availableDays: [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6),
    ],
    feedback: "Ainult esiletõstetud päevad on valitavad.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`availableDays` (a `Date[]` or a predicate) restricts selection to specific days — every other day is disabled. Use `unavailableDays` for the inverse.",
      },
    },
  },
};

export const NativePicker: Story = {
  args: {
    inputId: "date-native",
    useNativePicker: true,
    feedback: "Kasutab operatsioonisüsteemi kuupäevavalijat igal ekraanilaiusel.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`[useNativePicker]=\"true\"` swaps the popover for the browser's built-in `<input type=\"date\">` UI (single mode only). The prop accepts `boolean | sm | md | lg | xl` and **defaults to `false`**. Pass a breakpoint name like `\"md\"` for native on phones and the custom popover from `md` upward.",
      },
    },
  },
};

export const MobileModal: Story = {
  render: () => {
    const centeredControl = new FormControl<Date | null>(null);
    const fullscreenControl = new FormControl<Date | null>(null);
    return {
      props: { centeredControl, fullscreenControl },
      template: `
        <tedi-row cols="1" [md]="{ cols: 2 }" [gap]="3">
          <tedi-col>
            <p tedi-text modifiers="small bold">Centered modal (modal=true)</p>
            <tedi-form-field>
              <label tedi-label for="date-modal-centered">Kuupäev</label>
              <tedi-date-field
                inputId="date-modal-centered"
                [formControl]="centeredControl"
                [modal]="true"
                [useNativePicker]="false"
              />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <p tedi-text modifiers="small bold">Fullscreen modal (modal=true, fullscreen=true)</p>
            <tedi-form-field>
              <label tedi-label for="date-modal-fullscreen">Kuupäev</label>
              <tedi-date-field
                inputId="date-modal-fullscreen"
                [formControl]="fullscreenControl"
                [modal]="true"
                [fullscreen]="true"
                [useNativePicker]="false"
              />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "`[modal]=\"true\"` opens the calendar in a modal (with explicit Cancel/Confirm) instead of the popover, holding the selection as a draft until Confirm. By default the modal is centered; add `[fullscreen]=\"true\"` to make it fill the screen — useful on small phones where vertical space is tight. Both `modal` and `fullscreen` accept the same union (`true | false | sm | md | lg | xl`), so e.g. `fullscreen=\"md\"` only goes fullscreen below `md`.",
      },
    },
  },
};

export const CustomFormatAndParse: Story = {
  args: {
    inputId: "date-custom-format",
    label: "Kuupäev (MM/dd/yyyy)",
    initialValue: inThreeDays,
    formatDate: formatUS,
    parseDate: parseUS,
    placeholder: "mm/dd/yyyy",
    feedback: "Proovi sisestada 12/24/2026.",
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

export const EnableCalendarFalse: Story = {
  args: {
    inputId: "date-no-calendar",
    enableCalendar: false,
    placeholder: "pp.kk.aaaa",
    feedback: "Ainult käsitsi sisestus — valija puudub.",
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

export const CustomLocale: Story = {
  args: {
    inputId: "date-locale",
    localeCode: "en-US",
    useNativePicker: false,
    initialValue: inThreeDays,
    feedback: "Vahetab kuude nimed, nädalapäevade nimed ja nädala esimese päeva.",
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

export const WithReactiveForms: Story = {
  render: (args) => {
    const form = new FormGroup({
      start: new FormControl<Date | null>(inThreeDays, {
        validators: [Validators.required],
      }),
      end: new FormControl<Date | null>(inTenDays),
      range: new FormControl<DateRange | null>(
        { from: inThreeDays, to: inTenDays },
        { validators: [Validators.required] },
      ),
    });

    return {
      props: { ...args, form },
      template: `
        <form [formGroup]="form">
          <tedi-row [cols]="1" [gap]="3">
            <tedi-col>
              <tedi-form-field [size]="size">
                <label tedi-label for="date-form-start" [required]="true">Alguskuupäev</label>
                <tedi-date-field inputId="date-form-start" formControlName="start" [required]="true" ${argBindings(["mode", "required"])} />
                <tedi-feedback-text text="Vali alguskuupäev." />
              </tedi-form-field>
            </tedi-col>
            <tedi-col>
              <tedi-form-field [size]="size">
                <label tedi-label for="date-form-end">Lõppkuupäev</label>
                <tedi-date-field inputId="date-form-end" formControlName="end" ${argBindings(["mode", "required"])} />
                <tedi-feedback-text text="Vali lõppkuupäev." />
              </tedi-form-field>
            </tedi-col>
            <tedi-col>
              <tedi-form-field [size]="size">
                <label tedi-label for="date-form-range" [required]="true">Kuupäevavahemik</label>
                <tedi-date-field inputId="date-form-range" formControlName="range" mode="range" [required]="true" ${argBindings(["mode", "required"])} />
                <tedi-feedback-text text="Vali algus- ja lõppkuupäev." />
              </tedi-form-field>
            </tedi-col>
            <tedi-col>
              <tedi-alert type="info" [showClose]="false">
                <pre tedi-text modifiers="small">{{ form.value | json }}</pre>
              </tedi-alert>
            </tedi-col>
          </tedi-row>
        </form>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "DateField implements `ControlValueAccessor`, so it slots into a `FormGroup` like any reactive control — including `mode=\"range\"`, whose value is a `{ from, to }` object. The block below the fields echoes the live `form.value`.",
      },
    },
  },
};
