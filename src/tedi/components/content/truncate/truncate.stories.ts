import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { TruncateComponent } from "./truncate.component";

const LOREM_IPSUM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras quam sapien, ultrices quis suscipit in, sodales vel justo. Curabitur lobortis quam dolor, vel dapibus dui pellentesque in. Maecenas auctor lacus elit, a vulputate ante cursus vitae. Proin mollis auctor ipsum nec malesuada. Aliquam turpis dui, dictum sit amet eros ac, iaculis mollis diam. Vivamus sed nulla ut justo fermentum ornare. Nam iaculis accumsan euismod. Sed efficitur risus a nisl interdum, placerat tincidunt velit sollicitudin. Donec ac tincidunt lorem, id ornare felis. Vestibulum sed lacinia diam. Donec vehicula mi maximus purus sollicitudin, at pulvinar lacus placerat.`;

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.75.90?node-id=10317-3250&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/020483-truncate" target="_BLANK">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Content/Truncate",
  component: TruncateComponent,
  decorators: [
    moduleMetadata({
      imports: [TruncateComponent],
    }),
  ],
  parameters: {
    status: {
      type: ["breakpointSupport"],
    },
  },
  argTypes: {
    text: {
      description: "Text to display and truncate when it exceeds `maxLength`.",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    maxLength: {
      description:
        "Maximum number of text characters shown while collapsed, excluding the ellipsis. Combined accents and emoji sequences count as single characters. Negative values become zero, fractions round down, and non-finite values use 200. Accepts a number or breakpoint object; each value applies from that breakpoint upward until overridden.",
      control: "object",
      table: {
        category: "inputs",
        type: {
          summary: "number | BreakpointObject<number>",
          detail:
            "number | { \n xs: number; \n sm?: number; \n md?: number; \n lg?: number; \n xl?: number; \n xxl?: number \n}",
        },
        defaultValue: { summary: "200" },
      },
    },
    ellipsis: {
      description: "Text appended when content is truncated.",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "..." },
      },
    },
    expandable: {
      description:
        "Shows an expand/collapse button when the text exceeds `maxLength`. When false, `expanded` can still be controlled programmatically.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    expanded: {
      description:
        "Whether to show the full text. Supports two-way binding with `[(expanded)]`.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
} as Meta<TruncateComponent>;

type Story = StoryObj<TruncateComponent>;

export const Default: Story = {
  args: {
    text: LOREM_IPSUM,
    maxLength: { xs: 200 },
    ellipsis: "...",
    expandable: true,
    expanded: false,
  },
  render: (args) => ({
    props: { ...args },
    template: `<tedi-truncate ${argsToTemplate(args)} />`,
  }),
};

export const Expanded: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { text: LOREM_IPSUM },
    template: `<tedi-truncate [text]="text" [expanded]="true" />`,
  }),
};

export const NoTruncate: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      text: "This text does not get truncated, because its length is smaller than the maxLength input.",
    },
    template: `<tedi-truncate [text]="text" />`,
  }),
};

export const NotExpandable: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { text: LOREM_IPSUM },
    template: `<tedi-truncate [text]="text" [expandable]="false" />`,
  }),
};

/**
 * `maxLength` accepts a breakpoint object, so fewer characters can be shown on narrow
 * viewports. Resize the preview to see the collapsed length change.
 */
export const ResponsiveMaxLength: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { text: LOREM_IPSUM },
    template: `<tedi-truncate [text]="text" [maxLength]="{ xs: 80, md: 200, xl: 400 }" />`,
  }),
};
