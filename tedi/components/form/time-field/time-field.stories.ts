import {
  Meta,
  StoryObj,
  moduleMetadata,
} from "@storybook/angular";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { TimeFieldComponent } from "./time-field.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { TextComponent } from "../../base/text/text.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.41.64?node-id=4662-91741&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/73629d-time-field" target="_blank">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Form/TimeField",
  component: TimeFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormFieldComponent,
        LabelComponent,
        FeedbackTextComponent,
        RowComponent,
        ColComponent,
        ReactiveFormsModule,
        AlertComponent,
        TextComponent,
      ],
    }),
  ],
  argTypes: {
    inputId: {
      description:
        "The unique identifier for the input element that this label is associated with.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    value: {
      description:
        "Value of the input field in HH:mm format. Supports two-way binding.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string | null" },
      },
    },
    placeholder: {
      description: "Placeholder text shown when value is empty.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    size: {
      description: "Size of the time field.",
      control: { type: "select" },
      options: ["default", "small"],
      table: {
        category: "inputs",
        type: { summary: "TimeFieldSize", detail: "default \nsmall" },
        defaultValue: { summary: "default" },
      },
    },
    state: {
      description: "Visual state of the time field.",
      control: { type: "select" },
      options: ["default", "error", "valid"],
      table: {
        category: "inputs",
        type: { summary: "TimeFieldState", detail: "default \nerror \nvalid" },
        defaultValue: { summary: "default" },
      },
    },
    disabled: {
      description: "Is input disabled?",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    invalid: {
      description: "Marks the field as invalid for validation purposes.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
} as Meta<TimeFieldComponent>;

export const Default: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-form-field style="width: 200px">
        <label tedi-label for="example-id">Label</label>
        <tedi-time-field inputId="example-id" />
      </tedi-form-field>
    `,
  }),
};

export const Sizes: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row class="example-list" cols="1" gapY="3">
        <tedi-row cols="2" alignItems="center" class="padding-14-16 border-bottom">
          <b>Default</b>
          <tedi-form-field>
            <label tedi-label for="size-default">Label</label>
            <tedi-time-field inputId="size-default" />
          </tedi-form-field>
        </tedi-row>
        <tedi-row cols="2" alignItems="center" class="padding-14-16">
          <b>Small</b>
          <tedi-form-field size="small">
            <label tedi-label for="size-small">Label</label>
            <tedi-time-field inputId="size-small" size="small" />
          </tedi-form-field>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const States: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="1" gapY="3">
        <tedi-row cols="2" alignItems="center">
          <b>Default</b>
          <tedi-form-field>
            <label tedi-label for="state-default">Label</label>
            <tedi-time-field inputId="state-default" />
          </tedi-form-field>
        </tedi-row>
        <tedi-row cols="2" alignItems="center">
          <b>With value</b>
          <tedi-form-field>
            <label tedi-label for="state-value">Label</label>
            <tedi-time-field inputId="state-value" value="12:00" />
          </tedi-form-field>
        </tedi-row>
        <tedi-row cols="2" alignItems="center">
          <b>With placeholder</b>
          <tedi-form-field>
            <label tedi-label for="state-placeholder">Label</label>
            <tedi-time-field inputId="state-placeholder" placeholder="hh:mm" />
          </tedi-form-field>
        </tedi-row>
        <tedi-row cols="2" alignItems="center">
          <b>Error</b>
          <tedi-form-field>
            <label tedi-label for="state-error">Label</label>
            <tedi-time-field inputId="state-error" state="error" value="12:00" />
            <tedi-feedback-text text="Feedback text" type="error" position="left" />
          </tedi-form-field>
        </tedi-row>
        <tedi-row cols="2" alignItems="center">
          <b>Success</b>
          <tedi-form-field>
            <label tedi-label for="state-success">Label</label>
            <tedi-time-field inputId="state-success" state="valid" value="12:00" />
            <tedi-feedback-text text="Feedback text" type="valid" position="left" />
          </tedi-form-field>
        </tedi-row>
        <tedi-row cols="2" alignItems="center">
          <b>Disabled</b>
          <tedi-form-field>
            <label tedi-label for="state-disabled">Label</label>
            <tedi-time-field inputId="state-disabled" [disabled]="true" />
          </tedi-form-field>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const WithValue: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label for="example-value">Label</label>
        <tedi-time-field inputId="example-value" value="14:30" />
      </tedi-form-field>
    `,
  }),
};

export const WithPlaceholder: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label for="example-placeholder">Label</label>
        <tedi-time-field inputId="example-placeholder" placeholder="hh:mm" />
      </tedi-form-field>
    `,
  }),
};

export const WithHint: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label for="example-hint">Label</label>
        <tedi-time-field inputId="example-hint" />
        <tedi-feedback-text text="Hint text" type="hint" position="left" />
      </tedi-form-field>
    `,
  }),
};

export const WithError: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label for="example-error">Label</label>
        <tedi-time-field inputId="example-error" state="error" [invalid]="true" value="12:00" />
        <tedi-feedback-text text="Please enter a valid time" type="error" position="left" />
      </tedi-form-field>
    `,
  }),
};

export const WithScrollPicker: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label for="scroll-picker">Time</label>
        <tedi-time-field inputId="scroll-picker" value="03:03" pickerVariant="scroll" />
      </tedi-form-field>
    `,
  }),
};

export const WithSlotsPicker: StoryObj<TimeFieldComponent> = {
  render: () => ({
    props: {
      slots: ["09:30", "10:00", "11:30", "15:30", "18:30", "20:30"],
    },
    template: `
      <tedi-form-field>
        <label tedi-label for="slots-picker">Time</label>
        <tedi-time-field inputId="slots-picker" value="11:30" pickerVariant="slots" [timeSlots]="slots" [columns]="3" />
      </tedi-form-field>
    `,
  }),
};

export const WithDropdownPicker: StoryObj<TimeFieldComponent> = {
  render: () => ({
    props: {
      slots: ["12:30", "13:00", "13:30", "14:00", "14:30"],
    },
    template: `
      <tedi-form-field>
        <label tedi-label for="dropdown-picker">Time</label>
        <tedi-time-field inputId="dropdown-picker" value="13:30" pickerVariant="dropdown" [timeSlots]="slots" />
      </tedi-form-field>
    `,
  }),
};

export const WithScrollPickerStep15: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label for="scroll-picker-step">Time</label>
        <tedi-time-field inputId="scroll-picker-step" value="14:30" pickerVariant="scroll" [minuteStep]="15" />
      </tedi-form-field>
    `,
  }),
};

export const WithNativePicker: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label for="native-picker">Time</label>
        <tedi-time-field inputId="native-picker" value="09:30" pickerVariant="native" />
      </tedi-form-field>
    `,
  }),
};

export const WithReactiveForms: StoryObj<TimeFieldComponent> = {
  render: () => {
    const control = new FormControl<string | null>("12:00");

    return {
      props: { control },
      template: `
        <tedi-row cols="1" [gapY]="3">
          <tedi-col>
            <tedi-form-field>
              <label tedi-label for="reactive-time">Time</label>
              <tedi-time-field inputId="reactive-time" [formControl]="control" />
            </tedi-form-field>
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
