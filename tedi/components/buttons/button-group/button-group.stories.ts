import { signal } from "@angular/core";
import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { ButtonGroupComponent } from "./button-group.component";
import { ButtonGroupItemDirective } from "./button-group-item/button-group-item.directive";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.70?node-id=3506-29547&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/82e9cf-button-group" target="_blank">Zeroheight ↗</a><br>
 *
 * Group of mutually exclusive buttons. Use for switching between related
 * views, switching layouts (table / list / calendar), or filtering. Below
 * the `mobileBreakpoint` (when `enableMobileDropdown` is true) the group
 * collapses into a dropdown menu.
 */
export default {
  title: "TEDI-Ready/Components/Buttons/ButtonGroup",
  component: ButtonGroupComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ButtonGroupComponent,
        ButtonGroupItemDirective,
        RowComponent,
        ColComponent,
        TextComponent,
      ],
    }),
  ],
  parameters: {
    status: {
      type: ["breakpointSupport"],
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary"],
      description: "Visual style of the group.",
      table: {
        defaultValue: { summary: "primary" },
        type: { summary: "'primary' | 'secondary'" },
        category: "ButtonGroup inputs",
      },
    },
    size: {
      control: "select",
      options: ["default", "small"],
      description: "Size of the items.",
      table: {
        defaultValue: { summary: "default" },
        type: { summary: "'default' | 'small'" },
        category: "ButtonGroup inputs",
      },
    },
    stretch: {
      control: "boolean",
      description:
        "When true, items share horizontal space equally. On mobile, items always stretch.",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
        category: "ButtonGroup inputs",
      },
    },
    ariaLabel: {
      control: "text",
      description:
        "Accessible name for the group. Required when no visible heading labels it.",
      table: { type: { summary: "string" }, category: "ButtonGroup inputs" },
    },
    enableMobileDropdown: {
      control: "boolean",
      description:
        "Collapse the strip into a dropdown menu below `mobileBreakpoint`.",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
        category: "ButtonGroup inputs",
      },
    },
    mobileBreakpoint: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl", "xxl"],
      description: "Breakpoint at which to switch to a dropdown.",
      table: {
        defaultValue: { summary: "md" },
        type: { summary: "Breakpoint" },
        category: "ButtonGroup inputs",
      },
    },
    dropdownLabel: {
      control: "text",
      description:
        "Label shown on the dropdown trigger. Falls back to the `buttonGroup.menu` translation.",
      table: { type: { summary: "string" }, category: "ButtonGroup inputs" },
    },
    dropdownLabelMode: {
      control: "select",
      options: ["static", "selected"],
      description:
        "`static` keeps `dropdownLabel`; `selected` shows the selected item's label.",
      table: {
        defaultValue: { summary: "static" },
        type: { summary: "'static' | 'selected'" },
        category: "ButtonGroup inputs",
      },
    },
    selectionChange: {
      action: "selectionChange",
      description: "Emits the `id` of the item the user activated.",
      table: {
        type: { summary: "EventEmitter<string>" },
        category: "ButtonGroup events",
      },
    },
    id: {
      control: false,
      description:
        "(ButtonGroupItem) Unique identifier emitted via `selectionChange`. Required.",
      table: {
        type: { summary: "string" },
        category: "ButtonGroupItem inputs",
      },
    },
    label: {
      control: false,
      description:
        "(ButtonGroupItem) Display label used in the mobile dropdown trigger/items. Required.",
      table: {
        type: { summary: "string" },
        category: "ButtonGroupItem inputs",
      },
    },
    selected: {
      control: false,
      description:
        "(ButtonGroupItem) Marks this item as currently selected. Drives the `--selected` class and `aria-pressed`.",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
        category: "ButtonGroupItem inputs",
      },
    },
    disabled: {
      control: false,
      description:
        "(ButtonGroupItem) Disables the item via the native `disabled` attribute.",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
        category: "ButtonGroupItem inputs",
      },
    },
    iconLeft: {
      control: false,
      description:
        "(ButtonGroupItem) Icon name rendered before the label in the button and the mobile-dropdown item.",
      table: {
        type: { summary: "string" },
        category: "ButtonGroupItem inputs",
      },
    },
    iconRight: {
      control: false,
      description:
        "(ButtonGroupItem) Icon name rendered after the label in the button and the mobile-dropdown item.",
      table: {
        type: { summary: "string" },
        category: "ButtonGroupItem inputs",
      },
    },
    icon: {
      control: false,
      description:
        "(ButtonGroupItem) Icon-only mode for the dropdown trigger/item.",
      table: {
        type: { summary: "string" },
        category: "ButtonGroupItem inputs",
      },
    },
    clicked: {
      control: false,
      description:
        "(ButtonGroupItem) Fires on user activation. Disabled items don't emit.",
      table: {
        type: { summary: "EventEmitter<MouseEvent>" },
        category: "ButtonGroupItem events",
      },
    },
  },
} as Meta<ButtonGroupComponent>;

