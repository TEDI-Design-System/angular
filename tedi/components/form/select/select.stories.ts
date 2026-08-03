import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { JsonPipe } from "@angular/common";
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { SelectComponent } from "./select.component";
import {
  SelectOptionTemplateDirective,
  SelectValueTemplateDirective,
  SelectTooltipTemplateDirective,
} from "./select-templates.directive";
import { IconComponent } from "../../base";
import { ButtonComponent } from "../../buttons/button/button.component";
import {
  TextGroupComponent,
  TextGroupLabelComponent,
  TextGroupValueComponent,
} from "../../content/text-group";
import { DropdownItemValueComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value-label.component";
import { DropdownItemValueMetaComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value-meta.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";
import { Component, signal } from "@angular/core";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { TextComponent } from "../../base/text/text.component";

const simpleOptions = [
  { value: "tallinn", label: "Tallinn" },
  { value: "narva", label: "Narva" },
  { value: "tartu", label: "Tartu", disabled: true },
  { value: "elva", label: "Elva" },
  { value: "rakvere", label: "Rakvere" },
  { value: "haapsalu", label: "Haapsalu" },
];

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.38.59?node-id=4449-69807&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/97a0a6-select" target="_blank">Zeroheight ↗</a>
 */
const meta: Meta<SelectComponent> = {
  title: "TEDI-Ready/Components/Form/Select",
  component: SelectComponent,
  decorators: [
    moduleMetadata({
      imports: [
        SelectComponent,
        SelectOptionTemplateDirective,
        SelectValueTemplateDirective,
        SelectTooltipTemplateDirective,
        FormsModule,
        ReactiveFormsModule,
        JsonPipe,
        TextGroupComponent,
        TextGroupLabelComponent,
        TextGroupValueComponent,
        DropdownItemValueComponent,
        DropdownItemValueLabelComponent,
        DropdownItemValueMetaComponent,
        IconComponent,
        ButtonComponent,
        VerticalSpacingDirective,
      ],
    }),
  ],
  argTypes: {
    inputId: {
      control: "text",
      description: "Unique identifier for the select input element. Used for label association and accessibility.",
    },
    label: {
      control: "text",
      description: "Label text displayed above the select.",
    },
    tooltip: {
      control: "text",
      description: "When set, renders an info button next to the label that reveals this text in a tooltip.",
    },
    ariaLabelledby: {
      control: false,
      description: "Associates the select with an external visible label by its element id. A native `<label for>` cannot target the combobox (it is a `<div>`), so use this when the label lives outside the component. Ignored when `label` is set.",
    },
    ariaLabel: {
      control: false,
      description: "Accessible name used when there is no visible label to reference. Ignored when `label` or `ariaLabelledby` provides a name.",
    },
    required: {
      control: "boolean",
      description: "Whether the field is required.",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text shown when no value is selected.",
    },
    state: {
      control: "radio",
      options: ["error", "valid", "default"],
      description: "Visual state of the input.",
    },
    size: {
      control: "radio",
      options: ["small", "default"],
      description: "Size variant of the select.",
    },
    clearable: {
      control: "boolean",
      description: "Whether to show a clear button when a value is selected.",
    },
    allowMultiple: {
      control: "boolean",
      description: "Whether multiple items can be selected.",
    },
    showSelectAll: {
      control: "boolean",
      description: "Whether to show a \"Select All\" option in multiselect mode.",
    },
    selectableGroups: {
      control: "boolean",
      description: "Whether group headers are selectable in multiselect mode.",
    },
    isTagRemovable: {
      control: "boolean",
      description: "Whether tags in multiselect mode can be removed by clicking.",
    },
    multiRow: {
      control: "boolean",
      description: "Whether selected tags wrap to multiple rows in multiselect mode.",
    },
    tagEllipsis: {
      control: "radio",
      options: [false, "start", "end"],
      description:
        "Which end a tag's label truncates from when it doesn't fit. `false` never truncates; `end` → `label…`; `start` → `…label`.",
    },
    ellipsis: {
      control: "radio",
      options: [false, "start", "end"],
      description:
        "Which end the single selected value truncates from when it doesn't fit. The full value is revealed in a tooltip on hover/focus. `false` never truncates. Applies to single-select mode; multiselect tags use `tagEllipsis`.",
    },
    searchable: {
      control: "boolean",
      description: "Whether the select has a search input for filtering options.",
    },
    searchFn: {
      control: false,
      description: "Custom search function `(term: string, item: T) => boolean`. When provided, overrides the default label-based search.",
    },
    clearSearchOnSelect: {
      control: "boolean",
      description: "Whether to clear the search input after an option is selected. Mostly useful for searchable multiselect.",
    },
    selectionChange: {
      action: "selectionChange",
      control: false,
      description: "Emitted whenever the selection changes (option click, tag removal, clear, select-all, group toggle). Payload is the selected value (or `null`) in single-select, or the array of selected values in multi-select.",
    },
    searchChange: {
      action: "searchChange",
      control: false,
      description: "Emitted with the current search term whenever the user types in the search input. Only fires when `searchable` is `true`.",
    },
    opened: {
      action: "opened",
      control: false,
      description: "Emitted when the dropdown panel opens.",
    },
    closed: {
      action: "closed",
      control: false,
      description: "Emitted when the dropdown panel closes.",
    },
    cleared: {
      action: "cleared",
      control: false,
      description: "Emitted when the user clicks the clear button. Fires alongside `selectionChange`, which carries the new (empty) value.",
    },
    dropdownType: {
      control: "radio",
      options: ["menu", "grid"],
      description: "Use \"grid\" for swatch-type selects with custom option templates (e.g. color or icon pickers).",
    },
    options: {
      control: "object",
      description: "Array of options to display in the dropdown.",
    },
    maxDropdownHeight: {
      control: "number",
      description: "Value in pixels. When not set, fits available viewport space.",
    },
    hideOnScroll: {
      control: "boolean",
      description: "Whether the dropdown closes when the page scrolls.",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
      },
    },
  },
  args: {
    inputId: "select-1",
    label: "Label",
    required: false,
    placeholder: "Vali...",
    state: "default",
    size: "default",
    clearable: false,
    allowMultiple: false,
    showSelectAll: false,
    selectableGroups: false,
    isTagRemovable: false,
    multiRow: false,
    tagEllipsis: false,
    ellipsis: false,
    searchable: false,
    clearSearchOnSelect: false,
    dropdownType: "menu",
    maxDropdownHeight: undefined,
    hideOnScroll: false,
    options: simpleOptions as [],
  },
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-select
        [inputId]="inputId"
        [label]="label"
        [tooltip]="tooltip"
        [required]="required"
        [placeholder]="placeholder"
        [state]="state"
        [size]="size"
        [clearable]="clearable"
        [allowMultiple]="allowMultiple"
        [showSelectAll]="showSelectAll"
        [selectableGroups]="selectableGroups"
        [isTagRemovable]="isTagRemovable"
        [multiRow]="multiRow"
        [ellipsis]="ellipsis"
        [searchable]="searchable"
        [clearSearchOnSelect]="clearSearchOnSelect"
        [maxDropdownHeight]="maxDropdownHeight"
        [hideOnScroll]="hideOnScroll"
        [dropdownType]="dropdownType"
        [options]="options"
        bindLabel="label"
        bindValue="value"
        (selectionChange)="selectionChange($event)"
        (searchChange)="searchChange($event)"
        (opened)="opened()"
        (closed)="closed()"
        (cleared)="cleared()"
      />
    `,
  }),
};

export const Size: Story = {
  render: () => ({
    props: {
      options: simpleOptions,
    },
    template: `
      <div style="display: flex; flex-direction: column;" [tediVerticalSpacing]="1">
        <tedi-select
          inputId="size-default"
          label="Default"
          [options]="options"
          bindLabel="label"
          bindValue="value"
          size="default"
        />
        <tedi-select
          inputId="size-small"
          label="Small"
          [options]="options"
          bindLabel="label"
          bindValue="value"
          size="small"
        />
      </div>
    `,
  }),
};

export const Type: Story = {
  render: () => ({
    props: {
      options: simpleOptions,
      feedbackText: {
        type: "hint",
        text: "Hint text",
        position: "left",
      },
    },
    template: `
      <div style="display: flex; flex-direction: column;" [tediVerticalSpacing]="1">
        <tedi-select
          inputId="type-default"
          label="Default"
          [options]="options"
          bindLabel="label"
          bindValue="value"
        />
        <tedi-select
          inputId="type-hint"
          label="With hint"
          [feedbackText]="feedbackText"
          [options]="options"
          bindLabel="label"
          bindValue="value"
        />
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: {
    pseudo: {
      hover: "#states-hover .tedi-input",
      focus: "#states-focus .tedi-input",
      active: "#states-active .tedi-input",
    },
  },
  render: () => ({
    props: {
      options: simpleOptions,
      errorFeedback: { type: "error", text: "Error text" },
      validFeedback: { type: "valid", text: "Valid text" },
      disabledControl: new FormControl({ value: "tallinn", disabled: true }),
    },
    template: `
      <div style="display: flex; flex-direction: column;" [tediVerticalSpacing]="1">
        <tedi-select
          inputId="states-default"
          label="Default"
          [options]="options"
          bindLabel="label"
          bindValue="value"
        />
        <div id="states-hover">
          <tedi-select
            inputId="states-hover-select"
            label="Hover"
            [options]="options"
            bindLabel="label"
            bindValue="value"
          />
        </div>
        <div id="states-focus">
          <tedi-select
            inputId="states-focus-select"
            label="Focus"
            [options]="options"
            bindLabel="label"
            bindValue="value"
          />
        </div>
        <div id="states-active">
          <tedi-select
            inputId="states-active-select"
            label="Active"
            [options]="options"
            bindLabel="label"
            bindValue="value"
          />
        </div>
        <tedi-select
          inputId="states-error"
          label="Error"
          state="error"
          [feedbackText]="errorFeedback"
          [options]="options"
          bindLabel="label"
          bindValue="value"
        />
        <tedi-select
          inputId="states-valid"
          label="Valid"
          state="valid"
          [feedbackText]="validFeedback"
          [options]="options"
          bindLabel="label"
          bindValue="value"
        />
        <tedi-select
          inputId="states-disabled"
          label="Disabled"
          [options]="options"
          bindLabel="label"
          bindValue="value"
          [formControl]="disabledControl"
        />
      </div>
    `,
  }),
};

// ============ Value type ============

export const ValueType: Story = {
  render: () => ({
    props: {
      options: simpleOptions,
      multiselectOptions: [
        "Tag 1",
        "Tag 2",
        "Tag 3",
        "Tag 4",
        "Tag 5",
        "Tag 6",
        "Tag 7",
        "Tag 8",
        "Tag 9",
        "Tag 10",
      ],
      oneRowOptions: [
        "Pikem tekst",
        "Pikem tekst ühel real",
        "Kolmas valik",
        "Neljas valik",
        "Viies valik",
      ],
      colorOptions: [
        { id: 1, name: "Läbipaistev", color: "transparent" },
        { id: 2, name: "Valge", color: "#ffffff" },
        { id: 3, name: "Punane", color: "#f42a25" },
        { id: 4, name: "Magenta", color: "#e81e63" },
        { id: 5, name: "Lilla", color: "#b21f7e" },
        { id: 6, name: "Violetne", color: "#673ab7" },
        { id: 7, name: "Indigo", color: "#3f51b5" },
        { id: 8, name: "Sinine", color: "#3f88c5" },
        { id: 9, name: "Helesinine", color: "#03a9f3" },
        { id: 10, name: "Tsüaan", color: "#00bcd3" },
        { id: 11, name: "Sinakasroheline", color: "#009688" },
        { id: 12, name: "Roheline", color: "#4caf50" },
        { id: 13, name: "Heleroheline", color: "#8bc24a" },
        { id: 14, name: "Laimiroheline", color: "#ccdb39" },
        { id: 15, name: "Kollane", color: "#f2d611" },
        { id: 16, name: "Merevaigukollane", color: "#ffc107" },
        { id: 17, name: "Oranž", color: "#ff9800" },
        { id: 18, name: "Tumeoranž", color: "#ff5722" },
        { id: 19, name: "Hall", color: "#9e9e9e" },
        { id: 20, name: "Sinakashall", color: "#607d8b" },
        { id: 21, name: "Pruun", color: "#795548" },
        { id: 22, name: "Must", color: "#0d0d0d" },
      ],
      iconOptions: [
        { id: 1, name: "Lauaarvuti", icon: "computer" },
        { id: 2, name: "Telefon", icon: "smartphone" },
        { id: 3, name: "Tahvelarvuti", icon: "tablet_mac" },
        { id: 4, name: "Kell", icon: "watch" },
        { id: 5, name: "Teler", icon: "tv" },
      ],
      form: new FormGroup({
        default: new FormControl("tallinn"),
        multiselect: new FormControl([
          "Tag 1",
          "Tag 2",
          "Tag 3",
          "Tag 4",
          "Tag 5",
          "Tag 6",
          "Tag 7",
          "Tag 8",
          "Tag 9",
          "Tag 10",
        ]),
        oneRow: new FormControl([
          "Pikem tekst",
          "Pikem tekst ühel real",
          "Kolmas valik",
          "Neljas valik",
          "Viies valik",
        ]),
        color: new FormControl(1),
        icon: new FormControl(1),
      }),
    },
    template: `
      <form [formGroup]="form" style="display: flex; flex-direction: column;" [tediVerticalSpacing]="1">
        <tedi-select
          inputId="value-no-value"
          label="No value"
          [options]="options"
          bindLabel="label"
          bindValue="value"
          [clearable]="false"
        />
        <tedi-select
          inputId="value-default"
          label="Default"
          [options]="options"
          bindLabel="label"
          bindValue="value"
          [clearable]="true"
          formControlName="default"
        />
        <tedi-select
          inputId="value-placeholder"
          label="Placeholder"
          placeholder="Text value"
          [options]="options"
          bindLabel="label"
          bindValue="value"
          [clearable]="false"
        />
        <tedi-select
          inputId="value-multiselect"
          label="Multiselect"
          [options]="multiselectOptions"
          [allowMultiple]="true"
          [multiRow]="true"
          [isTagRemovable]="true"
          [clearable]="true"
          formControlName="multiselect"
        />
        <tedi-select
          inputId="value-multiselect-one-row"
          label="Multiselect one row (tagEllipsis=&quot;end&quot;)"
          [options]="oneRowOptions"
          [allowMultiple]="true"
          [multiRow]="false"
          [isTagRemovable]="true"
          [clearable]="true"
          tagEllipsis="end"
          formControlName="oneRow"
        />
        <div style="width: 100px;">
          <tedi-select
            inputId="value-color"
            label="Color"
            [options]="colorOptions"
            bindLabel="name"
            bindValue="id"
            [clearable]="false"
            [dropdownWidthRef]="null"
            dropdownType="grid"
            formControlName="color"
          >
            <ng-template tediSelectValue let-item>
              <div
                style="width: 24px; height: 24px; border-radius: 4px;"
                [style.background]="item.color === 'transparent'
                  ? 'linear-gradient(to top right, #fff calc(50% - 1px), #e53935 calc(50% - 1px), #e53935 calc(50% + 1px), #fff calc(50% + 1px))'
                  : item.color"
                [style.border]="item.color === 'transparent' || item.color === '#ffffff' ? '1px solid var(--form-input-border-default)' : 'none'"
                [attr.aria-label]="item.name"
                role="img"
              ></div>
            </ng-template>
            <ng-template tediSelectOption let-item>
              <div
                style="width: 100%; height: 100%; border-radius: 4px;"
                [style.background]="item.color === 'transparent'
                  ? 'linear-gradient(to top right, #fff calc(50% - 1px), #e53935 calc(50% - 1px), #e53935 calc(50% + 1px), #fff calc(50% + 1px))'
                  : item.color"
                [style.border]="item.color === 'transparent' || item.color === '#ffffff' ? '1px solid var(--form-input-border-default)' : 'none'"
                [attr.aria-label]="item.name"
                role="img"
              ></div>
            </ng-template>
          </tedi-select>
        </div>
        <div style="width: 100px;">
          <tedi-select
            inputId="value-icon"
            label="Icon"
            [options]="iconOptions"
            bindLabel="name"
            bindValue="id"
            [clearable]="false"
            [dropdownWidthRef]="null"
            dropdownType="grid"
            formControlName="icon"
          >
            <ng-template tediSelectValue let-item>
              <tedi-icon [name]="item.icon" [size]="24" [attr.aria-label]="item.name" />
            </ng-template>
            <ng-template tediSelectOption let-item>
              <tedi-icon [name]="item.icon" [size]="18" [attr.aria-label]="item.name" />
            </ng-template>
          </tedi-select>
        </div>
      </form>
    `,
  }),
};

export const Examples: Story = {
  render: () => ({
    props: {
      // Example 1 - Multiselect with Select All
      selectAllOptions: [
        { id: 1, name: "Asukohad" },
        { id: 2, name: "Arstid" },
        { id: 3, name: "Haiglad" },
      ],
      // Example 2 - Scrollable list
      scrollableOptions: [
        "Erakorralise meditsiini osakond",
        "Sisehaigused",
        "Kardioloogia",
        "Neuroloogia",
        "Ortopeedia",
        "Pediaatria",
        "Psühhiaatria",
        "Radioloogia",
        "Kirurgia",
        "Uroloogia",
        "Dermatoloogia",
        "Onkoloogia",
        "Gastroenteroloogia",
        "Pulmonoloogia",
        "Nefroloogia",
        "Endokrinoloogia",
        "Reumatoloogia",
        "Nakkushaigused",
        "Hematoloogia",
        "Allergoloogia ja immunoloogia",
        "Geriaatria",
        "Neonatoloogia",
        "Palliatiivravi",
        "Taastusravi",
        "Anestesioloogia",
        "Patoloogia",
        "Nukleaarmeditsiin",
        "Oftalmoloogia",
        "Kõrva-nina-kurguhaigused",
        "Plastikakirurgia",
        "Veresoontekirurgia",
        "Rindkerekirurgia",
        "Kolorektaalkirurgia",
        "Traumakirurgia",
        "Günekoloogia",
        "Sünnitusabi",
        "Reproduktiivmeditsiin",
        "Spordimeditsiin",
        "Valuravi",
        "Unemeditsiin",
        "Intensiivravi",
      ],
      // Example 3 & 5 & 6 - Grouped options
      groupedOptions: [
        { id: 1, name: "Erakorralise meditsiini osakond", category: "Erakorraline" },
        { id: 2, name: "Valvevastuvõtt", category: "Erakorraline" },
        { id: 3, name: "Sisehaigused", category: "Sisehaigused" },
        { id: 4, name: "Kardioloogia", category: "Sisehaigused" },
        { id: 5, name: "Neuroloogia", category: "Sisehaigused" },
        { id: 6, name: "Üldkirurgia", category: "Kirurgia" },
        { id: 7, name: "Ortopeediline kirurgia", category: "Kirurgia" },
        { id: 8, name: "Neurokirurgia", category: "Kirurgia" },
      ],
      // Example 4 - Options with descriptions
      descriptionOptions: [
        {
          id: 1,
          title: "Juurdepääs terviseandmetele",
          description: "Arstid näevad teie terviseandmeid",
        },
        {
          id: 2,
          title: "Juurdepääs ravimitele ja terviseandmetele",
          description:
            "Arstid näevad teie ravimeid ja terviseandmeid",
        },
        {
          id: 3,
          title: "Juurdepääs kõigele",
          description: "Arstid näevad kogu teie teavet",
        },
      ],
      // Example 7 - Options with horizontal meta
      metaOptions: [
        { id: 1, name: "Tallinn", slots: 3 },
        { id: 2, name: "Tartu", slots: 4 },
        { id: 3, name: "Elva", slots: 7 },
        { id: 4, name: "Pärnu", slots: 2 },
        { id: 5, name: "Narva", slots: 5 },
      ],
      // Multiselect with custom templates
      permissionOptions: [
        {
          id: 1,
          title: "Lugemisõigused",
          description: "Saab vaadata dokumente ja faile",
        },
        {
          id: 2,
          title: "Kirjutamisõigused",
          description: "Saab luua ja muuta dokumente",
        },
        {
          id: 3,
          title: "Administraatoriõigused",
          description: "Täielik juurdepääs kõigile funktsioonidele",
        },
      ],
    },
    template: `
      <div style="display: flex; flex-direction: column; justify-content: flex-start;" [tediVerticalSpacing]="1">
        <tedi-select
          inputId="example-1"
          label="Multiselect with Select All"
          placeholder="Vali kategooriad..."
          [options]="selectAllOptions"
          bindLabel="name"
          bindValue="id"
          [allowMultiple]="true"
          [showSelectAll]="true"
          [clearable]="false"
        />
        <tedi-select
          inputId="example-2"
          label="Scrollable list"
          placeholder="Vali osakond..."
          [options]="scrollableOptions"
          [clearable]="false"
        />
        <tedi-select
          inputId="example-2b"
          label="Searchable select"
          placeholder="Otsi osakondi..."
          [options]="scrollableOptions"
          [searchable]="true"
          [clearable]="true"
        />
        <tedi-select
          inputId="example-2c"
          label="Osakonnad"
          placeholder="Otsi ja vali osakondi..."
          [options]="scrollableOptions"
          [searchable]="true"
          [allowMultiple]="true"
          [clearable]="true"
          [isTagRemovable]="true"
        />
        <tedi-select
          inputId="example-2d"
          label="Searchable multiselect with clearSearchOnSelect"
          placeholder="Otsi ja vali osakondi..."
          [options]="scrollableOptions"
          [searchable]="true"
          [allowMultiple]="true"
          [clearable]="true"
          [isTagRemovable]="true"
          [clearSearchOnSelect]="true"
        />
        <tedi-select
          inputId="example-3"
          label="Grouped single select"
          placeholder="Vali osakond..."
          [options]="groupedOptions"
          bindLabel="name"
          bindValue="id"
          groupBy="category"
          [clearable]="false"
        />
        <tedi-select
          inputId="example-4"
          label="Options with descriptions"
          placeholder="Vali juurdepääsutase..."
          [options]="descriptionOptions"
          bindLabel="title"
          bindValue="id"
          [clearable]="false"
        >
          <ng-template tediSelectOption let-item>
            <tedi-dropdown-item-value layout="vertical">
              <tedi-dropdown-item-value-label>{{ item.title }}</tedi-dropdown-item-value-label>
              <tedi-dropdown-item-value-meta>{{ item.description }}</tedi-dropdown-item-value-meta>
            </tedi-dropdown-item-value>
          </ng-template>
        </tedi-select>
        <tedi-select
          inputId="example-5"
          label="Grouped multiselect"
          placeholder="Vali osakonnad..."
          [options]="groupedOptions"
          bindLabel="name"
          bindValue="id"
          groupBy="category"
          [allowMultiple]="true"
          [clearable]="true"
        />
        <tedi-select
          inputId="example-5b"
          label="Grouped multiselect with selectable groups"
          placeholder="Vali osakonnad..."
          [options]="groupedOptions"
          bindLabel="name"
          bindValue="id"
          groupBy="category"
          [allowMultiple]="true"
          [selectableGroups]="true"
          [clearable]="true"
        />
        <tedi-select
          inputId="example-6"
          label="Grouped multiselect with Select All"
          placeholder="Vali osakonnad..."
          [options]="groupedOptions"
          bindLabel="name"
          bindValue="id"
          groupBy="category"
          [allowMultiple]="true"
          [showSelectAll]="true"
          [selectableGroups]="true"
          [clearable]="true"
        />
        <tedi-select
          inputId="example-7"
          label="Options with horizontal meta"
          placeholder="Vali asukoht..."
          [options]="metaOptions"
          bindLabel="name"
          bindValue="id"
          [clearable]="false"
        >
          <ng-template tediSelectOption let-item>
            <tedi-dropdown-item-value>
              <tedi-dropdown-item-value-label>{{ item.name }}</tedi-dropdown-item-value-label>
              <tedi-dropdown-item-value-meta>{{ item.slots }} vaba aega</tedi-dropdown-item-value-meta>
            </tedi-dropdown-item-value>
          </ng-template>
        </tedi-select>
        <tedi-select
          inputId="example-8"
          label="Single select with radio buttons"
          placeholder="Vali juurdepääsutase..."
          [options]="descriptionOptions"
          bindLabel="title"
          bindValue="id"
          [clearable]="false"
        >
          <ng-template tediSelectOption let-item let-selected="selected">
            <tedi-dropdown-item-value type="radio" layout="vertical" [selected]="selected">
              <tedi-dropdown-item-value-label>{{ item.title }}</tedi-dropdown-item-value-label>
            </tedi-dropdown-item-value>
          </ng-template>
        </tedi-select>
        <tedi-select
          inputId="multiselect-custom"
          label="Multiselect with custom templates"
          placeholder="Vali õigused..."
          [options]="permissionOptions"
          bindLabel="title"
          bindValue="id"
          [allowMultiple]="true"
          [clearable]="true"
        >
          <ng-template tediSelectOption let-item let-selected="selected">
            <tedi-dropdown-item-value type="checkbox" layout="vertical" [selected]="selected">
              <tedi-dropdown-item-value-label>{{ item.title }}</tedi-dropdown-item-value-label>
              <tedi-dropdown-item-value-meta>{{ item.description }}</tedi-dropdown-item-value-meta>
            </tedi-dropdown-item-value>
          </ng-template>
        </tedi-select>
      </div>
    `,
  }),
};

@Component({
  selector: "storybook-select-reactive-forms-demo",
  standalone: true,
  imports: [
    SelectComponent,
    SelectOptionTemplateDirective,
    ReactiveFormsModule,
    DropdownItemValueComponent,
    DropdownItemValueLabelComponent,
    DropdownItemValueMetaComponent,
    VerticalSpacingDirective,
    AlertComponent,
    TextComponent,
    JsonPipe,
  ],
  template: `
    <form
      [formGroup]="form"
      style="display: flex; flex-direction: column;"
      [tediVerticalSpacing]="1"
    >
      <tedi-select
        inputId="rf-location"
        label="Asukoht"
        placeholder="Vali asukoht..."
        [options]="locationOptions"
        bindLabel="name"
        bindValue="id"
        formControlName="location"
      >
        <ng-template tediSelectOption let-item>
          <tedi-dropdown-item-value>
            <tedi-dropdown-item-value-label>{{ item.name }}</tedi-dropdown-item-value-label>
            <tedi-dropdown-item-value-meta>{{ item.slots }} kohta</tedi-dropdown-item-value-meta>
          </tedi-dropdown-item-value>
        </ng-template>
      </tedi-select>

      <tedi-select
        inputId="rf-access"
        label="Juurdepääsutase"
        placeholder="Vali juurdepääs..."
        [options]="accessOptions"
        bindLabel="title"
        bindValue="id"
        formControlName="access"
      >
        <ng-template tediSelectOption let-item let-selected="selected">
          <tedi-dropdown-item-value type="radio" layout="vertical" [selected]="selected">
            <tedi-dropdown-item-value-label>{{ item.title }}</tedi-dropdown-item-value-label>
            <tedi-dropdown-item-value-meta>{{ item.description }}</tedi-dropdown-item-value-meta>
          </tedi-dropdown-item-value>
        </ng-template>
      </tedi-select>

      <tedi-select
        inputId="rf-permissions"
        label="Õigused"
        placeholder="Vali õigused..."
        [options]="permissionOptions"
        bindLabel="title"
        bindValue="id"
        [allowMultiple]="true"
        [searchable]="true"
        formControlName="permissions"
      >
        <ng-template tediSelectOption let-item let-selected="selected">
          <tedi-dropdown-item-value type="checkbox" layout="vertical" [selected]="selected">
            <tedi-dropdown-item-value-label>{{ item.title }}</tedi-dropdown-item-value-label>
            <tedi-dropdown-item-value-meta>{{ item.description }}</tedi-dropdown-item-value-meta>
          </tedi-dropdown-item-value>
        </ng-template>
      </tedi-select>

      <tedi-alert type="info" [showClose]="false">
        <pre tedi-text modifiers="small">{{ form.value | json }}</pre>
      </tedi-alert>
    </form>
  `,
})
class SelectReactiveFormsDemoComponent {
  locationOptions = [
    { id: 1, name: "Tallinn", slots: 3 },
    { id: 2, name: "Tartu", slots: 5 },
    { id: 3, name: "Pärnu", slots: 2 },
    { id: 4, name: "Narva", slots: 4 },
  ];

  accessOptions = [
    { id: 1, title: "Terviseandmed", description: "Juurdepääs terviseandmetele" },
    { id: 2, title: "Ravimid", description: "Juurdepääs ravimite ajaloole" },
    { id: 3, title: "Analüüside tulemused", description: "Juurdepääs laborianalüüside tulemustele" },
  ];

  permissionOptions = [
    { id: 1, title: "Lugemine", description: "Saab vaadata dokumente" },
    { id: 2, title: "Kirjutamine", description: "Saab luua ja muuta" },
    { id: 3, title: "Administraator", description: "Täielik juurdepääs" },
  ];

  form = new FormGroup({
    location: new FormControl(1),
    access: new FormControl(2),
    permissions: new FormControl([1, 2]),
  });
}

/**
 * The `tooltip` string input covers the common case. When the tooltip needs
 * formatting the plain string cannot express, project a `*tediSelectTooltip`
 * template instead — it takes precedence over the `tooltip` input.
 */
export const Tooltip: Story = {
  render: () => ({
    props: {
      options: simpleOptions,
    },
    template: `
      <div style="display: flex; flex-direction: column;" [tediVerticalSpacing]="3">
        <tedi-select
          inputId="tooltip-string"
          label="Elukoht"
          tooltip="Vali linn, kus sa praegu elad."
          [options]="options"
          bindLabel="label"
          bindValue="value"
        />
        <tedi-select
          inputId="tooltip-template"
          label="Elukoht"
          [options]="options"
          bindLabel="label"
          bindValue="value"
        >
          <ng-template tediSelectTooltip>
            Vali <b>linn</b>, kus sa <i>praegu</i> elad, mitte
            <u>rahvastikuregistri</u> aadress.
          </ng-template>
        </tedi-select>
      </div>
    `,
  }),
};

export const ReactiveForms: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [SelectReactiveFormsDemoComponent],
    },
    template: `<storybook-select-reactive-forms-demo />`,
  }),
};

