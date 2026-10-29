import { FormsModule } from "@angular/forms";
import {
  Meta,
  StoryObj,
  moduleMetadata,
  argsToTemplate,
} from "@storybook/angular";
import { InlineEditComponent } from "./inline-edit.component";
import {
  InlineEditControlDirective,
  InlineEditValueDirective,
} from "./inline-edit-control.directive";
import { TextFieldComponent } from "../text-field/text-field.component";
import { SelectComponent } from "../select/select.component";
import { TagComponent } from "../../tags/tag/tag.component";
import { StatusBadgeComponent } from "../../tags/status-badge/status-badge.component";
import { DateFieldComponent } from "../date-field/date-field.component";
import { NumberFieldComponent } from "../number-field/number-field.component";
import { TextareaComponent } from "../textarea/textarea.component";
import { RadioGroupComponent } from "../radio-group/radio-group.component";
import { RadioComponent } from "../radio/radio.component";
import { CheckboxGroupComponent } from "../checkbox-group/checkbox-group.component";
import { CheckboxComponent } from "../checkbox/checkbox.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { LabelComponent } from "../../content/label/label.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { ShowAtDirective } from "../../../directives/show-at/show-at.directive";

type InlineEditStory = StoryObj<
  Omit<InlineEditComponent, "disabled" | "invalid"> & {
    disabled: boolean;
    invalid: boolean;
  }
>;

const STATES = [
  { name: "Default" },
  { name: "Hover" },
  { name: "Active", editing: true },
  { name: "Error", invalid: true },
  { name: "Focus" },
  { name: "Read-only", readOnly: true },
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
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.106.103?node-id=65952-130950&m=dev" target="_blank">Figma ↗</a>
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
        InlineEditValueDirective,
        TextFieldComponent,
        SelectComponent,
        TagComponent,
        StatusBadgeComponent,
        DateFieldComponent,
        NumberFieldComponent,
        TextareaComponent,
        RadioGroupComponent,
        RadioComponent,
        CheckboxGroupComponent,
        CheckboxComponent,
        FeedbackTextComponent,
        LabelComponent,
        RowComponent,
        ColComponent,
        ShowAtDirective,
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
    readOnly: {
      description:
        "Renders the value as plain text with no edit affordance, lined up with editable rows. For a block that is entirely read-only, use a text group instead.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    editIconPosition: {
      description:
        "Whether the edit icon sits at the row's trailing edge or straight after the value. Hidden while the row is invalid.",
      control: { type: "radio" },
      options: ["end", "inline"],
      table: {
        category: "inputs",
        type: {
          summary: "InlineEditIconPosition",
          detail: "end \ninline",
        },
        defaultValue: { summary: "end" },
      },
    },
    contentWidth: {
      description:
        "Sizes the row to its value rather than filling its container. The row then changes width when the editor opens, so it is reserved for a value edited inside running text.",
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
      description:
        "Commits when focus leaves the editor. Dropdowns and pickers opened by the editor count as part of it; anywhere else, including back into a surrounding modal, commits.",
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
    readOnly: false,
    editIconPosition: "end",
    contentWidth: false,
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
      <div style="max-width: 218px;">
        <tedi-inline-edit #defaultEdit ${argsToTemplate(args)}>
          <ng-template tediInlineEditControl>
            <input
              tedi-text-field
              [(value)]="displayValue"
              [attr.aria-label]="label || 'Nimi'"
              [attr.aria-describedby]="invalid ? defaultEdit.feedbackId : null"
            />
          </ng-template>
          <tedi-feedback-text *ngIf="invalid" text="Sisesta korrektne väärtus" type="error" />
        </tedi-inline-edit>
      </div>
    `,
  }),
};

/**
 * The editor is any TEDI form control, wired to its own value binding. Give it
 * its own accessible label — link a visible label with `for` and `id`, or use
 * `aria-label`. InlineEdit's `label` names only the read trigger. Set
 * `[closeOnEnter]="false"` on a select so Enter opens the dropdown instead of
 * committing.
 */
export const Type: StoryObj<InlineEditComponent> = {
  render: () => ({
    props: {
      state: { name: "Mari Maasikas", type: "prototype" },
      typeOptions: [
        { value: "prototype", label: "Prototüüp" },
        { value: "design", label: "Disain" },
        { value: "concept", label: "Kontseptsioon" },
      ],
      typeLabel: (value: string) =>
        (
          ({
            prototype: "Prototüüp",
            design: "Disain",
            concept: "Kontseptsioon",
          }) as Record<string, string>
        )[value] ?? "",
    },
    template: `
      <div style="display: grid; gap: 8px;">
        <div style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 218px); max-width: 338px; gap: 16px; align-items: center;">
          <b>Text field</b>
          <tedi-inline-edit [displayValue]="state.name" label="Nimi">
            <ng-template tediInlineEditControl>
              <input tedi-text-field [(value)]="state.name" aria-label="Nimi" />
            </ng-template>
          </tedi-inline-edit>
        </div>
        <div style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 218px); max-width: 338px; gap: 16px; align-items: center;">
          <b>Select</b>
          <tedi-inline-edit [displayValue]="typeLabel(state.type)" label="Tüüp" [closeOnEnter]="false">
            <ng-template tediInlineEditControl>
              <tedi-select inputId="ie-type-select" ariaLabel="Tüüp" [options]="typeOptions"
                bindLabel="label" bindValue="value" [clearable]="false" [(ngModel)]="state.type" />
            </ng-template>
          </tedi-inline-edit>
        </div>
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
 * The read view is plain text by default — or the placeholder while the value
 * is empty. For values a string cannot express, such as tags or a status badge,
 * project an `ng-template tediInlineEditValue`.
 */
