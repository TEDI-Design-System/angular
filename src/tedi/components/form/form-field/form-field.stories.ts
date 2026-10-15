import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { FormFieldComponent } from "./form-field.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { LabelComponent } from "../../content/label/label.component";
import { TextFieldComponent } from "../text-field/text-field.component";

/**
 * Groups a label and a form control, and provides shared field features such as
 * sizing, an icon, a clear button, and a character counter.
 */
export default {
  title: "TEDI-Ready/Components/Form/FormField",
  component: FormFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormFieldComponent,
        FeedbackTextComponent,
        LabelComponent,
        TextFieldComponent,
      ],
    }),
  ],
  parameters: {
    status: {
      type: ["devComponent"],
    },
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["default", "small", "large"],
    },
    icon: {
      control: "text",
      description: "Icon name or configuration shown at the end of the field.",
    },
    clearable: {
      control: "boolean",
      description: "Shows a clear button when the field has a value.",
    },
    showClearOnInteraction: {
      control: "boolean",
      description:
        "Shows the clear button only while the filled field is hovered or focused. Requires clearable.",
    },
    characterLimit: {
      control: "number",
      description:
        "Shows a live character counter and marks excess text as invalid.",
    },
  },
} as Meta<FormFieldComponent>;

type Story = StoryObj<FormFieldComponent>;

export const WithTextField: Story = {
  args: {
    size: "default",
    clearable: false,
    showClearOnInteraction: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-form-field ${argsToTemplate(args)}>
        <label tedi-label for="form-field-text-field">Label</label>
        <input tedi-text-field id="form-field-text-field" />
      </tedi-form-field>
    `,
  }),
};

/** The clear button appears when the filled field is hovered or focused. */
export const ClearButtonOnInteraction: Story = {
  args: {
    clearable: true,
    showClearOnInteraction: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-form-field ${argsToTemplate(args)}>
        <label tedi-label for="form-field-clear-on-interaction">Label</label>
        <input tedi-text-field id="form-field-clear-on-interaction" [value]="'Text value'" />
      </tedi-form-field>
    `,
  }),
};

export const WithCharacterLimit: Story = {
  args: {
    characterLimit: 20,
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-form-field ${argsToTemplate(args)}>
        <label tedi-label for="form-field-character-limit">Label</label>
        <input tedi-text-field id="form-field-character-limit" [value]="'Text value'" />
      </tedi-form-field>
    `,
  }),
};

export const WithIcon: Story = {
  args: {
    icon: "search",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-form-field ${argsToTemplate(args)}>
        <label tedi-label for="form-field-icon">Label</label>
        <input tedi-text-field id="form-field-icon" />
      </tedi-form-field>
    `,
  }),
};

export const WithFeedback: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-form-field ${argsToTemplate(args)}>
        <label tedi-label for="form-field-feedback">Label</label>
        <input tedi-text-field id="form-field-feedback" />
        <tedi-feedback-text text="Helpful information about this field" />
      </tedi-form-field>
    `,
  }),
};