type Story = StoryObj<ButtonGroupComponent>;

export const Default: Story = {
  render: (props) => ({
    props,
    template: `
      <tedi-button-group
        [variant]="variant"
        [size]="size"
        [stretch]="stretch"
        [ariaLabel]="ariaLabel"
        [enableMobileDropdown]="enableMobileDropdown"
        [mobileBreakpoint]="mobileBreakpoint"
        [dropdownLabel]="dropdownLabel"
        [dropdownLabelMode]="dropdownLabelMode"
      >
        <button tedi-button-group-item id="1" label="Details">Details</button>
        <button tedi-button-group-item id="2" label="Updates" [selected]="true">Updates</button>
        <button tedi-button-group-item id="3" label="Settings">Settings</button>
      </tedi-button-group>
    `,
  }),
  args: {
    variant: "primary",
    size: "default",
    stretch: false,
    ariaLabel: "Button group example",
    enableMobileDropdown: false,
    mobileBreakpoint: "md",
    dropdownLabelMode: "static",
  },
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-button-group variant="primary" ariaLabel="Primary tabs">
          <button tedi-button-group-item id="1" label="Tab 1">Tab 1</button>
          <button tedi-button-group-item id="2" label="Tab 2" [selected]="true">Tab 2</button>
          <button tedi-button-group-item id="3" label="Tab 3">Tab 3</button>
        </tedi-button-group>
        <tedi-button-group variant="secondary" ariaLabel="Secondary tabs">
          <button tedi-button-group-item id="1" label="Tab 1">Tab 1</button>
          <button tedi-button-group-item id="2" label="Tab 2" [selected]="true">Tab 2</button>
          <button tedi-button-group-item id="3" label="Tab 3">Tab 3</button>
        </tedi-button-group>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-button-group size="default" ariaLabel="Default size">
          <button tedi-button-group-item id="1" label="Tab 1">Tab 1</button>
          <button tedi-button-group-item id="2" label="Tab 2" [selected]="true">Tab 2</button>
          <button tedi-button-group-item id="3" label="Tab 3">Tab 3</button>
        </tedi-button-group>
        <tedi-button-group size="small" ariaLabel="Small size">
          <button tedi-button-group-item id="1" label="Tab 1">Tab 1</button>
          <button tedi-button-group-item id="2" label="Tab 2" [selected]="true">Tab 2</button>
          <button tedi-button-group-item id="3" label="Tab 3">Tab 3</button>
        </tedi-button-group>
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    template: `
      <tedi-button-group ariaLabel="With icons">
        <button tedi-button-group-item id="1" label="Tab 1" iconLeft="table">Tab 1</button>
        <button tedi-button-group-item id="2" label="Tab 2" iconLeft="refresh" [selected]="true">Tab 2</button>
        <button tedi-button-group-item id="3" label="Tab 3" iconLeft="settings">Tab 3</button>
      </tedi-button-group>
    `,
  }),
};

export const IconOnly: Story = {
  render: () => ({
    template: `
      <tedi-button-group ariaLabel="Icon-only tabs">
        <button tedi-button-group-item id="1" label="Table view" icon="table"></button>
        <button tedi-button-group-item id="2" label="Refresh" icon="refresh" [selected]="true"></button>
        <button tedi-button-group-item id="3" label="Settings" icon="settings"></button>
      </tedi-button-group>
    `,
  }),
};

export const DifferentWidthButtons: Story = {
  render: () => ({
    template: `
      <tedi-button-group ariaLabel="Variable widths">
        <button tedi-button-group-item id="1" label="Text" [selected]="true">Text</button>
        <button tedi-button-group-item id="2" label="Longer text">Longer text</button>
        <button tedi-button-group-item id="3" label="Even longer text">Even longer text</button>
      </tedi-button-group>
    `,
  }),
};