export const ValueType: StoryObj<InlineEditComponent> = {
  name: "Value type",
  render: () => {
    const typeOptions = [
      { value: "prototype", label: "Prototüüp" },
      { value: "design", label: "Disain" },
      { value: "concept", label: "Kontseptsioon" },
    ];
    const keywordOptions = [
      { value: "prototype", label: "Prototüüp" },
      { value: "figma", label: "Figma" },
      { value: "design", label: "Disain" },
      { value: "ui", label: "Kasutajaliides" },
    ];
    const olekOptions = [
      { value: "done", label: "Lõpetatud" },
      { value: "in-progress", label: "Töös" },
      { value: "planned", label: "Planeeritud" },
    ];
    const addressOptions = [
      { value: "tallinn", label: "Tulbi tn 6, Tallinn" },
      { value: "tartu", label: "Riia 12, Tartu" },
    ];
    const olekColor: Record<string, string> = {
      done: "success",
      "in-progress": "warning",
      planned: "brand",
    };
    const state = {
      type: typeOptions[0],
      address: null as { value: string; label: string } | null,
      keywords: keywordOptions.map((o) => o.value),
      olek: olekOptions[0],
    };

    return {
      props: {
        typeOptions,
        keywordOptions,
        olekOptions,
        addressOptions,
        olekColor,
        state,
        pick: (list: { value: string; label: string }[], value: string) =>
          list.find((o) => o.value === value) ?? null,
        keywordLabel: (value: string) =>
          keywordOptions.find((o) => o.value === value)?.label ?? value,
      },
      template: `
        <div style="display: grid; gap: 8px; max-width: 28rem;">
          <div style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 1fr); gap: 16px; align-items: start;">
            <label tedi-label>Tüüp</label>
            <tedi-inline-edit [displayValue]="state.type.label" label="Tüüp" [closeOnEnter]="false">
              <ng-template tediInlineEditControl>
                <tedi-select inputId="ie-value-type" ariaLabel="Tüüp" [options]="typeOptions"
                  bindLabel="label" bindValue="value" [ngModel]="state.type.value"
                  (selectionChange)="state.type = pick(typeOptions, $event) ?? state.type" />
              </ng-template>
            </tedi-inline-edit>
          </div>

          <div style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 1fr); gap: 16px; align-items: start;">
            <label tedi-label>Aadress</label>
            <tedi-inline-edit [displayValue]="state.address?.label ?? ''" label="Aadress" placeholder="Sisesta aadress" [closeOnEnter]="false">
              <ng-template tediInlineEditControl>
                <tedi-select inputId="ie-value-address" ariaLabel="Aadress" [options]="addressOptions"
                  bindLabel="label" bindValue="value" [ngModel]="state.address?.value"
                  (selectionChange)="state.address = pick(addressOptions, $event)" />
              </ng-template>
            </tedi-inline-edit>
          </div>

          <div style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 1fr); gap: 16px; align-items: start;">
            <label tedi-label>Märksõnad</label>
            <tedi-inline-edit [displayValue]="state.keywords.length ? 'valitud' : ''" label="Märksõnad" placeholder="—" [closeOnEnter]="false">
              <ng-template tediInlineEditValue>
                <span style="display: flex; flex-wrap: wrap; gap: 4px;">
                  <tedi-tag *ngFor="let k of state.keywords" color="primary">{{ keywordLabel(k) }}</tedi-tag>
                </span>
              </ng-template>
              <ng-template tediInlineEditControl>
                <tedi-select inputId="ie-value-keywords" ariaLabel="Märksõnad" [options]="keywordOptions"
                  bindLabel="label" bindValue="value" [allowMultiple]="true"
                  [(ngModel)]="state.keywords" />
              </ng-template>
            </tedi-inline-edit>
          </div>

          <div style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 1fr); gap: 16px; align-items: start;">
            <label tedi-label>Olek</label>
            <tedi-inline-edit [displayValue]="state.olek.label" label="Olek" [closeOnEnter]="false">
              <ng-template tediInlineEditValue>
                <tedi-status-badge [color]="olekColor[state.olek.value]" [text]="state.olek.label" />
              </ng-template>
              <ng-template tediInlineEditControl>
                <tedi-select inputId="ie-value-olek" ariaLabel="Olek" [options]="olekOptions"
                  bindLabel="label" bindValue="value" [ngModel]="state.olek.value"
                  (selectionChange)="state.olek = pick(olekOptions, $event) ?? state.olek" />
              </ng-template>
            </tedi-inline-edit>
          </div>
        </div>
      `,
    };
  },
};

