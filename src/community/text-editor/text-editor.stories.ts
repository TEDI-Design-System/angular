import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  AlertComponent,
  FeedbackTextComponent,
  FormFieldComponent,
  LabelComponent,
  RowComponent,
  TextComponent,
} from "@tedi-design-system/angular/tedi";
import { TextEditorComponent } from "./text-editor.component";

/**
 * Rich text editor built on <a href="https://github.com/KillerCodeMonkey/ngx-quill" target="_blank">ngx-quill ↗</a>.
 *
 * Install `ngx-quill` and `quill` yourself — they are optional peer dependencies
 * of this entry point — and load Quill's theme once in your global styles:
 *
 * ```scss
 * @forward "quill/dist/quill.core.css";
 * @forward "quill/dist/quill.snow.css";
 * ```
 *
 * `<label for>` cannot name the editor: Quill's editing area is a
 * `contenteditable` div, and only form elements are labelable. Point
 * `ariaLabelledby` at the label instead, or set `ariaLabel`.
 */
export default {
  title: "Community/Form/TextEditor",
  component: TextEditorComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TextEditorComponent,
        ReactiveFormsModule,
        FormFieldComponent,
        LabelComponent,
        FeedbackTextComponent,
        AlertComponent,
        TextComponent,
        RowComponent,
      ],
    }),
  ],
  parameters: {
    status: {
      type: ["devComponent"],
    },
  },
  argTypes: {
    value: {
      control: "text",
      description: "Editor contents as Quill HTML.",
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: '""' },
      },
    },
    inputId: {
      control: "text",
      description: "Id set on the editing area.",
      table: { category: "inputs", type: { summary: "string" } },
    },
    ariaLabelledby: {
      control: "text",
      description: "Id of the element labelling the editor.",
      table: { category: "inputs", type: { summary: "string" } },
    },
    ariaLabel: {
      control: "text",
      description:
        "Accessible name when there is no visible label. Ignored when `ariaLabelledby` is set.",
      table: { category: "inputs", type: { summary: "string" } },
    },
    placeholder: {
      control: "text",
      description: "Placeholder shown while the editor is empty.",
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: '""' },
      },
    },
    modules: {
      control: "object",
      description:
        "Quill module configuration. Replaces the default toolbar rather than extending it; Tab is always left to the browser.",
      table: { category: "inputs", type: { summary: "QuillModules" } },
    },
    characterLimit: {
      control: "number",
      description:
        "Maximum number of characters. Shows a live counter that turns into an error state once exceeded.",
      table: {
        category: "Form Field inputs",
        type: { summary: "number | undefined" },
      },
    },
    minRows: {
      control: { type: "number", min: 1 },
      description:
        "Rows the editing area rests at, and the fewest it can ever show.",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "10" },
      },
    },
  },
} as Meta<TextEditorComponent>;

type TextEditorStory = StoryObj<TextEditorComponent>;

/** `characterLimit` is a `tedi-form-field` input, so args must be told about it. */
type TextEditorFieldStory = StoryObj<
  TextEditorComponent & { characterLimit: number }
>;

export const Default: TextEditorStory = {
  args: {
    inputId: "text-editor-default",
    placeholder: "Enter text",
    minRows: 10,
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl<string>("", { nonNullable: true }),
    },
    template: `
      <tedi-form-field>
        <label tedi-label id="text-editor-default-label">Kirjeldus</label>
        <tedi-text-editor
          [formControl]="control"
          [inputId]="inputId"
          [placeholder]="placeholder"
          [minRows]="minRows"
          ariaLabelledby="text-editor-default-label"
        />
        <tedi-feedback-text text="Kirjeldage olukorda oma sõnadega." />
      </tedi-form-field>
    `,
  }),
};

/**
 * The error state appears only once the control has been touched.
 */
