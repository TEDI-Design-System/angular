import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { StatusIndicatorComponent } from "./status-indicator.component";
import { TextComponent } from "../../base/text/text.component";
import {
  RowComponent,
  ColComponent,
} from "@tedi-design-system/angular/tedi";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.68?node-id=2405-53326&m=dev" target="_blank">Figma ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Tags/StatusIndicator",
  component: StatusIndicatorComponent,
  decorators: [
    moduleMetadata({
      imports: [
        StatusIndicatorComponent,
        TextComponent,
        RowComponent,
        ColComponent,
      ],
    }),
  ],
  argTypes: {
    type: {
      description: "The status type, which determines the indicator color",
      control: { type: "radio" },
      options: ["success", "danger", "warning", "inactive"],
      table: {
        category: "inputs",
        type: { summary: "StatusIndicatorType" },
        defaultValue: { summary: "success" },
      },
    },
    size: {
      description: "The size of the indicator",
      control: { type: "radio" },
      options: ["sm", "lg"],
      table: {
        category: "inputs",
        type: { summary: "StatusIndicatorSize" },
        defaultValue: { summary: "sm" },
      },
    },
    hasBorder: {
      description: "Whether the indicator has a white border ring",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    label: {
      description:
        "Accessible label. When provided, the indicator is exposed to assistive technology with role=\"img\"; otherwise it is treated as decorative.",
      control: { type: "text" },
      table: {
        category: "inputs",
        type: { summary: "string | undefined" },
        defaultValue: { summary: "undefined" },
      },
    },
    position: {
      description: "Controls positioning of the indicator",
      control: { type: "radio" },
      options: ["default", "top-right"],
      table: {
        category: "inputs",
        type: { summary: "StatusIndicatorPosition" },
        defaultValue: { summary: "default" },
      },
    },
  },
} as Meta<StatusIndicatorComponent>;

export const Default: StoryObj<StatusIndicatorComponent> = {
  args: {
    type: "success",
    size: "sm",
    hasBorder: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="background: var(--general-surface-tertiary); padding: 16px; display: inline-block; width: 100%;">
        <tedi-status-indicator [type]="type" [size]="size" [hasBorder]="hasBorder" [position]="position" [label]="label" />
      </div>
    `,
  }),
};

export const AllVariants: StoryObj<StatusIndicatorComponent> = {
  render: () => ({
    template: `
      <div style="background: var(--general-surface-tertiary); padding: 16px; width: 100%;">
        <tedi-row [cols]="2" [gapY]="3" alignItems="center">
          <tedi-col><p tedi-text modifiers="bold">Small</p></tedi-col>
          <tedi-col class="flex gap-3 align-items-center">
            <tedi-status-indicator type="success" />
            <tedi-status-indicator type="danger" />
            <tedi-status-indicator type="warning" />
            <tedi-status-indicator type="inactive" />
          </tedi-col>

          <tedi-col><p tedi-text modifiers="bold">Large</p></tedi-col>
          <tedi-col class="flex gap-3 align-items-center">
            <tedi-status-indicator type="success" size="lg" />
            <tedi-status-indicator type="danger" size="lg" />
            <tedi-status-indicator type="warning" size="lg" />
            <tedi-status-indicator type="inactive" size="lg" />
          </tedi-col>

          <tedi-col><p tedi-text modifiers="bold">Small bordered</p></tedi-col>
          <tedi-col class="flex gap-3 align-items-center">
            <tedi-status-indicator type="success" [hasBorder]="true" />
            <tedi-status-indicator type="danger" [hasBorder]="true" />
            <tedi-status-indicator type="warning" [hasBorder]="true" />
            <tedi-status-indicator type="inactive" [hasBorder]="true" />
          </tedi-col>

          <tedi-col><p tedi-text modifiers="bold">Large bordered</p></tedi-col>
          <tedi-col class="flex gap-3 align-items-center">
            <tedi-status-indicator type="success" size="lg" [hasBorder]="true" />
            <tedi-status-indicator type="danger" size="lg" [hasBorder]="true" />
            <tedi-status-indicator type="warning" size="lg" [hasBorder]="true" />
            <tedi-status-indicator type="inactive" size="lg" [hasBorder]="true" />
          </tedi-col>
        </tedi-row>
      </div>
    `,
  }),
};

export const Examples: StoryObj<StatusIndicatorComponent> = {
  render: () => ({
    template: `
      <span style="position: relative">
        Lugemata teated&nbsp;
        <tedi-status-indicator type="danger" position="top-right" />
      </span>
    `,
  }),
};