/**
 * The edit icon is what identifies the value as editable, so it is always
 * shown. By default it sits at the row's trailing edge, lining the icons up
 * down a column; `inline` puts it straight after the value.
 */
export const EditIconPosition: StoryObj<InlineEditComponent> = {
  render: () => {
    const rows = () => [
      { label: "Kuupäev", value: "22.03.2026" },
      { label: "Kellaaeg", value: "08:00" },
      { label: "Kohtade arv", value: "2" },
      { label: "Aadress", value: "Tulbi tn 6, Tallinn" },
    ];
    return {
      props: {
        groups: [
          { name: "Inline", align: "inline", rows: rows() },
          { name: "End", align: "end", rows: rows() },
        ],
      },
      template: `
        <div style="display: grid; gap: 24px;">
          <div *ngFor="let group of groups" style="display: grid; gap: 8px;">
            <b>{{ group.name }}</b>
            <div style="display: grid; gap: 0;">
              <div *ngFor="let row of group.rows" style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 218px); max-width: 338px; gap: 16px; align-items: center;">
                <label tedi-label>{{ row.label }}</label>
                <tedi-inline-edit [displayValue]="row.value" [label]="row.label" [editIconPosition]="group.align">
                  <ng-template tediInlineEditControl>
                    <input tedi-text-field [(value)]="row.value" [attr.aria-label]="row.label" />
                  </ng-template>
                </tedi-inline-edit>
              </div>
            </div>
          </div>
        </div>
      `,
    };
  },
};

