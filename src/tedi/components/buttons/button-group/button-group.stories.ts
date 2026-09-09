import { signal } from "@angular/core";
import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { ButtonGroupComponent } from "./button-group.component";
import { ButtonGroupButtonDirective } from "./button-group-button/button-group-button.directive";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";

/**
 * <a href="https://www.figma.com/design/ze9LXyoxEdGV8vpEdat7Oi/Button-group-buttons?node-id=136-19706&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/82e9cf-button-group" target="_blank">Zeroheight ↗</a><br>
 *
 * Group of toggle buttons used as a view switcher (an alternative to tabs).
 * Selection lives on the group via `[(value)]`; set `multiple` to allow several
 * values at once. Below the `mobileBreakpoint` (when `enableMobileDropdown` is
 * true) the group collapses into a dropdown menu.
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
        TooltipComponent,
        TooltipTriggerComponent,
        TooltipContentComponent,
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
        category: "inputs",
      },
    },
    size: {
      control: "select",
      options: ["default", "small"],
      description: "Size of the items.",
      table: {
        defaultValue: { summary: "default" },
        type: { summary: "'default' | 'small'" },
        category: "inputs",
      },
    },
    multiple: {
      control: "boolean",
      description:
        "Allow several values to be toggled on (value becomes string[]).",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
        category: "inputs",
      },
    },
    stretch: {
      control: "boolean",
      description: "When true, items share horizontal space equally.",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
        category: "inputs",
      },
    },
    ariaLabel: {
      control: "text",
      description: "Accessible name for the group.",
      table: { type: { summary: "string" }, category: "inputs" },
    },
    enableMobileDropdown: {
      control: "boolean",
      description:
        "Collapse the strip into a dropdown below `mobileBreakpoint`.",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
        category: "inputs",
      },
    },
    mobileBreakpoint: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl", "xxl"],
      description: "Breakpoint at which to switch to a dropdown.",
      table: {
        defaultValue: { summary: "md" },
        type: { summary: "Breakpoint" },
        category: "inputs",
      },
    },
    dropdownLabel: {
      control: "text",
      description: "Label shown on the dropdown trigger.",
      table: { type: { summary: "string" }, category: "inputs" },
    },
    dropdownLabelMode: {
      control: "select",
      options: ["static", "selected"],
      description:
        "`static` keeps `dropdownLabel`; `selected` shows the selected item's label.",
      table: {
        defaultValue: { summary: "static" },
        type: { summary: "'static' | 'selected'" },
        category: "inputs",
      },
    },
    value: {
      control: false,
      description:
        "Selected value(s). `string` in single mode, `string[]` in multiple.",
      table: {
        type: { summary: "string | string[]" },
        category: "inputs",
      },
    },
    selectionChange: {
      action: "selectionChange",
      description: "Emits the value of the item the user toggled.",
      table: {
        type: { summary: "EventEmitter<string>" },
        category: "events",
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
        [dropdownLabel]="dropdownLabel"
        [dropdownLabelMode]="dropdownLabelMode"
        [value]="value()"
        (valueChange)="value.set($event)"
        (selectionChange)="selectionChange($event)"
      >
        <button tedi-button-group-button value="1" label="Tabel">Tabel</button>
        <button tedi-button-group-button value="2" label="Loend">Loend</button>
        <button tedi-button-group-button value="3" label="Kalender">Kalender</button>
      </tedi-button-group>
    `,
  }),
  args: {
    ariaLabel: "Vaate valik",
  },
};

/**
 * Sizes shown as a table. Showcase — controls are disabled.
 */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      sizes: ["default", "small"],
      values: { default: signal<string>("2"), small: signal<string>("2") },
    },
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        @for (size of sizes; track size) {
          <tedi-col>
            <tedi-row cols="1" [md]="{ cols: 12 }" [gapY]="1" alignItems="center">
              <tedi-col [width]="2">
                <p tedi-text modifiers="bold">{{ size === 'default' ? 'Default' : 'Small' }}</p>
              </tedi-col>
              <tedi-col [width]="10">
                <tedi-button-group [size]="size"
                  [ariaLabel]="size === 'default' ? 'Vaikesuurus' : 'Väike suurus'"
                  [value]="values[size]()" (valueChange)="values[size].set($event)">
                  <button tedi-button-group-button value="1" label="Tabel">Tabel</button>
                  <button tedi-button-group-button value="2" label="Loend">Loend</button>
                  <button tedi-button-group-button value="3" label="Kalender">Kalender</button>
                </tedi-button-group>
              </tedi-col>
            </tedi-row>
          </tedi-col>
        }
      </tedi-row>
    `,
  }),
};

/**
 * Both types (variants). Showcase — controls are disabled.
 */
export const Types: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { v1: signal<string>("2"), v2: signal<string>("2") },
    template: `
      <tedi-row [cols]="1" [gapY]="2">
        <tedi-col>
          <tedi-button-group variant="primary-button-group" ariaLabel="Esmane vaate valik"
            [value]="v1()" (valueChange)="v1.set($event)">
            <button tedi-button-group-button value="1" label="Tabel">Tabel</button>
            <button tedi-button-group-button value="2" label="Loend">Loend</button>
            <button tedi-button-group-button value="3" label="Kalender">Kalender</button>
          </tedi-button-group>
        </tedi-col>
        <tedi-col>
          <tedi-button-group variant="secondary-button-group" ariaLabel="Teisene vaate valik"
            [value]="v2()" (valueChange)="v2.set($event)">
            <button tedi-button-group-button value="1" label="Tabel">Tabel</button>
            <button tedi-button-group-button value="2" label="Loend">Loend</button>
            <button tedi-button-group-button value="3" label="Kalender">Kalender</button>
          </tedi-button-group>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const WithIcon: Story = {
  render: (args) => ({
    props: { ...args, value: signal<string>("2") },
    template: `
      <tedi-button-group ariaLabel="Ikoonidega" [variant]="variant" [size]="size"
        [value]="value()" (valueChange)="value.set($event)">
        <button tedi-button-group-button value="1" label="Tabel" iconLeft="table">Tabel</button>
        <button tedi-button-group-button value="2" label="Loend" iconLeft="list">Loend</button>
        <button tedi-button-group-button value="3" label="Kalender" iconLeft="calendar_month">Kalender</button>
      </tedi-button-group>
    `,
  }),
};

