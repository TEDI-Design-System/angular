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

const PSEUDO_STATE = ["Default", "Hover", "Active", "Disabled", "Focus"];

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
    invalid: {
      description:
        "Manually mark the field as invalid. Sets `aria-invalid` on the input and triggers the form-field's invalid styling. Combines with the form-control validity state from reactive forms.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
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
        "Picker variant. `none` renders just the input with no picker UI — typed input is still normalized on blur.",
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
        "Use the OS native time picker: `true` always, `false` never, breakpoint name (`sm | md | lg | xl`) means native below that breakpoint. When resolved to `true`, overrides `pickerVariant` and `modal`.",
      control: { type: "select" },
      options: [true, false, "sm", "md", "lg", "xl"],
      table: {
        category: "inputs",
        type: {
          summary: "TimeFieldUseNativePicker",
          detail: "boolean \nsm \nmd \nlg \nxl",
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
    fullscreen: {
      description:
        "Render the picker modal fullscreen: `true` always, `false` never, breakpoint name (`sm | md | lg | xl`) means fullscreen below that breakpoint. Only applies when the picker opens as a modal.",
      control: { type: "select" },
      options: [true, false, "sm", "md", "lg", "xl"],
      table: {
        category: "inputs",
        type: {
          summary: "TimeFieldFullscreen",
          detail: "boolean \nsm \nmd \nlg \nxl",
        },
        defaultValue: { summary: "false" },
      },
    },
  },
} as Meta<TimeFieldComponent>;

export const Default: StoryObj = {
  args: {
    inputId: "example-id",
    value: null,
    placeholder: "tt:mm",
    invalid: false,
    disabled: false,
    clearable: true,
    pickerVariant: "scroll",
    useNativePicker: false,
    pickerTrigger: "button",
    closeOnSelect: false,
    timeSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
    columns: 3,
    minuteStep: 1,
    modal: "md",
    fullscreen: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="example-id">Aeg</label>
            <tedi-time-field
              [inputId]="inputId"
              [(value)]="value"
              [placeholder]="placeholder"
              [invalid]="invalid"
              [disabled]="disabled"
              [clearable]="clearable"
              [pickerVariant]="pickerVariant"
              [useNativePicker]="useNativePicker"
              [pickerTrigger]="pickerTrigger"
              [closeOnSelect]="closeOnSelect"
              [timeSlots]="timeSlots"
              [columns]="columns"
              [minuteStep]="minuteStep"
              [modal]="modal"
              [fullscreen]="fullscreen"
            />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const Sizes: StoryObj = {
  render: () => ({
    template: `
      <tedi-row class="example-list" cols="1" gapY="3">
        <tedi-row cols="1" [md]="{ cols: 2 }" alignItems="center" class="padding-14-16 border-bottom">
          <b>Default</b>
          <tedi-form-field>
            <label tedi-label for="size-default">Aeg</label>
            <tedi-time-field inputId="size-default" />
          </tedi-form-field>
        </tedi-row>
        <tedi-row cols="1" [md]="{ cols: 2 }" alignItems="center" class="padding-14-16">
          <b>Small</b>
          <tedi-form-field size="small">
            <label tedi-label for="size-small">Aeg</label>
            <tedi-time-field inputId="size-small" />
          </tedi-form-field>
        </tedi-row>
      </tedi-row>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Field size is controlled by the surrounding `<tedi-form-field size=\"small\">` — the `tedi-time-field` itself has no `size` input.",
      },
    },
  },
};

export const States: StoryObj = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  render: () => ({
    props: { PSEUDO_STATE },
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        @for (state of PSEUDO_STATE; track state) {
          <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
            <tedi-col width="1">
              <p tedi-text modifiers="bold">{{ state }}</p>
            </tedi-col>
            <tedi-col width="5">
              <tedi-form-field>
                <label tedi-label [for]="state">Aeg</label>
                <tedi-time-field
                  [inputId]="state"
                  [value]="state === 'Disabled' ? '12:00' : null"
                  [disabled]="state === 'Disabled'"
                />
              </tedi-form-field>
            </tedi-col>
          </tedi-row>
        }
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">Error</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-form-field>
              <label tedi-label for="state-error">Aeg</label>
              <tedi-time-field inputId="state-error" [invalid]="true" value="12:00" />
              <tedi-feedback-text text="Tagasiside tekst" type="error" />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">Success</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-form-field>
              <label tedi-label for="state-success">Aeg</label>
              <tedi-time-field inputId="state-success" value="12:00" />
              <tedi-feedback-text text="Tagasiside tekst" type="valid" />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const FieldOptions: StoryObj = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-row cols="1" gapY="3">
            <tedi-form-field>
              <label tedi-label for="opts-default">Default time field</label>
              <tedi-time-field inputId="opts-default" />
            </tedi-form-field>
            <tedi-form-field>
              <label tedi-label for="opts-hint">Time field with hint</label>
              <tedi-time-field inputId="opts-hint" />
              <tedi-feedback-text text="Vihjetekst" type="hint" />
            </tedi-form-field>
          </tedi-row>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const ValueType: StoryObj = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-row cols="1" gapY="3">
            <tedi-form-field>
              <label tedi-label for="value-default">Aeg</label>
              <tedi-time-field inputId="value-default" />
            </tedi-form-field>
            <tedi-form-field>
              <label tedi-label for="value-placeholder">Aeg</label>
              <tedi-time-field inputId="value-placeholder" placeholder="tt:mm" />
            </tedi-form-field>
            <tedi-form-field>
              <label tedi-label for="value-set">Aeg</label>
              <tedi-time-field inputId="value-set" value="13:00" />
            </tedi-form-field>
          </tedi-row>
        </tedi-col>
      </tedi-row>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Default empty field, with placeholder, and with a pre-filled value.",
      },
    },
  },
};

