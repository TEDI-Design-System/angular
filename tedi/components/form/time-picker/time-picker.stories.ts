import {
  Meta,
  StoryObj,
  moduleMetadata,
} from "@storybook/angular";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { TimePickerComponent } from "./time-picker.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { TextComponent } from "../../base/text/text.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.41.64?node-id=42943-146292&m=dev" target="_blank">Figma ↗</a><br />
 * Standalone time picker component with scroll-wheel and predefined time slot variants.
 * Can be used with <a href="https://angular.dev/guide/forms/reactive-forms" target="_blank">Reactive forms</a>.
 */

export default {
  title: "TEDI-Ready/Components/Form/TimePicker",
  component: TimePickerComponent,
  decorators: [
    moduleMetadata({
      imports: [TimePickerComponent, RowComponent, ColComponent, ReactiveFormsModule, AlertComponent, TextComponent],
    }),
  ],
  argTypes: {
    value: {
      description: "Selected time value in HH:mm format.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string | null" },
      },
    },
    variant: {
      description: "Visual variant of the time picker.",
      control: { type: "select" },
      options: ["scroll", "slots", "dropdown"],
      table: {
        category: "inputs",
        type: { summary: "TimePickerVariant", detail: "scroll \nslots \ndropdown" },
        defaultValue: { summary: "scroll" },
      },
    },
    minuteStep: {
      description: "Minute increment for scroll variant.",
      control: { type: "number" },
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    timeSlots: {
      description: "Array of predefined time strings for slots variant.",
      control: { type: "object" },
      table: {
        category: "inputs",
        type: { summary: "string[]" },
        defaultValue: { summary: "[]" },
      },
    },
    columns: {
      description: "Number of grid columns for slots variant.",
      control: { type: "number" },
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "3" },
      },
    },
  },
} as Meta<TimePickerComponent>;

export const Default: StoryObj<TimePickerComponent> = {
  render: () => ({
    template: `
      <div style="width: 178px;">
        <tedi-time-picker value="03:03" />
      </div>
    `,
  }),
};

export const ScrollWithStep: StoryObj<TimePickerComponent> = {
  render: () => ({
    template: `
      <div style="width: 178px;">
        <tedi-time-picker value="14:30" [minuteStep]="5" />
      </div>
    `,
  }),
};

export const Slots: StoryObj<TimePickerComponent> = {
  render: () => ({
    props: {
      slots: ["09:30", "10:00", "11:30", "15:30", "18:30", "20:30"],
    },
    template: `
      <tedi-time-picker
        variant="slots"
        value="11:30"
        [timeSlots]="slots"
        [columns]="3"
      />
    `,
  }),
};

export const Dropdown: StoryObj<TimePickerComponent> = {
  render: () => ({
    props: {
      slots: ["12:30", "13:00", "13:30", "14:00", "14:30"],
    },
    template: `
      <div style="width: 200px;">
        <tedi-time-picker
          variant="dropdown"
          value="13:30"
          [timeSlots]="slots"
        />
      </div>
    `,
  }),
};

export const WithReactiveForms: StoryObj<TimePickerComponent> = {
  render: () => {
    const control = new FormControl<string | null>("14:30");

    return {
      props: { control },
      template: `
        <tedi-row cols="1" [gapY]="3">
          <tedi-col>
            <div style="width: 178px;">
              <tedi-time-picker [formControl]="control" />
            </div>
          </tedi-col>
          <tedi-col>
            <tedi-alert type="info" [showClose]="false">
              <pre tedi-text modifiers="small">{{ {
  value: control.value,
  touched: control.touched,
  dirty: control.dirty
} | json }}</pre>
            </tedi-alert>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
};