/**
 * Icon-only items have no visible label, so pair each with a `tedi-tooltip`
 * (the `label` input is still the accessible name). The tooltip wrapper keeps
 * the connected strip layout.
 */
export const IconOnly: Story = {
  render: (args) => ({
    props: { ...args, value: signal<string>("table") },
    template: `
      <tedi-button-group ariaLabel="Vaate valik" [variant]="variant" [size]="size"
        [value]="value()" (valueChange)="value.set($event)">
        <tedi-tooltip>
          <tedi-tooltip-trigger>
            <button tedi-button-group-button value="table" label="Tabel" icon="table"></button>
          </tedi-tooltip-trigger>
          <tedi-tooltip-content>Tabel</tedi-tooltip-content>
        </tedi-tooltip>
        <tedi-tooltip>
          <tedi-tooltip-trigger>
            <button tedi-button-group-button value="list" label="Loend" icon="list"></button>
          </tedi-tooltip-trigger>
          <tedi-tooltip-content>Loend</tedi-tooltip-content>
        </tedi-tooltip>
        <tedi-tooltip>
          <tedi-tooltip-trigger>
            <button tedi-button-group-button value="calendar" label="Kalender" icon="calendar_month"></button>
          </tedi-tooltip-trigger>
          <tedi-tooltip-content>Kalender</tedi-tooltip-content>
        </tedi-tooltip>
      </tedi-button-group>
    `,
  }),
};

const STATES = ["Default", "Hover", "Selected", "Focus", "Disabled"];

/**
 * Primary states. Showcase — controls are disabled.
 */
export const Primary: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: ["#hover-primary"],
      focusVisible: ["#focus-primary"],
    },
  },
  render: () => ({
    props: { states: STATES },
    template: `
      <tedi-row [cols]="1" [gapY]="2">
        @for (state of states; track state) {
          <tedi-col>
            <tedi-row cols="1" [md]="{ cols: 12 }" [gapY]="1" alignItems="center">
              <tedi-col [width]="2"><p tedi-text modifiers="bold">{{ state }}</p></tedi-col>
              <tedi-col [width]="10">
                <tedi-button-group variant="primary-button-group" [ariaLabel]="'Esmane ' + state"
                  [value]="state === 'Selected' ? '1' : undefined">
                  <button tedi-button-group-button [attr.id]="state.toLowerCase() + '-primary'"
                    value="1" label="Tabel" [disabled]="state === 'Disabled'">Tabel</button>
                  <button tedi-button-group-button value="2" label="Loend">Loend</button>
                  <button tedi-button-group-button value="3" label="Kalender">Kalender</button>
                </tedi-button-group>
              </tedi-col>
            </tedi-row>
          </tedi-col>
        }
      </tedi-row>
    `,
  }),
};