export const OnClickType: StoryObj = {
  render: () => ({
    template: `
      <tedi-row cols="1" gapY="3">
        <tedi-col>
          <tedi-row cols="1" [md]="{ cols: 3 }">
            <tedi-col>
              <p tedi-text>Clock button is clickable</p>
              <tedi-form-field>
                <label tedi-label for="trigger-button">Aeg</label>
                <tedi-time-field inputId="trigger-button" value="03:03" pickerTrigger="button" />
              </tedi-form-field>
            </tedi-col>
          </tedi-row>
        </tedi-col>
        <tedi-col>
          <tedi-row cols="1" [md]="{ cols: 3 }">
            <tedi-col>
              <p tedi-text>Input is clickable</p>
              <tedi-form-field>
                <label tedi-label for="trigger-input">Aeg</label>
                <tedi-time-field inputId="trigger-input" value="03:03" pickerTrigger="input" />
              </tedi-form-field>
            </tedi-col>
          </tedi-row>
        </tedi-col>
      </tedi-row>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`pickerTrigger` controls how the picker opens: `button` (default) opens it only from the clock icon (popover anchored to the icon); `input` opens it from anywhere in the field (popover anchored to the field, left-aligned and matched to the input width).",
      },
    },
  },
};

export const PredefinedTimeSlots: StoryObj = {
  render: () => ({
    props: {
      slots: ["09:30", "10:00", "11:30", "15:30", "18:30", "20:30"],
    },
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }" [gap]="3">
        <tedi-col>
          <p tedi-text modifiers="small bold">Input trigger (recommended)</p>
          <tedi-form-field>
            <label tedi-label for="slots-picker-input">Aeg</label>
            <tedi-time-field inputId="slots-picker-input" value="11:30" pickerVariant="slots" [timeSlots]="slots" [columns]="3" pickerTrigger="input" />
          </tedi-form-field>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="small bold">Radio buttons (showSlotIndicator)</p>
          <tedi-form-field>
            <label tedi-label for="slots-picker-radio">Aeg</label>
            <tedi-time-field inputId="slots-picker-radio" value="11:30" pickerVariant="slots" [timeSlots]="slots" [columns]="3" [showSlotIndicator]="true" pickerTrigger="input" />
          </tedi-form-field>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="small bold">Button trigger</p>
          <tedi-form-field>
            <label tedi-label for="slots-picker-button">Aeg</label>
            <tedi-time-field inputId="slots-picker-button" value="11:30" pickerVariant="slots" [timeSlots]="slots" [columns]="3" pickerTrigger="button" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Predefined time slots rendered as a grid of selectable cards. Set `[showSlotIndicator]=\"true\"` to surface the radio indicator dot. When the picker offers a fixed set of choices (`slots` / `dropdown`), prefer `pickerTrigger=\"input\"` so the user is signalled the input is not free-form — button-trigger is shown for completeness.",
      },
    },
  },
};

export const Dropdown: StoryObj = {
  render: () => ({
    props: {
      slots: ["12:30", "13:00", "13:30", "14:00", "14:30"],
    },
    template: `
      <tedi-row cols="1" [md]="{ cols: 2 }" [gap]="3">
        <tedi-col>
          <p tedi-text modifiers="small bold">Button trigger</p>
          <tedi-form-field>
            <label tedi-label for="dropdown-picker-button">Aeg</label>
            <tedi-time-field inputId="dropdown-picker-button" value="13:30" pickerVariant="dropdown" [timeSlots]="slots" [closeOnSelect]="true" pickerTrigger="button" />
          </tedi-form-field>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="small bold">Input trigger (recommended for dropdown)</p>
          <tedi-form-field>
            <label tedi-label for="dropdown-picker-input">Aeg</label>
            <tedi-time-field inputId="dropdown-picker-input" value="13:30" pickerVariant="dropdown" [timeSlots]="slots" [closeOnSelect]="true" pickerTrigger="input" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const CustomStep: StoryObj = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="scroll-picker-step">Time with 15-min steps</label>
            <tedi-time-field inputId="scroll-picker-step" value="14:30" pickerVariant="scroll" [minuteStep]="15" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`minuteStep` sets the increment between minute values on the scroll wheel. `[minuteStep]=\"15\"` renders the minute wheel as `00, 15, 30, 45`. Any divisor of 60 works (`1`, `5`, `10`, `15`, `20`, `30`).",
      },
    },
  },
};

