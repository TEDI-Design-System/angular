import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { CheckboxComponent } from "./checkbox.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { TextComponent } from "../../base/text/text.component";
import { LabelComponent } from "../label/label.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";
import { InfoButtonComponent } from "../../buttons/info-button/info-button.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.21.30?node-id=6149-138033&m=dev" target="_blank">Figma ↗</a><br />
 * <a href="https://tedi.tehik.ee/1ee8444b7/p/796203-checkbox" target="_blank">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Form/Checkbox",
  component: CheckboxComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CheckboxComponent,
        RowComponent,
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
  },
} as Meta<CheckboxComponent>;

export const Default: StoryObj<CheckboxComponent & { disabled: boolean }> = {
  args: {
    size: "default",
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <input tedi-checkbox type="checkbox" ${argsToTemplate(args)} />
    `,
  }),
};

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
        "#parentCB input",
      ) as HTMLInputElement;
      const children = Array.from(
        document.querySelectorAll("#childrenCB input"),
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
          <tedi-feedback-text text="Feedback text" type="error" />
        </div>
      </tedi-row>
    `,
  }),
};
