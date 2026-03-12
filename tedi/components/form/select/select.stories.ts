import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { JsonPipe } from "@angular/common";
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { SelectComponent } from "./select.component";
import { SelectOptionTemplateDirective, SelectValueTemplateDirective } from "./select-templates.directive";
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
import { AlertComponent } from "../../notifications";

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
        AlertComponent,
      ],
    }),
  ],
  argTypes: {
    inputId: { control: "text" },
    label: { control: "text" },
    required: { control: "boolean" },
    placeholder: { control: "text" },
    state: { control: "radio", options: ["error", "valid", "default"] },
    size: { control: "radio", options: ["small", "default"] },
    clearable: { control: "boolean" },
    multiple: { control: "boolean" },
    showSelectAll: { control: "boolean" },
    selectableGroups: { control: "boolean" },
    clearableTags: { control: "boolean" },
    multiRow: { control: "boolean" },
    searchable: { control: "boolean" },
  },
  args: {
    inputId: "select-1",
    label: "Label",
    required: false,
    placeholder: "Select an option...",
    state: "default",
    size: "default",
    clearable: false,
    multiple: false,
    showSelectAll: false,
    selectableGroups: false,
    clearableTags: false,
    multiRow: false,
    searchable: false,
  },
};

export default meta;
type Story = StoryObj<SelectComponent>;

const simpleOptions = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"];

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: simpleOptions,
    },
    template: `
      <tedi-select
        [inputId]="inputId"
        [label]="label"
        [required]="required"
        [placeholder]="placeholder"
        [state]="state"
        [size]="size"
        [clearable]="clearable"
        [multiple]="multiple"
        [showSelectAll]="showSelectAll"
        [selectableGroups]="selectableGroups"
        [clearableTags]="clearableTags"
        [multiRow]="multiRow"
        [searchable]="searchable"
        [items]="options"
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
          [items]="options"
          size="default"
        />
        <tedi-select
          inputId="size-small"
          label="Small"
          [items]="options"
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
          [items]="options"
        />
        <tedi-select
          inputId="type-hint"
          label="With hint"
          [feedbackText]="feedbackText"
          [items]="options"
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
      multiselectOptions: ["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5", "Tag 6", "Tag 7", "Tag 8", "Tag 9", "Tag 10"],
      oneRowOptions: ["Longer text", "Longer text on one row", "Third option", "Fourth option", "Fifth option"],
      colorOptions: [
        { id: 1, name: "Cyan", color: "#59ced9" },
        { id: 2, name: "Blue", color: "#3b82f6" },
        { id: 3, name: "Green", color: "#22c55e" },
        { id: 4, name: "Red", color: "#ef4444" },
        { id: 5, name: "Purple", color: "#a855f7" },
      ],
      iconOptions: [
        { id: 1, name: "Desktop", icon: "computer" },
        { id: 2, name: "Phone", icon: "smartphone" },
        { id: 3, name: "Tablet", icon: "tablet_mac" },
        { id: 4, name: "Watch", icon: "watch" },
        { id: 5, name: "TV", icon: "tv" },
      ],
      form: new FormGroup({
        default: new FormControl("Option 1"),
        multiselect: new FormControl(["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5", "Tag 6", "Tag 7", "Tag 8", "Tag 9", "Tag 10"]),
        oneRow: new FormControl(["Longer text", "Longer text on one row", "Third option", "Fourth option", "Fifth option"]),
        color: new FormControl(1),
        icon: new FormControl(1),
      }),
    },
    template: `
      <form [formGroup]="form" style="display: flex; flex-direction: column;" [tediVerticalSpacing]="1">
        <tedi-select
          inputId="value-no-value"
          label="No value"
          [items]="options"
          [clearable]="false"
        />
        <tedi-select
          inputId="value-default"
          label="Default"
          [items]="options"
          [clearable]="true"
          formControlName="default"
        />
        <tedi-select
          inputId="value-placeholder"
          label="Placeholder"
          placeholder="Text value"
          [items]="options"
          [clearable]="false"
        />
        <tedi-select
          inputId="value-multiselect"
          label="Multiselect"
          [items]="multiselectOptions"
          [multiple]="true"
          [multiRow]="true"
          [clearableTags]="true"
          [clearable]="true"
          formControlName="multiselect"
        />
        <tedi-select
          inputId="value-multiselect-one-row"
          label="Multiselect one row"
          [items]="oneRowOptions"
          [multiple]="true"
          [multiRow]="false"
          [clearableTags]="true"
          [clearable]="true"
          formControlName="oneRow"
        />
        <div style="width: 100px;">
          <tedi-select
            inputId="value-color"
            label="Color"
            [items]="colorOptions"
            bindLabel="name"
            bindValue="id"
            [clearable]="false"
            formControlName="color"
          >
            <ng-template tediSelectValue let-item>
              <div
                style="width: 100%; height: 24px; border-radius: 3px;"
                [style.background]="item.color"
                [attr.aria-label]="item.name"
                role="img"
              ></div>
            </ng-template>
            <ng-template tediSelectOption let-item>
              <div
                style="width: 100%; height: 24px; border-radius: 2px; flex-shrink: 0;"
                [style.background]="item.color"
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
            [items]="iconOptions"
            bindLabel="name"
            bindValue="id"
            [clearable]="false"
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
          description: "Doctors will be able to see your medications and health data",
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
          [items]="selectAllOptions"
          bindLabel="name"
          bindValue="id"
          [multiple]="true"
          [showSelectAll]="true"
          [clearable]="false"
        />
        <tedi-select
          inputId="example-2"
          label="Scrollable list"
          placeholder="Select department..."
          [items]="scrollableOptions"
          [clearable]="false"
        />
        <tedi-select
          inputId="example-2b"
          label="Searchable select"
          placeholder="Search departments..."
          [items]="scrollableOptions"
          [searchable]="true"
          [clearable]="true"
        />
        <tedi-select
          inputId="example-2c"
          label="Searchable multiselect"
          placeholder="Search and select departments..."
          [items]="scrollableOptions"
          [searchable]="true"
          [multiple]="true"
          [clearable]="true"
          [clearableTags]="true"
        />
        <tedi-select
          inputId="example-3"
          label="Grouped single select"
          placeholder="Select department..."
          [items]="groupedOptions"
          bindLabel="name"
          bindValue="id"
          groupBy="category"
          [clearable]="false"
        />
        <tedi-select
          inputId="example-4"
          label="Options with descriptions"
          placeholder="Select access level..."
          [items]="descriptionOptions"
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
          [items]="groupedOptions"
          bindLabel="name"
          bindValue="id"
          groupBy="category"
          [multiple]="true"
          [selectableGroups]="true"
          [clearable]="true"
        />
        <tedi-select
          inputId="example-6"
          label="Grouped multiselect with Select All"
          placeholder="Select departments..."
          [items]="groupedOptions"
          bindLabel="name"
          bindValue="id"
          groupBy="category"
          [multiple]="true"
          [showSelectAll]="true"
          [selectableGroups]="true"
          [clearable]="true"
        />
        <tedi-select
          inputId="example-7"
          label="Options with horizontal meta"
          placeholder="Select location..."
          [items]="metaOptions"
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
          [items]="descriptionOptions"
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
          [items]="permissionOptions"
          bindLabel="title"
          bindValue="id"
          [multiple]="true"
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

