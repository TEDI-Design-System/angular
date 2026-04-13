import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { CheckboxComponent } from "./checkbox.component";
import { CheckboxCardComponent } from "../checkbox-card/checkbox-card.component";
import { CheckboxGroupComponent } from "../checkbox-group/checkbox-group.component";
import { CheckboxCardGroupComponent } from "../checkbox-card-group/checkbox-card-group.component";
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
        CheckboxGroupComponent,
        CheckboxCardGroupComponent,
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
        category: "Checkbox",
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
        category: "Checkbox",
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
        category: "Checkbox",
        type: {
          summary: "boolean",
        },
      },
    },
    indeterminate: {
      control: "boolean",
      description:
        "Renders an alternate checked state, with a slash, which is neither toggled on or off. Interacting with the checkbox will dismiss the indeterminate state.",
      table: {
        category: "Checkbox",
      },
    },
    variant: {
      control: "radio",
      options: ["primary", "secondary"],
      description: "Visual variant of the checkbox card.",
      table: {
        category: "CheckboxCard",
        type: {
          summary: "CheckboxCardVariant",
          detail: "primary \nsecondary",
        },
        defaultValue: {
          summary: "primary",
        },
      },
    },
    showIndicator: {
      control: "boolean",
      description:
        "Whether to show the checkbox indicator. When false, the checkbox is visually hidden but remains functional.",
      table: {
        category: "CheckboxCard",
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "true",
        },
      },
    },
    groupLabel: {
      control: "text",
      description: "Label text displayed above the checkbox group.",
      table: {
        category: "CheckboxGroup",
        type: {
          summary: "string",
        },
      },
    },
    groupDirection: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout direction of the checkboxes.",
      table: {
        category: "CheckboxGroup",
        type: {
          summary: "CheckboxGroupDirection",
          detail: "horizontal \nvertical",
        },
        defaultValue: {
          summary: "horizontal",
        },
      },
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
      <label tedi-label color="primary" class="flex align-items-center gap-2">
        <input tedi-checkbox type="checkbox" ${argsToTemplate(args)} />
        Text
      </label>
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
      <tedi-checkbox-group label="Label" direction="vertical">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked />
          Text
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked />
          Text
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" />
          Text
        </label>
      </tedi-checkbox-group>
    `,
  }),
};

export const Horizontal: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-checkbox-group label="Label">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked />
          Text
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked />
          Text
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" />
          Text
        </label>
      </tedi-checkbox-group>
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
        <tedi-checkbox-group label="Label" direction="vertical">
          <label tedi-label id="parentCB" color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <tedi-checkbox-group id="childrenCB" direction="vertical" style="padding-left: 32px;">
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" checked />
              Text
            </label>
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" checked />
              Text
            </label>
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" />
              Text
            </label>
          </tedi-checkbox-group>
        </tedi-checkbox-group>
      `,
    };
  },
};

