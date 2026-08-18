import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { TextEditorComponent } from "./text-editor.component";

/**
 * Rich text editor built on <a href="https://github.com/KillerCodeMonkey/ngx-quill" target="_blank">ngx-quill ↗</a>.
 * `ngx-quill` and `quill` are peer dependencies and must be installed by the consumer,
 * along with Quill's `snow` theme stylesheet.
 */
export default {
  title: "Community/Form/TextEditor",
  component: TextEditorComponent,
  decorators: [
    moduleMetadata({
      imports: [TextEditorComponent, ReactiveFormsModule],
    }),
  ],
  parameters: {
    status: {
      type: ["devComponent"],
    },
  },
  argTypes: {
    control: {
      control: false,
      description: "Reactive form control backing the editor. Value is Quill HTML.",
      table: {
        category: "inputs",
        type: { summary: "FormControl" },
      },
    },
    inputId: {
      control: "text",
      description: "Id set on the editor element, for association with a label.",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    placeholder: {
      control: "text",
      description:
        "Placeholder shown while the editor is empty. Not translated — pass an already-translated string.",
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: '""' },
      },
    },
    modules: {
      control: "object",
      description:
        "Quill module configuration. Overriding this replaces the default toolbar rather than extending it.",
      table: {
        category: "inputs",
        type: { summary: "QuillModules" },
      },
    },
  },
} as Meta<TextEditorComponent>;

type TextEditorStory = StoryObj<TextEditorComponent>;

export const Default: TextEditorStory = {
  args: {
    inputId: "text-editor-default",
    placeholder: "Enter text",
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl<string | null>(null),
    },
  }),
};

export const Disabled: TextEditorStory = {
  args: {
    inputId: "text-editor-disabled",
    placeholder: "Enter text",
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl<string | null>(
        { value: "<p>Disabled content</p>", disabled: true },
        Validators.required,
      ),
    },
  }),
};

export const Error: TextEditorStory = {
  args: {
    inputId: "text-editor-error",
    placeholder: "Enter text",
  },
  render: (args) => {
    const control = new FormControl<string | null>(null, Validators.required);
    control.markAsTouched();

    return { props: { ...args, control } };
  },
};

/**
 * A custom `modules` value replaces the default toolbar entirely.
 */
export const CustomToolbar: TextEditorStory = {
  args: {
    inputId: "text-editor-custom-toolbar",
    placeholder: "Enter text",
    modules: {
      toolbar: [["bold", "italic", "link", "clean"]],
    },
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl<string | null>(null),
    },
  }),
};
