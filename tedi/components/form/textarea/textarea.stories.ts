import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { TextareaComponent } from "./textarea.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { TextComponent } from "../../base/text/text.component";
import { LabelComponent } from "../label/label.component";
import { AlertComponent } from "../../notifications/alert/alert.component";

const PSEUDO_STATE = ["Default", "Hover", "Active", "Disabled", "Focus"];

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.65.83?node-id=3486-37618&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/25f281-text-area" target="_blank">Zeroheight ↗</a>
 *
 * Can be used with <a href="https://angular.dev/guide/forms/reactive-forms" target="_blank">Reactive forms</a> and with <a href="https://angular.dev/guide/forms/template-driven-forms" target="_blank">Template-driven forms</a>
 */

export default {
  title: "TEDI-Ready/Components/Form/Textarea",
  component: TextareaComponent,
  decorators: [
    moduleMetadata({
      imports: [
        RowComponent,
        ColComponent,
        LabelComponent,
        TextComponent,
        FormFieldComponent,
        FeedbackTextComponent,
        AlertComponent,
        ReactiveFormsModule,
        FormsModule,
      ],
    }),
  ],
  argTypes: {
    size: {
      description: "Size of the form field.",
      control: {
        type: "radio",
      },
      options: ["default", "small"],
      table: {
        category: "Form Field inputs",
        type: { summary: "InputSize", detail: "default \nsmall" },
        defaultValue: { summary: "default" },
      },
    },
    characterLimit: {
      description:
        "Maximum number of characters. Shows a live counter that turns into an error state once exceeded.",
      control: {
        type: "number",
      },
      table: {
        category: "Form Field inputs",
        type: { summary: "number | undefined" },
      },
    },
    inputClass: {
      control: "text",
      description: "Custom CSS classes for the field.",
      table: {
        category: "Form Field inputs",
        type: { summary: "string | null" },
        defaultValue: { summary: "null" },
      },
    },
    placeholder: {
      control: "text",
      description: "Placeholder text shown when the textarea is empty.",
      table: {
        category: "Textarea inputs",
        type: { summary: "string" },
      },
    },
    resizable: {
      description:
        "Whether the user can resize the textarea vertically. Set to `false` to disable resizing.",
      control: {
        type: "boolean",
      },
      table: {
        category: "Textarea inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    autoGrow: {
      description:
        "Grows the textarea to fit its content as the user types (CSS `field-sizing`). Disables manual resize while active.",
      control: {
        type: "boolean",
      },
      table: {
        category: "Textarea inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    minRows: {
      control: "number",
      description: "Minimum number of visible rows while auto-growing.",
      table: {
        category: "Textarea inputs",
        type: { summary: "number" },
        defaultValue: { summary: "3" },
      },
    },
    maxRows: {
      control: "number",
      description:
        "Maximum number of visible rows before scrolling, while auto-growing.",
      table: {
        category: "Textarea inputs",
        type: { summary: "number" },
        defaultValue: { summary: "12" },
      },
    },
    height: {
      control: "text",
      description:
        "Fixed height (e.g. `7.5rem`, `200`). Applied only when `autoGrow` is off; set `undefined` to fall back to the native `rows` attribute.",
      table: {
        category: "Textarea inputs",
        type: { summary: "string | number | undefined" },
        defaultValue: { summary: "7.5rem" },
      },
    },
    maxHeight: {
      control: "text",
      description:
        "Maximum height before the field scrolls (e.g. `200px`, `12rem`). Limits both `autoGrow` growth and manual resizing.",
      table: {
        category: "Textarea inputs",
        type: { summary: "string | number | undefined" },
      },
    },
  },
} as Meta<TextareaComponent>;

export const Default: StoryObj = {
  args: {
    size: "default",
    resizable: true,
    autoGrow: false,
    minRows: 3,
    maxRows: 12,
  },
  render: ({
    resizable,
    placeholder,
    autoGrow,
    minRows,
    maxRows,
    height,
    maxHeight,
    ...formFieldArgs
  }) => ({
    props: {
      resizable,
      placeholder,
      autoGrow,
      minRows,
      maxRows,
      height,
      maxHeight,
      ...formFieldArgs,
    },
    template: `
      <tedi-form-field ${argsToTemplate(formFieldArgs)}>
        <label tedi-label [for]="'default'">Label</label>
        <textarea
          tedi-textarea
          id="default"
          rows="5"
          [resizable]="resizable"
          [autoGrow]="autoGrow"
          [minRows]="minRows"
          [maxRows]="maxRows"
          [height]="height"
          [maxHeight]="maxHeight"
          [attr.placeholder]="placeholder"
        ></textarea>
      </tedi-form-field>
    `,
  }),
};

export const Size: StoryObj<TextareaComponent> = {
  render: () => ({
    template: `
      <tedi-row class="example-list" cols="1">
        <tedi-row cols="1" [sm]="{ cols: 2 }" gap="3" alignItems="center" class="padding-14-16 border-bottom">
          <p tedi-text modifiers="bold">Default</p>
          <tedi-form-field>
            <label tedi-label [for]="'size-default'">Label</label>
            <textarea tedi-textarea id="size-default" rows="5"></textarea>
          </tedi-form-field>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 2 }" gap="3" alignItems="center" class="padding-14-16">
          <p tedi-text modifiers="bold">Small</p>
          <tedi-form-field size="small">
            <label tedi-label [for]="'size-small'">Label</label>
            <textarea tedi-textarea id="size-small" rows="5"></textarea>
          </tedi-form-field>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const States: StoryObj<TextareaComponent> = {
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
        <tedi-row cols="1" [sm]="{ cols: 6 }" *ngFor="let state of PSEUDO_STATE;" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">{{ state }}</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-form-field>
              <label tedi-label [for]="state">Label</label>
              <textarea tedi-textarea
                [id]="state"
                rows="3"
                [disabled]="state === 'Disabled'"
              ></textarea>
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">Error</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-form-field>
              <label tedi-label [for]="'error'">Label</label>
              <textarea tedi-textarea id="error" rows="3"></textarea>
              <tedi-feedback-text [text]="'Tagasiside tekst'" [type]="'error'" />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">Success</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-form-field>
              <label tedi-label [for]="'success'">Label</label>
              <textarea tedi-textarea id="success" rows="3"></textarea>
              <tedi-feedback-text [text]="'Tagasiside tekst'" [type]="'valid'" />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const WithHint: StoryObj<TextareaComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label [for]="'example-hint'">Label</label>
        <textarea tedi-textarea id="example-hint" rows="5"></textarea>
        <tedi-feedback-text [text]="'Vihjetekst'" />
      </tedi-form-field>
    `,
  }),
};

export const WithHintAndCharacterCount: StoryObj<TextareaComponent> = {
  render: () => ({
    props: {
      value: "",
    },
    template: `
      <tedi-form-field [characterLimit]="400">
        <label tedi-label [for]="'example-char-count'">Label</label>
        <textarea tedi-textarea id="example-char-count" rows="5" [(ngModel)]="value"></textarea>
        <tedi-feedback-text [text]="'Vihjetekst'" />
      </tedi-form-field>
    `,
  }),
};

export const CharacterCount: StoryObj<TextareaComponent> = {
  render: () => ({
    props: {
      value: "",
    },
    template: `
      <tedi-form-field [characterLimit]="400">
        <label tedi-label [for]="'example-only-char-count'">Label</label>
        <textarea tedi-textarea id="example-only-char-count" rows="5" [(ngModel)]="value"></textarea>
      </tedi-form-field>
    `,
  }),
};

export const Placeholder: StoryObj<TextareaComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label [for]="'example-placeholder'">Label</label>
        <textarea tedi-textarea id="example-placeholder" rows="5" placeholder="Placeholder"></textarea>
      </tedi-form-field>
    `,
  }),
};

export const HeightExamples: StoryObj<TextareaComponent> = {
  parameters: {
    docs: {
      description: {
        story: "Examples showing different height configurations for Textarea.",
      },
    },
  },
  render: () => ({
    props: {
      heightExamples: [
        {
          label: "Fixed Height (7.5rem default)",
          id: "fixed-height-default",
          height: "7.5rem",
          resizable: false,
          placeholder: "This textarea has a fixed height of 7.5rem",
        },
        {
          label: "Custom Fixed Height",
          id: "custom-height",
          height: "4rem",
          resizable: false,
          placeholder: "This textarea has a fixed height of 4rem",
        },
        {
          label: "Auto Grow (minRows: 3, maxRows: 12)",
          id: "auto-grow",
          autoGrow: true,
          minRows: 3,
          maxRows: 12,
          placeholder: "Type multiple lines to see it grow automatically",
        },
        {
          label: "Auto Grow with Custom Rows",
          id: "auto-grow-custom",
          autoGrow: true,
          minRows: 5,
          maxRows: 8,
          placeholder: "This will grow from 5 to 8 rows maximum",
        },
        {
          label: "Auto Grow with Max Height",
          id: "auto-grow-max-height",
          autoGrow: true,
          minRows: 3,
          maxRows: 12,
          maxHeight: "200px",
          placeholder: "This will grow but max height is limited to 200px",
        },
      ],
    },
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        <tedi-row cols="1" [sm]="{ cols: 2 }" *ngFor="let example of heightExamples" alignItems="start">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">{{ example.label }}</p>
          </tedi-col>
          <tedi-col width="1">
            <tedi-form-field>
              <label tedi-label [for]="example.id">Label</label>
              <textarea
                tedi-textarea
                [id]="example.id"
                [resizable]="example.resizable ?? true"
                [autoGrow]="example.autoGrow || false"
                [minRows]="example.minRows"
                [maxRows]="example.maxRows"
                [height]="example.height"
                [maxHeight]="example.maxHeight"
                [attr.placeholder]="example.placeholder"
              ></textarea>
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const WithTemplateDrivenForms: StoryObj<TextareaComponent> = {
  render: () => ({
    props: {
      inputValue: "",
    },
    template: `
      <form #form="ngForm" style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
        <tedi-form-field>
          <label tedi-label for="example-template-form" [required]="true">Label</label>
          <textarea
            tedi-textarea
            id="example-template-form"
            name="example"
            rows="5"
            required
            [(ngModel)]="inputValue"
            #inputModel="ngModel"
          ></textarea>
        </tedi-form-field>

        <tedi-alert type="info" [showClose]="false">
          <pre tedi-text modifiers="small">{{ {
  value: inputValue,
  touched: inputModel.touched,
  dirty: inputModel.dirty,
  invalid: inputModel.invalid
} | json }}</pre>
        </tedi-alert>
      </form>
    `,
  }),
};

export const WithReactiveForms: StoryObj<TextareaComponent> = {
  render: () => {
    const control = new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    });

    return {
      props: { control },
      template: `
        <div style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
          <tedi-form-field>
            <label tedi-label [for]="'example-reactive-form'" [required]="true">Label</label>
            <textarea tedi-textarea id="example-reactive-form" rows="5" [formControl]="control"></textarea>
          </tedi-form-field>

          <tedi-alert type="info" [showClose]="false">
            <pre tedi-text modifiers="small">{{ {
  value: control.value,
  touched: control.touched,
  dirty: control.dirty,
  invalid: control.invalid
} | json }}</pre>
          </tedi-alert>
        </div>
      `,
    };
  },
};
