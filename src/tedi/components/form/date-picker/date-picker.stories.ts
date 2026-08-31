import {
  type Meta,
  type StoryObj,
  argsToTemplate,
  moduleMetadata,
} from "@storybook/angular";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { DatePickerComponent } from "./date-picker.component";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { TextComponent } from "../../base/text/text.component";
import { LabelComponent } from "../label/label.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.23.39?node-id=9938-87564&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/15bd6e-date-field" target="_blank">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Form/DatePicker",
  component: DatePickerComponent,
  parameters: {
    status: {
      type: ["partiallyTediReady", "deprecated"],
    },
  },
  decorators: [
    moduleMetadata({
      imports: [
        DatePickerComponent,
        ReactiveFormsModule,
        AlertComponent,
        TextComponent,
        LabelComponent,
      ],
    }),
  ],
  argTypes: {
    selected: {
      description: "Selected date",
      control: { type: "date" },
      table: {
        category: "inputs",
        type: { summary: "Date | null" },
        defaultValue: { summary: "null" },
      },
    },
    month: {
      description: "Currently shown month",
      control: { type: "date" },
      table: {
        category: "inputs",
        type: { summary: "Date | null" },
        defaultValue: { summary: "new Date()" },
      },
    },
    disabledMatchers: {
      description: "Disabled dates that cannot be selected.",
      control: { type: "object" },
      table: {
        category: "inputs",
        type: {
          summary: "DatePickerMatcher | DatePickerMatcher[] | null",
          detail: `Date \n| Date[] \n| { before: Date } \n| { after: Date } \n| { from: Date; to?: Date } \n| ((date: Date) => boolean)
          `,
        },
        defaultValue: { summary: "null" },
      },
    },
    disabled: {
      description:
        "@deprecated Use `disabledMatchers` instead. Binding `[disabled]` together with `[formControl]` clashes with the boolean reactive-forms `disabled`.",
      control: false,
      table: {
        category: "inputs",
        type: {
          summary: "DatePickerMatcher | DatePickerMatcher[] | null",
          detail: `Date \n| Date[] \n| { before: Date } \n| { after: Date } \n| { from: Date; to?: Date } \n| ((date: Date) => boolean)
          `,
        },
        defaultValue: { summary: "null" },
      },
    },
    showNavigation: {
      description:
        "Shows or hides the calendar navigation controls (previous/next month buttons).",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    monthMode: {
      description: "Month selector mode: none | label | grid | dropdown",
      control: "radio",
      options: ["none", "label", "grid", "dropdown"],
      table: {
        category: "inputs",
        type: {
          summary: "DatePickerSelectorMode",
          detail: "none | label | grid | dropdown",
        },
        defaultValue: { summary: "dropdown" },
      },
    },
    yearMode: {
      description: "Year selector mode: none | label | grid | dropdown",
      control: "radio",
      options: ["none", "label", "grid", "dropdown"],
      table: {
        category: "inputs",
        type: {
          summary: "DatePickerSelectorMode",
          detail: "none | label | grid | dropdown",
        },
        defaultValue: { summary: "dropdown" },
      },
    },
    startYear: {
      description:
        "Explicit starting year for the year dropdown list. If null, a dynamic fallback range (current year - 100) is used.",
      control: { type: "number" },
      table: {
        category: "inputs",
        type: { summary: "number | null" },
        defaultValue: { summary: "null" },
      },
    },
    endYear: {
      description:
        "Explicit ending year for the year dropdown list. If null, a dynamic fallback range (current year + 20) is used.",
      control: { type: "number" },
      table: {
        category: "inputs",
        type: { summary: "number | null" },
        defaultValue: { summary: "null" },
      },
    },
    inputId: {
      description: "Input id",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    inputPlaceholder: {
      description: "Input placeholder",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    inputState: {
      control: "radio",
      options: ["default", "error", "valid"],
      description: "Input state",
      table: {
        category: "inputs",
        type: {
          summary: "DatePickerInputState",
          detail: `"default" | "error" | "valid"`,
        },
        defaultValue: { summary: "default" },
      },
    },
    inputSize: {
      control: "radio",
      options: ["default", "small"],
      description: "Input size",
      table: {
        category: "inputs",
        type: { summary: "DatePickerInputSize", detail: `"default" | "small"` },
        defaultValue: { summary: "default" },
      },
    },
    inputDisabled: {
      description: "Is input disabled?",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    allowManualInput: {
      description: "Is manual typing into input allowed?",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    showWeekNumbers: {
      description: "Should show week numbers before calendar grid?",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    closeOnSelect: {
      description: "Close calendar popover after date selection",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
  },
} as Meta<DatePickerComponent>;

const today = new Date();
const inTwoDays = new Date(today);
inTwoDays.setDate(today.getDate() + 2);

export const Default: StoryObj<DatePickerComponent> = {
  args: (() => {
    const today = new Date();
    const next = new Date(today);
    next.setDate(today.getDate() + 1);

    return {
      selected: next,
      month: today,
      showNavigation: true,
      monthMode: "dropdown",
      yearMode: "dropdown",
      disabledMatchers: null,
      disabled: null,
      startYear: null,
      endYear: null,
      inputId: "date-picker-id-1",
      inputPlaceholder: "Enter date...",
      inputState: "default",
      inputSize: "default",
      inputDisabled: false,
      allowManualInput: true,
      showWeekNumbers: false,
      closeOnSelect: true,
    };
  })(),
  render: (args) => ({
    props: {
      ...args,
      selected: args.selected ? new Date(args.selected) : null,
      month: args.month ? new Date(args.month) : null,
    },
    template: `
      <tedi-date-picker ${argsToTemplate(args)} />
    `,
  }),
};

export const WithReactiveForms: StoryObj<DatePickerComponent> = {
  render: () => {
    const dateControl = new FormControl<Date | null>(new Date(2024, 5, 15));

    return {
      props: { dateControl },
      template: `
        <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
          <tedi-date-picker
            [formControl]="dateControl"
            inputId="reactive-form-date"
            inputPlaceholder="Select a date..."
          />

          <tedi-alert type="info" [showClose]="false">
            <pre tedi-text modifiers="small" style="margin: 0;">{{ {
  value: dateControl.value,
  touched: dateControl.touched,
  dirty: dateControl.dirty
} | json }}</pre>
          </tedi-alert>
        </div>
      `,
    };
  },
};

export const WithLowWidth: StoryObj<DatePickerComponent> = {
  render: (args) => {
    return {
      template: `
        <div style="display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));">
          <tedi-date-picker ${argsToTemplate(args)}
            inputPlaceholder="Select a date..."
          />
          <tedi-date-picker ${argsToTemplate(args)}
            inputPlaceholder="Select a date..."
          />
          <tedi-date-picker ${argsToTemplate(args)}
            inputPlaceholder="Select a date..."
          />
            <div>
              <label tedi-label [required]="true" [for]="'success'">Label</label>
              <tedi-date-picker [inputId]="'success'" ${argsToTemplate(args)}
            inputPlaceholder="Select a date..."
          /></div>
          <tedi-date-picker ${argsToTemplate(args)}
            inputPlaceholder="Select a date..."
          />
        </div>

      `,
    };
  },
};
