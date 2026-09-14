import { FormsModule } from "@angular/forms";
import {
  Meta,
  StoryObj,
  moduleMetadata,
  argsToTemplate,
} from "@storybook/angular";
import { InlineEditComponent } from "./inline-edit.component";
import { InlineEditControlDirective } from "./inline-edit-control.directive";
import { TextFieldComponent } from "../text-field/text-field.component";
import { SelectComponent } from "../select/select.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { LabelComponent } from "../label/label.component";

type InlineEditStory = StoryObj<
  Omit<InlineEditComponent, "disabled" | "invalid"> & {
    disabled: boolean;
    invalid: boolean;
  }
>;

const STATES = [
  { name: "Default" },
  { name: "Hover" },
  { name: "Focus" },
  { name: "Active", editing: true },
  { name: "Error", invalid: true },
];

/**
 * A value that reads as plain text and turns into a form control when clicked.
 *
 * The inline edit manages the read display and edit mode. The control goes in an
 * `ng-template tediInlineEditControl`, is created on entry and destroyed on
 * exit, and keeps its own binding. Give the control its own accessible label.
 * Configure exit keys for the control and link overlays with aria-controls or aria-owns.
 *
 * Editing ends on Enter or when focus leaves (`editCommit`), or on Escape
 * (`editCancel`). Because the control owns the value, discarding an edit is the
 * consumer's job — snapshot the value on `editStart` and restore it on
 * `editCancel`.
 *
 * For a value that is never editable, use
 * <a href="./?path=/docs/tedi-ready-content-textgroup--docs" target="_top"><code>tedi-text-group</code></a> instead.
 *
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.75.90?node-id=9938-87560&m=dev" target="_blank">Figma ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Form/InlineEdit",
  component: InlineEditComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        InlineEditComponent,
        InlineEditControlDirective,
        TextFieldComponent,
        SelectComponent,
        FeedbackTextComponent,
        LabelComponent,
      ],
    }),
  ],
  parameters: { controls: { disable: true } },
  argTypes: {
    displayValue: {
      description: "Text shown while not editing.",
      control: { type: "text" },
      table: { category: "inputs", type: { summary: "string" } },
    },
    placeholder: {
      description: "Shown in place of an empty value, in the muted colour.",
      control: { type: "text" },
      table: { category: "inputs", type: { summary: "string" } },
    },
    label: {
      description:
        "Required label for the read-mode button. Give the projected control its own accessible label.",
      control: { type: "text" },
      table: { category: "inputs", type: { summary: "string" } },
    },
    size: {
      description: "Row height and type scale.",
      control: { type: "radio" },
      options: ["default", "small"],
      table: {
        category: "inputs",
        type: { summary: "InlineEditSize", detail: "default \nsmall" },
        defaultValue: { summary: "default" },
      },
    },
    editIcon: {
      description:
        "Material icon shown beside the value, or null to hide the icon.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string | null" },
        defaultValue: { summary: "null" },
      },
    },
    editIconVisibility: {
      description:
        "Whether the icon is permanent or revealed on hover and keyboard focus.",
      control: { type: "radio" },
      options: ["always", "hover"],
      table: {
        category: "inputs",
        type: {
          summary: "InlineEditIconVisibility",
          detail: "always \nhover",
        },
        defaultValue: { summary: "always" },
      },
    },
    editIconPosition: {
      description:
        "'end' pins the icon to the right edge, 'inline' puts it straight after the text.",
      control: { type: "radio" },
      options: ["end", "inline"],
      table: {
        category: "inputs",
        type: { summary: "InlineEditIconPosition", detail: "end \ninline" },
        defaultValue: { summary: "end" },
      },
    },
    editing: {
      description: "Whether the control is shown. Two-way bindable.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      description: "Blocks entering edit mode and mutes the value.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    invalid: {
      description: "Puts the row and the projected control in the error state.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    closeOnEnter: {
      description: "Whether Enter commits. Turn off for a textarea.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    closeOnEscape: {
      description: "Whether Escape exits edit mode and emits editCancel.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    closeOnBlur: {
      description: "Whether focus leaving the component commits.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    editStart: {
      description: "Edit mode was entered.",
      table: { category: "outputs", type: { summary: "void" } },
    },
    editCommit: {
      description: "Edit mode was left by Enter or by focus moving away.",
      table: { category: "outputs", type: { summary: "void" } },
    },
    editCancel: {
      description: "Edit mode was left by Escape.",
      table: { category: "outputs", type: { summary: "void" } },
    },
  },
} as Meta<InlineEditComponent>;

export const Default: InlineEditStory = {
  parameters: { controls: { disable: false } },
  args: {
    label: "Nimi",
    displayValue: "Mari Maasikas",
    placeholder: "Sisesta nimi",
    size: "default",
    editIcon: "",
    editIconVisibility: "always",
    editIconPosition: "end",
    editing: false,
    disabled: false,
    invalid: false,
    closeOnEnter: true,
    closeOnEscape: true,
    closeOnBlur: true,
  },
  render: (args) => ({
    props: { ...args },
    template: `
      <div style="width: 100%; max-width: 218px;">
        <tedi-inline-edit ${argsToTemplate(args)}>
          <ng-template tediInlineEditControl>
            <input tedi-text-field [(value)]="displayValue" [attr.aria-label]="label || 'Nimi'" />
          </ng-template>
        </tedi-inline-edit>
      </div>
    `,
  }),
};

export const Size: StoryObj<InlineEditComponent> = {
  render: () => ({
    props: {
      rows: [
        { name: "Default", size: "default", value: "22.03.2026" },
        { name: "Small", size: "small", value: "22.03.2026" },
      ],
    },
    template: `
      <div style="display: grid; gap: 8px;">
        <div *ngFor="let row of rows" style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 218px); max-width: 338px; gap: 16px; align-items: center;">
          <b>{{ row.name }}</b>
          <tedi-inline-edit [displayValue]="row.value" [size]="row.size" label="Kuupäev" editIcon="edit">
            <ng-template tediInlineEditControl>
              <input tedi-text-field [(value)]="row.value" aria-label="Kuupäev" />
            </ng-template>
          </tedi-inline-edit>
        </div>
      </div>
    `,
  }),
};

/**
 * `editIcon=null` hides the icon. Set `editIconVisibility` to `always` for a
 * persistent icon or `hover` to reveal it on hover and keyboard focus.
 * `editIconPosition="inline"` places the icon directly after the text.
 */
