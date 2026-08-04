import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { SliderComponent } from "./slider.component";
import { NumberFieldComponent } from "../number-field/number-field.component";
import { InputGroupComponent } from "../input-group/input-group.component";
import { InputGroupSuffixDirective } from "../input-group/input-group-suffix.directive";
import { FormFieldComponent } from "../form-field/form-field.component";
import { TextFieldComponent } from "../text-field/text-field.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.65.83?node-id=19071-105925&m=dev" target="_blank">Figma ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Form/Slider",
  component: SliderComponent,
  decorators: [
    moduleMetadata({
      imports: [
        NumberFieldComponent,
        InputGroupComponent,
        InputGroupSuffixDirective,
        FormFieldComponent,
        TextFieldComponent,
        RowComponent,
        ColComponent,
        TextComponent,
      ],
    }),
  ],
  args: {
    inputId: "slider-example",
    label: "Väärtus",
    min: 0,
    max: 100,
    step: 1,
    value: 50,
    minLabel: "0%",
    maxLabel: "100%",
  },
  render: (args) => ({
    props: { ...args, valueFormatter: (value: number) => `${value}%` },
    template: `
      <tedi-row>
        <tedi-col [width]="6">
          <tedi-slider ${argsToTemplate(args)} [valueFormatter]="valueFormatter" />
        </tedi-col>
      </tedi-row>
    `,
  }),
  argTypes: {
    inputId: {
      description:
        "Identifier for the underlying range input; associates the label with the input.",
      control: false,
      table: { category: "inputs", type: { summary: "string" } },
    },
    name: {
      description: "Name attribute of the underlying input.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    label: {
      description: "Label rendered above the slider.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    hideLabel: {
      description:
        "Hide the label visually while keeping it for assistive tech; 'keep-space' also reserves its vertical space.",
      control: "select",
      options: [false, true, "keep-space"],
      table: {
        category: "inputs",
        type: { summary: "boolean | 'keep-space'" },
        defaultValue: { summary: "false" },
      },
    },
    required: {
      description: "Marks the field as required.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    min: {
      description: "Minimum allowed value.",
      control: "number",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "0" },
      },
    },
    max: {
      description: "Maximum allowed value.",
      control: "number",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "100" },
      },
    },
    step: {
      description: "Step size.",
      control: "number",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    value: {
      description: "Current value. Supports two-way binding and reactive forms.",
      control: "number",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "0" },
      },
    },
    disabled: {
      description: "Disables the slider.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    invalid: {
      description: "Marks the slider as invalid for validation purposes.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    minLabel: {
      description: "Text rendered to the left of the track (e.g. the minimum value).",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    maxLabel: {
      description:
        "Text rendered to the right of the track. Ignored when showCurrentValue is true.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    showCurrentValue: {
      description:
        "Render the current value to the right of the track instead of maxLabel.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    valueFormatter: {
      description:
        "Formats the current value for the thumb tooltip and the showCurrentValue label.",
      control: false,
      table: {
        category: "inputs",
        type: { summary: "(value: number) => string" },
      },
    },
    tooltip: {
      description:
        "Show a tooltip with the current value above the thumb while hovered, focused or dragged.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    feedbackText: {
      description: "FeedbackText component inputs, rendered below the slider.",
      control: "object",
      table: {
        category: "inputs",
        type: { summary: "ComponentInputs<FeedbackTextComponent>" },
      },
    },
    ariaLabel: {
      description: "Accessible label used when no visible label is provided.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    ariaLabelledby: {
      description:
        "ID of an element that labels the slider, used when no visible label is provided.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    ariaValuetext: {
      description: "Human-readable text alternative of the current value.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
  },
} as Meta<SliderComponent>;

type Story = StoryObj<SliderComponent>;

export const Default: Story = {};

export const WithInputGroup: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { value: 20 },
    template: `
          <tedi-slider
            style="width: 100%"
            inputId="slider-input-group"
            label="Väärtus"
            [min]="0"
            [max]="100"
            [step]="1"
            [(value)]="value"
            minLabel="0%"
            maxLabel="100%"
          >
            <tedi-input-group sliderAddon style="width: 100px">
              <tedi-form-field>
                <input
                  tedi-text-field
                  type="number"
                  aria-label="Väärtus"
                  [value]="value"
                  (input)="value = +$any($event.target).value"
                />
              </tedi-form-field>
              <span tediInputGroupSuffix>%</span>
            </tedi-input-group>
          </tedi-slider>
    `,
  }),
};

