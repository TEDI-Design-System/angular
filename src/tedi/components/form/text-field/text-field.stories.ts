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
import { AlertComponent } from "../../notifications/alert/alert.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { TextComponent } from "../../base/text/text.component";
import { LabelComponent } from "../label/label.component";
import { LabelRowComponent } from "../label-row/label-row.component";
import { InfoTooltipComponent } from "../../overlay/info-tooltip/info-tooltip.component";

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
        AlertComponent,
        FormFieldComponent,
        LabelRowComponent,
        InfoTooltipComponent,
        FeedbackTextComponent,
        ReactiveFormsModule,
        FormsModule,
      ],
    }),
  ],
  argTypes: {
    size: {
      description:
        "Size of the field. Falls back to the size of a wrapping form field.",
      control: {
        type: "radio",
      },
      options: ["default", "small", "large"],
      table: {
        category: "Text Field inputs",
        type: { summary: "InputSize", detail: "default \nsmall \nlarge" },
        defaultValue: { summary: "default" },
      },
    },
    invalid: {
      description:
        "Forces the error state on. Combines with the state derived from reactive forms.",
      control: {
        type: "boolean",
      },
      table: {
        category: "Text Field inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    icon: {
      description: "Icon name or configuration, shown at the end of the field.",
      control: {
        type: "object",
      },
      table: {
        category: "Form Field inputs",
        type: { summary: "string | FormFieldIcon" },
      },
    },
    clearable: {
      description:
        "Whether the field shows a clear button once it holds a value.",
      control: {
        type: "boolean",
      },
      table: {
        category: "Form Field inputs",
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
      <form #form="ngForm">
        <tedi-row [cols]="1" [gap]="3">
          <tedi-col>
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
          </tedi-col>
          <tedi-col>
            <tedi-alert type="info" [showClose]="false">
              <pre tedi-text modifiers="small">{{ { value: inputValue, touched: inputModel.touched, dirty: inputModel.dirty, invalid: inputModel.invalid } | json }}</pre>
            </tedi-alert>
          </tedi-col>
        </tedi-row>
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
        <tedi-row [cols]="1" [gap]="3">
          <tedi-col>
            <tedi-form-field>
              <label tedi-label [for]="'example-reactive-form'" [required]="true">Label</label>
              <input tedi-text-field id="example-reactive-form" [formControl]="control" />
            </tedi-form-field>
          </tedi-col>
          <tedi-col>
            <tedi-alert type="info" [showClose]="false">
              <pre tedi-text modifiers="small">{{ { value: control.value, touched: control.touched, dirty: control.dirty, invalid: control.invalid } | json }}</pre>
            </tedi-alert>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
};

/**
 * The text field paints its own surface, so it renders correctly with no wrapper.
 * Wrap it in a `tedi-form-field` when it needs a label, feedback text, a character
 * counter, an icon or a clear button.
 */
export const Standalone: StoryObj<TextFieldComponent> = {
  render: () => ({
    template: `<input tedi-text-field placeholder="No wrapper" />`,
  }),
};

/**
 * A label that needs a tooltip is composed as `tedi-label-row` + `tedi-info-tooltip`, per the
 * Label documentation. The form field's label slot accepts the row as well as a bare label, so the
 * tooltip stays a sibling of the label rather than part of its accessible name.
 */
export const WithLabelTooltip: StoryObj<TextFieldComponent> = {
  render: () => ({
    template: `
      <tedi-row cols="1" [gapY]="3">
        <tedi-col>
          <tedi-form-field>
            <tedi-label-row>
              <label tedi-label for="tooltip-plain" [required]="true">Toimeaine</label>
              <tedi-info-tooltip>Vihje sisu</tedi-info-tooltip>
            </tedi-label-row>
            <input tedi-text-field id="tooltip-plain" />
            <tedi-feedback-text [text]="'Vihjetekst'" />
          </tedi-form-field>
        </tedi-col>
        <tedi-col>
          <tedi-form-field icon="search" [clearable]="true">
            <tedi-label-row>
              <label tedi-label for="tooltip-box">Otsi</label>
              <tedi-info-tooltip>Vihje sisu</tedi-info-tooltip>
            </tedi-label-row>
            <input tedi-text-field id="tooltip-box" />
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};
