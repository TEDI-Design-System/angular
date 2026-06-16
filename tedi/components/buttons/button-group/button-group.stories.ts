import { signal } from "@angular/core";
import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { ButtonGroupComponent } from "./button-group.component";
import { ButtonGroupButtonDirective } from "./button-group-button/button-group-button.directive";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";

/**
 * <a href="https://www.figma.com/design/ze9LXyoxEdGV8vpEdat7Oi/Button-group-buttons?node-id=136-19706&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/82e9cf-button-group" target="_blank">Zeroheight ↗</a><br>
 *
 * Group of toggle buttons used as a view switcher (an alternative to tabs).
 * Selection lives on the group via `[(value)]`.
 * Below the `mobileBreakpoint` (when `enableMobileDropdown` is true) the group collapses into a dropdown menu.
 */
export default {
  title: "TEDI-Ready/Components/Buttons/ButtonGroup",
  component: ButtonGroupComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ButtonGroupComponent,
        ButtonGroupButtonDirective,
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
  args: {
    variant: "primary-button-group",
    size: "default",
    stretch: false,
    multiple: false,
    enableMobileDropdown: false,
    mobileBreakpoint: "md",
    dropdownLabelMode: "static",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary-button-group",
        "secondary-button-group",
        "primary",
        "secondary",
        "success",
        "danger",
      ],
      description:
        "Variant applied to every item (each item may override via its own `variant`). Any `ButtonVariant` works; non-group variants show their active colors when selected.",
      table: {
        defaultValue: { summary: "primary-button-group" },
        type: { summary: "ButtonVariant" },
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
    multiple: {
      control: "boolean",
      description: "Allow several values to be toggled on (value becomes string[]).",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
        category: "ButtonGroup inputs",
      },
    },
    stretch: {
      control: "boolean",
      description: "When true, items share horizontal space equally.",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
        category: "ButtonGroup inputs",
      },
    },
    ariaLabel: {
      control: "text",
      description: "Accessible name for the group.",
      table: { type: { summary: "string" }, category: "ButtonGroup inputs" },
    },
    enableMobileDropdown: {
      control: "boolean",
      description: "Collapse the strip into a dropdown below `mobileBreakpoint`.",
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
    dropdownTriggerVariant: {
      control: "select",
      options: ["primary", "secondary", "neutral"],
      description: "Variant for the mobile trigger. Derived from `variant` when unset.",
      table: { type: { summary: "ButtonVariant" }, category: "ButtonGroup inputs" },
    },
    dropdownLabel: {
      control: "text",
      description: "Label shown on the dropdown trigger.",
      table: { type: { summary: "string" }, category: "ButtonGroup inputs" },
    },
    dropdownLabelMode: {
      control: "select",
      options: ["static", "selected"],
      description: "`static` keeps `dropdownLabel`; `selected` shows the selected item's label.",
      table: {
        defaultValue: { summary: "static" },
        type: { summary: "'static' | 'selected'" },
        category: "ButtonGroup inputs",
      },
    },
    value: {
      control: false,
      description: "Selected value(s). `string` in single mode, `string[]` in multiple.",
      table: {
        type: { summary: "string | string[]" },
        category: "ButtonGroup inputs",
      },
    },
    selectionChange: {
      action: "selectionChange",
      description: "Emits the value of the item the user toggled.",
      table: {
        type: { summary: "EventEmitter<string>" },
        category: "ButtonGroup events",
      },
    },
  },
} as Meta<ButtonGroupComponent>;

type Story = StoryObj<ButtonGroupComponent>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, value: signal<string>("2") },
    template: `
      <tedi-button-group
        [variant]="variant"
        [size]="size"
        [multiple]="multiple"
        [stretch]="stretch"
        [ariaLabel]="ariaLabel"
        [enableMobileDropdown]="enableMobileDropdown"
        [mobileBreakpoint]="mobileBreakpoint"
        [dropdownTriggerVariant]="dropdownTriggerVariant"
        [dropdownLabel]="dropdownLabel"
        [dropdownLabelMode]="dropdownLabelMode"
        [value]="value()"
        (valueChange)="value.set($event)"
      >
        <button tedi-button-group-button value="1" label="Details">Details</button>
        <button tedi-button-group-button value="2" label="Updates">Updates</button>
        <button tedi-button-group-button value="3" label="Settings">Settings</button>
      </tedi-button-group>
    `,
  }),
  args: {
    ariaLabel: "Button group example",
  },
};