export const Separate: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        <div>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <tedi-feedback-text text="Hint text" />
        </div>
        <div>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" [invalid]="true" />
            Text
          </label>
          <tedi-feedback-text text="Feedback text" type="error" />
        </div>
        <label tedi-label color="primary" [required]="true" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" />
          Text
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" />
          <tedi-icon name="stethoscope" [size]="16" />
          Text
        </label>
        <div class="flex align-items-center gap-1">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
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
        <div>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <tedi-feedback-text text="Description" />
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
        <tedi-checkbox-group label="Label" direction="vertical">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <tedi-feedback-text text="Hint text" />
        </tedi-checkbox-group>
        <tedi-checkbox-group label="Label" direction="vertical">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <tedi-feedback-text text="Feedback text" type="error" />
        </tedi-checkbox-group>
        <tedi-checkbox-group label="Label">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <tedi-feedback-text text="Hint text" />
        </tedi-checkbox-group>
        <tedi-checkbox-group label="Label">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
          <tedi-feedback-text text="Feedback text" type="error" />
        </tedi-checkbox-group>
      </tedi-row>
    `,
  }),
};

/**
 * All visual states of the checkbox component.
 */
export const States: StoryObj<CheckboxComponent> = {
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
          <input tedi-checkbox type="checkbox" />
          Text
        </label>

        <strong>Hover</strong>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" id="Hover" />
          Text
        </label>

        <strong>Selected</strong>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked />
          Text
        </label>

        <strong>Active</strong>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked id="Active" />
          Text
        </label>

        <strong>Error</strong>
        <div>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" [invalid]="true" />
            Text
          </label>
          <tedi-feedback-text text="Feedback text" type="error" />
        </div>

        <strong>Disabled</strong>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" disabled />
          Text
        </label>

        <strong>Disabled selected</strong>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked disabled />
          Text
        </label>

        <strong>Indeterminate</strong>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
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
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text>Primary</p>
          <tedi-checkbox-card-group>
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
          </tedi-checkbox-card-group>
        </tedi-col>
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text>Secondary</p>
          <tedi-checkbox-card-group>
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
          </tedi-checkbox-card-group>
        </tedi-col>
      </tedi-row>
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
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text>Primary</p>
          <tedi-checkbox-card-group>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" checked />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
          </tedi-checkbox-card-group>
        </tedi-col>
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text>Secondary</p>
          <tedi-checkbox-card-group>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" checked />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
          </tedi-checkbox-card-group>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

/**
 * Checkbox cards with icons before the label text.
 */
export const CheckboxCardsWithIcons: StoryObj<CheckboxComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [gapY]="3" [xs]="{cols: 1}" [md]="{cols: 2}">
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text>Primary</p>
          <tedi-checkbox-card-group>
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
          </tedi-checkbox-card-group>
        </tedi-col>
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text>Secondary</p>
          <tedi-checkbox-card-group>
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
          </tedi-checkbox-card-group>
        </tedi-col>
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text>Primary with description</p>
          <tedi-checkbox-card-group>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" checked />
              <tedi-icon name="apartment" [size]="18" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="stethoscope" [size]="18" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-checkbox-card variant="primary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="home" [size]="18" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
          </tedi-checkbox-card-group>
        </tedi-col>
        <tedi-col class="flex flex-column gap-2">
          <p tedi-text>Secondary with description</p>
          <tedi-checkbox-card-group>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" checked />
              <tedi-icon name="apartment" [size]="18" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="stethoscope" [size]="18" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
            <label tedi-checkbox-card variant="secondary">
              <input tedi-checkbox type="checkbox" />
              <tedi-icon name="home" [size]="18" />
              Text
              <tedi-feedback-text text="Description" />
            </label>
          </tedi-checkbox-card-group>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

/**
 * All visual states of the checkbox card component for both primary and secondary variants.
 */
export const CheckboxCardStates: StoryObj<CheckboxComponent> = {
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
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" />
            Text
          </label>
        </tedi-col>

        <tedi-col><strong>Hover</strong></tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" id="PrimaryHover" />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" id="SecondaryHover" />
            Text
          </label>
        </tedi-col>

        <tedi-col><strong>Selected</strong></tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" checked />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" checked />
            Text
          </label>
        </tedi-col>

        <tedi-col><strong>Active</strong></tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" checked id="PrimaryActive" />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" checked id="SecondaryActive" />
            Text
          </label>
        </tedi-col>

        <tedi-col><strong>Focus</strong></tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" id="PrimaryFocus" />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" id="SecondaryFocus" />
            Text
          </label>
        </tedi-col>

        <tedi-col><strong>Disabled</strong></tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" disabled />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" disabled />
            Text
          </label>
        </tedi-col>

        <tedi-col><strong>Disabled selected</strong></tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="primary">
            <input tedi-checkbox type="checkbox" checked disabled />
            Text
          </label>
        </tedi-col>
        <tedi-col>
          <label tedi-checkbox-card variant="secondary">
            <input tedi-checkbox type="checkbox" checked disabled />
            Text
          </label>
        </tedi-col>
      </tedi-row>
    `,
  }),
};
