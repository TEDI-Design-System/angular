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
      description:
        "Size of the field. Falls back to the size of a wrapping form field.",
      control: {
        type: "radio",
      },
      options: ["default", "small"],
      table: {
        category: "Textarea inputs",
        type: { summary: "TextareaSize", detail: "default \nsmall" },
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
        category: "Textarea inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
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
      description:
        "Rows the field rests at, and the fewest it can ever show. With no `height` set this is what sizes the textarea, in every mode — reach for it first when a field needs to be taller or shorter.",
      table: {
        category: "Textarea inputs",
        type: { summary: "number" },
        defaultValue: { summary: "3" },
      },
    },
    maxRows: {
      control: "number",
      description:
        "Most rows the field shows before it scrolls. Caps `autoGrow`'s growth and how far the resize grip can be dragged.",
      table: {
        category: "Textarea inputs",
        type: { summary: "number" },
        defaultValue: { summary: "12" },
      },
    },
    height: {
      control: "text",
      description:
        "Exact resting height (e.g. `7.5rem`, `200`), for the rare field that has to match something other than a whole number of rows. Prefer `minRows`. Ignored while `autoGrow` is on, and still bounded by `minRows` and `maxRows`.",
      table: {
        category: "Textarea inputs",
        type: { summary: "string | number | undefined" },
      },
    },
    maxHeight: {
      control: "text",
      description:
        "Maximum height before the field scrolls (e.g. `200px`, `12rem`). Applied on top of `maxRows`, whichever is smaller.",
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
            <textarea tedi-textarea id="size-default" [minRows]="5"></textarea>
          </tedi-form-field>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 2 }" gap="3" alignItems="center" class="padding-14-16">
          <p tedi-text modifiers="bold">Small</p>
          <tedi-form-field size="small">
            <label tedi-label [for]="'size-small'">Label</label>
            <textarea tedi-textarea id="size-small" [minRows]="5"></textarea>
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
                [minRows]="3"
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
              <textarea tedi-textarea id="error" [minRows]="3"></textarea>
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
              <textarea tedi-textarea id="success" [minRows]="3"></textarea>
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
        <textarea tedi-textarea id="example-hint" [minRows]="5"></textarea>
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
        <textarea tedi-textarea id="example-char-count" [minRows]="5" [(ngModel)]="value"></textarea>
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
        <textarea tedi-textarea id="example-only-char-count" [minRows]="5" [(ngModel)]="value"></textarea>
      </tedi-form-field>
    `,
  }),
};

export const Placeholder: StoryObj<TextareaComponent> = {
  render: () => ({
    template: `
      <tedi-form-field>
        <label tedi-label [for]="'example-placeholder'">Label</label>
        <textarea tedi-textarea id="example-placeholder" [minRows]="5" placeholder="Placeholder"></textarea>
      </tedi-form-field>
    `,
  }),
};

export const HeightExamples: StoryObj<TextareaComponent> = {
  parameters: {
    docs: {
      description: {
        story:
          "`minRows` is the field's resting height — it sizes the textarea whether or not `autoGrow` is on, and is the floor a resize drag stops at. `maxRows` is the ceiling, for the drag and for `autoGrow` alike. `height` is the escape hatch for a field that has to match an exact measurement.",
      },
    },
  },
  render: () => ({
    props: {
      heightExamples: [
        {
          label: "Default (minRows 3)",
          id: "sizing-default",
          placeholder: "Rests at three rows, drag to grow",
        },
        {
          label: "Taller (minRows 6)",
          id: "sizing-tall",
          minRows: 6,
          placeholder: "Rests at six rows",
        },
        {
          label: "Bounded drag (minRows 3, maxRows 5)",
          id: "sizing-bounded",
          maxRows: 5,
          placeholder: "The grip stops at five rows",
        },
        {
          label: "Exact height (10rem, not resizable)",
          id: "sizing-exact",
          height: "10rem",
          resizable: false,
          placeholder: "Only when a row count will not do",
        },
        {
          label: "Auto grow (minRows 3 to maxRows 12)",
          id: "sizing-auto-grow",
          autoGrow: true,
          placeholder: "Type multiple lines to see it grow",
        },
        {
          label: "Auto grow, capped at 200px",
          id: "sizing-auto-grow-capped",
          autoGrow: true,
          maxHeight: "200px",
          placeholder: "Grows until 200px, then scrolls",
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
                [minRows]="example.minRows ?? 3"
                [maxRows]="example.maxRows ?? 12"
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
            [minRows]="5"
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
            <textarea tedi-textarea id="example-reactive-form" [minRows]="5" [formControl]="control"></textarea>
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

/**
 * The textarea paints its own surface, so it renders correctly with no wrapper
 * at all. A `tedi-form-field` is only needed for a label, feedback text or a
 * character counter.
 */
export const Standalone: StoryObj<TextareaComponent> = {
  render: () => ({
    template: `<textarea tedi-textarea placeholder="No wrapper"></textarea>`,
  }),
};

/**
 * A textarea takes an `icon` and a `clearable` clear button the same way a
 * single-line field does. Both make `tedi-form-field` render a surface box
 * around the control, and the textarea adapts to it: the box grows to the
 * textarea's height instead of holding it to a 40px row, and the additions sit
 * on the first line rather than halfway down a tall field.
 *
 * The textarea keeps its own resize grip — it reaches under the additions all
 * the way to the border, so the grip lands on the field's visual corner and the
 * text stops one gap short of them. Sizing is therefore identical boxed and
 * standalone: `minRows` is the resting height and the floor, `maxRows` the
 * ceiling. `resizable="false"` and `autoGrow` take the grip away.
 *
 * The last row is the same textarea with no additions, painting its own surface.
 */
export const WithIconAndClearButton: StoryObj<TextareaComponent> = {
  render: () => ({
    props: {
      clearableValue: "The clear button empties this.",
      bothValue: "The clear button empties this one too.",
    },
    template: `
      <tedi-row cols="1" [gapY]="5">
        <tedi-col>
          <p tedi-text modifiers="bold">With an icon</p>
          <tedi-form-field icon="search">
            <label tedi-label for="textarea-box-icon">Icon</label>
            <textarea tedi-textarea id="textarea-box-icon" placeholder="Drag the corner to resize"></textarea>
          </tedi-form-field>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Clearable</p>
          <tedi-form-field [clearable]="true">
            <label tedi-label for="textarea-box-clearable">Clearable</label>
            <textarea tedi-textarea id="textarea-box-clearable" [(ngModel)]="clearableValue"></textarea>
          </tedi-form-field>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Both, and not resizable</p>
          <tedi-form-field icon="search" [clearable]="true">
            <label tedi-label for="textarea-box-both">Icon and clear button</label>
            <textarea tedi-textarea id="textarea-box-both" [resizable]="false" [(ngModel)]="bothValue"></textarea>
          </tedi-form-field>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Neither — the textarea paints its own surface</p>
          <tedi-form-field>
            <label tedi-label for="textarea-box-plain">Plain</label>
            <textarea tedi-textarea id="textarea-box-plain" placeholder="No icon, not clearable"></textarea>
          </tedi-form-field>
        </tedi-col>
      </tedi-row>
    `,
  }),
};