interface PermissionOption {
  id: number;
  title: string;
  description: string;
}

@Component({
  selector: "storybook-select-custom-search-demo",
  standalone: true,
  imports: [
    SelectComponent,
    SelectOptionTemplateDirective,
    DropdownItemValueComponent,
    DropdownItemValueLabelComponent,
    DropdownItemValueMetaComponent,
  ],
  template: `
    <tedi-select
      inputId="custom-search"
      label="Dokumendiõigused"
      placeholder="Otsi pealkirja või kirjelduse järgi..."
      [options]="options"
      bindLabel="title"
      bindValue="id"
      [searchable]="true"
      [allowMultiple]="true"
      [clearable]="true"
      [isTagRemovable]="true"
      [searchFn]="searchFn"
    >
      <ng-template tediSelectOption let-item let-selected="selected">
        <tedi-dropdown-item-value type="checkbox" layout="vertical" [selected]="selected">
          <tedi-dropdown-item-value-label>{{ item.title }}</tedi-dropdown-item-value-label>
          <tedi-dropdown-item-value-meta>{{ item.description }}</tedi-dropdown-item-value-meta>
        </tedi-dropdown-item-value>
      </ng-template>
    </tedi-select>
  `,
})
class SelectCustomSearchDemoComponent {
  options: PermissionOption[] = [
    { id: 1, title: "Lugemisõigused", description: "Saab vaadata dokumente ja faile" },
    { id: 2, title: "Kirjutamisõigused", description: "Saab luua ja muuta dokumente" },
    { id: 3, title: "Administraatoriõigused", description: "Täielik juurdepääs kõigile funktsioonidele" },
    { id: 4, title: "Kustutamisõigused", description: "Saab eemaldada dokumente ja andmeid" },
  ];