export const MinAndMaxValues: Story = {
  args: {
    inputId: "slider-min-max",
    label: undefined,
    ariaLabel: "Väärtus",
  },
};

export const WithCurrentValue: Story = {
  args: {
    inputId: "slider-current-value",
    label: undefined,
    ariaLabel: "Silt",
    showCurrentValue: true,
    maxLabel: undefined,
  },
};

export const WithHint: Story = {
  args: {
    inputId: "slider-hint",
    label: undefined,
    ariaLabel: "Väärtus",
    value: 50,
    showCurrentValue: true,
    minLabel: undefined,
    maxLabel: undefined,
    feedbackText: {
      text: "Hint text",
      type: "hint",
      position: "left",
    },
  },
};

/**
 * The slider composes freely: a hidden label, a paired input field, or a custom range
 * such as `1–10` with an editable `tedi-number-field`.
 */
export const CustomValue: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { inputValue: 50, numberValue: 4 },
    template: `
      <tedi-row cols="1" gapY="2">
        <tedi-col [width]="6">
          <tedi-slider
            inputId="slider-custom-basic"
            label="Väärtus"
            [hideLabel]="true"
            [min]="0"
            [max]="100"
            [value]="50"
            minLabel="0%"
            maxLabel="100%"
          />
        </tedi-col>
        <tedi-col [width]="6">
          <tedi-slider
            inputId="slider-custom-input"
            label="Väärtus"
            [min]="0"
            [max]="100"
            [(value)]="inputValue"
            minLabel="0%"
            maxLabel="100%"
          >
            <tedi-number-field
              sliderAddon
              inputId="slider-custom-input-field"
              ariaLabel="Väärtus"
              [(value)]="inputValue"
              [min]="0"
              [max]="100"
              suffix="%"
            />
          </tedi-slider>
        </tedi-col>
        <tedi-col [width]="6">
          <tedi-slider
            inputId="slider-custom-number"
            label="Väärtus"
            [min]="1"
            [max]="10"
            [step]="1"
            [(value)]="numberValue"
            minLabel="1"
            maxLabel="10"
          >
            <tedi-number-field
              sliderAddon
              inputId="slider-custom-number-field"
              ariaLabel="Väärtus"
              [(value)]="numberValue"
              [min]="1"
              [max]="10"
              [step]="1"
            />
          </tedi-slider>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: ["tedi-slider[data-state=hover]", "#state-hover"],
      active: ["tedi-slider[data-state=active]", "#state-active"],
      focusVisible: ["#state-focus"],
    },
  },
  render: () => ({
    template: `
      <tedi-row cols="1" gapY="3">
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">Default</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-slider inputId="state-default" ariaLabel="Väärtus" [value]="50" minLabel="0%" maxLabel="100%" />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">Hover</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-slider data-state="hover" inputId="state-hover" ariaLabel="Väärtus" [value]="50" minLabel="0%" maxLabel="100%" />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">Active</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-slider data-state="active" inputId="state-active" ariaLabel="Väärtus" [value]="50" minLabel="0%" maxLabel="100%" />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">Disabled</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-slider inputId="state-disabled" ariaLabel="Väärtus" [value]="50" [disabled]="true" minLabel="0%" maxLabel="100%" />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">Focus</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-slider inputId="state-focus" ariaLabel="Väärtus" [value]="50" minLabel="0%" maxLabel="100%" />
          </tedi-col>
        </tedi-row>
        <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
          <tedi-col width="1">
            <p tedi-text modifiers="bold">Error</p>
          </tedi-col>
          <tedi-col width="5">
            <tedi-slider
              inputId="state-error"
              ariaLabel="Väärtus"
              [value]="50"
              [invalid]="true"
              minLabel="0%"
              maxLabel="100%"
              [feedbackText]="{ text: 'See väli on kohustuslik', type: 'error', position: 'left' }"
            />
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const WithoutTooltip: Story = {
  args: {
    inputId: "slider-no-tooltip",
    tooltip: false,
    value: 40,
  },
};
