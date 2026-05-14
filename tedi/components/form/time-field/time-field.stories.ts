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
  parameters: {
    status: {
      type: ["breakpointSupport"],
    },
  },
  argTypes: {
    inputId: {
      description: "Unique ID for label association and accessibility.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    value: {
      description: "Selected time in HH:mm format. Two-way bindable.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string | null" },
        defaultValue: { summary: "null" },
      },
    },
    placeholder: {
      description: "Placeholder shown when the input is empty.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    size: {
      description: "Field size — matches the surrounding tedi-form-field.",
      control: { type: "radio" },
      options: ["default", "small"],
      table: {
        category: "inputs",
        type: { summary: "TimeFieldSize", detail: "default \nsmall" },
        defaultValue: { summary: "default" },
      },
    },
    state: {
      description: "Visual validation state.",
      control: { type: "radio" },
      options: ["default", "error", "valid"],
      table: {
        category: "inputs",
        type: { summary: "TimeFieldState", detail: "default \nerror \nvalid" },
        defaultValue: { summary: "default" },
      },
    },
    disabled: {
      description: "Disables interaction. Combines with the form-control disabled state.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    invalid: {
      description: "Marks the field as invalid for ARIA + form-field error styling.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    clearable: {
      description: "Show a clear button when the field has a value.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    pickerVariant: {
      description:
        "Picker variant. `none` renders just the input with browser HH:mm validation and no picker UI.",
      control: { type: "radio" },
      options: ["scroll", "slots", "dropdown", "none"],
      table: {
        category: "inputs",
        type: {
          summary: "TimeFieldPickerVariant",
          detail: "scroll \nslots \ndropdown \nnone",
        },
        defaultValue: { summary: "scroll" },
      },
    },
    useNativePicker: {
      description:
        "Use the OS native time picker. Accepts a breakpoint object, e.g. `{ xs: true, md: false }` to use the native picker on phones and the custom variant on larger screens. When `true`, overrides `pickerVariant` and `modal`.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: {
          summary: "BreakpointInput<boolean>",
          detail: "boolean \n{ xs: boolean; sm?: boolean; md?: boolean; lg?: boolean; xl?: boolean; xxl?: boolean }",
        },
        defaultValue: { summary: "false" },
      },
    },
    pickerTrigger: {
      description:
        "What opens the picker: only the icon (`button`) or also clicking the input (`input`).",
      control: { type: "radio" },
      options: ["button", "input"],
      table: {
        category: "inputs",
        type: { summary: "TimeFieldPickerTrigger", detail: "button \ninput" },
        defaultValue: { summary: "button" },
      },
    },
    closeOnSelect: {
      description: "Close the popover/modal as soon as the user picks a value.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    timeSlots: {
      description: "Predefined HH:mm strings for the slots and dropdown variants.",
      control: { type: "object" },
      table: {
        category: "inputs",
        type: { summary: "string[]" },
        defaultValue: { summary: "[]" },
      },
    },
    columns: {
      description: "Grid columns for the slots variant.",
      control: { type: "number" },
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "3" },
      },
    },
    minuteStep: {
      description: "Minute step for the scroll variant — e.g. 5 renders 00, 05, 10…",
      control: { type: "number" },
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    modal: {
      description:
        "Open the picker in a modal: `true` always, `false` never, breakpoint name (`sm | md | lg | xl`) means modal below that breakpoint.",
      control: { type: "select" },
      options: [true, false, "sm", "md", "lg", "xl"],
      table: {
        category: "inputs",
        type: {
          summary: "TimeFieldModal",
          detail: "boolean \nsm \nmd \nlg \nxl",
        },
        defaultValue: { summary: "md" },
      },
    },
  },
} as Meta<TimeFieldComponent>;