export const Error: TextEditorStory = {
  args: {
    inputId: "text-editor-error",
    placeholder: "Enter text",
    minRows: 10,
  },
  render: (args) => {
    const control = new FormControl<string>("", {
      nonNullable: true,
      validators: Validators.required,
    });
    control.markAsTouched();

    return {
      props: { ...args, control },
      template: `
        <tedi-form-field>
          <label tedi-label id="text-editor-error-label">Kirjeldus</label>
          <tedi-text-editor
            [formControl]="control"
            [inputId]="inputId"
            [placeholder]="placeholder"
            [minRows]="minRows"
            ariaLabelledby="text-editor-error-label"
          />
          <tedi-feedback-text type="error" text="Kirjeldus on kohustuslik." />
        </tedi-form-field>
      `,
    };
  },
};

export const Disabled: TextEditorStory = {
  args: {
    inputId: "text-editor-disabled",
    placeholder: "Enter text",
    minRows: 10,
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl<string>(
        { value: "<p>Disabled content</p>", disabled: true },
        { nonNullable: true },
      ),
    },
    template: `
      <tedi-form-field>
        <label tedi-label id="text-editor-disabled-label">Kirjeldus</label>
        <tedi-text-editor
          [formControl]="control"
          [inputId]="inputId"
          [placeholder]="placeholder"
          [minRows]="minRows"
          ariaLabelledby="text-editor-disabled-label"
        />
      </tedi-form-field>
    `,
  }),
};

/**
 * A custom `modules` value replaces the default toolbar entirely.
 */
export const CustomToolbar: TextEditorStory = {
  args: {
    inputId: "text-editor-custom-toolbar",
    placeholder: "Enter text",
    minRows: 10,
    modules: { toolbar: [["bold", "italic", "link", "clean"]] },
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl<string>("", { nonNullable: true }),
    },
    template: `
      <tedi-form-field>
        <label tedi-label id="text-editor-custom-label">Kirjeldus</label>
        <tedi-text-editor
          [formControl]="control"
          [inputId]="inputId"
          [placeholder]="placeholder"
          [minRows]="minRows"
          [modules]="modules"
          ariaLabelledby="text-editor-custom-label"
        />
      </tedi-form-field>
    `,
  }),
};

export const WithCharacterCount: TextEditorFieldStory = {
  args: {
    inputId: "text-editor-character-count",
    placeholder: "Enter text",
    minRows: 6,
    characterLimit: 400,
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl<string>("<p>Kirjeldan oma olukorda.</p>", {
        nonNullable: true,
      }),
    },
    template: `
      <tedi-form-field [characterLimit]="characterLimit">
        <label tedi-label id="text-editor-character-count-label">Kirjeldus</label>
        <tedi-text-editor
          [formControl]="control"
          [inputId]="inputId"
          [placeholder]="placeholder"
          [minRows]="minRows"
          ariaLabelledby="text-editor-character-count-label"
        />
        <tedi-feedback-text text="Kirjeldage olukorda oma sõnadega." />
      </tedi-form-field>
    `,
  }),
};

/**
 * With no field to supply a label, set `ariaLabel` so the editor still has an
 * accessible name.
 */
export const Standalone: TextEditorStory = {
  args: {
    inputId: "text-editor-standalone",
    ariaLabel: "Kirjeldus",
    placeholder: "No wrapper",
    minRows: 6,
  },
  render: (args) => ({
    props: { ...args },
    template: `
      <tedi-text-editor
        [inputId]="inputId"
        [ariaLabel]="ariaLabel"
        [placeholder]="placeholder"
        [minRows]="minRows"
      />
    `,
  }),
};

export const TwoWayBinding: TextEditorStory = {
  args: {
    inputId: "text-editor-two-way",
    ariaLabel: "Kirjeldus",
    minRows: 6,
  },
  render: (args) => ({
    props: { ...args, value: "<p>Muuda seda teksti.</p>" },
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        <tedi-text-editor
          [inputId]="inputId"
          [ariaLabel]="ariaLabel"
          [minRows]="minRows"
          [(value)]="value"
        />

        <tedi-alert type="info" [showClose]="false">
          <pre tedi-text modifiers="small">{{ value | json }}</pre>
        </tedi-alert>
      </tedi-row>
    `,
  }),
};