/**
 * The row fills its container, so on narrow layouts the whole row is a
 * comfortable tap target rather than just the value. Its height grows below
 * the mobile breakpoint on its own — the spacing comes from
 * `--form-field-padding-y-sm`, which core redefines there.
 */
export const Responsiveness: StoryObj<InlineEditComponent> = {
  globals: { viewport: { value: "mobile1" } },
  render: () => ({
    props: { name: "Mari Maasikas" },
    template: `
      <tedi-inline-edit [displayValue]="name" label="Nimi">
        <ng-template tediInlineEditControl>
          <input tedi-text-field [(value)]="name" aria-label="Nimi" />
        </ng-template>
      </tedi-inline-edit>
    `,
  }),
};

/**
 * Active is the open editor. An invalid row drops the edit icon. Read-only and
 * Disabled have no Figma counterpart yet.
 */
export const States: StoryObj<InlineEditComponent> = {
  parameters: {
    pseudo: {
      hover: [
        "#ie-state-hover-text .tedi-inline-edit__trigger",
        "#ie-state-hover-select .tedi-inline-edit__trigger",
      ],
      focusVisible: [
        "#ie-state-focus-text .tedi-inline-edit__trigger",
        "#ie-state-focus-select .tedi-inline-edit__trigger",
        "#ie-state-active-text input",
      ],
      focus: ["#ie-state-active-select .tedi-select__trigger"],
    },
  },
  render: () => ({
    props: {
      states: STATES.map((state) => ({
        ...state,
        key: state.name
          .toLowerCase()
          .replace("read-only", "readonly")
          .replace("error", "invalid"),
        value: "Mari Maasikas",
        country: "ee",
      })),
      countries: [
        { value: "ee", label: "Eesti" },
        { value: "fi", label: "Soome" },
        { value: "se", label: "Rootsi" },
      ],
      countryLabel: (value: string) =>
        (
          ({ ee: "Eesti", fi: "Soome", se: "Rootsi" }) as Record<string, string>
        )[value] ?? "",
    },
    template: `
      <tedi-row cols="1" gapY="3" style="max-width: 640px;">
        <tedi-row cols="12" gapX="3" showAt="md">
          <tedi-col width="2" />
          <tedi-col width="5"><b>Text field</b></tedi-col>
          <tedi-col width="5"><b>Select</b></tedi-col>
        </tedi-row>
        <tedi-row *ngFor="let state of states" cols="1" gap="2" [md]="{ cols: 12, gapX: 3, gapY: 0 }">
          <tedi-col [md]="{ width: 2 }"><b>{{ state.name }}</b></tedi-col>
          <tedi-col [md]="{ width: 5 }">
            <tedi-inline-edit #textEdit
              [id]="'ie-state-' + state.key + '-text'"
              [displayValue]="state.value"
              label="Nimi"
              [editing]="!!state.editing"
              [invalid]="!!state.invalid"
              [disabled]="!!state.disabled"
              [readOnly]="!!state.readOnly"
            >
              <ng-template tediInlineEditControl>
                <input tedi-text-field [(value)]="state.value" aria-label="Nimi" [attr.aria-describedby]="state.invalid ? textEdit.feedbackId : null" />
              </ng-template>
              <tedi-feedback-text *ngIf="state.invalid" text="Nimi sisaldab lubamatuid märke" type="error" />
            </tedi-inline-edit>
          </tedi-col>
          <tedi-col [md]="{ width: 5 }">
            <tedi-inline-edit #selectEdit
              [id]="'ie-state-' + state.key + '-select'"
              [displayValue]="countryLabel(state.country)"
              label="Riik"
              [closeOnEnter]="false"
              [editing]="!!state.editing"
              [invalid]="!!state.invalid"
              [disabled]="!!state.disabled"
              [readOnly]="!!state.readOnly"
            >
              <ng-template tediInlineEditControl>
                <tedi-select
                  [inputId]="'ie-state-' + state.key + '-select-input'"
                  ariaLabel="Riik"
                  [options]="countries"
                  bindLabel="label"
                  bindValue="value"
                  [clearable]="false"
                  [(ngModel)]="state.country"
                />
              </ng-template>
              <tedi-feedback-text *ngIf="state.invalid" text="Palun vali sobiv väärtus" type="error" />
            </tedi-inline-edit>
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

/**
 * `readOnly` renders the value as static text with no edit affordance. It
 * keeps an editable row's inset so it still lines up when mixed in with
 * editable ones, which is what it is for — the odd fixed value among the rest.
 * When a whole block is fixed, reach for
 * <a href="./?path=/docs/tedi-ready-content-textgroup--docs" target="_top"><code>tedi-text-group</code></a>
 * instead.
 *
 * Differs from `disabled`, which keeps the greyed trigger and icon for
 * transient states such as saving.
 */
export const ReadOnly: StoryObj<InlineEditComponent> = {
  name: "Read-only",
  render: () => ({
    props: {
      rows: [
        { label: "Kuupäev", value: "22.03.2026", fixed: false },
        { label: "Kellaaeg", value: "08:00", fixed: true },
        { label: "Kohtade arv", value: "2", fixed: false },
      ],
    },
    template: `
      <div style="display: grid; gap: 0;">
        <div *ngFor="let row of rows" style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 218px); max-width: 338px; gap: 16px; align-items: center;">
          <b>{{ row.label }}</b>
          <tedi-inline-edit [displayValue]="row.value" [label]="row.label" [readOnly]="row.fixed">
            <ng-template tediInlineEditControl>
              <input tedi-text-field [(value)]="row.value" [attr.aria-label]="row.label" />
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
  render: () => {
    const state = {
      date: new Date(2026, 2, 22),
      seats: 2,
      note: "Palun helista enne saabumist",
      transport: "bus",
      extras: ["breakfast"],
    };
    return {
      props: {
        state,
        formatDate: (d: Date | null) =>
          d ? d.toLocaleDateString("et-EE") : "",
        transportLabel: (v: string) =>
          ({ bus: "Buss", train: "Rong" })[v] ?? "",
        extrasLabel: (v: string[]) =>
          v
            .map((x) => ({ breakfast: "Hommikusöök", parking: "Parkimine" })[x])
            .join(", "),
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
          <div style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 260px); gap: 16px; align-items: start;">
            <b>Transport</b>
            <tedi-inline-edit [displayValue]="transportLabel(state.transport)" label="Transport" [closeOnEnter]="false">
              <ng-template tediInlineEditControl>
                <tedi-radio-group ariaLabel="Transport" direction="vertical" [(value)]="state.transport">
                  <label tedi-label color="primary" class="flex align-items-center gap-2">
                    <input tedi-radio type="radio" name="ie-transport" value="bus" />
                    Buss
                  </label>
                  <label tedi-label color="primary" class="flex align-items-center gap-2">
                    <input tedi-radio type="radio" name="ie-transport" value="train" />
                    Rong
                  </label>
                </tedi-radio-group>
              </ng-template>
            </tedi-inline-edit>
          </div>
          <div style="display: grid; grid-template-columns: minmax(0, 104px) minmax(0, 260px); gap: 16px; align-items: start;">
            <b>Lisad</b>
            <tedi-inline-edit [displayValue]="extrasLabel(state.extras)" label="Lisad" [closeOnEnter]="false">
              <ng-template tediInlineEditControl>
                <tedi-checkbox-group ariaLabel="Lisad" direction="vertical" [(value)]="state.extras">
                  <label tedi-label color="primary" class="flex align-items-center gap-2">
                    <input tedi-checkbox type="checkbox" name="ie-extras" value="breakfast" />
                    Hommikusöök
                  </label>
                  <label tedi-label color="primary" class="flex align-items-center gap-2">
                    <input tedi-checkbox type="checkbox" name="ie-extras" value="parking" />
                    Parkimine
                  </label>
                </tedi-checkbox-group>
              </ng-template>
            </tedi-inline-edit>
          </div>
        </div>
      `,
    };
  },
};