export const Default: StoryObj<TimeFieldComponent> = {
  args: {
    inputId: "example-id",
    placeholder: "hh:mm",
    size: "default",
    state: "default",
    disabled: false,
    invalid: false,
    clearable: true,
    pickerVariant: "scroll",
    useNativePicker: false,
    pickerTrigger: "button",
    closeOnSelect: false,
    timeSlots: [],
    columns: 3,
    minuteStep: 1,
    modal: "md",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="example-id">Label</label>
            <tedi-time-field
              [inputId]="inputId"
              [(value)]="value"
              [placeholder]="placeholder"
              [size]="size"
              [state]="state"
              [disabled]="disabled"
              [invalid]="invalid"
              [clearable]="clearable"
              [pickerVariant]="pickerVariant"
              [useNativePicker]="useNativePicker"
              [pickerTrigger]="pickerTrigger"
              [closeOnSelect]="closeOnSelect"
              [timeSlots]="timeSlots"
              [columns]="columns"
              [minuteStep]="minuteStep"
              [modal]="modal"
            />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
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
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="example-value">Label</label>
            <tedi-time-field inputId="example-value" value="14:30" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const WithPlaceholder: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="example-placeholder">Label</label>
            <tedi-time-field inputId="example-placeholder" placeholder="hh:mm" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const WithHint: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="example-hint">Label</label>
            <tedi-time-field inputId="example-hint" />
            <tedi-feedback-text text="Hint text" type="hint" position="left" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const WithError: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="example-error">Label</label>
            <tedi-time-field inputId="example-error" state="error" [invalid]="true" value="12:00" />
            <tedi-feedback-text text="Please enter a valid time" type="error" position="left" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const WithScrollPicker: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="scroll-picker">Time</label>
            <tedi-time-field inputId="scroll-picker" value="03:03" pickerVariant="scroll" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const WithSlotsPicker: StoryObj<TimeFieldComponent> = {
  render: () => ({
    props: {
      slots: ["09:30", "10:00", "11:30", "15:30", "18:30", "20:30"],
    },
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="slots-picker">Time</label>
            <tedi-time-field inputId="slots-picker" value="11:30" pickerVariant="slots" [timeSlots]="slots" [columns]="3" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const WithDropdownPicker: StoryObj<TimeFieldComponent> = {
  render: () => ({
    props: {
      slots: ["12:30", "13:00", "13:30", "14:00", "14:30"],
    },
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="dropdown-picker">Time</label>
            <tedi-time-field inputId="dropdown-picker" value="13:30" pickerVariant="dropdown" [timeSlots]="slots" [closeOnSelect]="true" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const WithScrollPickerStep15: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="scroll-picker-step">Time</label>
            <tedi-time-field inputId="scroll-picker-step" value="14:30" pickerVariant="scroll" [minuteStep]="15" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const WithNativePicker: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="native-picker">Time</label>
            <tedi-time-field inputId="native-picker" value="09:30" [useNativePicker]="true" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Native picker uses the browser's built-in `<input type=\"time\">` UI instead of the custom popover. Set `[useNativePicker]=\"true\"` to force it everywhere. The visible input becomes `type=\"time\"`, so the OS keyboard and validation kick in automatically. To use the native picker only on small viewports, see the `WithResponsiveNativePicker` story.",
      },
    },
  },
};

export const WithResponsiveNativePicker: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="responsive-native">Time</label>
            <tedi-time-field
              inputId="responsive-native"
              value="09:30"
              pickerVariant="scroll"
              [useNativePicker]="{ xs: true, md: false }"
            />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`useNativePicker` accepts a `BreakpointInput<boolean>`, so consumers can switch the picker per breakpoint. Here the OS picker is used on `xs`/`sm`, and the custom `scroll` variant takes over from `md` upward — without having to redefine `pickerVariant` for each breakpoint.",
      },
    },
  },
};

export const WithoutPicker: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="no-picker">Time</label>
            <tedi-time-field inputId="no-picker" placeholder="hh:mm" pickerVariant="none" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "When you only need a typed time entry without any picker UI, set `pickerVariant=\"none\"`. The input is rendered as `type=\"time\"` so the browser still enforces HH:mm format.",
      },
    },
  },
};

export const MobileModal: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="mobile-modal">Time</label>
            <tedi-time-field inputId="mobile-modal" pickerTrigger="input" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "On viewports below the `md` breakpoint, the picker opens in a centered modal with explicit Cancel/Confirm buttons instead of a popover. Pass a different breakpoint name to shift the threshold (e.g. `modal=\"lg\"`), `[modal]=\"true\"` to always use the modal, or `[modal]=\"false\"` to always use the popover.",
      },
    },
  },
};

export const PickerTrigger: StoryObj<TimeFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="1" gapY="3">
        <tedi-col>
          <tedi-row cols="1" [md]="{ cols: 3 }">
            <tedi-col>
              <p tedi-text>Clock button is clickable (default)</p>
              <tedi-form-field>
                <label tedi-label for="trigger-button">Time</label>
                <tedi-time-field inputId="trigger-button" pickerTrigger="button" />
              </tedi-form-field>
            </tedi-col>
          </tedi-row>
        </tedi-col>
        <tedi-col>
          <tedi-row cols="1" [md]="{ cols: 3 }">
            <tedi-col>
              <p tedi-text>Input is clickable</p>
              <tedi-form-field>
                <label tedi-label for="trigger-input">Time</label>
                <tedi-time-field inputId="trigger-input" pickerTrigger="input" />
              </tedi-form-field>
            </tedi-col>
          </tedi-row>
        </tedi-col>
      </tedi-row>
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
            <tedi-row cols="1" [md]="{ cols: 3 }">
              <tedi-col>
                <tedi-form-field>
                  <label tedi-label for="reactive-time">Time</label>
                  <tedi-time-field inputId="reactive-time" [formControl]="control" />
                </tedi-form-field>
              </tedi-col>
            </tedi-row>
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
