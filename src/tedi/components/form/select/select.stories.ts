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
import { Component, inject, signal } from "@angular/core";
import { ToastService } from "../../../services/toast/toast.service";

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
      description:
        "Unique identifier for the select input element. Used for label association and accessibility.",
    },
    label: {
      control: "text",
      description: "Label text displayed above the select.",
    },
    tooltip: {
      control: "text",
      description:
        "When set, renders an info button next to the label that reveals this text in a tooltip.",
    },
    ariaLabelledby: {
      control: false,
      description:
        "Associates the select with an external visible label by its element id. A native `<label for>` cannot target the combobox (it is a `<div>`), so use this when the label lives outside the component. Ignored when `label` is set.",
    },
    ariaLabel: {
      control: false,
      description:
        "Accessible name used when there is no visible label to reference. Ignored when `label` or `ariaLabelledby` provides a name.",
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
      description: 'Whether to show a "Select All" option in multiselect mode.',
    },
    selectableGroups: {
      control: "boolean",
      description: "Whether group headers are selectable in multiselect mode.",
    },
    isTagRemovable: {
      control: "boolean",
      description:
        "Whether tags in multiselect mode can be removed by clicking.",
    },
    multiRow: {
      control: "boolean",
      description:
        "Whether selected tags wrap to multiple rows in multiselect mode.",
    },
    tagEllipsis: {
      control: "radio",
      options: [false, "start", "end"],
      description:
        "Which end a tag's label truncates from when it doesn't fit. `false` never truncates; `end` → `label…`; `start` → `…label`.",
    },
    searchable: {
      control: "boolean",
      description:
        "Whether the select has a search input for filtering options.",
    },
    searchFn: {
      control: false,
      description:
        "Custom search function `(term: string, item: T) => boolean`. When provided, overrides the default label-based search.",
    },
    clearSearchOnSelect: {
      control: "boolean",
      description:
        "Whether to clear the search input after an option is selected. Mostly useful for searchable multiselect.",
    },
    selectionChange: {
      action: "selectionChange",
      control: false,
      description:
        "Emitted whenever the selection changes (option click, tag removal, clear, select-all, group toggle). Payload is the selected value (or `null`) in single-select, or the array of selected values in multi-select.",
    },
    searchChange: {
      action: "searchChange",
      control: false,
      description:
        "Emitted with the current search term whenever the user types in the search input. Only fires when `searchable` is `true`.",
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
      description:
        "Emitted when the user clicks the clear button. Fires alongside `selectionChange`, which carries the new (empty) value.",
    },
    dropdownType: {
      control: "radio",
      options: ["menu", "grid"],
      description:
        'Use "grid" for swatch-type selects with custom option templates (e.g. color or icon pickers).',
    },
    options: {
      control: "object",
      description: "Array of options to display in the dropdown.",
    },
    maxDropdownHeight: {
      control: "number",
      description:
        "Value in pixels. When not set, fits available viewport space.",
    },
  },
  args: {
    inputId: "select-1",
    label: "Label",
    required: false,
    placeholder: "Select an option...",
    state: "default",
    size: "default",
    clearable: false,
    allowMultiple: false,
    showSelectAll: false,
    selectableGroups: false,
    isTagRemovable: false,
    multiRow: false,
    tagEllipsis: false,
    searchable: false,
    clearSearchOnSelect: false,
    dropdownType: "menu",
    maxDropdownHeight: undefined,
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
        [searchable]="searchable"
        [clearSearchOnSelect]="clearSearchOnSelect"
        [maxDropdownHeight]="maxDropdownHeight"
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
        "Longer text",
        "Longer text on one row",
        "Third option",
        "Fourth option",
        "Fifth option",
      ],
      colorOptions: [
        { id: 1, name: "Transparent", color: "transparent" },
        { id: 2, name: "White", color: "#ffffff" },
        { id: 3, name: "Red", color: "#f42a25" },
        { id: 4, name: "Magenta", color: "#e81e63" },
        { id: 5, name: "Purple", color: "#b21f7e" },
        { id: 6, name: "Violet", color: "#673ab7" },
        { id: 7, name: "Indigo", color: "#3f51b5" },
        { id: 8, name: "Blue", color: "#3f88c5" },
        { id: 9, name: "Light blue", color: "#03a9f3" },
        { id: 10, name: "Cyan", color: "#00bcd3" },
        { id: 11, name: "Teal", color: "#009688" },
        { id: 12, name: "Green", color: "#4caf50" },
        { id: 13, name: "Light green", color: "#8bc24a" },
        { id: 14, name: "Lime", color: "#ccdb39" },
        { id: 15, name: "Yellow", color: "#f2d611" },
        { id: 16, name: "Amber", color: "#ffc107" },
        { id: 17, name: "Orange", color: "#ff9800" },
        { id: 18, name: "Deep orange", color: "#ff5722" },
        { id: 19, name: "Grey", color: "#9e9e9e" },
        { id: 20, name: "Blue grey", color: "#607d8b" },
        { id: 21, name: "Brown", color: "#795548" },
        { id: 22, name: "Black", color: "#0d0d0d" },
      ],
      iconOptions: [
        { id: 1, name: "Desktop", icon: "computer" },
        { id: 2, name: "Phone", icon: "smartphone" },
        { id: 3, name: "Tablet", icon: "tablet_mac" },
        { id: 4, name: "Watch", icon: "watch" },
        { id: 5, name: "TV", icon: "tv" },
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
          "Longer text",
          "Longer text on one row",
          "Third option",
          "Fourth option",
          "Fifth option",
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
        { id: 1, name: "Locations" },
        { id: 2, name: "Doctors" },
        { id: 3, name: "Hospitals" },
      ],
      // Example 2 - Scrollable list
      scrollableOptions: [
        "Emergency department",
        "Internal medicine",
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "Pediatrics",
        "Psychiatry",
        "Radiology",
        "Surgery",
        "Urology",
        "Dermatology",
        "Oncology",
        "Gastroenterology",
        "Pulmonology",
        "Nephrology",
        "Endocrinology",
        "Rheumatology",
        "Infectious diseases",
        "Hematology",
        "Allergy and immunology",
        "Geriatrics",
        "Neonatology",
        "Palliative care",
        "Physical medicine",
        "Anesthesiology",
        "Pathology",
        "Nuclear medicine",
        "Ophthalmology",
        "Otolaryngology",
        "Plastic surgery",
        "Vascular surgery",
        "Thoracic surgery",
        "Colorectal surgery",
        "Trauma surgery",
        "Gynecology",
        "Obstetrics",
        "Reproductive medicine",
        "Sports medicine",
        "Pain management",
        "Sleep medicine",
        "Critical care",
      ],
      // Example 3 & 5 & 6 - Grouped options
      groupedOptions: [
        { id: 1, name: "Emergency department", category: "Emergency" },
        { id: 2, name: "Urgent care", category: "Emergency" },
        { id: 3, name: "Internal medicine", category: "Internal" },
        { id: 4, name: "Cardiology", category: "Internal" },
        { id: 5, name: "Neurology", category: "Internal" },
        { id: 6, name: "General surgery", category: "Surgery" },
        { id: 7, name: "Orthopedic surgery", category: "Surgery" },
        { id: 8, name: "Neurosurgery", category: "Surgery" },
      ],
      // Example 4 - Options with descriptions
      descriptionOptions: [
        {
          id: 1,
          title: "Access to health data",
          description: "Doctors will be able to see your health data",
        },
        {
          id: 2,
          title: "Access to medications and health data",
          description:
            "Doctors will be able to see your medications and health data",
        },
        {
          id: 3,
          title: "Access to all",
          description: "Doctors will be able to see all your information",
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
          title: "Read permissions",
          description: "Can view documents and files",
        },
        {
          id: 2,
          title: "Write permissions",
          description: "Can create and edit documents",
        },
        {
          id: 3,
          title: "Admin permissions",
          description: "Full access to all features",
        },
      ],
    },
    template: `
      <div style="display: flex; flex-direction: column; justify-content: flex-start;" [tediVerticalSpacing]="1">
        <tedi-select
          inputId="example-1"
          label="Multiselect with Select All"
          placeholder="Select options..."
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
          placeholder="Select department..."
          [options]="scrollableOptions"
          [clearable]="false"
        />
        <tedi-select
          inputId="example-2b"
          label="Searchable select"
          placeholder="Search departments..."
          [options]="scrollableOptions"
          [searchable]="true"
          [clearable]="true"
        />
        <tedi-select
          inputId="example-2c"
          label="Searchable multiselect"
          placeholder="Search and select departments..."
          [options]="scrollableOptions"
          [searchable]="true"
          [allowMultiple]="true"
          [clearable]="true"
          [isTagRemovable]="true"
        />
        <tedi-select
          inputId="example-2d"
          label="Searchable multiselect with clearSearchOnSelect"
          placeholder="Search and select departments..."
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
          placeholder="Select department..."
          [options]="groupedOptions"
          bindLabel="name"
          bindValue="id"
          groupBy="category"
          [clearable]="false"
        />
        <tedi-select
          inputId="example-4"
          label="Options with descriptions"
          placeholder="Select access level..."
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
          placeholder="Select departments..."
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
          placeholder="Select departments..."
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
          placeholder="Select departments..."
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
          placeholder="Select location..."
          [options]="metaOptions"
          bindLabel="name"
          bindValue="id"
          [clearable]="false"
        >
          <ng-template tediSelectOption let-item>
            <tedi-dropdown-item-value>
              <tedi-dropdown-item-value-label>{{ item.name }}</tedi-dropdown-item-value-label>
              <tedi-dropdown-item-value-meta>{{ item.slots }} timeslots available</tedi-dropdown-item-value-meta>
            </tedi-dropdown-item-value>
          </ng-template>
        </tedi-select>
        <tedi-select
          inputId="example-8"
          label="Single select with radio buttons"
          placeholder="Select access level..."
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
          placeholder="Select permissions..."
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
    ButtonComponent,
    DropdownItemValueComponent,
    DropdownItemValueLabelComponent,
    DropdownItemValueMetaComponent,
    VerticalSpacingDirective,
  ],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
      style="display: flex; flex-direction: column;"
      [tediVerticalSpacing]="1"
    >
      <tedi-select
        inputId="rf-location"
        label="Location"
        placeholder="Select location..."
        [options]="locationOptions"
        bindLabel="name"
        bindValue="id"
        formControlName="location"
      >
        <ng-template tediSelectOption let-item>
          <tedi-dropdown-item-value>
            <tedi-dropdown-item-value-label>{{
              item.name
            }}</tedi-dropdown-item-value-label>
            <tedi-dropdown-item-value-meta
              >{{ item.slots }} slots</tedi-dropdown-item-value-meta
            >
          </tedi-dropdown-item-value>
        </ng-template>
      </tedi-select>

      <tedi-select
        inputId="rf-access"
        label="Access level"
        placeholder="Select access..."
        [options]="accessOptions"
        bindLabel="title"
        bindValue="id"
        formControlName="access"
      >
        <ng-template tediSelectOption let-item let-selected="selected">
          <tedi-dropdown-item-value
            type="radio"
            layout="vertical"
            [selected]="selected"
          >
            <tedi-dropdown-item-value-label>{{
              item.title
            }}</tedi-dropdown-item-value-label>
            <tedi-dropdown-item-value-meta>{{
              item.description
            }}</tedi-dropdown-item-value-meta>
          </tedi-dropdown-item-value>
        </ng-template>
      </tedi-select>

      <tedi-select
        inputId="rf-permissions"
        label="Permissions"
        placeholder="Select permissions..."
        [options]="permissionOptions"
        bindLabel="title"
        bindValue="id"
        [allowMultiple]="true"
        [searchable]="true"
        formControlName="permissions"
      >
        <ng-template tediSelectOption let-item let-selected="selected">
          <tedi-dropdown-item-value
            type="checkbox"
            layout="vertical"
            [selected]="selected"
          >
            <tedi-dropdown-item-value-label>{{
              item.title
            }}</tedi-dropdown-item-value-label>
            <tedi-dropdown-item-value-meta>{{
              item.description
            }}</tedi-dropdown-item-value-meta>
          </tedi-dropdown-item-value>
        </ng-template>
      </tedi-select>

      <button tedi-button type="submit">Submit</button>
    </form>
  `,
})
class SelectReactiveFormsDemoComponent {
  private readonly toastService = inject(ToastService);