  searchFn = (term: string, item: PermissionOption): boolean => {
    return item.title.toLowerCase().includes(term) || item.description.toLowerCase().includes(term);
  };
}

export const CustomSearchFunction: Story = {
  parameters: {
    docs: {
      source: {
        type: "code" as const,
        code:
          "// [searchFn] overrides the default label-based search.\n" +
          "// The item parameter contains all original properties of the option object.\n\n" +
          "searchFn = (term: string, item: PermissionOption): boolean =>\n" +
          "  item.title.toLowerCase().includes(term)\n" +
          "  || item.description.toLowerCase().includes(term);",
        language: "typescript",
      },
    },
  },
  render: () => ({
    moduleMetadata: {
      imports: [SelectCustomSearchDemoComponent],
    },
    template: `<storybook-select-custom-search-demo />`,
  }),
};

@Component({
  selector: "storybook-select-outputs-demo",
  standalone: true,
  imports: [SelectComponent, ButtonComponent, VerticalSpacingDirective],
  template: `
    <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: start;">
      <div style="display: flex; flex-direction: column;" [tediVerticalSpacing]="1">
        <tedi-select
          inputId="outputs-demo"
          label="Linnad"
          placeholder="Vali linn..."
          [options]="options"
          bindLabel="label"
          bindValue="value"
          [searchable]="true"
          [allowMultiple]="true"
          [clearable]="true"
          [isTagRemovable]="true"
          (selectionChange)="logEvent('selectionChange', $event)"
          (searchChange)="logEvent('searchChange', $event)"
          (opened)="logEvent('opened')"
          (closed)="logEvent('closed')"
          (cleared)="logEvent('cleared')"
        />
        <button tedi-button variant="secondary" (click)="clearLog()">Tühjenda logi</button>
      </div>
      <div
        style="
          font-family: monospace;
          font-size: 12px;
          background: var(--general-surface-primary);
          border: 1px solid var(--general-border-primary);
          border-radius: 4px;
          padding: 12px;
          min-height: 240px;
          max-height: 400px;
          overflow: auto;
        "
      >
        @if (events().length === 0) {
          <span style="color: var(--general-text-tertiary);">Interact with the select to see events.</span>
        } @else {
          @for (event of events(); track $index) {
            <div>
              <strong>{{ event.name }}</strong>
              @if (event.payload !== undefined) {
                <span> → {{ event.payload }}</span>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
})
class SelectOutputsDemoComponent {
  options = [
    { value: "tallinn", label: "Tallinn" },
    { value: "narva", label: "Narva" },
    { value: "tartu", label: "Tartu" },
    { value: "elva", label: "Elva" },
    { value: "rakvere", label: "Rakvere" },
    { value: "haapsalu", label: "Haapsalu" },
  ];

  events = signal<{ name: string; payload?: string }[]>([]);

  logEvent(name: string, payload?: unknown): void {
    const formatted = payload === undefined ? undefined : JSON.stringify(payload);
    this.events.update((list) => [{ name, payload: formatted }, ...list].slice(0, 50));
  }

  clearLog(): void {
    this.events.set([]);
  }
}

/**
 * Interactive demo of every output the component emits. Pick options, type in the search field,
 * open/close the dropdown, and click the clear button to see each event fire in the log on the right.
 */
export const Outputs: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [SelectOutputsDemoComponent],
    },
    template: `<storybook-select-outputs-demo />`,
  }),
};
