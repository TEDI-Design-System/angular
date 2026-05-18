import {
  Meta,
  StoryObj,
  argsToTemplate,
  moduleMetadata,
} from "@storybook/angular";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { CalendarComponent } from "./calendar.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { TextComponent } from "../../base/text/text.component";
import type { DateRange } from "../../../utils/date.util";
import type { Matcher } from "../../../utils/matchers.util";

/**
 * <a href="https://www.tedi.ee/1ee8444b7/p/15bd6e-date-field" target="_blank">Zeroheight ↗</a>
 *
 * The Calendar is the standalone date selection surface used inside DateField, and can also be
 * embedded directly. It supports `single`, `multiple` and `range` selection modes, three commit
 * levels (`days`, `months`, `years`), available/unavailable day predicates, ISO week numbers,
 * multi-month layouts, header dropdown vs. grid month-year selection, custom locales and a
 * footer projection slot (`tediCalendarFooter`).
 */

// Lock "today" for Chromatic stability. Patches the global Date constructor
// for this stories module so the calendar's internal `new Date()` checks
// (today indicator, focusable-day fallback) resolve to a fixed reference.
const FIXED_TODAY_MS = new Date(2026, 4, 18).getTime();
const RealDate = Date;
class MockDate extends RealDate {
  constructor(...args: unknown[]) {
    if (args.length === 0) {
      super(FIXED_TODAY_MS);
      return;
    }
    super(
      ...(args as ConstructorParameters<typeof Date>),
    );
  }
  static override now(): number {
    return FIXED_TODAY_MS;
  }
}
(globalThis as unknown as { Date: typeof Date }).Date = MockDate as typeof Date;

const today = new Date(2026, 4, 18);
const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const inThreeDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
const inFiveDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
const inSevenDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
const inTenDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);
const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

export default {
  title: "TEDI-Ready/Components/Content/Calendar",
  component: CalendarComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CalendarComponent,
        ButtonComponent,
        ReactiveFormsModule,
        AlertComponent,
        TextComponent,
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
        "How the header exposes month/year picking. `dropdown` shows two dropdowns; `grid` switches the body to a month or year grid when the header label is clicked.",
      control: { type: "radio" },
      options: ["dropdown", "grid"],
      table: {
        category: "inputs",
        type: {
          summary: '"dropdown" | "grid"',
        },
        defaultValue: { summary: "dropdown" },
      },
    },
    localeCode: {
      description:
        "BCP-47 locale used for weekday/month names and the first day of the week.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "et-EE" },
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
      description: "Render the ISO week number column at the start of each row.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    showNavigation: {
      description: "Show the previous/next navigation buttons in the header.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    bordered: {
      description:
        "Render the calendar with its own outer border and rounded corners. Disable when embedding inside a surface that already has a border (e.g. the DateField overlay).",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    numberOfMonths: {
      description:
        "How many consecutive months to render side by side. Useful for date-range selection.",
      control: { type: "number" },
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    required: {
      description:
        "When `mode='multiple'`, prevents clearing the last selected date — at least one date must remain.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    inputDisabled: {
      description:
        "Disables all interactions. Combines with the reactive-forms disabled state.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabledMatchers: {
      description:
        "Array of matchers that mark dates as disabled. Each matcher can be a `Date`, `Date[]`, `{ before }`, `{ after }`, `{ before, after }`, `{ from, to? }`, `{ dayOfWeek: number[] }`, or a `(date) => boolean` function.",
      table: {
        category: "inputs",
        type: {
          summary: "Matcher[]",
          detail:
            "Date \nDate[] \n{ before: Date } \n{ after: Date } \n{ before: Date; after: Date } \n{ from: Date; to?: Date } \n{ dayOfWeek: number[] } \n(date: Date) => boolean",
        },
        defaultValue: { summary: "[]" },
      },
    },
    availableDays: {
      description:
        "Whitelist of selectable days. Either an explicit `Date[]` or a predicate `(date) => boolean`. Days outside the whitelist are visually marked as unavailable.",
      table: {
        category: "inputs",
        type: { summary: "Date[] | ((date: Date) => boolean)" },
        defaultValue: { summary: "undefined" },
      },
    },
    unavailableDays: {
      description:
        "Blacklist of explicitly unavailable days — `Date[]` or `(date) => boolean`. Takes precedence over `availableDays`.",
      table: {
        category: "inputs",
        type: { summary: "Date[] | ((date: Date) => boolean)" },
        defaultValue: { summary: "undefined" },
      },
    },
  },
  parameters: {
    backgrounds: {
      values: [{ name: "default", value: "var(--card-background-primary)" }],
      default: "default",
    },
  },
} as Meta<CalendarComponent>;