export const NativePicker: StoryObj = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 2 }" [gap]="3">
        <tedi-col>
          <p tedi-text modifiers="small bold">Always native (useNativePicker=true)</p>
          <tedi-form-field>
            <label tedi-label for="native-picker">Aeg</label>
            <tedi-time-field inputId="native-picker" value="09:30" [useNativePicker]="true" />
          </tedi-form-field>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="small bold">Responsive (useNativePicker=md)</p>
          <tedi-form-field>
            <label tedi-label for="responsive-native">Aeg</label>
            <tedi-time-field
              inputId="responsive-native"
              value="09:30"
              pickerVariant="scroll"
              useNativePicker="md"
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
          "Use the browser's built-in `<input type=\"time\">` UI instead of the custom popover. `[useNativePicker]=\"true\"` forces it everywhere; a breakpoint name like `useNativePicker=\"md\"` uses the native picker below that breakpoint and the custom variant from it upward — handy for native UX on phones and the custom variant on desktop.",
      },
    },
  },
};

export const FieldWithoutPicker: StoryObj = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="no-picker">Aeg</label>
            <tedi-time-field inputId="no-picker" placeholder="tt:mm" pickerVariant="none" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "When you only need a typed time entry without any picker UI, set `pickerVariant=\"none\"`. The input stays a plain text field, so the same blur-time normalization as the `ManualTyping` story applies. Use `useNativePicker` if you want the browser's `type=\"time\"` UI instead.",
      },
    },
  },
};

export const MobileModal: StoryObj = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 2 }" [gap]="3">
        <tedi-col>
          <p tedi-text modifiers="small bold">Centered modal</p>
          <tedi-form-field>
            <label tedi-label for="mobile-modal">Aeg</label>
            <tedi-time-field inputId="mobile-modal" pickerTrigger="input" />
          </tedi-form-field>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="small bold">Fullscreen modal (fullscreen=md)</p>
          <tedi-form-field>
            <label tedi-label for="fullscreen-modal">Aeg</label>
            <tedi-time-field
              inputId="fullscreen-modal"
              pickerTrigger="input"
              modal="md"
              fullscreen="md"
            />
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
          "Below the `md` breakpoint, the picker opens in a modal with explicit Cancel/Confirm buttons instead of a popover. By default the modal is centered; add `fullscreen=\"md\"` to make it fullscreen on the same breakpoint — useful on small phones where vertical space is tight. Both `modal` and `fullscreen` accept the same union (`true | false | sm | md | lg | xl`).",
      },
    },
  },
};

export const ManualTyping: StoryObj = {
  render: () => ({
    template: `
      <tedi-row cols="1" [md]="{ cols: 3 }">
        <tedi-col>
          <tedi-form-field>
            <label tedi-label for="input-formatting">Type a time and tab out</label>
            <tedi-time-field inputId="input-formatting" placeholder="tt:mm" pickerVariant="none" />
            <tedi-feedback-text text="Try 1155, 930, 11.55, or 9:5" type="hint" position="left" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
On blur, typed input is normalized to the canonical \`HH:mm\` form.

| Input            | Normalized | Notes                                           |
| ---------------- | ---------- | ----------------------------------------------- |
| \`9:5\`            | \`09:05\`    | Single-digit hour or minute is zero-padded      |
| \`1155\`           | \`11:55\`    | 4 digits → split as \`HH\` + \`mm\`                 |
| \`930\`            | \`09:30\`    | 3 digits → split as \`H\` + \`mm\`                  |
| \`11.55\`, \`11-55\`, \`11 55\` | \`11:55\` | Any non-digit is treated as the separator |
`,
      },
    },
  },
};

export const WithReactiveForms: StoryObj = {
  render: () => {
    const control = new FormControl<string | null>("12:00");

    return {
      props: { control },
      template: `
        <tedi-row cols="1" [gap]="3">
          <tedi-col>
            <tedi-row cols="1" [md]="{ cols: 3 }">
              <tedi-col>
                <tedi-form-field>
                  <label tedi-label for="reactive-time">Aeg</label>
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
