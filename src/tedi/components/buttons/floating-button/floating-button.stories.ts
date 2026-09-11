import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryFn,
  StoryObj,
} from "@storybook/angular";
import {
  FloatingButtonComponent,
  type FloatingButtonVariant,
} from "./floating-button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TextComponent } from "../../base/text/text.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";

const PSEUDO_STATE = ["Default", "Hover", "Active", "Focus"];

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.75.90?node-id=4515-65391&m=dev" target="_blank">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/546461-floating-button" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Buttons/FloatingButton",
  component: FloatingButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FloatingButtonComponent,
        IconComponent,
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
      type: ["mobileViewDifference"],
    },
  },
  args: {
    variant: "primary",
    size: "default",
    axis: "horizontal",
    position: "fixed",
  },
  argTypes: {
    ngContent: {
      name: "ng-content",
      description: "Button label.",
      control: "text",
    },
    variant: {
      control: "radio",
      options: ["primary", "secondary"],
      description: "The button's color variant.",
      table: {
        category: "inputs",
        defaultValue: { summary: "primary" },
        type: {
          summary: "FloatingButtonVariant",
          detail: "primary \nsecondary",
        },
      },
    },
    size: {
      control: "radio",
      options: ["default", "large"],
      description:
        "For a single-line horizontal button, `default` is 40px tall on desktop and 44px on mobile; `large` is 48px.",
      table: {
        category: "inputs",
        defaultValue: { summary: "default" },
        type: {
          summary: "FloatingButtonSize",
          detail: "default \nlarge",
        },
      },
    },
    axis: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description:
        "`vertical` rotates the button 90° counter-clockwise, with rounded left corners and square right corners.",
      table: {
        category: "inputs",
        defaultValue: { summary: "horizontal" },
        type: {
          summary: "FloatingButtonAxis",
          detail: "horizontal \nvertical",
        },
      },
    },
    position: {
      control: "radio",
      options: ["fixed", "absolute", "sticky", "relative", "static"],
      description:
        "CSS positioning mode. Defaults to `fixed`; use `static` to keep the button in normal document flow.",
      table: {
        category: "inputs",
        defaultValue: { summary: "fixed" },
        type: {
          summary: "FloatingButtonPosition",
          detail: "fixed \nabsolute \nsticky \nrelative \nstatic",
        },
      },
    },
    placement: {
      control: "object",
      description:
        "Where to pin the button within its containing block. `center` pins the midpoint on that axis. Has no effect when `position` is `static`.",
      table: {
        category: "inputs",
        type: {
          summary: "FloatingButtonPlacement",
          detail:
            "{ vertical: 'top' | 'bottom' | 'center', horizontal: 'left' | 'right' | 'center' }",
        },
      },
    },
    offset: {
      control: "object",
      description:
        "Distance from the pinned edges, defaulting to 0. Numbers are pixels; strings accept CSS lengths such as `1rem`. Only the edges named by `placement` apply.",
      table: {
        category: "inputs",
        type: {
          summary: "FloatingButtonOffset",
          detail:
            "{ top?: number | string, bottom?: number | string, left?: number | string, right?: number | string }",
        },
      },
    },
    zIndex: {
      control: "number",
      description:
        "Overrides the button's CSS `z-index`. Defaults to `--z-index-feedback` when omitted.",
      table: {
        category: "inputs",
        type: { summary: "number" },
      },
    },
  },
} as Meta<FloatingButtonType>;

type FloatingButtonType = FloatingButtonComponent & { ngContent: string };

export const Default: StoryObj<FloatingButtonType> = {
  args: {
    ngContent: "Jäta oma tagasiside",
    position: "static",
  },
  render: ({ ngContent, ...args }) => ({
    props: { ngContent, ...args },
    template: `<button tedi-floating-button ${argsToTemplate(args)}>${ngContent}</button>`,
  }),
};

export const Horizontal: StoryObj<FloatingButtonType> = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    props: { variants: ["primary", "secondary"] as FloatingButtonVariant[] },
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        <tedi-col *ngFor="let variant of variants">
          <p tedi-text modifiers="bold">{{ variant === 'primary' ? 'Primary' : 'Secondary' }}</p>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; padding-top: 0.5rem;">
            <button tedi-floating-button position="static" [variant]="variant">Jäta oma tagasiside</button>
            <button tedi-floating-button position="static" [variant]="variant">
              Mine üles
              <tedi-icon name="arrow_upward" />
            </button>
            <button tedi-floating-button position="static" [variant]="variant">
              <tedi-icon name="chat" />
              Vestle meiega
            </button>
            <tedi-tooltip>
              <tedi-tooltip-trigger>
                <button tedi-floating-button position="static" [variant]="variant" aria-label="Mine üles">
                  <tedi-icon name="arrow_upward" />
                </button>
              </tedi-tooltip-trigger>
              <tedi-tooltip-content>Mine üles</tedi-tooltip-content>
            </tedi-tooltip>
          </div>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

/**
 * Rotating the button does not change the space it occupies in the layout.
 * These examples use tall, narrow containers to leave room for the rotated
 * buttons and prevent them from overlapping nearby content.
 */
