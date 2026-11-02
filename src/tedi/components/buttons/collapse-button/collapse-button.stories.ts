import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  type WritableSignal,
} from "@angular/core";
import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryFn,
  StoryObj,
} from "@storybook/angular";

import {
  CollapseButtonComponent,
  type CollapseButtonArrowType,
  type CollapseButtonSize,
} from "./collapse-button.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { type TextColor, TextComponent } from "../../base/text/text.component";

const PSEUDO_STATE = ["Default", "Hover", "Active", "Focus"];

@Component({
  standalone: true,
  selector: "tedi-collapse-button-demo",
  imports: [CollapseButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      tedi-collapse-button
      [open]="isOpen()"
      [openText]="openText()"
      [closeText]="closeText()"
      [hideText]="hideText()"
      [arrowType]="arrowType()"
      [size]="size()"
      [inverted]="inverted()"
      [ariaLabel]="ariaLabel()"
      (openChange)="isOpen.set($event)"
    ></button>
  `,
})
class CollapseButtonDemoComponent {
  readonly isOpen: WritableSignal<boolean> = signal(false);
  readonly openText = input<string | undefined>(undefined);
  readonly closeText = input<string | undefined>(undefined);
  readonly hideText = input(false);
  readonly arrowType = input<CollapseButtonArrowType>("default");
  readonly size = input<CollapseButtonSize>("default");
  readonly inverted = input(false);
  readonly ariaLabel = input<string | undefined>(undefined);
}

type StatesArgs = {
  openText?: string;
  closeText?: string;
  hideText?: boolean;
  arrowType?: CollapseButtonArrowType;
  inverted?: boolean;
  ariaLabel?: string;
  titleColor?: TextColor;
};

const StatesTemplate: StoryFn<StatesArgs> = ({
  titleColor = "primary",
  ...args
}) => ({
  props: { ...args, titleColor, pseudoState: PSEUDO_STATE },
  template: `
    <tedi-row [cols]="1" [gapY]="5">
      <tedi-col>
        <tedi-row [cols]="1" [gapY]="3">
          <p tedi-text modifiers="bold" [color]="titleColor">Default</p>
          <tedi-col *ngFor="let state of pseudoState">
            <tedi-row [cols]="5" alignItems="center" [gapX]="2">
              <p tedi-text [color]="titleColor">{{ state }}</p>
              <tedi-col [width]="4" style="display: flex; gap: 1rem; align-items: center;">
                <button
                  tedi-collapse-button
                  [id]="state"
                  [openText]="openText"
                  [closeText]="closeText"
                  [hideText]="hideText"
                  [arrowType]="arrowType"
                  [inverted]="inverted"
                  [ariaLabel]="ariaLabel"
                ></button>
                <button
                  tedi-collapse-button
                  [id]="state"
                  [open]="true"
                  [openText]="openText"
                  [closeText]="closeText"
                  [hideText]="hideText"
                  [arrowType]="arrowType"
                  [inverted]="inverted"
                  [ariaLabel]="ariaLabel"
                ></button>
              </tedi-col>
            </tedi-row>
          </tedi-col>
        </tedi-row>
      </tedi-col>
      <tedi-col>
        <tedi-row [cols]="1" [gapY]="3">
          <p tedi-text modifiers="bold" [color]="titleColor">Small</p>
          <tedi-col *ngFor="let state of pseudoState">
            <tedi-row [cols]="5" alignItems="center" [gapX]="2">
              <p tedi-text [color]="titleColor">{{ state }}</p>
              <tedi-col [width]="4" style="display: flex; gap: 1rem; align-items: center;">
                <button
                  tedi-collapse-button
                  [id]="state"
                  size="small"
                  [openText]="openText"
                  [closeText]="closeText"
                  [hideText]="hideText"
                  [arrowType]="arrowType"
                  [inverted]="inverted"
                  [ariaLabel]="ariaLabel"
                ></button>
                <button
                  tedi-collapse-button
                  [id]="state"
                  [open]="true"
                  size="small"
                  [openText]="openText"
                  [closeText]="closeText"
                  [hideText]="hideText"
                  [arrowType]="arrowType"
                  [inverted]="inverted"
                  [ariaLabel]="ariaLabel"
                ></button>
              </tedi-col>
            </tedi-row>
          </tedi-col>
        </tedi-row>
      </tedi-col>
    </tedi-row>
  `,
});

const PSEUDO_PARAMS = {
  pseudo: {
    hover: "#Hover",
    active: "#Active",
    focusVisible: "#Focus",
  },
};

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.49.74?node-id=15433-138256&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/9469bf-collapse-button" target="_BLANK">Zeroheight ↗</a>
 *
 * <p>
 *   Standalone toggle button used by <code>tedi-collapse</code> and the table's
 *   expandable rows. The parent owns the <code>open</code> state and listens to
 *   <code>openChange</code>.
 * </p>
 */
export default {
  title: "TEDI-Ready/Components/Buttons/CollapseButton",
  component: CollapseButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CollapseButtonComponent,
        CollapseButtonDemoComponent,
        RowComponent,
        ColComponent,
        TextComponent,
      ],
    }),
  ],
  parameters: {
    status: {
      type: ["devComponent"],
    },
    chromatic: { disableSnapshot: true },
  },
  args: {
    openText: "Open",
    closeText: "Close",
    hideText: false,
    arrowType: "default",
    size: "default",
    inverted: false,
    ariaLabel: "Toggle details",
  },
  argTypes: {
    openText: {
      description: "Label shown when collapsed.",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    closeText: {
      description: "Label shown when expanded.",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
    hideText: {
      description: "Hide the label and render the chevron only.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    arrowType: {
      description: "Chevron style. Only takes effect with `hideText`.",
      control: { type: "inline-radio" },
      options: ["default", "secondary"],
      table: {
        category: "inputs",
        type: { summary: "CollapseButtonArrowType" },
        defaultValue: { summary: "default" },
      },
    },
    size: {
      description: "Visual size.",
      control: { type: "inline-radio" },
      options: ["default", "small"],
      table: {
        category: "inputs",
        type: { summary: "CollapseButtonSize" },
        defaultValue: { summary: "default" },
      },
    },
    inverted: {
      description:
        "Use light text and icon for placement on a dark / brand background.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    ariaLabel: {
      description: "Accessible label. Required when `hideText` is true.",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
      },
    },
  },
} as Meta<CollapseButtonDemoComponent>;

type DemoStory = StoryObj<CollapseButtonDemoComponent>;

export const Default: DemoStory = {
  render: (args) => ({
    props: { ...args },
    template: `<tedi-collapse-button-demo ${argsToTemplate(args)} />`,
  }),
};

export const States: StoryObj<StatesArgs> = {
  parameters: PSEUDO_PARAMS,
  args: {
    hideText: false,
    arrowType: "default",
    openText: "Open",
    closeText: "Close",
  },
  render: StatesTemplate,
};

export const IconOnly: StoryObj<StatesArgs> = {
  parameters: PSEUDO_PARAMS,
  args: {
    hideText: true,
    arrowType: "default",
    ariaLabel: "Toggle details",
  },
  render: StatesTemplate,
};

export const SecondaryButton: StoryObj<StatesArgs> = {
  parameters: PSEUDO_PARAMS,
  args: {
    hideText: true,
    arrowType: "secondary",
    ariaLabel: "Toggle details",
  },
  render: StatesTemplate,
};

export const WithTextInverted: StoryObj<StatesArgs> = {
  parameters: PSEUDO_PARAMS,
  globals: {
    backgrounds: { value: "brand" },
  },
  args: {
    hideText: false,
    arrowType: "default",
    inverted: true,
    titleColor: "white",
    openText: "Open",
    closeText: "Close",
  },
  render: StatesTemplate,
};

export const IconOnlyInverted: StoryObj<StatesArgs> = {
  parameters: PSEUDO_PARAMS,
  globals: {
    backgrounds: { value: "brand" },
  },
  args: {
    hideText: true,
    arrowType: "default",
    inverted: true,
    titleColor: "white",
    ariaLabel: "Toggle details",
  },
  render: StatesTemplate,
};

const VISUAL_COLLAPSE_BUTTON_ROWS = (color: TextColor) => `
  @for (size of sizes; track size) {
    @for (state of states; track state) {
      <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
        <tedi-col width="1">
          <p tedi-text color="${color}">{{ size }}, {{ state }}</p>
        </tedi-col>
        <tedi-col width="5">
          <div class="flex align-items-center gap-3">
            @for (open of [false, true]; track open) {
              <button
                tedi-collapse-button
                [attr.data-state]="state"
                [open]="open"
                [size]="size"
                openText="Open"
                closeText="Close"
                [hideText]="config.hideText"
                [arrowType]="config.arrowType"
                [inverted]="config.inverted"
                ariaLabel="Toggle details"
              ></button>
            }
          </div>
        </tedi-col>
      </tedi-row>
    }
  }
`;

/** Chromatic snapshot for CollapseButton: add every new visual variant here too. */
export const VisualTest: StoryObj<StatesArgs> = {
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
  render: () => ({
    props: {
      sizes: ["default", "small"],
      states: PSEUDO_STATE,
      configs: [
        {
          label: "With text",
          hideText: false,
          arrowType: "default",
          inverted: false,
        },
        {
          label: "Icon only",
          hideText: true,
          arrowType: "default",
          inverted: false,
        },
        {
          label: "Secondary button",
          hideText: true,
          arrowType: "secondary",
          inverted: false,
        },
      ],
      invertedConfigs: [
        {
          label: "With text inverted",
          hideText: false,
          arrowType: "default",
          inverted: true,
        },
        {
          label: "Icon only inverted",
          hideText: true,
          arrowType: "default",
          inverted: true,
        },
      ],
    },
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        @for (config of configs; track config.label) {
          <tedi-col>
            <tedi-row [cols]="1" [gapY]="2">
              <p tedi-text modifiers="bold">{{ config.label }}</p>
              ${VISUAL_COLLAPSE_BUTTON_ROWS("primary")}
            </tedi-row>
          </tedi-col>
        }
        @for (config of invertedConfigs; track config.label) {
          <tedi-col>
            <div class="bg bg-primary">
              <div class="w-100">
                <tedi-row [cols]="1" [gapY]="2">
                  <p tedi-text modifiers="bold" color="white">{{ config.label }}</p>
                  ${VISUAL_COLLAPSE_BUTTON_ROWS("white")}
                </tedi-row>
              </div>
            </div>
          </tedi-col>
        }
      </tedi-row>
    `,
  }),
};
