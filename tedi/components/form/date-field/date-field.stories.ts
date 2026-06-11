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
  },
} as Meta<DateFieldComponent>;

type Story = StoryObj<DateFieldComponent>;

export const Default: Story = {
  args: {
    mode: "single",
    selectionLevel: "days",
    monthYearSelectType: "dropdown",
    localeCode: "et-EE",
    inputDisabled: false,
    readOnly: false,
    required: false,
    disablePast: false,
    disableFuture: false,
    showOutsideDays: true,
    enableCalendar: true,
    isTagRemovable: true,
  },
  render: (args) => {
    const control = new FormControl<Date | null>(null);
    return {
      props: { ...args, control },
      template: `
        <tedi-form-field [size]="size">
          <label tedi-label for="date-default" [required]="required">Kuupäev</label>
          <tedi-date-field
            inputId="date-default"
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
          />
          <tedi-feedback-text text="Vali kuupäev" />
        </tedi-form-field>
      `,
    };
  },
};

export const Size: Story = {
  render: () => ({
    template: `
      <tedi-row [cols]="1" [gap]="3">
        <tedi-col>
          <tedi-form-field size="default">
            <label tedi-label for="date-size-default">Vaikimisi</label>
            <tedi-date-field inputId="date-size-default" size="default" />
          </tedi-form-field>
        </tedi-col>
        <tedi-col>
          <tedi-form-field size="small">
            <label tedi-label for="date-size-small">Väike</label>
            <tedi-date-field inputId="date-size-small" size="small" />
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
  render: () => {
    const disabledControl = new FormControl<Date | null>(inThreeDays);
    disabledControl.disable();
    return {
      props: { disabledControl },
      template: `
        <tedi-row [cols]="1" [gap]="3">
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-state-default">Vaikimisi</label>
              <tedi-date-field inputId="date-state-default" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-state-disabled">Mitteaktiivne</label>
              <tedi-date-field inputId="date-state-disabled" [formControl]="disabledControl" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-state-valid">Õnnestumine</label>
              <tedi-date-field inputId="date-state-valid" />
              <tedi-feedback-text text="Tagasiside tekst" type="valid" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-state-error">Viga</label>
              <tedi-date-field inputId="date-state-error" />
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
  render: () => {
    const shortcutControl = new FormControl<Date | null>(null);
    const setToday = (): void =>
      shortcutControl.setValue(
        new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      );
    const setTomorrow = (): void => shortcutControl.setValue(tomorrow);
    return {
      props: { shortcutControl, setToday, setTomorrow },
      template: `
        <tedi-row [cols]="1" [gap]="3">
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-opt-default">Vaikimisi kuupäevaväli</label>
              <tedi-date-field inputId="date-opt-default" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-opt-hint">Kuupäevaväli vihjega</label>
              <tedi-date-field inputId="date-opt-hint" placeholder="pp.kk.aaaa" />
              <tedi-feedback-text text="pp.kk.aaaa" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-opt-shortcuts">Kuupäevaväli otseteedega</label>
              <tedi-date-field inputId="date-opt-shortcuts" [formControl]="shortcutControl" />
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
  render: () => {
    const single = new FormControl<Date | null>(null);
    const singleWithValue = new FormControl<Date | null>(inThreeDays);
    const multiple = new FormControl<Date[] | null>([inThreeDays, inTenDays]);
    const range = new FormControl<DateRange | null>({
      from: inThreeDays,
      to: inTenDays,
    });
    return {
      props: { single, singleWithValue, multiple, range },
      template: `
        <tedi-row [cols]="1" [gap]="3">
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-vt-single">Üksik kuupäev</label>
              <tedi-date-field inputId="date-vt-single" [formControl]="single" placeholder="pp.kk.aaaa" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-vt-single-value">Üksik kuupäev vaikeväärtusega</label>
              <tedi-date-field inputId="date-vt-single-value" [formControl]="singleWithValue" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-vt-multiple">Mitu kuupäeva</label>
              <tedi-date-field inputId="date-vt-multiple" mode="multiple" [formControl]="multiple" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-vt-range">Vahemik</label>
              <tedi-date-field inputId="date-vt-range" mode="range" [formControl]="range" />
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
  render: () => {
    const dates = Array.from(
      { length: 6 },
      (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i),
    );
    const wrapControl = new FormControl<Date[] | null>(dates);
    const singleRowControl = new FormControl<Date[] | null>(dates);
    return {
      props: { wrapControl, singleRowControl },
      template: `
        <tedi-row [cols]="1" [gap]="3">
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-tags-wrap">Mitmerealine (vaikimisi)</label>
              <tedi-date-field inputId="date-tags-wrap" mode="multiple" [formControl]="wrapControl" />
              <tedi-feedback-text text="Sildid murduvad uutele ridadele; välja kõrgus kasvab." />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-tags-single">Üherealine + loendur</label>
              <tedi-date-field inputId="date-tags-single" mode="multiple" [multiRow]="false" tagEllipsis="start" [formControl]="singleRowControl" />
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
  render: () => {
    const buttonControl = new FormControl<Date | null>(null);
    const inputControl = new FormControl<Date | null>(null);
    return {
      props: { buttonControl, inputControl },
      template: `
        <tedi-row [gap]="3" [xs]="{ cols: 1 }" [lg]="{ cols: 2 }">
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-trigger-button">Kalendriikoon on klõpsatav</label>
              <tedi-date-field inputId="date-trigger-button" [formControl]="buttonControl" calendarTrigger="button" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-trigger-input">Sisestusväli on klõpsatav</label>
              <tedi-date-field inputId="date-trigger-input" [formControl]="inputControl" calendarTrigger="input" />
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
  render: () => {
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
        defaultRange,
        limitsRange,
        startOnly,
        disabledPastRange,
        multipleMonthsRange,
        twoMonthsAgo,
        maxDate: today,
      },
      template: `
        <tedi-row [gap]="3" [xs]="{ cols: 1 }" [lg]="{ cols: 2 }">
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="range-default">Vaikimisi vahemik</label>
              <tedi-date-field inputId="range-default" mode="range" [formControl]="defaultRange" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="range-limits">Vahemik min/max piiranguga</label>
              <tedi-date-field inputId="range-limits" mode="range" [formControl]="limitsRange" [minDate]="twoMonthsAgo" [maxDate]="maxDate" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="range-start-only">Ainult alguskuupäev</label>
              <tedi-date-field inputId="range-start-only" mode="range" [formControl]="startOnly" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="range-disabled-past">Vahemik keelatud minevikuga</label>
              <tedi-date-field inputId="range-disabled-past" mode="range" [formControl]="disabledPastRange" [disablePast]="true" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="range-multiple-months">Vahemik mitme kuuga</label>
              <tedi-date-field inputId="range-multiple-months" mode="range" [formControl]="multipleMonthsRange" [numberOfMonths]="2" />
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
          "`mode='range'` builds a `{ from, to }` value across two clicks. It combines with the same constraint inputs as single mode (`minDate`/`maxDate`, `disablePast`) and with `numberOfMonths` for a multi-month view.",
      },
    },
  },
};

export const DisabledWeekends: Story = {
  render: () => ({
    props: { weekendMatcher: { dayOfWeek: [0, 6] } },
    template: `
      <tedi-form-field>
        <label tedi-label for="date-weekends">Kuupäev</label>
        <tedi-date-field inputId="date-weekends" [disabled]="weekendMatcher" />
        <tedi-feedback-text text="Nädalavahetused ei ole valitavad." />
      </tedi-form-field>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Pass a `{ dayOfWeek: number[] }` matcher to `disabled` (0 = Sunday … 6 = Saturday) to grey out recurring weekdays. The `disabled` input also accepts single dates, ranges and predicate functions.",
      },
    },
  },
};

export const ShowWeekCount: Story = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label for="date-week-count">Kuupäev</label>
        <tedi-date-field inputId="date-week-count" [showWeekNumbers]="true" />
        <tedi-feedback-text text="ISO nädalanumbrid kuvatakse vasakul." />
      </tedi-form-field>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "`showWeekNumbers` adds an ISO week-number column to the day grid.",
      },
    },
  },
};

