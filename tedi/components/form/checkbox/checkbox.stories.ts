import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { CheckboxComponent } from "./checkbox.component";
import { CheckboxCardComponent } from "../checkbox-card/checkbox-card.component";
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

type StoryCheckboxComponent = CheckboxComponent & {
  indeterminate: boolean;
};

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.41.64?node-id=4228-72936&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/796203-checkbox" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Form/Checkbox",
  component: CheckboxComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CheckboxComponent,
        CheckboxCardComponent,
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
      description: "Size of the checkbox.",
      table: {
        type: {
          summary: "CheckboxSize",
          detail: "default \nlarge",
        },
        defaultValue: {
          summary: "default",
        },
      },
    },
    invalid: {
      control: "boolean",
      description: "Is checkbox invalid?",
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
      description: "Is checkbox disabled?",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    indeterminate: {
      control: "boolean",
      description:
        "Renders an alternate checked state, with a slash, which is neither toggled on or off. Interacting with the checkbox will dismiss the indeterminate state.",
    },
  },
} as Meta<StoryCheckboxComponent>;

export const Default: StoryObj<StoryCheckboxComponent & { disabled: boolean }> =
  {
    args: {
      size: "default",
      invalid: false,
      disabled: false,
      indeterminate: false,
    },
    render: (args) => ({
      props: args,
      template: `
      <input tedi-checkbox type="checkbox" ${argsToTemplate(args)} />
    `,
    }),
  };

/**
 * Default size is used on desktop, large size is applied automatically on mobile screen sizes.
 * Use in tables where the checkbox has no text. **Otherwise, prefer using default size.**
 */
export const Size: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="2" [gapY]="3">
        <div>Default</div>
        <input tedi-checkbox type="checkbox" />
        <div>Large</div>
        <input tedi-checkbox type="checkbox" size="large" />
      </tedi-row>
    `,
  }),
};

export const Vertical: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <p tedi-text color="secondary">Label</p>
      <tedi-row [cols]="1" [gapY]="1">
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" checked />
          Text
        </label>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" checked />
          Text
        </label>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" />
          Text
        </label>
      </tedi-row>
    `,
  }),
};

export const Horizontal: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <p tedi-text color="secondary">Label</p>
      <div style="display: flex; align-items: center; gap: 12px;">
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" checked />
          Text
        </label>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" checked />
          Text
        </label>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" />
          Text
        </label>
      </div>
    `,
  }),
};

export const VerticalTree: StoryObj<CheckboxComponent> = {
  render: (args) => {
    setTimeout(() => {
      const parent = document.querySelector(
        "#parentCB input"
      ) as HTMLInputElement;
      const children = Array.from(
        document.querySelectorAll("#childrenCB input")
      ) as HTMLInputElement[];

      function updateParent() {
        const checked = children.map((c) => c.checked);
        const all = checked.every((v) => v === true);
        const none = checked.every((v) => v === false);

        parent.checked = all;
        parent.indeterminate = !all && !none;
      }

      updateParent();

      children.forEach((c) => c.addEventListener("change", updateParent));

      parent.addEventListener("change", () => {
        const targetState = parent.checked;
        children.forEach((c) => (c.checked = targetState));
        updateParent();
      });
    });

    return {
      props: args,
      template: `
        <p tedi-text color="secondary">Label</p>
        <label tedi-label id="parentCB" color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" />
          Text
        </label>
        <tedi-row id="childrenCB" [cols]="1" [gapY]="1" style="padding-left: 32px;">
          <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <input tedi-checkbox type="checkbox" checked />
            Text
          </label>
          <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <input tedi-checkbox type="checkbox" checked />
            Text
          </label>
          <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
        </tedi-row>
      `,
    };
  },
};

export const Separate: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" />
          Text
        </label>
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox id="checkbox-required" type="checkbox" />
          <label tedi-label for="checkbox-required" color="primary" [required]="true">
            Text
          </label>
        </div>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" />
          <tedi-icon name="stethoscope" [size]="16" />
          Text
        </label>
        <div style="display: inline-flex; align-items: center; gap: 4px;">
          <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <input tedi-checkbox type="checkbox" />
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
            <input tedi-checkbox id="checkbox-with-desc" type="checkbox" />
          </div>
          <div>
            <label tedi-label for="checkbox-with-desc" color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
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

export const Group: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="2" [gapY]="3">
        <div>
          <p tedi-text color="secondary">Label</p>
          <tedi-row [cols]="1" [gapY]="1">
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
          </tedi-row>
          <tedi-feedback-text text="Hint text" />
        </div>
        <div>
          <p tedi-text color="secondary">Label</p>
          <tedi-row [cols]="1" [gapY]="1">
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
          </tedi-row>
          <tedi-feedback-text text="Feedback text" type="error" />
        </div>
        <div>
          <p tedi-text color="secondary">Label</p>
          <div style="display: flex; align-items: center; gap: 12px;">
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
          </div>
          <tedi-feedback-text text="Hint text" />
        </div>
        <div>
          <p tedi-text color="secondary">Label</p>
          <div style="display: flex; align-items: center; gap: 12px;">
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
            <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
              <input tedi-checkbox type="checkbox" />
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
 * All visual states of the checkbox component.
 */
export const States: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="2" [gapY]="3">
        <div>Default</div>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" />
          Text
        </label>

        <div>Selected</div>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" checked />
          Text
        </label>

        <div>Error</div>
        <div>
          <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <input tedi-checkbox type="checkbox" [invalid]="true" />
            Text
          </label>
          <tedi-feedback-text text="Feedback text" type="error" />
        </div>

        <div>Disabled</div>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" disabled />
          Text
        </label>

        <div>Disabled selected</div>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" checked disabled />
          Text
        </label>

        <div>Indeterminate</div>
        <label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <input tedi-checkbox type="checkbox" [indeterminate]="true" />
          Text
        </label>
      </tedi-row>
    `,
  }),
};

