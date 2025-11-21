import {
  type Meta,
  type StoryObj,
  argsToTemplate,
  moduleMetadata,
} from "@storybook/angular";
import { DatePickerComponent } from "./date-picker.component";

export default {
  title: "TEDI-Ready/Components/Form/DatePicker",
  component: DatePickerComponent,
  decorators: [
    moduleMetadata({
      imports: [DatePickerComponent],
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
    disabled: {
      description: " Disabled dates that cannot be selected.",
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
    showControls: {
      description:
        "Shows or hides the calendar navigation controls (previous/next month buttons).",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    showMonthDropdown: {
      description:
        "Toggle visibility of the month selection dropdown in the header.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    showYearDropdown: {
      description:
        "Toggle visibility of the year selection dropdown in the header.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
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
      showControls: true,
      showMonthDropdown: true,
      showYearDropdown: true,
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
