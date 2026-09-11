import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { DropdownItemValueComponent } from "./dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "./dropdown-item-value-label.component";
import { DropdownItemValueMetaComponent } from "./dropdown-item-value-meta.component";
import { IconComponent } from "../../../base";
import { VerticalSpacingDirective } from "../../../../directives/vertical-spacing/vertical-spacing.directive";

/**
 * The DropdownItemValue component provides a reusable structure for rendering option content
 * in both Select and Dropdown components. It supports built-in checkbox/radio indicators
 * and flexible layouts for label and meta text.
 *
 * ## Usage
 *
 * Use this component inside dropdown items or select options to render structured content
 * with optional selection indicators.
 *
 * ### Basic usage
 * ```html
 * <tedi-dropdown-item-value>
 *   <tedi-dropdown-item-value-label>Option 1</tedi-dropdown-item-value-label>
 * </tedi-dropdown-item-value>
 * ```
 *
 * ### With meta text
 * ```html
 * <tedi-dropdown-item-value>
 *   <tedi-dropdown-item-value-label>Tallinn</tedi-dropdown-item-value-label>
 *   <tedi-dropdown-item-value-meta>3 timeslots</tedi-dropdown-item-value-meta>
 * </tedi-dropdown-item-value>
 * ```
 *
 * ### With checkbox (multiselect)
 * ```html
 * <tedi-dropdown-item-value type="checkbox" [selected]="isSelected">
 *   <tedi-dropdown-item-value-label>Option 1</tedi-dropdown-item-value-label>
 * </tedi-dropdown-item-value>
 * ```
 */

export default {
  title: "TEDI-Ready/Components/Overlay/DropdownItemValue",
  component: DropdownItemValueComponent,
  decorators: [
    moduleMetadata({
      imports: [
        DropdownItemValueComponent,
        DropdownItemValueLabelComponent,
        DropdownItemValueMetaComponent,
        IconComponent,
        VerticalSpacingDirective,
      ],
    }),
  ],
  argTypes: {
    type: {
      control: "radio",
      options: ["default", "checkbox", "radio"],
      description: "Type of selection indicator",
      table: {
        type: { summary: "DropdownItemValueType" },
        defaultValue: { summary: "default" },
      },
    },
    layout: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout of label and meta content",
      table: {
        type: { summary: "DropdownItemValueLayout" },
        defaultValue: { summary: "horizontal" },
      },
    },
    selected: {
      control: "boolean",
      description:
        "Whether the item is selected (controls checkbox/radio state)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the item is disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    clipContent: {
      control: "boolean",
      description:
        "`tedi-dropdown-item-value-label` input. Whether the label clips overflowing content for text ellipsis. Set `false` when the label holds decorations that sit outside the line box (e.g. status indicator), so they are not cut off.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
  },
  args: {
    type: "default",
    layout: "horizontal",
    selected: false,
    disabled: false,
    clipContent: true,
  },
} as Meta<DropdownItemValueComponent>;

type Story = StoryObj<DropdownItemValueComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-dropdown-item-value [type]="type" [layout]="layout" [selected]="selected" [disabled]="disabled">
        <tedi-dropdown-item-value-label [clipContent]="clipContent">Option 1</tedi-dropdown-item-value-label>
      </tedi-dropdown-item-value>
    `,
  }),
};

export const WithMeta: Story = {
  name: "With Meta (Horizontal)",
  render: () => ({
    template: `
      <tedi-dropdown-item-value>
        <tedi-dropdown-item-value-label>Tallinn</tedi-dropdown-item-value-label>
        <tedi-dropdown-item-value-meta>3 timeslots available</tedi-dropdown-item-value-meta>
      </tedi-dropdown-item-value>
    `,
  }),
};

export const Vertical: Story = {
  name: "Vertical Layout",
  render: () => ({
    template: `
      <tedi-dropdown-item-value layout="vertical">
        <tedi-dropdown-item-value-label>Access to health data</tedi-dropdown-item-value-label>
        <tedi-dropdown-item-value-meta>Doctors will be able to see your health data</tedi-dropdown-item-value-meta>
      </tedi-dropdown-item-value>
    `,
  }),
};

export const WithCheckbox: Story = {
  name: "With Checkbox",
  render: () => ({
    props: {
      selected: false,
    },
    template: `
      <div [tediVerticalSpacing]="0.5">
        <tedi-dropdown-item-value type="checkbox" [selected]="false">
          <tedi-dropdown-item-value-label>Unchecked option</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
        <tedi-dropdown-item-value type="checkbox" [selected]="true">
          <tedi-dropdown-item-value-label>Checked option</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
        <tedi-dropdown-item-value type="checkbox" [selected]="false" [disabled]="true">
          <tedi-dropdown-item-value-label>Disabled option</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
        <tedi-dropdown-item-value type="checkbox" [selected]="true" [disabled]="true">
          <tedi-dropdown-item-value-label>Disabled checked option</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
      </div>
    `,
  }),
};

export const WithRadio: Story = {
  name: "With Radio",
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="0.5">
        <tedi-dropdown-item-value type="radio" [selected]="false">
          <tedi-dropdown-item-value-label>Unselected option</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
        <tedi-dropdown-item-value type="radio" [selected]="true">
          <tedi-dropdown-item-value-label>Selected option</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
        <tedi-dropdown-item-value type="radio" [selected]="false" [disabled]="true">
          <tedi-dropdown-item-value-label>Disabled option</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
        <tedi-dropdown-item-value type="radio" [selected]="true" [disabled]="true">
          <tedi-dropdown-item-value-label>Disabled selected option</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  name: "With Leading Icon",
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="0.5">
        <tedi-dropdown-item-value>
          <tedi-icon name="computer" [size]="18" />
          <tedi-dropdown-item-value-label>Desktop</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
        <tedi-dropdown-item-value>
          <tedi-icon name="smartphone" [size]="18" />
          <tedi-dropdown-item-value-label>Phone</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
        <tedi-dropdown-item-value>
          <tedi-icon name="tablet_mac" [size]="18" />
          <tedi-dropdown-item-value-label>Tablet</tedi-dropdown-item-value-label>
        </tedi-dropdown-item-value>
      </div>
    `,
  }),
};