type Story = StoryObj<CalendarComponent>;

export const Default: Story = {
  args: {
    mode: "single",
    selectionLevel: "days",
    monthYearSelectType: "dropdown",
    localeCode: "et-EE",
    showOutsideDays: true,
    showWeekNumbers: false,
    showNavigation: true,
    numberOfMonths: 1,
    required: false,
    inputDisabled: false,
  },
  render: (args) => ({
    props: { ...args, currentMonth: startOfThisMonth },
    template: `<tedi-calendar [currentMonth]="currentMonth" ${argsToTemplate(args)} />`,
  }),
};

export const WithSelectedValue: Story = {
  render: () => ({
    props: {
      currentMonth: startOfThisMonth,
      selected: inThreeDays,
    },
    template: `
      <tedi-calendar
        [currentMonth]="currentMonth"
        [value]="selected"
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Single-mode calendar with a starting value preselected.",
      },
    },
  },
};

export const MultipleSelectedDates: Story = {
  render: () => {
    const control = new FormControl<Date[]>([inThreeDays, inFiveDays, inTenDays]);
    return {
      props: { control, currentMonth: startOfThisMonth },
      template: `
        <tedi-calendar
          mode="multiple"
          [currentMonth]="currentMonth"
          [formControl]="control"
        />
        <tedi-alert type="info" [showClose]="false" style="margin-top: 16px;">
          <pre tedi-text modifiers="small" style="margin: 0;">{{ control.value | json }}</pre>
        </tedi-alert>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`mode='multiple'` toggles dates in and out of a `Date[]` value. Click a selected day again to deselect it.",
      },
    },
  },
};

export const Range: Story = {
  render: () => {
    const range: DateRange = { from: inThreeDays, to: inTenDays };
    const control = new FormControl<DateRange | null>(range);
    const controlMulti = new FormControl<DateRange | null>(range);
    return {
      props: {
        control,
        controlMulti,
        currentMonth: startOfThisMonth,
      },
      template: `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <tedi-calendar
            mode="range"
            [currentMonth]="currentMonth"
            [formControl]="control"
          />
          <tedi-calendar
            mode="range"
            [currentMonth]="currentMonth"
            [formControl]="controlMulti"
            [numberOfMonths]="2"
            [showNavigation]="false"
          />
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`mode='range'` builds a `{ from, to }` range. The first click sets `from`; the second click sets `to` (or replaces `from` if it falls earlier). Pair with `numberOfMonths` to render multiple consecutive months side by side — each gets its own header.",
      },
    },
  },
};

export const MonthView: Story = {
  render: () => ({
    props: { currentMonth: startOfThisMonth },
    template: `
      <tedi-calendar
        selectionLevel="months"
        mode="single"
        [currentMonth]="currentMonth"
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "With `selectionLevel='months'` the month grid is the commit level — clicking a month sets the value instead of drilling down to days.",
      },
    },
  },
};

export const YearView: Story = {
  render: () => ({
    props: { currentMonth: startOfThisMonth },
    template: `
      <tedi-calendar
        selectionLevel="years"
        mode="single"
        [currentMonth]="currentMonth"
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "With `selectionLevel='years'` the year grid is the commit level — clicking a year sets the value instead of drilling down further.",
      },
    },
  },
};

export const Availability: Story = {
  render: () => {
    const dateOffset = (offset: number): Date =>
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const availableDays = [
      dateOffset(-1),
      dateOffset(4),
      dateOffset(5),
      dateOffset(6),
    ];
    const unavailableDays = [dateOffset(1), dateOffset(2), dateOffset(3)];
    return {
      props: {
        availableDays,
        unavailableDays,
        currentMonth: startOfThisMonth,
      },
      template: `
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <tedi-calendar
            [currentMonth]="currentMonth"
            [availableDays]="availableDays"
          />
          <tedi-calendar
            [currentMonth]="currentMonth"
            [unavailableDays]="unavailableDays"
          />
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`availableDays` whitelists specific days as selectable; `unavailableDays` does the inverse. Both accept a `Date[]` or a predicate. Left calendar marks four specific days as available; right marks three specific days as unavailable.",
      },
    },
  },
};