export const ReactiveForms: Story = {
  render: () => ({
    props: {
      locationOptions: [
        { id: 1, name: "Tallinn", slots: 3 },
        { id: 2, name: "Tartu", slots: 5 },
        { id: 3, name: "Pärnu", slots: 2 },
        { id: 4, name: "Narva", slots: 4 },
      ],
      accessOptions: [
        { id: 1, title: "Health data", description: "Access to health records" },
        { id: 2, title: "Medications", description: "Access to medication history" },
        { id: 3, title: "Lab results", description: "Access to laboratory results" },
      ],
      permissionOptions: [
        { id: 1, title: "Read", description: "Can view documents" },
        { id: 2, title: "Write", description: "Can create and edit" },
        { id: 3, title: "Admin", description: "Full access" },
      ],
      form: new FormGroup({
        location: new FormControl(1),
        access: new FormControl(2),
        permissions: new FormControl([1, 2]),
      }),
      submitted: false,
      onSubmit(form: FormGroup, context: { submitted: boolean }) {
        context.submitted = true;
      },
    },
    template: `
      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit(form, this)"
        style="display: flex; flex-direction: column;"
        [tediVerticalSpacing]="1"
      >
        <tedi-alert type="success" title="Success" [open]="submitted">Form submitted</tedi-alert>

        <tedi-select
          inputId="rf-location"
          label="Location (horizontal meta)"
          placeholder="Select location..."
          [items]="locationOptions"
          bindLabel="name"
          bindValue="id"
          formControlName="location"
        >
          <ng-template tediSelectOption let-item>
            <tedi-dropdown-item-value>
              <tedi-dropdown-item-value-label>{{ item.name }}</tedi-dropdown-item-value-label>
              <tedi-dropdown-item-value-meta>{{ item.slots }} slots</tedi-dropdown-item-value-meta>
            </tedi-dropdown-item-value>
          </ng-template>
        </tedi-select>

        <tedi-select
          inputId="rf-access"
          label="Access level (radio + vertical)"
          placeholder="Select access..."
          [items]="accessOptions"
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
          label="Permissions (checkbox + vertical multiselect)"
          placeholder="Select permissions..."
          [items]="permissionOptions"
          bindLabel="title"
          bindValue="id"
          [multiple]="true"
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

        <button tedi-button type="submit">
          Submit
        </button>

        <div>
          <strong>Form values:</strong>
          <pre>{{ form.value | json }}</pre>
        </div>

      </form>
    `,
  }),
};
