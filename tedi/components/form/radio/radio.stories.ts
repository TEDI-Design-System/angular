import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { RadioComponent } from "./radio.component";
import { RadioCardComponent } from "../radio-card/radio-card.component";
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
  title: "TEDI-Ready/Components/Form/Choicegroup/Radio",
  component: RadioComponent,
  decorators: [
    moduleMetadata({
      imports: [
        RadioComponent,
        RadioCardComponent,
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
      <input tedi-radio type="radio" ${argsToTemplate(args)} />
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
      <p tedi-text color="secondary">Label</p>
      <tedi-row [cols]="1" [gapY]="1">
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-radio type="radio" name="vertical-demo" />
          Text
        </label>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-radio type="radio" name="vertical-demo" />
          Text
        </label>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-radio type="radio" name="vertical-demo" checked />
          Text
        </label>
      </tedi-row>
    `,
  }),
};

export const Horizontal: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <p tedi-text color="secondary">Label</p>
      <div style="display: flex; align-items: center; gap: 12px;">
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-radio type="radio" name="horizontal-demo" />
          Text
        </label>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-radio type="radio" name="horizontal-demo" />
          Text
        </label>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-radio type="radio" name="horizontal-demo" checked />
          Text
        </label>
      </div>
    `,
  }),
};

export const Separate: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-radio type="radio" name="separate-demo" />
          Text
        </label>
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-radio id="radio-required" type="radio" name="separate-required" />
          <label tedi-label for="radio-required" color="primary" [required]="true">
            Text
          </label>
        </div>
        <div style="display: inline-flex; align-items: center; gap: 4px;">
          <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
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
        <div style="display: inline-flex; gap: 8px;">
          <div>
            <input tedi-radio id="radio-with-desc" type="radio" name="separate-desc" />
          </div>
          <div>
            <label tedi-label for="radio-with-desc" color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              Text
            </label>
            <p tedi-text color="secondary">
              Description
            </p>
          </div>
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
        <div>
          <p tedi-text color="secondary">Label</p>
          <tedi-row [cols]="1" [gapY]="1">
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-radio type="radio" name="group-hint" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-radio type="radio" name="group-hint" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-radio type="radio" name="group-hint" />
              Text
            </label>
          </tedi-row>
          <tedi-feedback-text text="Hint text" />
        </div>
        <div>
          <p tedi-text color="secondary">Label</p>
          <tedi-row [cols]="1" [gapY]="1">
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-radio type="radio" name="group-error" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-radio type="radio" name="group-error" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-radio type="radio" name="group-error" />
              Text
            </label>
          </tedi-row>
          <tedi-feedback-text text="Feedback text" type="error" />
        </div>
        <div>
          <p tedi-text color="secondary">Label</p>
          <div style="display: flex; align-items: center; gap: 12px;">
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-radio type="radio" name="group-h-hint" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-radio type="radio" name="group-h-hint" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-radio type="radio" name="group-h-hint" />
              Text
            </label>
          </div>
          <tedi-feedback-text text="Hint text" />
        </div>
        <div>
          <p tedi-text color="secondary">Label</p>
          <div style="display: flex; align-items: center; gap: 12px;">
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-radio type="radio" name="group-h-error" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-radio type="radio" name="group-h-error" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-radio type="radio" name="group-h-error" />
              Text
            </label>
          </div>
          <tedi-feedback-text text="Feedback text" type="error" />
        </div>
      </tedi-row>
    `,
  }),
};

/**
 * All visual states of the radio component.
 */
export const States: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="2" [gapY]="3">
        <div>Default</div>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-radio type="radio" name="state-default" />
          Text
        </label>

        <div>Selected</div>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-radio type="radio" name="state-selected" checked />
          Text
        </label>

        <div>Error</div>
        <div>
          <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <input tedi-radio type="radio" name="state-error" [invalid]="true" />
            Text
          </label>
          <tedi-feedback-text text="Feedback text" type="error" />
        </div>

        <div>Disabled</div>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-radio type="radio" name="state-disabled" disabled />
          Text
        </label>

        <div>Disabled selected</div>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
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
      <tedi-row [cols]="2" [gapY]="3">
        <tedi-col><p tedi-text modifiers="bold">Primary</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Secondary</p></tedi-col>
        <tedi-col>
          <div style="display: flex; gap: 8px;">
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
          </div>
        </tedi-col>
        <tedi-col>
          <div style="display: flex; gap: 8px;">
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
          </div>
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
      <tedi-row [cols]="2" [gapY]="3">
        <tedi-col><p tedi-text modifiers="bold">Primary</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Secondary</p></tedi-col>
        <tedi-col>
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
      <tedi-row [cols]="2" [gapY]="3">
        <tedi-col><p tedi-text modifiers="bold">Primary</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Secondary</p></tedi-col>
        <tedi-col>
          <div style="display: flex; gap: 8px;">
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-desc-primary" checked />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-desc-primary" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-desc-primary" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
          </div>
        </tedi-col>
        <tedi-col>
          <div style="display: flex; gap: 8px;">
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-desc-secondary" checked />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-desc-secondary" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-desc-secondary" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
          </div>
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
      <tedi-row [cols]="2" [gapY]="3">
        <tedi-col><p tedi-text modifiers="bold">Primary</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Secondary</p></tedi-col>
        <tedi-col>
          <div style="display: inline-flex;">
            <label tedi-radio-card variant="primary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-desc-primary" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-radio-card variant="primary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-desc-primary" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-radio-card variant="primary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-desc-primary" checked />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
          </div>
        </tedi-col>
        <tedi-col>
          <div style="display: inline-flex;">
            <label tedi-radio-card variant="secondary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-desc-secondary" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-radio-card variant="secondary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-desc-secondary" checked />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-radio-card variant="secondary" [grouped]="true">
              <input tedi-radio type="radio" name="card-group-desc-secondary" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
          </div>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

/**
 * All visual states of the radio card component with primary and secondary variants side by side.
 */
export const RadioCardStates: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="3" [gapY]="3" alignItems="center">
        <tedi-col><p tedi-text modifiers="bold">State</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Primary</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Secondary</p></tedi-col>

        <tedi-col>Default</tedi-col>
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

        <tedi-col>Hover</tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="primary"
            style="--_card-bg: var(--form-checkbox-radio-card-primary-hover-background); --_card-text: var(--form-checkbox-radio-card-primary-hover-text); --_card-border: var(--form-checkbox-radio-card-primary-hover-border);">
            <input tedi-radio type="radio" name="card-state-p-hover" />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="secondary"
            style="--_card-bg: var(--form-checkbox-radio-card-secondary-hover-background); --_card-text: var(--form-checkbox-radio-card-secondary-hover-text); --_card-border: var(--form-checkbox-radio-card-secondary-hover-border);">
            <input tedi-radio type="radio" name="card-state-s-hover" />
            Text
          </label>
        </tedi-col>

        <tedi-col>Selected</tedi-col>
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

        <tedi-col>Focus</tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="primary"
            style="outline: 2px solid var(--form-input-border-active); outline-offset: 1px;">
            <input tedi-radio type="radio" name="card-state-p-focus" />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-radio-card variant="secondary"
            style="outline: 2px solid var(--form-input-border-active); outline-offset: 1px;">
            <input tedi-radio type="radio" name="card-state-s-focus" />
            Text
          </label>
        </tedi-col>

        <tedi-col>Disabled</tedi-col>
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

        <tedi-col>Disabled selected</tedi-col>
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

/**
 * Radio cards with icons before the label text.
 */
export const RadioCardsWithIcons: StoryObj<RadioComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="2" [gapY]="3">
        <tedi-col><p tedi-text modifiers="bold">Primary</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Secondary</p></tedi-col>
        <tedi-col>
          <div style="display: flex; gap: 8px;">
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
          </div>
        </tedi-col>
        <tedi-col>
          <div style="display: flex; gap: 8px;">
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
          </div>
        </tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Primary with description</p></tedi-col>
        <tedi-col><p tedi-text modifiers="bold">Secondary with description</p></tedi-col>
        <tedi-col>
          <div style="display: flex; gap: 8px;">
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-icon-desc-primary" checked />
              <tedi-icon name="apartment" [size]="18" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-icon-desc-primary" />
              <tedi-icon name="stethoscope" [size]="18" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-radio-card variant="primary">
              <input tedi-radio type="radio" name="card-icon-desc-primary" />
              <tedi-icon name="home" [size]="18" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
          </div>
        </tedi-col>
        <tedi-col>
          <div style="display: flex; gap: 8px;">
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-icon-desc-secondary" checked />
              <tedi-icon name="apartment" [size]="18" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-icon-desc-secondary" />
              <tedi-icon name="stethoscope" [size]="18" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-radio-card variant="secondary">
              <input tedi-radio type="radio" name="card-icon-desc-secondary" />
              <tedi-icon name="home" [size]="18" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
          </div>
        </tedi-col>
      </tedi-row>
    `,
  }),
};
