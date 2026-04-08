import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { RadioComponent } from "./radio.component";
import { RadioCardComponent } from "../radio-card/radio-card.component";
import { RadioGroupComponent } from "../radio-group/radio-group.component";
import { RadioCardGroupComponent } from "../radio-card-group/radio-card-group.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";
import { LabelComponent } from "../label/label.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";
import { InfoButtonComponent } from "../../buttons/info-button/info-button.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.41.64?node-id=6149-138013&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/93e423-radio" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Form/Radio",
  component: RadioComponent,
  decorators: [
    moduleMetadata({
      imports: [
        RadioComponent,
        RadioCardComponent,
        RadioGroupComponent,
        RadioCardGroupComponent,
        RowComponent,
        ColComponent,
        TextComponent,
        LabelComponent,
        IconComponent,
        TooltipComponent,
        TooltipTriggerComponent,
        TooltipContentComponent,
        InfoButtonComponent,
        FeedbackTextComponent,
      ],
    }),
  ],
  argTypes: {
    size: {
      control: "radio",
      options: ["default", "large"],
      description: "Size of the radio.",
      table: {
        type: {
          summary: "RadioSize",
          detail: "default \nlarge",
        },
        defaultValue: {
          summary: "default",
        },
      },
    },
    invalid: {
      control: "boolean",
      description: "Is radio invalid?",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
    disabled: {
      control: "boolean",
      description: "Is radio disabled?",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
  },
} as Meta<RadioComponent>;

export const Default: StoryObj<RadioComponent & { disabled: boolean }> = {
  args: {
    size: "default",
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <label tedi-label color="primary" class="flex align-items-center gap-2">
        <input tedi-radio type="radio" ${argsToTemplate(args)} />
        Text
      </label>
    `,
  }),
};

/**
 * Default size is used on desktop, large size is applied automatically on mobile screen sizes.
 * Use in tables where the radio has no text. **Otherwise, prefer using default size.**
 */
export const Size: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="2" [gapY]="3">
        <div>Default</div>
        <input tedi-radio type="radio" name="size-demo" />
        <div>Large</div>
        <input tedi-radio type="radio" name="size-demo" size="large" />
      </tedi-row>
    `,
  }),
};

export const Vertical: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-radio-group label="Label" direction="vertical">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="vertical-demo" />
          Text
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="vertical-demo" />
          Text
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="vertical-demo" checked />
          Text
        </label>
      </tedi-radio-group>
    `,
  }),
};

export const Horizontal: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-radio-group label="Label">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="horizontal-demo" />
          Text
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="horizontal-demo" />
          Text
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="horizontal-demo" checked />
          Text
        </label>
      </tedi-radio-group>
    `,
  }),
};

export const Separate: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        <div>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="separate-demo" />
            Text
          </label>
          <tedi-feedback-text text="Hint text" />
        </div>
        <div>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="separate-error" [invalid]="true" />
            Text
          </label>
          <tedi-feedback-text text="Feedback text" type="error" />
        </div>
        <label tedi-label color="primary" [required]="true" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="separate-required" />
          Text
        </label>
        <div class="flex align-items-center gap-1">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="separate-tooltip" />
            Text
          </label>
          <tedi-tooltip>
            <tedi-tooltip-trigger>
              <button tedi-info-button></button>
            </tedi-tooltip-trigger>
            <tedi-tooltip-content>
              Tooltip text
            </tedi-tooltip-content>
          </tedi-tooltip>
        </div>
        <div>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="separate-desc" />
            Text
          </label>
          <tedi-feedback-text text="Description" />
        </div>
      </tedi-row>
    `,
  }),
};

export const Group: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="2" [gapY]="3">
        <tedi-radio-group label="Label" direction="vertical">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-hint" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-hint" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-hint" />
            Text
          </label>
          <tedi-feedback-text text="Hint text" />
        </tedi-radio-group>
        <tedi-radio-group label="Label" direction="vertical">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-error" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-error" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-error" />
            Text
          </label>
          <tedi-feedback-text text="Feedback text" type="error" />
        </tedi-radio-group>
        <tedi-radio-group label="Label">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-h-hint" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-h-hint" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-h-hint" />
            Text
          </label>
          <tedi-feedback-text text="Hint text" />
        </tedi-radio-group>
        <tedi-radio-group label="Label">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-h-error" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-h-error" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="group-h-error" />
            Text
          </label>
          <tedi-feedback-text text="Feedback text" type="error" />
        </tedi-radio-group>
      </tedi-row>
    `,
  }),
};

