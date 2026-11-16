import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryFn,
  StoryObj,
} from "@storybook/angular";
import { signal, WritableSignal } from "@angular/core";
import { ButtonComponent } from "./button.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";
import { TextColor, TextComponent } from "../../base/text/text.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { IconComponent } from "../../base/icon/icon.component";
import { BaseButtonDirective } from "./base-button.directive";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";

const PSEUDO_STATE = ["Default", "Hover", "Active", "Focus", "Disabled"];

/**
 * <a href="https://www.figma.com/file/jWiRIXhHRxwVdMSimKX2FF/TEDI-Design-System-(draft)?type=design&node-id=136-29124&m=dev" target="_blank">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/10984a-button" target="_blank">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Buttons/Button",
  component: ButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ButtonComponent,
        RowComponent,
        ColComponent,
        TextComponent,
        IconComponent,
        TooltipComponent,
        TooltipTriggerComponent,
        TooltipContentComponent,
        VerticalSpacingDirective,
      ],
    }),
  ],
  args: {
    size: "default",
    variant: "primary",
    loading: false,
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
      options: ["default", "small"],
      description: "Defines the size of the button.",
      table: {
        category: "inputs",
        defaultValue: { summary: "default" },
        type: {
          summary: "ButtonSize",
          detail: "default \nsmall",
        },
      },
    },
    loading: {
      control: "boolean",
      description:
        "Shows a spinner in place of the icons and blocks activation. Unlike `disabled`, the button keeps focus.",
      table: {
        category: "inputs",
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
      },
    },
    loadingLabel: {
      control: "text",
      description:
        'What screen readers hear while `loading`. Say what is happening, e.g. "Saving".',
      table: {
        category: "inputs",
        defaultValue: { summary: "the translated `loading` label" },
        type: { summary: "string" },
      },
    },
  },
} as Meta<ButtonType>;

type ButtonType = ButtonComponent & { ngContent: string };

export const Default: StoryObj<ButtonType> = {
  parameters: { chromatic: { disableSnapshot: true } },
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

const ButtonTemplate: StoryFn<TemplateType> = ({
  titleColor = "primary",
  ...args
}) => ({
  props: { ...args, titleColor: titleColor, pseudoState: PSEUDO_STATE },
  template: `
    <tedi-row [cols]="1" [gapY]="5">
      <tedi-col [class]="'tedi-vertical-spacing'" style="--vertical-spacing-internal: 1em; overflow-x: auto;">
        <p tedi-text modifiers="bold" [color]="titleColor">Default</p>
        <tedi-row *ngFor="let state of pseudoState;" [cols]="5" alignItems="center" [gapX]="2">
          <p tedi-text [color]="titleColor">{{ state }}</p>
          <tedi-col [width]="4" style="display: flex; gap: 1rem;">
            <button tedi-button ${argsToTemplate(args)} [id]="state" [disabled]="state === 'Disabled'">Create</button>
            <button tedi-button ${argsToTemplate(args)} [id]="state" [disabled]="state === 'Disabled'">
              Continue
              <tedi-icon name="arrow_right_alt" />
            </button>
            <button tedi-button ${argsToTemplate(args)} [id]="state" [disabled]="state === 'Disabled'">
              <tedi-icon name="edit" />
              Edit
            </button>
            <tedi-tooltip>
              <tedi-tooltip-trigger>
                <button tedi-button ${argsToTemplate(args)} [id]="state" [disabled]="state === 'Disabled'" aria-label="Edasi">
                  <tedi-icon name="arrow_forward" />
                </button>
              </tedi-tooltip-trigger>
              <tedi-tooltip-content [ariaHidden]="true">Edasi</tedi-tooltip-content>
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
            <button tedi-button ${argsToTemplate(args)} [id]="state" [disabled]="state === 'Disabled'" [size]="'small'">Create</button>
            <button tedi-button ${argsToTemplate(args)} [id]="state" [disabled]="state === 'Disabled'" [size]="'small'">
              Continue
              <tedi-icon name="arrow_right_alt" />
            </button>
            <button tedi-button ${argsToTemplate(args)} [id]="state" [disabled]="state === 'Disabled'" [size]="'small'">
              <tedi-icon name="edit" />
              Edit
            </button>
            <tedi-tooltip>
              <tedi-tooltip-trigger>
                <button tedi-button ${argsToTemplate(args)} [id]="state" [disabled]="state === 'Disabled'" [size]="'small'" aria-label="Edasi">
                  <tedi-icon name="arrow_forward" />
                </button>
              </tedi-tooltip-trigger>
              <tedi-tooltip-content [ariaHidden]="true">Edasi</tedi-tooltip-content>
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
  render: ButtonTemplate,
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

  render: ButtonTemplate,

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
  render: ButtonTemplate,
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

  render: ButtonTemplate,

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
  render: ButtonTemplate,
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

  render: ButtonTemplate,

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
  render: ButtonTemplate,
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
  render: ButtonTemplate,
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
  render: ButtonTemplate,
};

export const Loading: StoryObj<ButtonType> = {
  parameters: {
    pseudo: {
      focusVisible: "#Focus",
    },
  },
  args: {
    loading: true,
  },
  render: (args) => ({
    props: {
      ...args,
      saving: signal(false),
      save(this: { saving: WritableSignal<boolean> }) {
        this.saving.set(true);
        setTimeout(() => this.saving.set(false), 3000);
      },
    },
    template: `
      <div [tediVerticalSpacing]="4">
      <tedi-row [cols]="1" [gapY]="5">
        @for (size of ["default", "small"]; track size) {
          <tedi-col class="flex flex-column gap-3">
            <p tedi-text modifiers="bold">{{ size === "default" ? "Default" : "Small" }}</p>
            @for (state of ["Default", "Focus"]; track state) {
              <tedi-row [cols]="5" alignItems="center" [gapX]="2">
                <p tedi-text>{{ state }}</p>
                <tedi-col [width]="4" class="flex flex-wrap align-items-center gap-3">
                  <button tedi-button ${argsToTemplate(args, { exclude: ["size"] })} [id]="state" [size]="size">Create</button>
                  <button tedi-button ${argsToTemplate(args, { exclude: ["size"] })} [id]="state" [size]="size">
                    Continue
                    <tedi-icon name="arrow_right_alt" />
                  </button>
                  <button tedi-button ${argsToTemplate(args, { exclude: ["size"] })} [id]="state" [size]="size">
                    <tedi-icon name="edit" />
                    Edit
                  </button>
                  <tedi-tooltip>
                    <tedi-tooltip-trigger>
                      <button tedi-button ${argsToTemplate(args, { exclude: ["size"] })} [id]="state" [size]="size" aria-label="Edasi">
                        <tedi-icon name="arrow_forward" />
                      </button>
                    </tedi-tooltip-trigger>
                    <tedi-tooltip-content [ariaHidden]="true">Edasi</tedi-tooltip-content>
                  </tedi-tooltip>
                </tedi-col>
              </tedi-row>
            }
          </tedi-col>
        }
      </tedi-row>
      <tedi-row [cols]="5" alignItems="center" [gapX]="2">
        <p tedi-text modifiers="bold">On click</p>
        <tedi-col [width]="4">
          <button tedi-button loadingLabel="Salvestamine" [loading]="saving()" (click)="save()">Salvesta</button>
        </tedi-col>
      </tedi-row>
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
