import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { OptionContentComponent } from "./option-content.component";
import { OptionContentLabelComponent } from "./option-content-label.component";
import { OptionContentMetaComponent } from "./option-content-meta.component";
import { IconComponent } from "../../base";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";

/**
 * The OptionContent component provides a reusable structure for rendering option content
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
 * <tedi-option-content>
 *   <tedi-option-content-label>Option 1</tedi-option-content-label>
 * </tedi-option-content>
 * ```
 *
 * ### With meta text
 * ```html
 * <tedi-option-content>
 *   <tedi-option-content-label>Tallinn</tedi-option-content-label>
 *   <tedi-option-content-meta>3 timeslots</tedi-option-content-meta>
 * </tedi-option-content>
 * ```
 *
 * ### With checkbox (multiselect)
 * ```html
 * <tedi-option-content type="checkbox" [selected]="isSelected">
 *   <tedi-option-content-label>Option 1</tedi-option-content-label>
 * </tedi-option-content>
 * ```
 */

export default {
  title: "TEDI-Ready/Components/Helpers/OptionContent",
  component: OptionContentComponent,
  decorators: [
    moduleMetadata({
      imports: [
        OptionContentComponent,
        OptionContentLabelComponent,
        OptionContentMetaComponent,
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
        type: { summary: "OptionContentType" },
        defaultValue: { summary: "default" },
      },
    },
    layout: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout of label and meta content",
      table: {
        type: { summary: "OptionContentLayout" },
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
        "`tedi-option-content-label` input. Whether the label clips overflowing content for text ellipsis. Set `false` when the label holds decorations that sit outside the line box (e.g. status indicator), so they are not cut off.",
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
} as Meta<OptionContentComponent>;

type Story = StoryObj<OptionContentComponent>;

export const Default: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: (args) => ({
    props: args,
    template: `
      <tedi-option-content [type]="type" [layout]="layout" [selected]="selected" [disabled]="disabled">
        <tedi-option-content-label [clipContent]="clipContent">Option 1</tedi-option-content-label>
      </tedi-option-content>
    `,
  }),
};

export const WithMeta: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  name: "With Meta (Horizontal)",
  render: () => ({
    template: `
      <tedi-option-content>
        <tedi-option-content-label>Tallinn</tedi-option-content-label>
        <tedi-option-content-meta>3 timeslots available</tedi-option-content-meta>
      </tedi-option-content>
    `,
  }),
};

export const Vertical: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  name: "Vertical Layout",
  render: () => ({
    template: `
      <tedi-option-content layout="vertical">
        <tedi-option-content-label>Access to health data</tedi-option-content-label>
        <tedi-option-content-meta>Doctors will be able to see your health data</tedi-option-content-meta>
      </tedi-option-content>
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
        <tedi-option-content type="checkbox" [selected]="false">
          <tedi-option-content-label>Unchecked option</tedi-option-content-label>
        </tedi-option-content>
        <tedi-option-content type="checkbox" [selected]="true">
          <tedi-option-content-label>Checked option</tedi-option-content-label>
        </tedi-option-content>
        <tedi-option-content type="checkbox" [selected]="false" [disabled]="true">
          <tedi-option-content-label>Disabled option</tedi-option-content-label>
        </tedi-option-content>
        <tedi-option-content type="checkbox" [selected]="true" [disabled]="true">
          <tedi-option-content-label>Disabled checked option</tedi-option-content-label>
        </tedi-option-content>
      </div>
    `,
  }),
};