/**
 * Secondary states. Showcase — controls are disabled.
 */
export const Secondary: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: ["#hover-secondary"],
      focusVisible: ["#focus-secondary"],
    },
  },
  render: () => ({
    props: { states: STATES },
    template: `
      <tedi-row [cols]="1" [gapY]="2">
        @for (state of states; track state) {
          <tedi-col>
            <tedi-row cols="1" [md]="{ cols: 12 }" [gapY]="1" alignItems="center">
              <tedi-col [width]="2"><p tedi-text modifiers="bold">{{ state }}</p></tedi-col>
              <tedi-col [width]="10">
                <tedi-button-group variant="secondary-button-group" [ariaLabel]="'Teisene ' + state"
                  [value]="state === 'Selected' ? '1' : undefined">
                  <button tedi-button-group-button [attr.id]="state.toLowerCase() + '-secondary'"
                    value="1" label="Tabel" [disabled]="state === 'Disabled'">Tabel</button>
                  <button tedi-button-group-button value="2" label="Loend">Loend</button>
                  <button tedi-button-group-button value="3" label="Kalender">Kalender</button>
                </tedi-button-group>
              </tedi-col>
            </tedi-row>
          </tedi-col>
        }
      </tedi-row>
    `,
  }),
};

export const DifferentWidthButtons: Story = {
  render: () => ({
    props: { value: signal<string>("1") },
    template: `
      <tedi-button-group ariaLabel="Erineva laiusega nupud"
        [value]="value()" (valueChange)="value.set($event)">
        <button tedi-button-group-button value="1" label="Tabel">Tabel</button>
        <button tedi-button-group-button value="2" label="Loend">Loend</button>
        <button tedi-button-group-button value="3" label="Kalender">Kalender</button>
      </tedi-button-group>
    `,
  }),
};

export const Stretched: Story = {
  render: (args) => ({
    props: { ...args, value: signal<string>("2") },
    template: `
      <tedi-button-group ariaLabel="Venitatud" [stretch]="true" [variant]="variant" [size]="size"
        [value]="value()" (valueChange)="value.set($event)">
        <button tedi-button-group-button value="1" label="Tabel">Tabel</button>
        <button tedi-button-group-button value="2" label="Loend">Loend</button>
        <button tedi-button-group-button value="3" label="Kalender">Kalender</button>
      </tedi-button-group>
    `,
  }),
};

export const MobileDropdown: Story = {
  args: {
    ariaLabel: "Mobiilis koondub rippmenüüks",
    enableMobileDropdown: true,
    mobileBreakpoint: "xxl",
    dropdownLabel: "Alammenüü",
    dropdownLabelMode: "static",
  },
  render: (args) => ({
    props: { ...args, value: signal<string | undefined>(undefined) },
    template: `
      <div style="max-width: 320px;">
        <tedi-button-group
          [variant]="variant"
          [size]="size"
          [multiple]="multiple"
          [stretch]="stretch"
          [ariaLabel]="ariaLabel"
          [enableMobileDropdown]="enableMobileDropdown"
          [mobileBreakpoint]="mobileBreakpoint"
          [dropdownLabel]="dropdownLabel"
          [dropdownLabelMode]="dropdownLabelMode"
          [value]="value()"
          (valueChange)="value.set($event)"
          (selectionChange)="selectionChange($event)"
        >
          <button tedi-button-group-button value="1" label="Tabel" iconLeft="table">Tabel</button>
          <button tedi-button-group-button value="2" label="Loend" iconLeft="list">Loend</button>
          <button tedi-button-group-button value="3" label="Kalender" iconLeft="calendar_month">Kalender</button>
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
        ariaLabel="Vaate valik"
        [variant]="variant"
        [value]="selected()"
        (valueChange)="selected.set($event)"
      >
        <button tedi-button-group-button value="1" label="Tabel">Tabel</button>
        <button tedi-button-group-button value="2" label="Loend">Loend</button>
        <button tedi-button-group-button value="3" label="Kalender">Kalender</button>
      </tedi-button-group>
      <p style="margin-top: 8px;">Valitud: {{ selected() }}</p>
    `,
  }),
};
