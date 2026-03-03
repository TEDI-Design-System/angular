import {
  Meta,
  StoryObj,
  moduleMetadata,
  argsToTemplate,
} from "@storybook/angular";
import { IconComponent, TextComponent } from "tedi/components/base";
import { ButtonComponent } from "tedi/components/buttons";
import { ColComponent, RowComponent } from "tedi/components/helpers";
import {
  StatusBadgeColor,
  StatusBadgeComponent,
  StatusBadgeSize,
  StatusBadgeStatus,
  StatusBadgeVariant,
} from "./status-badge.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.37.57?m=dev&node-id=5784-114506" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/764a67-status-badge" target="_blank">Zeroheight ↗</a><br /><br />
 */

const colors: StatusBadgeColor[] = [
  "neutral",
  "brand",
  "accent",
  "warning",
  "danger",
  "success",
  "transparent",
];

const demoColors: Exclude<StatusBadgeColor, "transparent">[] = [
  "neutral",
  "brand",
  "accent",
  "warning",
  "danger",
  "success",
];

const variants: StatusBadgeVariant[] = [
  "filled",
  "filled-bordered",
  "bordered",
];

const statuses: StatusBadgeStatus[] = [
  "inactive",
  "success",
  "warning",
  "danger",
];

const colorToIconMap: Record<StatusBadgeColor, string> = {
  neutral: "edit",
  brand: "send",
  accent: "sync",
  warning: "warning",
  danger: "error",
  success: "check",
  transparent: "edit",
};

const statusToIconMap: Partial<Record<StatusBadgeStatus, string>> = {
  inactive: "edit",
  success: "send",
  warning: "sync",
  danger: "error",
};

export default {
  title: "TEDI-Ready/Components/Tags/StatusBadge",
  decorators: [
    moduleMetadata({
      imports: [
        StatusBadgeComponent,
        IconComponent,
        TextComponent,
        ButtonComponent,
        RowComponent,
        ColComponent,
      ],
    }),
  ],
  argTypes: {
    color: {
      control: "select",
      description: "Specifies the color scheme of the StatusBadge.",
      options: colors,
      table: {
        category: "inputs",
        type: { summary: "StatusBadgeColor" },
        defaultValue: { summary: "neutral" },
      },
    },
    variant: {
      control: "radio",
      description: "Determines the style or visual type of the StatusBadge.",
      options: variants,
      table: {
        category: "inputs",
        type: { summary: "StatusBadgeVariant" },
        defaultValue: { summary: "filled" },
      },
    },
    text: {
      control: "text",
      description: "The text to be displayed inside the StatusBadge.",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    icon: {
      control: "text",
      description:
        "The name of the icon to be displayed inside the StatusBadge. The icon is rendered using the `Icon` component.",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    title: {
      control: "text",
      description:
        "Provides the full text or description when the Badge represents an abbreviation. This is typically shown as a tooltip on hover.",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    role: {
      control: "text",
      description: "ARIA role attribute for accessibility.",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    size: {
      control: "radio",
      description: "Specifies the size of the StatusBadge.",
      options: ["default", "large"] as StatusBadgeSize[],
      table: {
        category: "inputs",
        type: { summary: "StatusBadgeSize" },
        defaultValue: { summary: "default" },
      },
    },
    status: {
      control: "radio",
      description: "StatusBadge status indicator.",
      options: statuses,
      table: {
        category: "inputs",
        type: { summary: "StatusBadgeStatus" },
      },
    },
    class: {
      control: "text",
      description:
        "Additional classes to apply custom styles to the StatusBadge.",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
  },
} as Meta;

export const Default: StoryObj<StatusBadgeComponent> = {
  args: {
    color: "neutral",
    variant: "filled",
    text: "Text",
    size: "default",
  },
  render: (args) => ({
    props: args,
    template: `<tedi-status-badge ${argsToTemplate(args)} />`,
  }),
};

export const Colors: StoryObj<StatusBadgeComponent> = {
  render: (args) => ({
    props: { ...args, demoColors, variants, colorToIconMap },
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        <tedi-row cols="6" [gap]="3" *ngFor="let color of demoColors">
          <tedi-col style="min-width: 5rem;">
            <p tedi-text modifiers="bold" style="text-transform: capitalize;">{{ color }}</p>
          </tedi-col>
          <tedi-col *ngFor="let variant of variants" style="display: flex; gap: var(--layout-grid-gutters-16);">
            <tedi-status-badge ${argsToTemplate(args)} [text]="'Text'" [color]="color" [variant]="variant" />
            <tedi-status-badge ${argsToTemplate(args)} [text]="'Text'" [color]="color" [variant]="variant" [icon]="colorToIconMap[color]" />
            <tedi-status-badge ${argsToTemplate(args)} [color]="color" [variant]="variant" [icon]="colorToIconMap[color]" />
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const WithIndicator: StoryObj<StatusBadgeComponent> = {
  render: (args) => ({
    props: { ...args, color: "neutral", statuses, variants, statusToIconMap },
    template: `
    <tedi-row [cols]="1" [gapY]="3">
      <tedi-row cols="6" [gap]="3" *ngFor="let status of statuses">
          <tedi-col style="min-width: 5rem;">
            <p tedi-text modifiers="bold" style="text-transform: capitalize;">{{ status }}</p>
          </tedi-col>
          <tedi-col *ngFor="let variant of variants" style="display: flex; gap: var(--layout-grid-gutters-16);">
            <tedi-status-badge ${argsToTemplate(args)} [text]="'Text'" [status]="status" [variant]="variant" />
            <tedi-status-badge ${argsToTemplate(args)} [text]="'Text'" [status]="status" [variant]="variant" [icon]="statusToIconMap[status]" />
            <tedi-status-badge ${argsToTemplate(args)} [status]="status" [variant]="variant" [icon]="statusToIconMap[status]" />
          </tedi-col>
      </tedi-row>
    </tedi-row>
    `,
  }),
};

export const Size: StoryObj<StatusBadgeComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row class="example-list" cols="1" style="overflow: auto;">
        <tedi-row cols="2" gap="3" alignItems="center" class="padding-14-16 border-bottom">
          <tedi-col style="min-width: 5rem;">
            <p tedi-text>Default</p>
          </tedi-col>
          <tedi-col style="display: flex; gap: var(--layout-grid-gutters-08);">
            <tedi-status-badge ${argsToTemplate(args)} [text]="'Draft'" />
            <tedi-status-badge ${argsToTemplate(args)} [text]="'Draft'" [status]="'success'" />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="2" gap="3" alignItems="center" class="padding-14-16">
          <tedi-col style="min-width: 5rem;">
            <p tedi-text>Large</p>
          </tedi-col>
          <tedi-col style="display: flex; gap: var(--layout-grid-gutters-08);">
            <tedi-status-badge ${argsToTemplate(args)} [text]="'Draft'" [size]="'large'" />
            <tedi-status-badge ${argsToTemplate(args)} [text]="'Draft'" [status]="'success'" [size]="'large'" />
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};