/**
 * All visual states of the radio component.
 */
export const States: StoryObj<RadioComponent> = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="2" [gapY]="3">
        <strong>Default</strong>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="state-default" />
          Text
        </label>

        <strong>Hover</strong>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="state-hover" id="Hover" />
          Text
        </label>

        <strong>Selected</strong>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="state-selected" checked />
          Text
        </label>

        <strong>Active</strong>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="state-active" id="Active" />
          Text
        </label>

        <strong>Error</strong>
        <div>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" name="state-error" [invalid]="true" />
            Text
          </label>
          <tedi-feedback-text text="Feedback text" type="error" />
        </div>

        <strong>Disabled</strong>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="state-disabled" disabled />
          Text
        </label>

        <strong>Disabled selected</strong>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" name="state-disabled-selected" checked disabled />
          Text
        </label>
      </tedi-row>
    `,
  }),
};

/**
 * Radio cards with primary and secondary variants side by side. Primary uses a filled background when selected, secondary uses an outline border.
 */
export const RadioCards: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col>
          <p tedi-text modifiers="bold">Primary</p>
          <tedi-radio-card-group>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-primary" checked />
              Text
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-primary" />
              Text
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-primary" />
              Text
            </label>
          </tedi-radio-card-group>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Secondary</p>
          <tedi-radio-card-group>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-secondary" checked />
              Text
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-secondary" />
              Text
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-secondary" />
              Text
            </label>
          </tedi-radio-card-group>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

/**
 * Radio cards in a grouped layout, joined like a button group with shared borders and no gap.
 */
export const RadioCardsGrouped: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col>
          <p tedi-text modifiers="bold">Primary</p>
          <div style="display: inline-flex;">
            <label tedi-radio-card variant="primary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-primary" />
              Text
            </label>
            <label tedi-radio-card variant="primary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-primary" />
              Text
            </label>
            <label tedi-radio-card variant="primary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-primary" checked />
              Text
            </label>
            <label tedi-radio-card variant="primary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-primary" />
              Text
            </label>
          </div>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Secondary</p>
          <div style="display: inline-flex;">
            <label tedi-radio-card variant="secondary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-secondary" />
              Text
            </label>
            <label tedi-radio-card variant="secondary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-secondary" checked />
              Text
            </label>
            <label tedi-radio-card variant="secondary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-secondary" />
              Text
            </label>
            <label tedi-radio-card variant="secondary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-secondary" />
              Text
            </label>
          </div>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

/**
 * Radio cards with a description below the label text.
 */
export const RadioCardsWithDescription: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col>
          <p tedi-text modifiers="bold">Primary</p>
          <tedi-radio-card-group>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-desc-primary" checked />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-desc-primary" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-desc-primary" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
          </tedi-radio-card-group>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Secondary</p>
          <tedi-radio-card-group>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-desc-secondary" checked />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-desc-secondary" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-desc-secondary" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
          </tedi-radio-card-group>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

/**
 * Grouped radio cards with description text.
 */
export const RadioCardsGroupedWithDescription: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col>
          <p tedi-text modifiers="bold">Primary</p>
          <div style="display: inline-flex;">
            <label tedi-radio-card variant="primary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-desc-primary" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-radio-card variant="primary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-desc-primary" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-radio-card variant="primary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-desc-primary" checked />
              Text
              <tedi-feedback-text text="Description" />
            </label>
          </div>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Secondary</p>
          <div style="display: inline-flex;">
            <label tedi-radio-card variant="secondary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-desc-secondary" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-radio-card variant="secondary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-desc-secondary" checked />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-radio-card variant="secondary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-desc-secondary" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
          </div>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

/**
 * Radio cards with icons before the label text.
 */
export const RadioCardsWithIcons: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col>
          <p tedi-text modifiers="bold">Primary</p>
          <tedi-radio-card-group>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-icon-primary" checked />
              <tedi-icon name="apartment" [size]="18" />
              Text
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-icon-primary" />
              <tedi-icon name="stethoscope" [size]="18" />
              Text
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-icon-primary" />
              <tedi-icon name="home" [size]="18" />
              Text
            </label>
          </tedi-radio-card-group>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Secondary</p>
          <tedi-radio-card-group>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-icon-secondary" checked />
              <tedi-icon name="apartment" [size]="18" />
              Text
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-icon-secondary" />
              <tedi-icon name="stethoscope" [size]="18" />
              Text
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-icon-secondary" />
              <tedi-icon name="home" [size]="18" />
              Text
            </label>
          </tedi-radio-card-group>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Primary with description</p>
          <tedi-radio-card-group>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-icon-desc-primary" checked />
              <tedi-icon name="apartment" [size]="18" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-icon-desc-primary" />
              <tedi-icon name="stethoscope" [size]="18" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-icon-desc-primary" />
              <tedi-icon name="home" [size]="18" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
          </tedi-radio-card-group>
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Secondary with description</p>
          <tedi-radio-card-group>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-icon-desc-secondary" checked />
              <tedi-icon name="apartment" [size]="18" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-icon-desc-secondary" />
              <tedi-icon name="stethoscope" [size]="18" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-icon-desc-secondary" />
              <tedi-icon name="home" [size]="18" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
          </tedi-radio-card-group>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

/**
 * All visual states of the radio card component for both primary and secondary variants.
 */
export const RadioCardStates: StoryObj<RadioComponent> = {
  parameters: {
    pseudo: {
      hover: ["#PrimaryHover", "#SecondaryHover"],
      active: ["#PrimaryActive", "#SecondaryActive"],
      focusVisible: ["#PrimaryFocus", "#SecondaryFocus"],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="3" [gapY]="3">
        <tedi-col></tedi-col>
        <tedi-col><strong>Primary</strong></tedi-col>
        <tedi-col><strong>Secondary</strong></tedi-col>

        <tedi-col><strong>Default</strong></tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-state-p-default" />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-state-s-default" />
            Text
          </label>
        </tedi-col>

        <tedi-col><strong>Hover</strong></tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-state-p-hover" id="PrimaryHover" />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-state-s-hover" id="SecondaryHover" />
            Text
          </label>
        </tedi-col>

        <tedi-col><strong>Selected</strong></tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-state-p-selected" checked />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-state-s-selected" checked />
            Text
          </label>
        </tedi-col>

        <tedi-col><strong>Active</strong></tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-state-p-active" checked id="PrimaryActive" />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-state-s-active" checked id="SecondaryActive" />
            Text
          </label>
        </tedi-col>

        <tedi-col><strong>Focus</strong></tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-state-p-focus" id="PrimaryFocus" />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-state-s-focus" id="SecondaryFocus" />
            Text
          </label>
        </tedi-col>

        <tedi-col><strong>Disabled</strong></tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-state-p-disabled" disabled />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-state-s-disabled" disabled />
            Text
          </label>
        </tedi-col>

        <tedi-col><strong>Disabled selected</strong></tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="primary">
            <input tedi-radio type="radio" name="card-state-p-disabled-selected" checked disabled />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="secondary">
            <input tedi-radio type="radio" name="card-state-s-disabled-selected" checked disabled />
            Text
          </label>
        </tedi-col>
      </tedi-row>
    `,
  }),
};
