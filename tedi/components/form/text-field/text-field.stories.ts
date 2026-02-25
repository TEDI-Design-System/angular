import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { TextFieldComponent } from "./text-field.component";
import { ColComponent, RowComponent } from "tedi/components/helpers";
import { LabelComponent } from "../label/label.component";
import { TextComponent } from "tedi/components/base";

const PSEUDO_STATE = ["Default", "Hover", "Active", "Disabled", "Focus"];

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.30.43?node-id=6060-65779&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/328d11-text-field" target="_blank">Zeroheight ↗</a>
 * Can be used with <a href="https://angular.dev/guide/forms/reactive-forms" target="_blank">Reactive forms</a> and with <a href="https://angular.dev/guide/forms/template-driven-forms" target="_blank">Template-driven forms</a>
 */

export default {
  title: "TEDI-Ready/Components/Form/TextField",
  component: TextFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [RowComponent, ColComponent, LabelComponent, TextComponent],
    }),
  ],
  argTypes: {
    inputId: {
      description:
        "The unique identifier for the input element that this label is associated with. This ID should match the input element's id attribute to ensure accessibility.",
      control: {
        type: "text",
      },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    label: {
      description:
        "The text content of the label that describes the input field.",
      control: {
        type: "text",
      },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    name: {
      description: "Name attribute for the input element.",
      control: {
        type: "text",
      },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    value: {
      description:
        "Value of the input field. Supports two-way binding, use with form controls.",
      control: {
        type: "text",
      },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    disabled: {
      description: "Whether the input is disabled.",
      control: {
        type: "boolean",
      },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    required: {
      description:
        "Indicates whether the input field is required. If set to true, the required indicator will be displayed next to the label.",
      control: {
        type: "boolean",
      },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    size: {
      description: "Input field size.",
      control: {
        type: "select",
      },
      options: ["default", "small", "large"],
      table: {
        category: "inputs",
        type: { summary: "TextFieldSize", detail: "default \nsmall" },
        defaultValue: { summary: "default" },
      },
    },
    invalid: {
      description: "Marks the field as invalid for validation purposes.",
      control: {
        type: "boolean",
      },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    placeholder: {
      description: "Placeholder text displayed inside the input.",
      control: {
        type: "text",
      },
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    icon: {
      description: "Icon name or configuration for the input field.",
      control: {
        type: "object",
      },
      table: {
        category: "inputs",
        type: { summary: "string | TextFieldIcon" },
      },
    },
    isClearable: {
      description: "Whether the input includes a clear button.",
      control: {
        type: "boolean",
      },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    readOnly: {
      description: "Whether the input is read-only.",
      control: {
        type: "boolean",
      },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    arrowsHidden: {
      description: "Whether to hide arrows for number inputs.",
      control: {
        type: "boolean",
      },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    inputAttrs: {
      description: "Additional attributes for the input element.",
      control: { type: "object" },
      table: {
        category: "inputs",
        type: { summary: "InputHTMLAttributes<HTMLInputElement>" },
      },
    },
  },
} as Meta<TextFieldComponent>;

export const Default: StoryObj<TextFieldComponent> = {
  args: {
    inputId: "example-id",
    label: "Label",
    required: false,
    value: "",
    invalid: false,
    disabled: false,
    placeholder: "Placeholder",
    icon: {
      name: "person",
    },
    isClearable: false,
    name: "",
    readOnly: false,
    arrowsHidden: true,
    inputAttrs: {},
  },
  render: (args) => ({
    props: {
      ...args,
      handleClear: () => {
        console.log("Input cleared");
      },
    },
    template: `<tedi-text-field ${argsToTemplate(args)} (clear)="handleClear($event)" />`,
  }),
};

export const Size: StoryObj<TextFieldComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row class="example-list" cols="1" gapY="3">
        <tedi-row cols="1" [sm]="{ cols: 3 }" gap="3" alignItems="center" class="padding-14-16 border-bottom">
          <p tedi-text>Default</p>
          <tedi-text-field label="Label" inputId="size-default" />
          <tedi-text-field label="Label" inputId="size-default-with-icon" icon="person" />
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 3 }" gap="3" alignItems="center" class="padding-14-16">
          <p tedi-text>Small</p>
          <tedi-text-field label="Label" inputId="size-small" size="small" />
          <tedi-text-field label="Label" inputId="size-small-with-icon" size="small" icon="person" />
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const States: StoryObj<TextFieldComponent> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  render: (args) => ({
    props: { args, PSEUDO_STATE },
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        <tedi-row cols="1" [sm]="{ cols: 6 }" *ngFor="let state of PSEUDO_STATE;" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">{{ state }}</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-text-field
              ${argsToTemplate(args)}
              [disabled]="state === 'Disabled'"
              [_forceState]="state === 'Default' ? null : state"
              label="Label"
              [inputId]="state"
              [value]="state === 'Disabled' ? 'Text value' : ''"
            />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">Error</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-text-field
              ${argsToTemplate(args)}
              [helper]="{
                text: 'Feedback text',
                type: 'error',
                position: 'left',
              }"
              label="Label"
              inputId="error"
            />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">Success</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-text-field
              ${argsToTemplate(args)}
              [helper]="{
                text: 'Feedback text',
                type: 'valid',
                position: 'left',
              }"
              label="Label"
              inputId="success"
            />
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const WithHint: StoryObj<TextFieldComponent> = {
  args: {
    inputId: "example-hint",
    label: "Label",
    helper: {
      text: "Hint text",
      type: "hint",
      position: "left",
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-text-field ${argsToTemplate(args)} />`,
  }),
};

export const Password: StoryObj<TextFieldComponent> = {
  args: {
    inputId: "example-password",
    label: "Label",
    inputAttrs: { type: "password" },
    value: "123456789",
  },
  render: (args) => ({
    props: args,
    template: `<tedi-text-field ${argsToTemplate(args)} />`,
  }),
};

export const Placeholder: StoryObj<TextFieldComponent> = {
  args: {
    inputId: "example-placeholder",
    label: "Label",
  },
  render: (args) => ({
    props: args,
    template: `<tedi-text-field ${argsToTemplate(args)} placeholder="Placeholder" />`,
  }),
};