export const EditIcon: StoryObj<InlineEditComponent> = {
  render: () => ({
    props: {
      rows: [
        { name: "None", icon: null, visibility: "always", position: "end" },
        { name: "Always", icon: "edit", visibility: "always", position: "end" },
        {
          name: "On hover",
          icon: "edit",
          visibility: "hover",
          position: "end",
        },
        {
          name: "Following text",
          icon: "edit",
          visibility: "always",
          position: "inline",
        },
      ],
    },
    template: `
      <div style="display: grid; gap: 8px;">
        <div *ngFor="let row of rows" style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 218px); max-width: 338px; gap: 16px; align-items: center;">
          <b>{{ row.name }}</b>
          <tedi-inline-edit
            displayValue="22.03.2026"
            label="Kuupäev"
            [editIcon]="row.icon"
            [editIconVisibility]="row.visibility"
            [editIconPosition]="row.position"
          >
            <ng-template tediInlineEditControl>
              <input tedi-text-field value="22.03.2026" aria-label="Kuupäev" />
            </ng-template>
          </tedi-inline-edit>
        </div>
      </div>
    `,
  }),
};

/**
 * Set `closeOnEnter` to `false` so Enter opens the dropdown. Select links its
 * dropdown through `aria-controls`, allowing focus to move inside it. Leaving
 * both the control and dropdown commits the edit.
 */
export const WithSelect: StoryObj<InlineEditComponent> = {
  render: () => {
    const options = [
      { value: "prototype", label: "Prototüüp" },
      { value: "design", label: "Disain" },
      { value: "ui", label: "Kasutajaliides" },
    ];
    const state = { selected: options[0] };

    return {
      props: {
        options,
        state,
        onSelect: (value: string) => {
          state.selected =
            options.find((option) => option.value === value) ?? state.selected;
        },
      },
      template: `
        <div style="width: 100%; max-width: 218px;">
          <tedi-inline-edit
            [displayValue]="state.selected.label"
            label="Tüüp"
            [closeOnEnter]="false"
            editIcon="arrow_drop_down"
            editIconVisibility="hover"
          >
            <ng-template tediInlineEditControl>
              <tedi-select
                inputId="inline-edit-select"
                ariaLabel="Tüüp"
                [options]="options"
                bindLabel="label"
                bindValue="value"
                [ngModel]="state.selected.value"
                (selectionChange)="onSelect($event)"
              />
            </ng-template>
          </tedi-inline-edit>
        </div>
      `,
    };
  },
};

export const Placeholder: StoryObj<InlineEditComponent> = {
  render: () => ({
    props: { address: "" },
    template: `
      <div style="width: 100%; max-width: 218px;">
        <tedi-inline-edit [displayValue]="address" placeholder="Sisesta aadress" label="Aadress">
          <ng-template tediInlineEditControl>
            <input tedi-text-field [(value)]="address" aria-label="Aadress" />
          </ng-template>
        </tedi-inline-edit>
      </div>
    `,
  }),
};