/**
 * Both variants. Showcase — controls are disabled.
 */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { v1: signal<string>("2"), v2: signal<string>("2") },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-button-group variant="primary-button-group" ariaLabel="Primary tabs"
          [value]="v1()" (valueChange)="v1.set($event)">
          <button tedi-button-group-button value="1" label="Tab 1">Tab 1</button>
          <button tedi-button-group-button value="2" label="Tab 2">Tab 2</button>
          <button tedi-button-group-button value="3" label="Tab 3">Tab 3</button>
        </tedi-button-group>
        <tedi-button-group variant="secondary-button-group" ariaLabel="Secondary tabs"
          [value]="v2()" (valueChange)="v2.set($event)">
          <button tedi-button-group-button value="1" label="Tab 1">Tab 1</button>
          <button tedi-button-group-button value="2" label="Tab 2">Tab 2</button>
          <button tedi-button-group-button value="3" label="Tab 3">Tab 3</button>
        </tedi-button-group>
      </div>
    `,
  }),
};

/**
 * Both sizes. Showcase — controls are disabled.
 */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { v1: signal<string>("2"), v2: signal<string>("2") },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-button-group size="default" ariaLabel="Default size"
          [value]="v1()" (valueChange)="v1.set($event)">
          <button tedi-button-group-button value="1" label="Tab 1">Tab 1</button>
          <button tedi-button-group-button value="2" label="Tab 2">Tab 2</button>
          <button tedi-button-group-button value="3" label="Tab 3">Tab 3</button>
        </tedi-button-group>
        <tedi-button-group size="small" ariaLabel="Small size"
          [value]="v2()" (valueChange)="v2.set($event)">
          <button tedi-button-group-button value="1" label="Tab 1">Tab 1</button>
          <button tedi-button-group-button value="2" label="Tab 2">Tab 2</button>
          <button tedi-button-group-button value="3" label="Tab 3">Tab 3</button>
        </tedi-button-group>
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  render: (args) => ({
    props: { ...args, value: signal<string>("2") },
    template: `
      <tedi-button-group ariaLabel="With icons" [variant]="variant" [size]="size"
        [value]="value()" (valueChange)="value.set($event)">
        <button tedi-button-group-button value="1" label="Tab 1" iconLeft="table">Tab 1</button>
        <button tedi-button-group-button value="2" label="Tab 2" iconLeft="refresh">Tab 2</button>
        <button tedi-button-group-button value="3" label="Tab 3" iconLeft="settings">Tab 3</button>
      </tedi-button-group>
    `,
  }),
};

export const IconOnly: Story = {
  render: (args) => ({
    props: { ...args, value: signal<string>("2") },
    template: `
      <tedi-button-group ariaLabel="Icon-only tabs" [variant]="variant" [size]="size"
        [value]="value()" (valueChange)="value.set($event)">
        <button tedi-button-group-button value="1" label="Table view" icon="table"></button>
        <button tedi-button-group-button value="2" label="Refresh" icon="refresh"></button>
        <button tedi-button-group-button value="3" label="Settings" icon="settings"></button>
      </tedi-button-group>
    `,
  }),
};

export const Stretched: Story = {
  render: (args) => ({
    props: { ...args, value: signal<string>("2") },
    template: `
      <tedi-button-group ariaLabel="Stretched" [stretch]="true" [variant]="variant" [size]="size"
        [value]="value()" (valueChange)="value.set($event)">
        <button tedi-button-group-button value="1" label="Details">Details</button>
        <button tedi-button-group-button value="2" label="Updates">Updates</button>
        <button tedi-button-group-button value="3" label="Settings">Settings</button>
      </tedi-button-group>
    `,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: { ...args, value: signal<string>("1") },
    template: `
      <tedi-button-group ariaLabel="With disabled item" [variant]="variant" [size]="size"
        [value]="value()" (valueChange)="value.set($event)">
        <button tedi-button-group-button value="1" label="Details">Details</button>
        <button tedi-button-group-button value="2" label="Updates">Updates</button>
        <button tedi-button-group-button value="3" label="Settings" [disabled]="true">Settings</button>
      </tedi-button-group>
    `,
  }),
};

/**
 * All states for both variants. Showcase — controls are disabled.
 */
export const States: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: ".pseudo-hover .tedi-button:first-child",
      focusVisible: ".pseudo-focus .tedi-button:first-child",
    },
  },
  render: () => ({
    props: {
      STATES: ["Default", "Hover", "Selected", "Focus", "Disabled"],
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
              <tedi-button-group variant="primary-button-group" [ariaLabel]="'Primary ' + state"
                [value]="state === 'Selected' ? 'p' : undefined">
                <button
                  tedi-button-group-button
                  value="p"
                  label="Tab 1"
                  [disabled]="state === 'Disabled'"
                >Tab 1</button>
              </tedi-button-group>
            </tedi-col>
            <tedi-col [class]="'pseudo-' + state.toLowerCase()">
              <tedi-button-group variant="secondary-button-group" [ariaLabel]="'Secondary ' + state"
                [value]="state === 'Selected' ? 's' : undefined">
                <button
                  tedi-button-group-button
                  value="s"
                  label="Tab 1"
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
  render: (args) => ({
    props: { ...args, value: signal<string>("2") },
    template: `
      <div style="max-width: 320px;">
        <tedi-button-group
          ariaLabel="Mobile collapses to dropdown"
          [variant]="variant"
          [enableMobileDropdown]="true"
          mobileBreakpoint="xxl"
          [dropdownTriggerVariant]="dropdownTriggerVariant"
          dropdownLabelMode="selected"
          [value]="value()"
          (valueChange)="value.set($event)"
        >
          <button tedi-button-group-button value="1" label="Details" iconLeft="info">Details</button>
          <button tedi-button-group-button value="2" label="Updates" iconLeft="refresh">Updates</button>
          <button tedi-button-group-button value="3" label="Settings" iconLeft="settings">Settings</button>
        </tedi-button-group>
      </div>
    `,
  }),
};

/**
 * Bind `[(value)]` to a string in single mode and read it back.
 */
export const Controlled: Story = {
  render: (args) => ({
    props: { ...args, selected: signal<string>("2") },
    template: `
      <tedi-button-group
        ariaLabel="View"
        [variant]="variant"
        [value]="selected()"
        (valueChange)="selected.set($event)"
      >
        <button tedi-button-group-button value="1" label="Details">Details</button>
        <button tedi-button-group-button value="2" label="Updates">Updates</button>
        <button tedi-button-group-button value="3" label="Settings">Settings</button>
      </tedi-button-group>
      <p style="margin-top: 8px;">Selected: {{ selected() }}</p>
    `,
  }),
};

/**
 * Set `multiple` to toggle several values; `value` is a string array.
 */
export const Multiple: Story = {
  render: (args) => ({
    props: { ...args, selected: signal<string[]>(["open"]) },
    template: `
      <tedi-button-group
        ariaLabel="Filters"
        [variant]="variant"
        [multiple]="true"
        [value]="selected()"
        (valueChange)="selected.set($event)"
      >
        <button tedi-button-group-button value="new" label="New">New</button>
        <button tedi-button-group-button value="open" label="Open">Open</button>
        <button tedi-button-group-button value="done" label="Done">Done</button>
      </tedi-button-group>
      <p style="margin-top: 8px;">Selected: {{ selected().join(", ") }}</p>
    `,
  }),
};

/**
 * Any `ButtonVariant` works in the group — set it on the group (a selected item
 * shows that variant's active colors), or override `variant` on a single item.
 * Showcase — controls are disabled.
 */
export const OtherVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { v1: signal<string>("2"), v2: signal<string>("1") },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-button-group variant="secondary" ariaLabel="Secondary group"
          [value]="v1()" (valueChange)="v1.set($event)">
          <button tedi-button-group-button value="1" label="One">One</button>
          <button tedi-button-group-button value="2" label="Two">Two</button>
          <button tedi-button-group-button value="3" label="Three">Three</button>
        </tedi-button-group>
        <tedi-button-group variant="primary-button-group" ariaLabel="Per-item override"
          [value]="v2()" (valueChange)="v2.set($event)">
          <button tedi-button-group-button value="1" label="Keep">Keep</button>
          <button tedi-button-group-button value="2" label="Default">Default</button>
          <button tedi-button-group-button value="3" variant="danger" label="Danger">Danger</button>
        </tedi-button-group>
      </div>
    `,
  }),
};
