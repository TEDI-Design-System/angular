import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import {
  EmptyStateComponent,
  EmptyStateSize,
  EmptyStateType,
} from "./empty-state.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { LinkComponent } from "../../navigation/link/link.component";
import { TextComponent } from "../../base/text/text.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";

/**
 * EmptyState communicates that there is nothing to display — empty search
 * results, an unpopulated list, a freshly-created workspace — and optionally
 * guides the user toward the next step via action buttons or a link.
 *
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.70?node-id=5784-114507&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/6792c3-empty-state" target="_BLANK">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Content/EmptyState",
  component: EmptyStateComponent,
  decorators: [
    moduleMetadata({
      imports: [
        VerticalSpacingDirective,
        TextComponent,
        EmptyStateComponent,
        ButtonComponent,
        IconComponent,
        LinkComponent,
      ],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.70?node-id=5784-114507&m=dev",
    },
    chromatic: { disableSnapshot: true },
  },
  args: {
    type: "separate" as EmptyStateType,
    size: "default" as EmptyStateSize,
    icon: "spa",
  },
  argTypes: {
    type: {
      description: "Container variant.",
      control: "inline-radio",
      options: ["separate", "attached", "inside"],
      table: { category: "inputs", defaultValue: { summary: "separate" } },
    },
    size: {
      description: "Padding scale.",
      control: "inline-radio",
      options: ["default", "small"],
      table: { category: "inputs", defaultValue: { summary: "default" } },
    },
    icon: {
      description:
        "Material icon name rendered above the text. Pass `null` to hide.",
      control: "text",
      table: { category: "inputs", defaultValue: { summary: "spa" } },
    },
    iconColor: {
      description: "Icon color override.",
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "brand",
        "brand-dark",
        "success",
        "warning",
        "danger",
        "inherit",
      ],
      table: { category: "inputs", defaultValue: { summary: "brand" } },
    },
    iconSize: {
      description: "Icon size in pixels.",
      control: { type: "number", min: 8, max: 72, step: 1 },
      table: { category: "inputs", defaultValue: { summary: "36" } },
    },
    heading: {
      description: "Optional heading above the description.",
      control: "text",
      table: { category: "inputs" },
    },
  },
} satisfies Meta<EmptyStateComponent>;

type Story = StoryObj<EmptyStateComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<tedi-empty-state ${argsToTemplate(args)}>You have no data to display</tedi-empty-state>`,
  }),
};

export const WithPrimaryAction: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-empty-state ${argsToTemplate(args)}>
        You have no data to display
        <button tedi-button tedi-empty-state-actions type="button">
          <tedi-icon name="add" [size]="18" color="inherit" />
          Create new
        </button>
      </tedi-empty-state>
    `,
  }),
};

export const WithSecondaryAction: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-empty-state ${argsToTemplate(args)}>
        You have no data to display
        <button tedi-button variant="secondary" tedi-empty-state-actions type="button">
          <tedi-icon name="add" [size]="18" color="inherit" />
          Create new
        </button>
      </tedi-empty-state>
    `,
  }),
};

export const WithLink: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-empty-state ${argsToTemplate(args)}>
        You have no data to display
        <a tedi-link href="#" tedi-empty-state-actions>
          Read more
          <tedi-icon name="arrow_forward" [size]="18" color="inherit" />
        </a>
      </tedi-empty-state>
    `,
  }),
};

export const WithHeading: Story = {
  args: {
    icon: "event_busy",
    heading: "Choose new time",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-empty-state ${argsToTemplate(args)}>
        You have no data to display
        <button tedi-button tedi-empty-state-actions type="button">Choose time</button>
      </tedi-empty-state>
    `,
  }),
};

export const Minimal: Story = {
  args: { icon: null as never },
  render: (args) => ({
    props: args,
    template: `<tedi-empty-state ${argsToTemplate(args)}>You have no data to display</tedi-empty-state>`,
  }),
};

export const SmallPadding: Story = {
  args: { size: "small" },
  render: (args) => ({
    props: args,
    template: `
      <tedi-empty-state ${argsToTemplate(args)}>
        You have no data to display
        <button tedi-button tedi-empty-state-actions type="button">
          <tedi-icon name="add" [size]="18" color="inherit" />
          Create new
        </button>
        <button tedi-button variant="secondary" tedi-empty-state-actions type="button">
          Read more
          <tedi-icon name="arrow_forward" [size]="18" color="inherit" />
        </button>
      </tedi-empty-state>
    `,
  }),
};

export const Separate: Story = {
  args: { type: "separate" },
  render: (args) => ({
    props: args,
    template: `<tedi-empty-state ${argsToTemplate(args)}>You have no data to display</tedi-empty-state>`,
  }),
};

const ATTACHED_TEMPLATE = `
      <div style="
        padding: 16px;
        background: var(--card-background-primary);
        border: 1px solid var(--card-border-primary);
        border-bottom: 0;
        border-top-left-radius: var(--card-radius);
        border-top-right-radius: var(--card-radius);
      ">Previous content</div>
      <tedi-empty-state type="attached">You have no data to display</tedi-empty-state>
    `;

export const AttachedToComponent: Story = {
  render: () => ({
    template: ATTACHED_TEMPLATE,
  }),
};

const INSIDE_TEMPLATE = `
      <div style="
        padding: 16px;
        background: var(--card-background-primary);
        border: 1px solid var(--card-border-primary);
        border-radius: var(--card-radius);
      ">
        <tedi-empty-state type="inside">You have no data to display</tedi-empty-state>
      </div>
    `;

export const InsideComponent: Story = {
  render: () => ({
    template: INSIDE_TEMPLATE,
  }),
};

export const CustomIcon: Story = {
  args: { icon: "shopping_cart_off" },
  render: (args) => ({
    props: args,
    template: `<tedi-empty-state ${argsToTemplate(args)}>No products in your cart</tedi-empty-state>`,
  }),
};

/** Chromatic snapshot for EmptyState: add every new visual variant here too. */
export const VisualTest: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: false },
    controls: { disable: true },
  },
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="2">
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">Default</p>
          <tedi-empty-state>You have no data to display</tedi-empty-state>
        </div>
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">With primary action</p>
          <tedi-empty-state>
            You have no data to display
            <button tedi-button tedi-empty-state-actions type="button">
              <tedi-icon name="add" [size]="18" color="inherit" />
              Create new
            </button>
          </tedi-empty-state>
        </div>
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">With secondary action</p>
          <tedi-empty-state>
            You have no data to display
            <button tedi-button variant="secondary" tedi-empty-state-actions type="button">
              <tedi-icon name="add" [size]="18" color="inherit" />
              Create new
            </button>
          </tedi-empty-state>
        </div>
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">With link</p>
          <tedi-empty-state>
            You have no data to display
            <a tedi-link href="#" tedi-empty-state-actions>
              Read more
              <tedi-icon name="arrow_forward" [size]="18" color="inherit" />
            </a>
          </tedi-empty-state>
        </div>
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">With heading</p>
          <tedi-empty-state icon="event_busy" heading="Choose new time">
            You have no data to display
            <button tedi-button tedi-empty-state-actions type="button">Choose time</button>
          </tedi-empty-state>
        </div>
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">Minimal</p>
          <tedi-empty-state [icon]="null">You have no data to display</tedi-empty-state>
        </div>
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">Small padding</p>
          <tedi-empty-state size="small">
            You have no data to display
            <button tedi-button tedi-empty-state-actions type="button">
              <tedi-icon name="add" [size]="18" color="inherit" />
              Create new
            </button>
            <button tedi-button variant="secondary" tedi-empty-state-actions type="button">
              Read more
              <tedi-icon name="arrow_forward" [size]="18" color="inherit" />
            </button>
          </tedi-empty-state>
        </div>
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">Attached to component</p>
          ${ATTACHED_TEMPLATE}
        </div>
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">Inside component</p>
          ${INSIDE_TEMPLATE}
        </div>
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">Custom icon</p>
          <tedi-empty-state icon="shopping_cart_off">No products in your cart</tedi-empty-state>
        </div>
      </div>
    `,
  }),
};