/**
 * `invalid` applies the error state to the row and projected control.
 * Use `tedi-feedback-text` to explain the error and reference `feedbackId`
 * from the editor's `aria-describedby`.
 */
export const Invalid: StoryObj<InlineEditComponent> = {
  render: () => ({
    props: { email: "mari.maasikas" },
    template: `
      <div style="width: 100%; max-width: 218px;">
        <tedi-inline-edit #emailEdit [displayValue]="email" label="E-post" invalid>
          <ng-template tediInlineEditControl>
            <input tedi-text-field [(value)]="email" aria-label="E-post" [attr.aria-describedby]="emailEdit.feedbackId" />
          </ng-template>
          <tedi-feedback-text text="Sisesta korrektne e-posti aadress" type="error" />
        </tedi-inline-edit>
      </div>
    `,
  }),
};

export const Disabled: StoryObj<InlineEditComponent> = {
  render: () => ({
    props: { code: "EE47101010033" },
    template: `
      <div style="width: 100%; max-width: 218px;">
        <tedi-inline-edit [displayValue]="code" label="Isikukood" disabled>
          <ng-template tediInlineEditControl>
            <input tedi-text-field [(value)]="code" aria-label="Isikukood" />
          </ng-template>
        </tedi-inline-edit>
      </div>
    `,
  }),
};

/**
 * Link each visible label to its editor using `for` and `id`. Set InlineEdit's
 * `label` input to name the read-mode button.
 */
export const FieldList: StoryObj<InlineEditComponent> = {
  render: () => ({
    props: {
      rows: [
        { key: "date", label: "Kuupäev", value: "22.03.2026" },
        { key: "time", label: "Kellaaeg", value: "08:00" },
        { key: "seats", label: "Kohtade arv", value: "2" },
        { key: "address", label: "Aadress", value: "Tulbi tn 6, Tallinn" },
      ],
    },
    template: `
      <div style="display: grid; gap: 8px;">
        <div *ngFor="let row of rows" style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 218px); max-width: 338px; align-items: center; gap: 16px;">
          <label tedi-label [attr.for]="'inline-edit-' + row.key">{{ row.label }}</label>
          <tedi-inline-edit [displayValue]="row.value" [label]="row.label" editIcon="edit">
            <ng-template tediInlineEditControl>
              <input tedi-text-field [(value)]="row.value" [id]="'inline-edit-' + row.key" />
            </ng-template>
          </tedi-inline-edit>
        </div>
      </div>
    `,
  }),
};

export const States: StoryObj<InlineEditComponent> = {
  parameters: {
    pseudo: {
      hover: "#Hover .tedi-inline-edit__trigger",
      focusVisible: "#Focus .tedi-inline-edit__trigger",
    },
  },
  render: () => ({
    props: { states: STATES },
    template: `
      <div style="display: grid; gap: 16px;">
        <div
          *ngFor="let state of states"
          style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 218px); max-width: 338px; gap: 16px; align-items: start;"
        >
          <b style="padding-top: 4px;">{{ state.name }}</b>
          <tedi-inline-edit #stateEdit
            [id]="state.name"
            displayValue="Mari Maasikas"
            label="Nimi"
            editIcon="edit"
            [editing]="!!state.editing"
            [invalid]="!!state.invalid"
          >
            <ng-template tediInlineEditControl>
              <input tedi-text-field value="Mari Maasikas" aria-label="Nimi" [attr.aria-describedby]="state.invalid ? stateEdit.feedbackId : null" />
            </ng-template>
            <tedi-feedback-text *ngIf="state.invalid" text="Feedback text" type="error" />
          </tedi-inline-edit>
        </div>
      </div>
    `,
  }),
};

/** Snapshot the value on entry and restore it when Escape cancels the edit. */
export const CancelEdit: StoryObj<InlineEditComponent> = {
  render: () => {
    const state = { name: "Mari Maasikas", previousName: "Mari Maasikas" };
    return {
      props: {
        state,
        onStart: () => {
          state.previousName = state.name;
        },
        onCancel: () => {
          state.name = state.previousName;
        },
      },
      template: `
        <div style="width: 100%; max-width: 218px;">
          <tedi-inline-edit [displayValue]="state.name" label="Nimi" (editStart)="onStart()" (editCancel)="onCancel()">
            <ng-template tediInlineEditControl>
              <input tedi-text-field [(value)]="state.name" aria-label="Nimi" />
            </ng-template>
          </tedi-inline-edit>
        </div>
      `,
    };
  },
};
