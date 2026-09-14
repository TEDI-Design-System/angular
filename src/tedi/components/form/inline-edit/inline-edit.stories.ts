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
import { DateFieldComponent } from "../date-field/date-field.component";
import { NumberFieldComponent } from "../number-field/number-field.component";
import { TextareaComponent } from "../textarea/textarea.component";
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
  { name: "Disabled", disabled: true },
];

/**
 * Displays a value as text with an edit icon. Activate it to edit the value in place.
 *
 * Place the editor in an `ng-template tediInlineEditControl` with its own value
 * binding and accessible label. It is created on entry and destroyed on exit.
 * Enter or leaving the editor commits; Escape emits `editCancel`. Restore the
 * previous value in `editCancel` if the edit should be discarded.
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
        DateFieldComponent,
        NumberFieldComponent,
        TextareaComponent,
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
    hideEditIcon: {
      description:
        "Hides the edit icon. It is the only visual cue that the value is editable, so hiding it fails WCAG 1.3.3 unless something adjacent signals it.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    editIconAlign: {
      description:
        "Whether the edit icon follows the value or aligns to the row's trailing edge.",
      control: { type: "radio" },
      options: ["following", "aligned"],
      table: {
        category: "inputs",
        type: {
          summary: "InlineEditIconAlign",
          detail: "following \naligned",
        },
        defaultValue: { summary: "following" },
      },
    },
    fullWidth: {
      description:
        "Makes the read trigger and editor fill their container rather than sizing to their content.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
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
      description:
        "Whether Enter commits. Turn off when the control uses Enter, such as a textarea or select.",
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
    hideEditIcon: false,
    editIconAlign: "following",
    fullWidth: false,
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

export const Sizes: StoryObj<InlineEditComponent> = {
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
          <tedi-inline-edit [displayValue]="row.value" [size]="row.size" label="Kuupäev">
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
 * The most common editor: a text field wired to its own value binding. Give it
 * an accessible label — the trigger's label does not reach the control.
 */
export const TextField: StoryObj<InlineEditComponent> = {
  name: "Text field",
  render: () => ({
    props: { name: "Mari Maasikas" },
    template: `
      <div style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 218px); max-width: 338px; gap: 16px; align-items: center;">
        <label tedi-label for="inline-edit-name">Nimi</label>
        <tedi-inline-edit [displayValue]="name" label="Nimi">
          <ng-template tediInlineEditControl>
            <input tedi-text-field id="inline-edit-name" [(value)]="name" />
          </ng-template>
        </tedi-inline-edit>
      </div>
    `,
  }),
};

/**
 * Set `closeOnEnter` to `false` so Enter opens the dropdown. Select links its
 * dropdown through `aria-controls`, allowing focus to move inside it. Leaving
 * both the control and dropdown commits the edit.
 */
export const Select: StoryObj<InlineEditComponent> = {
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

/**
 * The edit icon is visible by default to help users identify editable values.
 * `editIconAlign` puts it straight after the value or out at the row's trailing
 * edge, which lines the icons up down a column. Use `hideEditIcon` only when
 * another visible cue communicates that the value is editable.
 */
export const EditIconAlignment: StoryObj<InlineEditComponent> = {
  render: () => ({
    props: {
      rows: [
        { name: "Following", hide: false, align: "following" },
        { name: "Aligned", hide: false, align: "aligned" },
        { name: "Hidden", hide: true, align: "following" },
      ],
    },
    template: `
      <div style="display: grid; gap: 8px;">
        <div *ngFor="let row of rows" style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 218px); max-width: 338px; gap: 16px; align-items: center;">
          <b>{{ row.name }}</b>
          <tedi-inline-edit
            displayValue="22.03.2026"
            label="Kuupäev"
            [hideEditIcon]="row.hide"
            [editIconAlign]="row.align"
            fullWidth
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
            [editing]="!!state.editing"
            [invalid]="!!state.invalid"
            [disabled]="!!state.disabled"
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

/**
 * Link each visible label to its editor using `for` and `id`. Set InlineEdit's
 * `label` input to name the read-mode button.
 */
export const Example: StoryObj<InlineEditComponent> = {
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
          <tedi-inline-edit [displayValue]="row.value" [label]="row.label">
            <ng-template tediInlineEditControl>
              <input tedi-text-field [(value)]="row.value" [id]="'inline-edit-' + row.key" />
            </ng-template>
          </tedi-inline-edit>
        </div>
      </div>
    `,
  }),
};

/** Snapshot the value on entry and restore it when Escape cancels the edit. */
export const CancelEdit: StoryObj<InlineEditComponent> = {
  name: "Cancel edit",
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

/**
 * Use InlineEdit with these TEDI controls:
 *
 * - Text: `input[tedi-text-field]`, `textarea[tedi-textarea]`, `tedi-search`
 * - Numeric: `tedi-number-field`, `tedi-slider`
 * - Choice: `tedi-select` (single or multiple), `tedi-checkbox-group`, `tedi-radio-group`
 * - Date and time: `tedi-date-field`, `tedi-time-field`, `tedi-time-picker`
 * - Boolean: `tedi-toggle`
 *
 * Each editor keeps its own value binding. Bind `displayValue` to the same
 * source, formatting it for the read view, and give the editor its own
 * accessible label. The InlineEdit label names only the read trigger.
 * Set `closeOnEnter` to `false` when the editor uses Enter, such as a textarea
 * inserting a newline or a select opening its dropdown.
 *
 * The examples below show date, number and multiline editors. For file
 * management, use `tedi-file-upload` or `tedi-file-dropzone` separately;
 * for checkbox and radio choices, use the group components listed above.
 */
export const SupportedControls: StoryObj<InlineEditComponent> = {
  name: "Supported controls",
  // Hidden from the sidebar: it is embedded in the Documentation page, where
  // the surrounding prose is what makes it worth reading.
  tags: ["!dev", "!autodocs"],
  render: () => {
    const state = {
      date: new Date(2026, 2, 22),
      seats: 2,
      note: "Palun helista enne saabumist",
    };
    return {
      props: {
        state,
        formatDate: (d: Date | null) =>
          d ? d.toLocaleDateString("et-EE") : "",
      },
      template: `
        <div style="display: grid; gap: 8px;">
          <div style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 260px); gap: 16px; align-items: center;">
            <label tedi-label for="inline-edit-date">Kuupäev</label>
            <tedi-inline-edit [displayValue]="formatDate(state.date)" label="Kuupäev">
              <ng-template tediInlineEditControl>
                <tedi-date-field inputId="inline-edit-date" [(value)]="state.date" />
              </ng-template>
            </tedi-inline-edit>
          </div>
          <div style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 260px); gap: 16px; align-items: center;">
            <label tedi-label for="inline-edit-seats">Kohtade arv</label>
            <tedi-inline-edit [displayValue]="state.seats + ''" label="Kohtade arv">
              <ng-template tediInlineEditControl>
                <tedi-number-field inputId="inline-edit-seats" [(value)]="state.seats" />
              </ng-template>
            </tedi-inline-edit>
          </div>
          <div style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 260px); gap: 16px; align-items: start;">
            <label tedi-label for="inline-edit-note">Märkus</label>
            <tedi-inline-edit [displayValue]="state.note" label="Märkus" [closeOnEnter]="false">
              <ng-template tediInlineEditControl>
                <textarea tedi-textarea id="inline-edit-note" [(value)]="state.note"></textarea>
              </ng-template>
            </tedi-inline-edit>
          </div>
        </div>
      `,
    };
  },
};