export const DisabledMatchers: Story = {
  render: () => {
    const matchers: Matcher[] = [
      { before: yesterday },
      { dayOfWeek: [0, 6] },
      (date: Date): boolean => date.getDate() === 15,
    ];
    return {
      props: { matchers, currentMonth: startOfThisMonth },
      template: `
        <tedi-calendar
          [currentMonth]="currentMonth"
          [disabledMatchers]="matchers"
        />
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`disabledMatchers` accepts a mix of matcher shapes. This story combines a `{ before }` matcher (all past dates), a `{ dayOfWeek }` matcher (Sun/Sat) and a predicate function (the 15th of any month).",
      },
    },
  },
};

export const WithWeeksCount: Story = {
  render: () => ({
    props: { currentMonth: startOfThisMonth },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <tedi-calendar
          [currentMonth]="currentMonth"
          [showWeekNumbers]="true"
        />
        <tedi-calendar
          [currentMonth]="currentMonth"
          [showWeekNumbers]="true"
          [numberOfMonths]="2"
          [showNavigation]="false"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Set `showWeekNumbers=true` to render ISO 8601 week numbers in a leading column. Combines with `numberOfMonths` for multi-month range pickers.",
      },
    },
  },
};

export const HeaderDropdown: Story = {
  render: () => ({
    props: { currentMonth: startOfThisMonth },
    template: `
      <tedi-calendar
        [currentMonth]="currentMonth"
        monthYearSelectType="dropdown"
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Default header — the month and year are picked from inline dropdowns. Useful when users expect fast keyboard-friendly selection.",
      },
    },
  },
};

export const HeaderGrid: Story = {
  render: () => ({
    props: { currentMonth: startOfThisMonth },
    template: `
      <tedi-calendar
        [currentMonth]="currentMonth"
        monthYearSelectType="grid"
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`monthYearSelectType='grid'` replaces the header dropdowns with a clickable label that drills the body into a month or year grid.",
      },
    },
  },
};

export const NoControls: Story = {
  render: () => ({
    props: { currentMonth: startOfThisMonth },
    template: `
      <tedi-calendar
        [currentMonth]="currentMonth"
        [showNavigation]="false"
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`showNavigation=false` hides the previous/next chevron buttons in the header — useful when the surrounding UI provides its own navigation, or when the calendar is shown in a read-only context.",
      },
    },
  },
};

export const WithLegend: Story = {
  render: () => {
    const availableDays = [inThreeDays, inFiveDays, inSevenDays, inTenDays];
    return {
      props: { availableDays, currentMonth: startOfThisMonth },
      template: `
        <tedi-calendar
          [currentMonth]="currentMonth"
          [availableDays]="availableDays"
        >
          <div
            tediCalendarFooter
            style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;"
          >
            <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
              <span style="
                width: 18px;
                height: 18px;
                border-radius: 4px;
                background: var(--form-datepicker-date-selected);
              "></span>
              Selected
            </span>
            <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
              <span style="
                width: 18px;
                height: 18px;
                border-radius: 4px;
                background: var(--form-datepicker-date-available);
                border: 1px solid var(--form-datepicker-date-text-available);
              "></span>
              Available
            </span>
          </div>
        </tedi-calendar>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "Project a legend into the `tediCalendarFooter` slot to explain colour-coded day states. Pairs naturally with `availableDays` / `unavailableDays`.",
      },
    },
  },
};

export const WithFooter: Story = {
  render: () => {
    const control = new FormControl<Date | null>(inThreeDays);
    const clear = (): void => control.setValue(null);
    return {
      props: { control, currentMonth: startOfThisMonth, clear },
      template: `
        <tedi-calendar [currentMonth]="currentMonth" [formControl]="control">
          <div tediCalendarFooter style="display: flex; justify-content: flex-end; padding: 8px 12px;">
            <button tedi-button variant="link" (click)="clear()">Clear</button>
          </div>
        </tedi-calendar>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "Anything projected with the `tediCalendarFooter` attribute renders below the calendar body. Use it for clear/today shortcuts or for surfacing the current selection.",
      },
    },
  },
};

export const InputDisabled: Story = {
  render: () => ({
    props: { currentMonth: startOfThisMonth, selected: inThreeDays },
    template: `
      <tedi-calendar
        [currentMonth]="currentMonth"
        [value]="selected"
        [inputDisabled]="true"
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`inputDisabled=true` blocks all interactions and applies the disabled visual style. The reactive-forms `disabled` state has the same effect.",
      },
    },
  },
};

export const OutsideDaysHidden: Story = {
  render: () => ({
    props: { currentMonth: startOfThisMonth },
    template: `
      <tedi-calendar
        [currentMonth]="currentMonth"
        [showOutsideDays]="false"
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Hide the trailing/leading days from neighbouring months by setting `showOutsideDays=false`. Their cells stay in the grid but are blank.",
      },
    },
  },
};

export const WithCustomLocale: Story = {
  render: () => ({
    props: { currentMonth: startOfThisMonth },
    template: `
      <tedi-calendar
        [currentMonth]="currentMonth"
        localeCode="en-US"
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Override `localeCode` (BCP-47) to switch month names, weekday names and the first day of the week. `en-US` starts the week on Sunday.",
      },
    },
  },
};