export const Vertical: StoryObj<FloatingButtonType> = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    props: { variants: ["primary", "secondary"] as FloatingButtonVariant[] },
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        <tedi-col *ngFor="let variant of variants">
          <p tedi-text modifiers="bold">{{ variant === 'primary' ? 'Primary' : 'Secondary' }}</p>
          <div style="display: flex; align-items: center; gap: 1rem; padding-top: 0.5rem;">
            <div style="display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 12rem;">
              <button tedi-floating-button position="static" axis="vertical" [variant]="variant">Anna tagasiside</button>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 12rem;">
              <button tedi-floating-button position="static" axis="vertical" [variant]="variant">
                Anna tagasiside
                <tedi-icon name="news" />
              </button>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 12rem;">
              <button tedi-floating-button position="static" axis="vertical" [variant]="variant">
                <tedi-icon name="news" />
                Anna tagasiside
              </button>
            </div>
          </div>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const Sizes: StoryObj<FloatingButtonType> = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    props: { sizes: ["default", "large"] },
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        <tedi-col *ngFor="let size of sizes">
          <p tedi-text modifiers="bold">{{ size === 'default' ? 'Default' : 'Large' }}</p>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; padding-top: 0.5rem;">
            <button tedi-floating-button position="static" variant="secondary" [size]="size">Jäta oma tagasiside</button>
            <tedi-tooltip>
              <tedi-tooltip-trigger>
                <button tedi-floating-button position="static" variant="secondary" [size]="size" aria-label="Mine üles">
                  <tedi-icon name="arrow_upward" />
                </button>
              </tedi-tooltip-trigger>
              <tedi-tooltip-content>Mine üles</tedi-tooltip-content>
            </tedi-tooltip>
          </div>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

const StatesTemplate: StoryFn = () => ({
  props: { pseudoState: PSEUDO_STATE },
  template: `
    <tedi-row [cols]="3" [gapY]="3" alignItems="center">
      <tedi-col></tedi-col>
      <tedi-col><p tedi-text modifiers="bold">Primary</p></tedi-col>
      <tedi-col><p tedi-text modifiers="bold">Secondary</p></tedi-col>
      <ng-container *ngFor="let state of pseudoState">
        <tedi-col><p tedi-text modifiers="bold">{{ state }}</p></tedi-col>
        <tedi-col style="display: flex; flex-wrap: wrap; align-items: center; gap: 1rem;">
          <button tedi-floating-button position="static" variant="primary" [attr.data-state]="state">Jäta oma tagasiside</button>
          <tedi-tooltip>
            <tedi-tooltip-trigger>
              <button tedi-floating-button position="static" variant="primary" [attr.data-state]="state" aria-label="Mine üles">
                <tedi-icon name="arrow_upward" />
              </button>
            </tedi-tooltip-trigger>
            <tedi-tooltip-content>Mine üles</tedi-tooltip-content>
          </tedi-tooltip>
        </tedi-col>
        <tedi-col style="display: flex; flex-wrap: wrap; align-items: center; gap: 1rem;">
          <button tedi-floating-button position="static" variant="secondary" [attr.data-state]="state">Jäta oma tagasiside</button>
          <tedi-tooltip>
            <tedi-tooltip-trigger>
              <button tedi-floating-button position="static" variant="secondary" [attr.data-state]="state" aria-label="Mine üles">
                <tedi-icon name="arrow_upward" />
              </button>
            </tedi-tooltip-trigger>
            <tedi-tooltip-content>Mine üles</tedi-tooltip-content>
          </tedi-tooltip>
        </tedi-col>
      </ng-container>
    </tedi-row>
  `,
});

export const States: StoryObj = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: '[data-state="Hover"]',
      active: '[data-state="Active"]',
      focusVisible: '[data-state="Focus"]',
    },
  },
  render: StatesTemplate,
};

/**
 * Use `placement` to choose an edge or center the button, and `offset` to add
 * space from the chosen edges. These examples use `position="absolute"` within
 * a relatively positioned container. Use the default `position="fixed"` to keep
 * the button in place in the viewport as the page scrolls.
 */
export const Placement: StoryObj<FloatingButtonType> = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    props: {},
    template: `
      <div style="position: relative; height: 20rem; border: 1px solid var(--general-border-primary);">
        <button
          tedi-floating-button
          position="absolute"
          variant="secondary"
          [placement]="{ vertical: 'top', horizontal: 'left' }"
          [offset]="{ top: 16, left: 16 }"
        >
          Üleval vasakul
        </button>
        <button
          tedi-floating-button
          position="absolute"
          variant="secondary"
          [placement]="{ vertical: 'bottom', horizontal: 'center' }"
          [offset]="{ bottom: 16 }"
        >
          All keskel
        </button>
        <div style="position: absolute; top: 50%; right: 0; translate: 0 -50%; display: flex; align-items: center; justify-content: center; width: var(--button-md-icon-size); height: 12rem;">
          <button
            tedi-floating-button
            position="static"
            axis="vertical"
          >
            Anna tagasiside
          </button>
        </div>
      </div>
    `,
  }),
};
