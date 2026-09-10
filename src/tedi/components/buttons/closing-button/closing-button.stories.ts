import {
  Meta,
  StoryObj,
  argsToTemplate,
  moduleMetadata,
} from "@storybook/angular";

import { ClosingButtonComponent } from "./closing-button.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { IconComponent } from "../../base/icon/icon.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";

const PSEUDO_STATE = ["Default", "Hover", "Active", "Focus"];

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-(work-in-progress)?node-id=4514-63815&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/30df1b-closing-button" target="_BLANK">Zeroheight ↗</a>

 * A closing button component used for dismissing content or dialogs. It's typically displayed as an 'X' icon and can be used in various scenarios such as closing modals, popovers, or panels.
 */

export default {
  title: "TEDI-Ready/Components/Buttons/ClosingButton",
  component: ClosingButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        VerticalSpacingDirective,
        IconComponent,
        RowComponent,
        ColComponent,
        TooltipComponent,
        TooltipTriggerComponent,
        TooltipContentComponent,
      ],
    }),
  ],
  argTypes: {
    size: {
      control: "radio",
      options: ["default", "small"],
      description: "The size of the button.",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    iconSize: {
      control: "radio",
      options: [24, 18],
      description: "The size of the icon inside the button in pixels.",
      table: {
        defaultValue: { summary: "24" },
      },
    },
    ariaLabel: {
      control: "text",
      description:
        'ARIA label (and native `title`) of the button. Overrides the translated default label "close".',
      table: {
        defaultValue: { summary: "close" },
      },
    },
    icon: {
      control: "text",
      description:
        "Material Symbols icon rendered inside the button. Override for other closing-like actions such as delete/remove (e.g. `delete`) and provide a matching `ariaLabel`.",
      table: {
        defaultValue: { summary: "close" },
      },
    },
    showTitle: {
      control: "boolean",
      description:
        "Render the label as a native `title` attribute. Set to `false` when the button is wrapped in a `tedi-tooltip` so the native tooltip does not double the custom one.",
      table: {
        defaultValue: { summary: "true" },
      },
    },
  },
  parameters: {
    status: {
      type: ["breakpointSupport"],
    },
  },
} as Meta<ClosingButtonComponent>;

type Story = StoryObj<ClosingButtonComponent>;

export const Default: Story = {
  args: {
    size: "default",
    iconSize: 24,
    icon: "close",
    showTitle: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <button tedi-closing-button ${argsToTemplate(args)}></button>
    `,
  }),
};

export const Size: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="example-list" tediVerticalSpacing="1">
        <tedi-row class="padding-14-16 border-bottom" [gap]="3">
          <tedi-col>
            Default
          </tedi-col>
          <tedi-col>
            <button tedi-closing-button></button>
          </tedi-col>
        </tedi-row>
        <tedi-row class="padding-14-16" [gap]="3">
          <tedi-col>
            Small
          </tedi-col>
          <tedi-col>
            <button tedi-closing-button size="small"></button>
          </tedi-col>
        </tedi-row>
      </div>
    `,
  }),
};

export const IconSize: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="example-list" tediVerticalSpacing="1">
        <tedi-row class="padding-14-16 border-bottom" [gap]="3">
          <tedi-col>
            18px
          </tedi-col>
          <tedi-col>
            <button tedi-closing-button size="small" [iconSize]="18"></button>
          </tedi-col>
        </tedi-row>
        <tedi-row class="padding-14-16" [gap]="3">
          <tedi-col>
            24px
          </tedi-col>
          <tedi-col style="display: flex; align-items: center; gap: 1rem">
            <button tedi-closing-button></button>
            <button tedi-closing-button size="small"></button>
          </tedi-col>
        </tedi-row>
      </div>
    `,
  }),
};

/**
 * Override the `icon` input to reuse the closing-button look for other
 * closing-like actions such as delete/remove. Always provide a matching
 * `ariaLabel` — the default label is "close".
 */
export const CustomIcon: Story = {
  render: () => ({
    template: `
      <div class="flex gap-2">
        <button tedi-closing-button icon="delete" ariaLabel="Kustuta"></button>
        <button tedi-closing-button icon="delete_forever" ariaLabel="Kustuta jäädavalt"></button>
      </div>
    `,
  }),
};

/**
 * Wrap the button in a `tedi-tooltip` to show a custom tooltip on hover.
 * Set `[showTitle]="false"` so the native browser tooltip (the `title`
 * attribute) does not double the custom one — the `aria-label` is kept.
 */
export const WithTooltip: Story = {
  render: () => ({
    template: `
      <div class="flex gap-2">
        <tedi-tooltip>
          <tedi-tooltip-trigger>
            <button tedi-closing-button [showTitle]="false"></button>
          </tedi-tooltip-trigger>
          <tedi-tooltip-content>Sulge</tedi-tooltip-content>
        </tedi-tooltip>
        <tedi-tooltip>
          <tedi-tooltip-trigger>
            <button
              tedi-closing-button
              icon="delete"
              [showTitle]="false"
              ariaLabel="Kustuta"
            ></button>
          </tedi-tooltip-trigger>
          <tedi-tooltip-content>Kustuta</tedi-tooltip-content>
        </tedi-tooltip>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  render: (args) => ({
    props: { ...args, PSEUDO_STATE },
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        <tedi-col *ngFor="let state of PSEUDO_STATE;" style="max-width: 200px; display: grid; grid-template-columns: repeat(2, 1fr); align-items: center;">
          <b>{{ state }}</b>
          <button tedi-closing-button ${argsToTemplate(args)} [id]="state"></button>
        </tedi-col>
      </tedi-row>
    `,
  }),
};