  locationOptions = [
    { id: 1, name: "Tallinn", slots: 3 },
    { id: 2, name: "Tartu", slots: 5 },
    { id: 3, name: "Pärnu", slots: 2 },
    { id: 4, name: "Narva", slots: 4 },
  ];

  accessOptions = [
    { id: 1, title: "Health data", description: "Access to health records" },
    {
      id: 2,
      title: "Medications",
      description: "Access to medication history",
    },
    {
      id: 3,
      title: "Lab results",
      description: "Access to laboratory results",
    },
  ];

  permissionOptions = [
    { id: 1, title: "Read", description: "Can view documents" },
    { id: 2, title: "Write", description: "Can create and edit" },
    { id: 3, title: "Admin", description: "Full access" },
  ];

  form = new FormGroup({
    location: new FormControl(1),
    access: new FormControl(2),
    permissions: new FormControl([1, 2]),
  });

  onSubmit(): void {
    this.toastService.success("Success", "Form submitted successfully");
  }
}

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
      label="Searchable with custom search function"
      placeholder="Search by title or description..."
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
        <tedi-dropdown-item-value
          type="checkbox"
          layout="vertical"
          [selected]="selected"
        >
          <tedi-dropdown-item-value-label>{{
            item.title
          }}</tedi-dropdown-item-value-label>
          <tedi-dropdown-item-value-meta>{{
            item.description
          }}</tedi-dropdown-item-value-meta>
        </tedi-dropdown-item-value>
      </ng-template>
    </tedi-select>
  `,
})
class SelectCustomSearchDemoComponent {
  options: PermissionOption[] = [
    {
      id: 1,
      title: "Read permissions",
      description: "Can view documents and files",
    },
    {
      id: 2,
      title: "Write permissions",
      description: "Can create and edit documents",
    },
    {
      id: 3,
      title: "Admin permissions",
      description: "Full access to all features",
    },
    {
      id: 4,
      title: "Delete permissions",
      description: "Can remove documents and data",
    },
  ];

  searchFn = (term: string, item: PermissionOption): boolean => {
    return (
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
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
    <div
      style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: start;"
    >
      <div
        style="display: flex; flex-direction: column;"
        [tediVerticalSpacing]="1"
      >
        <tedi-select
          inputId="outputs-demo"
          label="Searchable multiselect"
          placeholder="Pick a city..."
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
        <button tedi-button variant="secondary" (click)="clearLog()">
          Clear log
        </button>
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
          <span style="color: var(--general-text-tertiary);"
            >Interact with the select to see events.</span
          >
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
    const formatted =
      payload === undefined ? undefined : JSON.stringify(payload);
    this.events.update((list) =>
      [{ name, payload: formatted }, ...list].slice(0, 50),
    );
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
