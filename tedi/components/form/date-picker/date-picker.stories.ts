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
      description:
        "Currently selected date. Supports two-way binding using Angular model().",
      control: { type: "date" },
      table: {
        category: "inputs",
        type: { summary: "Date | null" },
      },
    },

    min: {
      description:
        "Minimum allowed date. All dates earlier than this are disabled, including navigation to months before the limit.",
      control: { type: "date" },
      table: {
        category: "inputs",
        type: { summary: "Date | null" },
      },
    },

    max: {
      description:
        "Maximum allowed date. All dates after this are disabled, including navigation to months after the limit.",
      control: { type: "date" },
      table: {
        category: "inputs",
        type: { summary: "Date | null" },
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
        "Toggle visibility of the month selection dropdown inside the header.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },

    showYearDropdown: {
      description:
        "Toggle visibility of the year selection dropdown inside the header.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },

    startYear: {
      description:
        "Explicit starting year for the year dropdown list. If null, a dynamic fallback range is used.",
      control: { type: "number" },
      table: {
        category: "inputs",
        type: { summary: "number | null" },
        defaultValue: { summary: "null" },
      },
    },

    endYear: {
      description:
        "Explicit ending year for the year dropdown list. If null, a dynamic fallback range is used.",
      control: { type: "number" },
      table: {
        category: "inputs",
        type: { summary: "number | null" },
        defaultValue: { summary: "null" },
      },
    },
  },
} as Meta<DatePickerComponent>;

export const Default: StoryObj<DatePickerComponent> = {
  args: {
    showControls: true,
    showMonthDropdown: true,
    showYearDropdown: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-date-picker ${argsToTemplate(args)} />
    `,
  }),
};
