import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryFn,
  StoryObj,
} from "@storybook/angular";
import { visualTest } from "../../../../../.storybook/visual-test-story";
import { ButtonComponent } from "./button.component";
import { TextColor, TextComponent } from "../../base/text/text.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { IconComponent } from "../../base/icon/icon.component";
import { BaseButtonDirective } from "./base-button.directive";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";

const PSEUDO_STATE = ["Default", "Hover", "Active", "Focus", "Disabled"];

/**
 * <a href="https://www.figma.com/file/jWiRIXhHRxwVdMSimKX2FF/TEDI-Design-System-(draft)?type=design&node-id=136-29124&m=dev" target="_blank">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/10984a-button" target="_blank">Zeroheight ↗</a>
 */

const meta: Meta<ButtonType> = {
  title: "TEDI-Ready/Components/Buttons/Button",
  component: ButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        VerticalSpacingDirective,
        ButtonComponent,
        RowComponent,
        ColComponent,
        TextComponent,
        IconComponent,
        TooltipComponent,
        TooltipTriggerComponent,
        TooltipContentComponent,
      ],
    }),
  ],
  parameters: { chromatic: { disableSnapshot: true } },
  args: {
    size: "default",
    variant: "primary",
  },
  argTypes: {
    ngContent: {
      name: "ng-content",
      description: "Link text.",
      control: "text",
    },
    variant: {
      control: "radio",
      options: [
        "primary",
        "secondary",
        "neutral",
        "success",
        "danger",
        "danger-neutral",
        "primary-button-group",
        "secondary-button-group",
      ],
      description:
        "Specifies the color theme of the button. The color should meet accessibility standards for color contrast.",
      table: {
        category: "inputs",
        defaultValue: { summary: "primary" },
        type: {
          summary: "ButtonVariant",
          detail:
            "primary \nsecondary \nneutral \nsuccess \ndanger \ndanger-neutral \nprimary-inverted \nsecondary-inverted \nneutral-inverted \nprimary-button-group \nsecondary-button-group",
        },
      },
    },
    size: {
      control: "radio",
      options: ["default", "small", "extra-small"],
      description:
        "Defines the size of the button. The `extra-small` size is only intended for icon-only buttons.",
      table: {
        category: "inputs",
        defaultValue: { summary: "default" },
        type: {
          summary: "ButtonSize",
          detail: "default \nsmall \nextra-small",
        },
      },
    },
  },
};

export default meta;

type ButtonType = ButtonComponent & { ngContent: string };

export const Default: StoryObj<ButtonType> = {
  args: {
    ngContent: "Button",
  },
  render: ({ ngContent, ...args }) => ({
    props: { ngContent, ...args },
    template: `<button tedi-button ${argsToTemplate(args)}>${ngContent}</button>`,
  }),
};

type TemplateType = ButtonType &
  BaseButtonDirective & { titleColor?: TextColor };

// VisualTest marks states with data-state: the docs stories repeat the same ids in every variant.
const buttonTemplate =
  (stateAttr = "id"): StoryFn<TemplateType> =>
  ({ titleColor = "primary", ...args }) => ({
    props: { ...args, titleColor: titleColor, pseudoState: PSEUDO_STATE },
    template: `
    <tedi-row [cols]="1" [gapY]="5">
      <tedi-col [class]="'tedi-vertical-spacing'" style="--vertical-spacing-internal: 1em; overflow-x: auto;">
        <p tedi-text modifiers="bold" [color]="titleColor">Default</p>
        <tedi-row *ngFor="let state of pseudoState;" [cols]="5" alignItems="center" [gapX]="2">
          <p tedi-text [color]="titleColor">{{ state }}</p>
          <tedi-col [width]="4" style="display: flex; gap: 1rem;">
            <button tedi-button ${argsToTemplate(args)} [${stateAttr}]="state" [disabled]="state === 'Disabled'">Create</button>
            <button tedi-button ${argsToTemplate(args)} [${stateAttr}]="state" [disabled]="state === 'Disabled'">
              Continue
              <tedi-icon name="arrow_right_alt" />
            </button>
            <button tedi-button ${argsToTemplate(args)} [${stateAttr}]="state" [disabled]="state === 'Disabled'">
              <tedi-icon name="edit" />
              Edit
            </button>
            <tedi-tooltip>
              <tedi-tooltip-trigger>
                <button tedi-button ${argsToTemplate(args)} [${stateAttr}]="state" [disabled]="state === 'Disabled'" aria-label="Edasi">
                  <tedi-icon name="arrow_forward" />
                </button>
              </tedi-tooltip-trigger>
              <tedi-tooltip-content>Edasi</tedi-tooltip-content>
            </tedi-tooltip>
          </tedi-col>
        </tedi-row>
      </tedi-col>
      <tedi-col [class]="'tedi-vertical-spacing'" style="--vertical-spacing-internal: 1.4em; overflow-x: auto;">
        <p tedi-text modifiers="bold" [color]="titleColor">Small</p>
        <tedi-row *ngFor="let state of pseudoState;" [cols]="5" alignItems="center" [gapX]="2">
          <tedi-col>
            <p tedi-text [color]="titleColor">{{ state }}</p>
          </tedi-col>
          <tedi-col [width]="4" style="display: flex; gap: 1rem;">
            <button tedi-button ${argsToTemplate(args)} [${stateAttr}]="state" [disabled]="state === 'Disabled'" [size]="'small'">Create</button>
            <button tedi-button ${argsToTemplate(args)} [${stateAttr}]="state" [disabled]="state === 'Disabled'" [size]="'small'">
              Continue
              <tedi-icon name="arrow_right_alt" />
            </button>
            <button tedi-button ${argsToTemplate(args)} [${stateAttr}]="state" [disabled]="state === 'Disabled'" [size]="'small'">
              <tedi-icon name="edit" />
              Edit
            </button>
            <tedi-tooltip>
              <tedi-tooltip-trigger>
                <button tedi-button ${argsToTemplate(args)} [${stateAttr}]="state" [disabled]="state === 'Disabled'" [size]="'small'" aria-label="Edasi">
                  <tedi-icon name="arrow_forward" />
                </button>
              </tedi-tooltip-trigger>
              <tedi-tooltip-content>Edasi</tedi-tooltip-content>
            </tedi-tooltip>
          </tedi-col>
        </tedi-row>
      </tedi-col>
    </tedi-row>
  `,
  });