export const WithRadio: Story = {
  name: "With Radio",
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="0.5">
        <tedi-option-content type="radio" [selected]="false">
          <tedi-option-content-label>Unselected option</tedi-option-content-label>
        </tedi-option-content>
        <tedi-option-content type="radio" [selected]="true">
          <tedi-option-content-label>Selected option</tedi-option-content-label>
        </tedi-option-content>
        <tedi-option-content type="radio" [selected]="false" [disabled]="true">
          <tedi-option-content-label>Disabled option</tedi-option-content-label>
        </tedi-option-content>
        <tedi-option-content type="radio" [selected]="true" [disabled]="true">
          <tedi-option-content-label>Disabled selected option</tedi-option-content-label>
        </tedi-option-content>
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  name: "With Leading Icon",
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="0.5">
        <tedi-option-content>
          <tedi-icon name="computer" [size]="18" />
          <tedi-option-content-label>Desktop</tedi-option-content-label>
        </tedi-option-content>
        <tedi-option-content>
          <tedi-icon name="smartphone" [size]="18" />
          <tedi-option-content-label>Phone</tedi-option-content-label>
        </tedi-option-content>
        <tedi-option-content>
          <tedi-icon name="tablet_mac" [size]="18" />
          <tedi-option-content-label>Tablet</tedi-option-content-label>
        </tedi-option-content>
      </div>
    `,
  }),
};

export const WithIconAndMeta: Story = {
  name: "With Icon and Meta",
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="0.5">
        <tedi-option-content>
          <tedi-icon name="location_on" [size]="18" />
          <tedi-option-content-label>Tallinn</tedi-option-content-label>
          <tedi-option-content-meta>3 timeslots</tedi-option-content-meta>
        </tedi-option-content>
        <tedi-option-content>
          <tedi-icon name="location_on" [size]="18" />
          <tedi-option-content-label>Tartu</tedi-option-content-label>
          <tedi-option-content-meta>5 timeslots</tedi-option-content-meta>
        </tedi-option-content>
      </div>
    `,
  }),
};

export const CheckboxWithMeta: Story = {
  name: "Checkbox with Meta (Vertical)",
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="0.5">
        <tedi-option-content type="checkbox" layout="vertical" [selected]="true">
          <tedi-option-content-label>Access to health data</tedi-option-content-label>
          <tedi-option-content-meta>Doctors will be able to see your health data</tedi-option-content-meta>
        </tedi-option-content>
        <tedi-option-content type="checkbox" layout="vertical" [selected]="false">
          <tedi-option-content-label>Access to medications</tedi-option-content-label>
          <tedi-option-content-meta>Doctors will be able to see your medications</tedi-option-content-meta>
        </tedi-option-content>
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
          <tedi-option-content>
            <tedi-option-content-label>Option 1</tedi-option-content-label>
          </tedi-option-content>
        </div>

        <div>
          <strong style="display: block; margin-bottom: 8px;">Horizontal (Label + Meta)</strong>
          <tedi-option-content>
            <tedi-option-content-label>Tallinn</tedi-option-content-label>
            <tedi-option-content-meta>3 timeslots available</tedi-option-content-meta>
          </tedi-option-content>
        </div>

        <div>
          <strong style="display: block; margin-bottom: 8px;">Vertical (Label + Description)</strong>
          <tedi-option-content layout="vertical">
            <tedi-option-content-label>Access to health data</tedi-option-content-label>
            <tedi-option-content-meta>Doctors will be able to see your health data</tedi-option-content-meta>
          </tedi-option-content>
        </div>

        <div>
          <strong style="display: block; margin-bottom: 8px;">With Checkbox (Multiselect)</strong>
          <tedi-option-content type="checkbox" [selected]="true">
            <tedi-option-content-label>Selected option</tedi-option-content-label>
          </tedi-option-content>
        </div>

        <div>
          <strong style="display: block; margin-bottom: 8px;">With Radio (Single select)</strong>
          <tedi-option-content type="radio" [selected]="true">
            <tedi-option-content-label>Selected option</tedi-option-content-label>
          </tedi-option-content>
        </div>

        <div>
          <strong style="display: block; margin-bottom: 8px;">With Leading Icon</strong>
          <tedi-option-content>
            <tedi-icon name="computer" [size]="18" />
            <tedi-option-content-label>Desktop</tedi-option-content-label>
          </tedi-option-content>
        </div>

        <div>
          <strong style="display: block; margin-bottom: 8px;">Full Example (Checkbox + Icon + Vertical)</strong>
          <tedi-option-content type="checkbox" layout="vertical" [selected]="true">
            <tedi-icon name="verified_user" [size]="18" />
            <tedi-option-content-label>Admin permissions</tedi-option-content-label>
            <tedi-option-content-meta>Full access to all features and settings</tedi-option-content-meta>
          </tedi-option-content>
        </div>
      </div>
    `,
  }),
};