export const Stretched: Story = {
  render: () => ({
    template: `
      <tedi-button-group ariaLabel="Stretched" [stretch]="true">
        <button tedi-button-group-item id="1" label="Details">Details</button>
        <button tedi-button-group-item id="2" label="Updates" [selected]="true">Updates</button>
        <button tedi-button-group-item id="3" label="Settings">Settings</button>
      </tedi-button-group>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <tedi-button-group ariaLabel="With disabled item">
        <button tedi-button-group-item id="1" label="Details" [selected]="true">Details</button>
        <button tedi-button-group-item id="2" label="Updates">Updates</button>
        <button tedi-button-group-item id="3" label="Settings" [disabled]="true">Settings</button>
      </tedi-button-group>
    `,
  }),
};

export const States: Story = {
  parameters: {
    pseudo: {
      hover: ".pseudo-hover .tedi-button-group__item:first-child",
      focusVisible: ".pseudo-focus .tedi-button-group__item:first-child",
    },
  },
  render: () => ({
    props: {
      STATES: ["Default", "Hover", "Active", "Focus", "Disabled"],
    },
    template: `
      <div style="overflow-x: auto; padding: 24px;">
        <tedi-row [cols]="3" [gap]="3" alignItems="center" style="min-width: 720px;">
          <tedi-col><p tedi-text modifiers="bold">State</p></tedi-col>
          <tedi-col><p tedi-text modifiers="bold">Primary</p></tedi-col>
          <tedi-col><p tedi-text modifiers="bold">Secondary</p></tedi-col>

          @for (state of STATES; track state) {
            <tedi-col><p tedi-text modifiers="bold">{{ state }}</p></tedi-col>
            <tedi-col [class]="'pseudo-' + state.toLowerCase()">
              <tedi-button-group variant="primary" [ariaLabel]="'Primary ' + state">
                <button
                  tedi-button-group-item
                  [id]="'p-' + state"
                  label="Tab 1"
                  [selected]="state === 'Active'"
                  [disabled]="state === 'Disabled'"
                >Tab 1</button>
              </tedi-button-group>
            </tedi-col>
            <tedi-col [class]="'pseudo-' + state.toLowerCase()">
              <tedi-button-group variant="secondary" [ariaLabel]="'Secondary ' + state">
                <button
                  tedi-button-group-item
                  [id]="'s-' + state"
                  label="Tab 1"
                  [selected]="state === 'Active'"
                  [disabled]="state === 'Disabled'"
                >Tab 1</button>
              </tedi-button-group>
            </tedi-col>
          }
        </tedi-row>
      </div>
    `,
  }),
};

export const MobileDropdown: Story = {
  render: () => ({
    template: `
      <div style="max-width: 320px;">
        <tedi-button-group
          ariaLabel="Mobile collapses to dropdown"
          [enableMobileDropdown]="true"
          mobileBreakpoint="xxl"
          dropdownLabelMode="selected"
        >
          <button tedi-button-group-item id="1" label="Details" iconLeft="info">Details</button>
          <button tedi-button-group-item id="2" label="Updates" iconLeft="refresh" [selected]="true">Updates</button>
          <button tedi-button-group-item id="3" label="Settings" iconLeft="settings">Settings</button>
        </tedi-button-group>
      </div>
    `,
  }),
};

/**
 * Bind `[selected]` from local state and listen to
 * `(selectionChange)` to update it.
 */
export const Controlled: StoryObj<{ variant: "primary" | "secondary" }> = {
  render: (props) => ({
    props: {
      ...props,
      selected: signal("2"),
    },
    template: `
      <tedi-button-group
        ariaLabel="View"
        [variant]="variant"
        (selectionChange)="selected.set($event)"
      >
        <button tedi-button-group-item id="1" label="Details" [selected]="selected() === '1'">Details</button>
        <button tedi-button-group-item id="2" label="Updates" [selected]="selected() === '2'">Updates</button>
        <button tedi-button-group-item id="3" label="Settings" [selected]="selected() === '3'">Settings</button>
      </tedi-button-group>
      <p style="margin-top: 8px;">Selected: {{ selected() }}</p>
    `,
  }),
  args: {
    variant: "primary",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary"],
    },
  },
};