export const WithIconAndMeta: Story = {
  name: "With Icon and Meta",
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="0.5">
        <tedi-dropdown-item-value>
          <tedi-icon name="location_on" [size]="18" />
          <tedi-dropdown-item-value-label>Tallinn</tedi-dropdown-item-value-label>
          <tedi-dropdown-item-value-meta>3 timeslots</tedi-dropdown-item-value-meta>
        </tedi-dropdown-item-value>
        <tedi-dropdown-item-value>
          <tedi-icon name="location_on" [size]="18" />
          <tedi-dropdown-item-value-label>Tartu</tedi-dropdown-item-value-label>
          <tedi-dropdown-item-value-meta>5 timeslots</tedi-dropdown-item-value-meta>
        </tedi-dropdown-item-value>
      </div>
    `,
  }),
};

export const CheckboxWithMeta: Story = {
  name: "Checkbox with Meta (Vertical)",
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="0.5">
        <tedi-dropdown-item-value type="checkbox" layout="vertical" [selected]="true">
          <tedi-dropdown-item-value-label>Access to health data</tedi-dropdown-item-value-label>
          <tedi-dropdown-item-value-meta>Doctors will be able to see your health data</tedi-dropdown-item-value-meta>
        </tedi-dropdown-item-value>
        <tedi-dropdown-item-value type="checkbox" layout="vertical" [selected]="false">
          <tedi-dropdown-item-value-label>Access to medications</tedi-dropdown-item-value-label>
          <tedi-dropdown-item-value-meta>Doctors will be able to see your medications</tedi-dropdown-item-value-meta>
        </tedi-dropdown-item-value>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div>
          <strong style="display: block; margin-bottom: 8px;">Default (Label only)</strong>
          <tedi-dropdown-item-value>
            <tedi-dropdown-item-value-label>Option 1</tedi-dropdown-item-value-label>
          </tedi-dropdown-item-value>
        </div>

        <div>
          <strong style="display: block; margin-bottom: 8px;">Horizontal (Label + Meta)</strong>
          <tedi-dropdown-item-value>
            <tedi-dropdown-item-value-label>Tallinn</tedi-dropdown-item-value-label>
            <tedi-dropdown-item-value-meta>3 timeslots available</tedi-dropdown-item-value-meta>
          </tedi-dropdown-item-value>
        </div>

        <div>
          <strong style="display: block; margin-bottom: 8px;">Vertical (Label + Description)</strong>
          <tedi-dropdown-item-value layout="vertical">
            <tedi-dropdown-item-value-label>Access to health data</tedi-dropdown-item-value-label>
            <tedi-dropdown-item-value-meta>Doctors will be able to see your health data</tedi-dropdown-item-value-meta>
          </tedi-dropdown-item-value>
        </div>

        <div>
          <strong style="display: block; margin-bottom: 8px;">With Checkbox (Multiselect)</strong>
          <tedi-dropdown-item-value type="checkbox" [selected]="true">
            <tedi-dropdown-item-value-label>Selected option</tedi-dropdown-item-value-label>
          </tedi-dropdown-item-value>
        </div>

        <div>
          <strong style="display: block; margin-bottom: 8px;">With Radio (Single select)</strong>
          <tedi-dropdown-item-value type="radio" [selected]="true">
            <tedi-dropdown-item-value-label>Selected option</tedi-dropdown-item-value-label>
          </tedi-dropdown-item-value>
        </div>

        <div>
          <strong style="display: block; margin-bottom: 8px;">With Leading Icon</strong>
          <tedi-dropdown-item-value>
            <tedi-icon name="computer" [size]="18" />
            <tedi-dropdown-item-value-label>Desktop</tedi-dropdown-item-value-label>
          </tedi-dropdown-item-value>
        </div>

        <div>
          <strong style="display: block; margin-bottom: 8px;">Full Example (Checkbox + Icon + Vertical)</strong>
          <tedi-dropdown-item-value type="checkbox" layout="vertical" [selected]="true">
            <tedi-icon name="verified_user" [size]="18" />
            <tedi-dropdown-item-value-label>Admin permissions</tedi-dropdown-item-value-label>
            <tedi-dropdown-item-value-meta>Full access to all features and settings</tedi-dropdown-item-value-meta>
          </tedi-dropdown-item-value>
        </div>
      </div>
    `,
  }),
};