type ButtonStory = StoryObj<ButtonType & { disabled: boolean }>;

export const Primary: StoryObj<TemplateType> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  args: {
    variant: "primary",
  },
  render: buttonTemplate(),
};

export const PrimaryInverted: StoryObj<TemplateType> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },

  args: {
    titleColor: "white",
    variant: "primary-inverted",
  },

  render: buttonTemplate(),

  globals: {
    backgrounds: {
      value: "brand",
    },
  },
};

export const Secondary: StoryObj<TemplateType> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  args: {
    variant: "secondary",
  },
  render: buttonTemplate(),
};

export const SecondaryInverted: StoryObj<TemplateType> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },

  args: {
    titleColor: "white",
    variant: "secondary-inverted",
  },

  render: buttonTemplate(),

  globals: {
    backgrounds: {
      value: "brand",
    },
  },
};

export const Neutral: StoryObj<TemplateType> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  args: {
    variant: "neutral",
  },
  render: buttonTemplate(),
};

export const NeutralInverted: StoryObj<TemplateType> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },

  args: {
    titleColor: "white",
    variant: "neutral-inverted",
  },

  render: buttonTemplate(),

  globals: {
    backgrounds: {
      value: "brand",
    },
  },
};

export const Success: StoryObj<TemplateType> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  args: {
    variant: "success",
  },
  render: buttonTemplate(),
};

export const Danger: StoryObj<TemplateType> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  args: {
    variant: "danger",
  },
  render: buttonTemplate(),
};

export const DangerNeutral: StoryObj<TemplateType> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  args: {
    variant: "danger-neutral",
  },
  render: buttonTemplate(),
};

/**
 * The extra small size is only available for icon-only buttons. It does not grow on mobile.
 */
export const ExtraSmallIconOnly: ButtonStory = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <button tedi-button size="extra-small" aria-label="Close"><tedi-icon name="close" /></button>
        <button tedi-button variant="secondary" size="extra-small" aria-label="Edit"><tedi-icon name="edit" /></button>
        <button tedi-button variant="neutral" size="extra-small" aria-label="More"><tedi-icon name="more_vert" /></button>
        <button tedi-button size="extra-small" aria-label="Close" disabled><tedi-icon name="close" /></button>
      </div>
    `,
  }),
};

export const FullWidth: ButtonStory = {
  render: (args) => ({
    props: args,
    template: `<button tedi-button style="width: 100%;">Full Width Button</button>`,
  }),
};

export const LinkAsButton: ButtonStory = {
  render: (props) => ({
    props,
    template: `
        <a tedi-button>Link</a>
      `,
  }),
};

const vtStates = (story: StoryObj<TemplateType>) => ({
  args: story.args,
  render: buttonTemplate("attr.data-state"),
});

const vtInverted = (story: StoryObj<TemplateType>) => ({
  args: story.args,
  render: (args: Parameters<StoryFn<TemplateType>>[0]) => {
    const result = buttonTemplate("attr.data-state")(args, {} as never);
    return {
      ...result,
      template: `<div class="bg bg-primary"><div class="w-100">${result.template}</div></div>`,
    };
  },
});

/** Chromatic snapshot for Button: add every new visual variant here too. */
export const VisualTest: StoryObj<ButtonType> = {
  tags: ["!dev", "!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: false },
    controls: { disable: true },
    pseudo: {
      hover: '[data-state="Hover"]',
      active: '[data-state="Active"]',
      focusVisible: '[data-state="Focus"]',
    },
  },
  render: () =>
    visualTest(
      [
        { label: "Primary", story: vtStates(Primary) },
        { label: "Primary inverted", story: vtInverted(PrimaryInverted) },
        { label: "Secondary", story: vtStates(Secondary) },
        { label: "Secondary inverted", story: vtInverted(SecondaryInverted) },
        { label: "Neutral", story: vtStates(Neutral) },
        { label: "Neutral inverted", story: vtInverted(NeutralInverted) },
        { label: "Success", story: vtStates(Success) },
        { label: "Danger", story: vtStates(Danger) },
        { label: "Danger neutral", story: vtStates(DangerNeutral) },
        { label: "Extra small icon only", story: ExtraSmallIconOnly },
        { label: "Full width", story: FullWidth },
        { label: "Link as button", story: LinkAsButton },
      ],
      { args: meta.args },
    ),
};
