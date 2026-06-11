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
import { TextFieldComponent } from "./text-field.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { TextComponent } from "../../base/text/text.component";
import { LabelComponent } from "../label/label.component";

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
      imports: [
        RowComponent,
        ColComponent,
        LabelComponent,
        TextComponent,
        FormFieldComponent,
        FeedbackTextComponent,
        ReactiveFormsModule,
        FormsModule,
      ],
    }),
  ],
  argTypes: {
    size: {
      description: "Input field size.",
      control: {
        type: "radio",
      },
      options: ["default", "small", "large"],
      table: {
        category: "Form Field inputs",
        type: { summary: "InputSize", detail: "default \nsmall \nlarge" },
        defaultValue: { summary: "default" },
      },
    },
    icon: {
      description: "Icon name or configuration for the input field.",
      control: {
        type: "object",
      },
      table: {
        category: "Form Field inputs",
        type: { summary: "string | TextFieldIcon" },
      },
    },
    clearable: {
      description: "Whether the input includes a clear button.",
      control: {
        type: "boolean",
      },
      table: {
        category: "Form Field inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    inputClass: {
      control: "text",
      description: "Custom CSS classes for the input.",
      table: {
        category: "Form Field inputs",
        type: { summary: "string" },
      },
    },
    arrowsHidden: {
      description: "Whether to hide arrows for number inputs.",
      control: {
        type: "boolean",
      },
      table: {
        category: "Text Field inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    clear: {
      description: "Callback triggered when the clear button is clicked.",
      control: false,
      action: "clear",
      table: {
        category: "Text Field outputs",
        type: { summary: "void" },
      },
    },
  },
} as Meta<TextFieldComponent>;

export const Default: StoryObj = {
  args: {
    size: "default",
    clearable: false,
    arrowsHidden: true,
  },
  render: ({ arrowsHidden, ...formFieldArgs }) => ({
    props: {
      arrowsHidden,
      ...formFieldArgs,
    },
    template: `
      <tedi-form-field ${argsToTemplate(formFieldArgs)}>
        <label tedi-label [for]="'default'">Label</label>
        <input tedi-text-field [arrowsHidden]="arrowsHidden" (clear)="clear($event)" id="default" />
      </tedi-form-field>
    `,
  }),
};

export const Size: StoryObj<TextFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row class="example-list" cols="1" gapY="3">
        <tedi-row cols="1" [sm]="{ cols: 3 }" gap="3" alignItems="center" class="padding-14-16 border-bottom">
          <p tedi-text>Default</p>
          <tedi-form-field>
            <label tedi-label [for]="'size-default'">Label</label>
            <input tedi-text-field id="size-default" />
          </tedi-form-field>
          <tedi-form-field icon="person">
            <label tedi-label [for]="'size-default-with-icon'">Label</label>
            <input tedi-text-field id="size-default-with-icon" />
          </tedi-form-field>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 3 }" gap="3" alignItems="center" class="padding-14-16">
          <p tedi-text>Small</p>
          <tedi-form-field size="small">
            <label tedi-label [for]="'size-small'">Label</label>
            <input tedi-text-field id="size-small" />
          </tedi-form-field>
          <tedi-form-field size="small" icon="person">
            <label tedi-label [for]="'size-small-with-icon'">Label</label>
            <input tedi-text-field id="size-small-with-icon" />
          </tedi-form-field>
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
              <input tedi-text-field
                [id]="state"
                [attr.value]="state === 'Disabled' ? 'Text value' : null"
                [disabled]="state === 'Disabled'"
              />
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
              <input tedi-text-field id="error" />
              <tedi-feedback-text [text]="'Feedback text'" [type]="'error'" />
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
              <input tedi-text-field id="success" />
              <tedi-feedback-text [text]="'Feedback text'" [type]="'valid'" />
            </tedi-form-field>
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const WithHint: StoryObj<TextFieldComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label [for]="'example-hint'">Label</label>
        <input tedi-text-field id="example-hint" />
        <tedi-feedback-text [text]="'Hint text'" />
      </tedi-form-field>
    `,
  }),
};

export const Password: StoryObj<TextFieldComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label [for]="'example-password'">Label</label>
        <input tedi-text-field id="example-password" type="password" value="123456789" />
      </tedi-form-field>
    `,
  }),
};

export const Placeholder: StoryObj<TextFieldComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label [for]="'example-placeholder'">Label</label>
        <input tedi-text-field id="example-placeholder" placeholder="Placeholder" />
      </tedi-form-field>
    `,
  }),
};

export const WithTemplateDrivenForms: StoryObj<TextFieldComponent> = {
  render: () => ({
    props: {
      inputValue: "",
    },
    template: `
      <form #form="ngForm" style="display: flex; flex-direction: column; gap: var(--layout-grid-gutters-16);">
        <tedi-form-field>
              <label tedi-label for="example-template-form" [required]="true">Label</label>
          <input
            tedi-text-field
                id="example-template-form"
                name="example"
            required
            [(ngModel)]="inputValue"
            #inputModel="ngModel"
          />
        </tedi-form-field>

        <div>
          <p>Value: {{ inputValue }}</p>
          <p>Touched: {{ inputModel.touched }}</p>
          <p>Dirty: {{ inputModel.dirty }}</p>
          <p>Invalid: {{ inputModel.invalid }}</p>
        </div>
      </form>
    `,
  }),
};

export const WithReactiveForms: StoryObj<TextFieldComponent> = {
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
            <input tedi-text-field id="example-reactive-form" [formControl]="control" />
          </tedi-form-field>

          <div>
            <p>Value: {{ control.value }}</p>
            <p>Touched: {{ control.touched }}</p>
            <p>Dirty: {{ control.dirty }}</p>
            <p>Invalid: {{ control.invalid }}</p>
          </div>
        </div>
      `,
    };
  },
};