export const MultipleMonths: Story = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label for="date-multiple-months">Kuupäev</label>
        <tedi-date-field inputId="date-multiple-months" [numberOfMonths]="2" />
        <tedi-feedback-text text="Kaks kuud kuvatakse kõrvuti (alla md jääb üks kuu)." />
      </tedi-form-field>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`numberOfMonths` shows several months side by side in the popover. Below the `md` breakpoint it is clamped to a single month so the popover stays usable on phones.",
      },
    },
  },
};

export const YearGrid: Story = {
  render: () => {
    const control = new FormControl<Date | null>(null);
    const formatYear = (value: Date | Date[] | DateRange | null): string =>
      value instanceof Date ? `${value.getFullYear()}` : "";
    return {
      props: { control, formatYear },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-year-grid">Aasta</label>
          <tedi-date-field
            inputId="date-year-grid"
            [formControl]="control"
            monthYearSelectType="grid"
            selectionLevel="years"
            [formatDate]="formatYear"
            placeholder="aaaa"
          />
          <tedi-feedback-text text="Vali aasta — väli näitab ainult aastanumbrit." />
        </tedi-form-field>
      `,
    };
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
  render: () => {
    const timeControl = new FormControl<Date | null>(null);
    const saveControl = new FormControl<Date | null>(null);
    return {
      props: { timeControl, saveControl },
      template: `
        <tedi-row [gap]="3" [xs]="{ cols: 1 }" [lg]="{ cols: 2 }">
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="date-footer-time">Kellaaeg</label>
              <tedi-date-field inputId="date-footer-time" [formControl]="timeControl">
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
            <tedi-form-field>
              <label tedi-label for="date-footer-save">Kuupäev</label>
              <tedi-date-field inputId="date-footer-save" [formControl]="saveControl">
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
  render: () => {
    const control = new FormControl<Date | null>(null);
    const availableDays = [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6),
    ];
    return {
      props: { control, availableDays },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-available">Kuupäev</label>
          <tedi-date-field inputId="date-available" [formControl]="control" [availableDays]="availableDays" />
          <tedi-feedback-text text="Ainult esiletõstetud päevad on valitavad." />
        </tedi-form-field>
      `,
    };
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
  render: () => {
    const control = new FormControl<Date | null>(null);
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-native">Kuupäev</label>
          <tedi-date-field inputId="date-native" [formControl]="control" [useNativePicker]="true" />
          <tedi-feedback-text text="Kasutab operatsioonisüsteemi kuupäevavalijat igal ekraanilaiusel." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`useNativePicker=true` swaps the popover for the browser's built-in `<input type=\"date\">` UI (single mode only). The prop accepts a `BreakpointInput<boolean>` and **defaults to `{ xs: true, md: false }`** — native on phones, custom popover from `md` upward. Pass `false` to always use the custom popover.",
      },
    },
  },
};