/**
 * Checkbox cards with primary and secondary variants. Primary uses a filled background when selected, secondary uses an outline border.
 */
export const CheckboxCards: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div>
          <p tedi-text color="secondary" style="margin-bottom: 8px;">Primary</p>
          <div style="display: flex; gap: 8px;">
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" checked />
              Text
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
          </div>
        </div>
        <div>
          <p tedi-text color="secondary" style="margin-bottom: 8px;">Secondary</p>
          <div style="display: flex; gap: 8px;">
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" checked />
              Text
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Checkbox cards with a description below the label text.
 */
export const CheckboxCardsWithDescription: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div>
          <p tedi-text color="secondary" style="margin-bottom: 8px;">Primary</p>
          <div style="display: flex; gap: 8px;">
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" checked />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
          </div>
        </div>
        <div>
          <p tedi-text color="secondary" style="margin-bottom: 8px;">Secondary</p>
          <div style="display: flex; gap: 8px;">
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" checked />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Checkbox cards with icons before the label text.
 */
/**
 * All visual states of the checkbox card component for both primary and secondary variants.
 */
export const CheckboxCardStates: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div>
          <p tedi-text color="secondary" style="margin-bottom: 8px;">Primary</p>
          <tedi-row [cols]="2" [gapY]="3">
            <tedi-col>Default</tedi-col>
            <tedi-col>
              <label tedi-checkbox-card variant="primary">
                <input tedi-checkbox type="checkbox" />
                Text
              </label>
            </tedi-col>

            <tedi-col>Hover</tedi-col>
            <tedi-col>
              <label tedi-checkbox-card variant="primary"
                style="--_card-bg: var(--form-checkbox-radio-card-primary-hover-background); --_card-text: var(--form-checkbox-radio-card-primary-hover-text); --_card-border: var(--form-checkbox-radio-card-primary-hover-border);">
                <input tedi-checkbox type="checkbox" />
                Text
              </label>
            </tedi-col>

            <tedi-col>Selected</tedi-col>
            <tedi-col>
              <label tedi-checkbox-card variant="primary">
                <input tedi-checkbox type="checkbox" checked />
                Text
              </label>
            </tedi-col>

            <tedi-col>Focus</tedi-col>
            <tedi-col>
              <label tedi-checkbox-card variant="primary"
                style="outline: 2px solid var(--form-input-border-active); outline-offset: 1px;">
                <input tedi-checkbox type="checkbox" />
                Text
              </label>
            </tedi-col>

            <tedi-col>Disabled</tedi-col>
            <tedi-col>
              <label tedi-checkbox-card variant="primary">
                <input tedi-checkbox type="checkbox" disabled />
                Text
              </label>
            </tedi-col>

            <tedi-col>Disabled selected</tedi-col>
            <tedi-col>
              <label tedi-checkbox-card variant="primary">
                <input tedi-checkbox type="checkbox" checked disabled />
                Text
              </label>
            </tedi-col>
          </tedi-row>
        </div>
        <div>
          <p tedi-text color="secondary" style="margin-bottom: 8px;">Secondary</p>
          <tedi-row [cols]="2" [gapY]="3">
            <tedi-col>Default</tedi-col>
            <tedi-col>
              <label tedi-checkbox-card variant="secondary">
                <input tedi-checkbox type="checkbox" />
                Text
              </label>
            </tedi-col>

            <tedi-col>Hover</tedi-col>
            <tedi-col>
              <label tedi-checkbox-card variant="secondary"
                style="--_card-bg: var(--form-checkbox-radio-card-secondary-hover-background); --_card-text: var(--form-checkbox-radio-card-secondary-hover-text); --_card-border: var(--form-checkbox-radio-card-secondary-hover-border);">
                <input tedi-checkbox type="checkbox" />
                Text
              </label>
            </tedi-col>

            <tedi-col>Selected</tedi-col>
            <tedi-col>
              <label tedi-checkbox-card variant="secondary">
                <input tedi-checkbox type="checkbox" checked />
                Text
              </label>
            </tedi-col>

            <tedi-col>Focus</tedi-col>
            <tedi-col>
              <label tedi-checkbox-card variant="secondary"
                style="outline: 2px solid var(--form-input-border-active); outline-offset: 1px;">
                <input tedi-checkbox type="checkbox" />
                Text
              </label>
            </tedi-col>

            <tedi-col>Disabled</tedi-col>
            <tedi-col>
              <label tedi-checkbox-card variant="secondary">
                <input tedi-checkbox type="checkbox" disabled />
                Text
              </label>
            </tedi-col>

            <tedi-col>Disabled selected</tedi-col>
            <tedi-col>
              <label tedi-checkbox-card variant="secondary">
                <input tedi-checkbox type="checkbox" checked disabled />
                Text
              </label>
            </tedi-col>
          </tedi-row>
        </div>
      </div>
    `,
  }),
};

export const CheckboxCardsWithIcons: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div>
          <p tedi-text color="secondary" style="margin-bottom: 8px;">Primary</p>
          <div style="display: flex; gap: 8px;">
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" checked />
              <tedi-icon name="apartment" [size]="18" />
              Text
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="stethoscope" [size]="18" />
              Text
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="home" [size]="18" />
              Text
            </label>
          </div>
        </div>
        <div>
          <p tedi-text color="secondary" style="margin-bottom: 8px;">Secondary</p>
          <div style="display: flex; gap: 8px;">
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" checked />
              <tedi-icon name="apartment" [size]="18" />
              Text
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="stethoscope" [size]="18" />
              Text
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="home" [size]="18" />
              Text
            </label>
          </div>
        </div>
        <div>
          <p tedi-text color="secondary" style="margin-bottom: 8px;">Primary with description</p>
          <div style="display: flex; gap: 8px;">
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" checked />
              <tedi-icon name="apartment" [size]="18" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="stethoscope" [size]="18" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="home" [size]="18" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
          </div>
        </div>
        <div>
          <p tedi-text color="secondary" style="margin-bottom: 8px;">Secondary with description</p>
          <div style="display: flex; gap: 8px;">
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" checked />
              <tedi-icon name="apartment" [size]="18" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="stethoscope" [size]="18" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="home" [size]="18" />
              <span style="display: flex; flex-direction: column;">
                Text
                <span tedi-text modifiers="small">Description</span>
              </span>
            </label>
          </div>
        </div>
      </div>
    `,
  }),
};