export const ModalPicker: Story = {
  render: () => {
    const control = new FormControl<Date | null>(null);
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-modal">Kuupäev</label>
          <tedi-date-field inputId="date-modal" [formControl]="control" [modal]="true" />
          <tedi-feedback-text text="Kalender avaneb alati tsentreeritud modaalis koos Tühista/Kinnita nuppudega." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`[modal]=\"true\"` opens the calendar in a centered modal (explicit Cancel/Confirm footer) instead of the popover. The selection is held as a draft and only committed on Confirm.",
      },
    },
  },
};

export const ResponsiveModalPicker: Story = {
  render: () => {
    const control = new FormControl<Date | null>(null);
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-modal-md">Kuupäev</label>
          <tedi-date-field inputId="date-modal-md" [formControl]="control" modal="md" [useNativePicker]="false" />
          <tedi-feedback-text text="Alates md hüpikuna, alla md modaalina. Muuda lõuendi suurust, et vahetust näha." />
        </tedi-form-field>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`modal=\"md\"` opens the calendar in a modal only below the `md` breakpoint and keeps the popover above it — pass a different breakpoint name to shift the threshold. (`useNativePicker` is set to `false` here so the modal shows on phones instead of the native default.)",
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
          <label tedi-label for="date-custom-format">Kuupäev (MM/dd/yyyy)</label>
          <tedi-date-field
            inputId="date-custom-format"
            [formControl]="control"
            [formatDate]="formatUS"
            [parseDate]="parseUS"
            placeholder="mm/dd/yyyy"
          />
          <tedi-feedback-text text="Proovi sisestada 12/24/2026." />
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

export const EnableCalendarFalse: Story = {
  render: () => {
    const control = new FormControl<Date | null>(null);
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-no-calendar">Kuupäev</label>
          <tedi-date-field
            inputId="date-no-calendar"
            [formControl]="control"
            [enableCalendar]="false"
            placeholder="pp.kk.aaaa"
          />
          <tedi-feedback-text text="Ainult käsitsi sisestus — valija puudub." />
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

export const CustomLocale: Story = {
  render: () => {
    const control = new FormControl<Date | null>(inThreeDays);
    return {
      props: { control },
      template: `
        <tedi-form-field>
          <label tedi-label for="date-locale">Kuupäev</label>
          <tedi-date-field
            inputId="date-locale"
            [formControl]="control"
            localeCode="en-US"
            [useNativePicker]="false"
          />
          <tedi-feedback-text text="Vahetab kuude nimed, nädalapäevade nimed ja nädala esimese päeva." />
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

export const WithReactiveForms: Story = {
  render: () => {
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
      props: { form },
      template: `
        <form [formGroup]="form">
          <tedi-row [cols]="1" [gap]="3">
            <tedi-col>
              <tedi-form-field>
                <label tedi-label for="date-form-start" [required]="true">Alguskuupäev</label>
                <tedi-date-field inputId="date-form-start" formControlName="start" [required]="true" [useNativePicker]="false" />
                <tedi-feedback-text text="Vali alguskuupäev." />
              </tedi-form-field>
            </tedi-col>
            <tedi-col>
              <tedi-form-field>
                <label tedi-label for="date-form-end">Lõppkuupäev</label>
                <tedi-date-field inputId="date-form-end" formControlName="end" [useNativePicker]="false" />
                <tedi-feedback-text text="Vali lõppkuupäev." />
              </tedi-form-field>
            </tedi-col>
            <tedi-col>
              <tedi-form-field>
                <label tedi-label for="date-form-range" [required]="true">Kuupäevavahemik</label>
                <tedi-date-field inputId="date-form-range" formControlName="range" mode="range" [required]="true" />
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
