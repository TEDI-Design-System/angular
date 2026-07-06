import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { SliderComponent } from "./slider.component";
import { NumberFieldComponent } from "../number-field/number-field.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.65.83?node-id=19071-105925&m=dev" target="_blank">Figma ↗</a>
 */

export default {
  title: "TEDI-Ready/Components/Form/Slider",
  component: SliderComponent,
  decorators: [
    moduleMetadata({
      imports: [NumberFieldComponent, RowComponent, ColComponent],
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
    props: args,
    template: `
      <tedi-row>
        <tedi-col [width]="6">
          <tedi-slider ${argsToTemplate(args)} />
        </tedi-col>
      </tedi-row>
    `,
  }),
  argTypes: {
    label: {
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    value: {
      control: "number",
      table: { category: "inputs", type: { summary: "number" } },
    },
    min: {
      control: "number",
      table: { category: "inputs", type: { summary: "number" } },
    },
    max: {
      control: "number",
      table: { category: "inputs", type: { summary: "number" } },
    },
    step: {
      control: "number",
      table: { category: "inputs", type: { summary: "number" } },
    },
    minLabel: {
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    maxLabel: {
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    showCurrentValue: {
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    tooltip: {
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    required: {
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    invalid: {
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    hideLabel: {
      control: "select",
      options: [false, true, "keep-space"],
      table: {
        category: "inputs",
        type: { summary: "boolean | 'keep-space'" },
        defaultValue: { summary: "false" },
      },
    },
    feedbackText: {
      control: "object",
      table: {
        category: "inputs",
        type: { summary: "ComponentInputs<FeedbackTextComponent>" },
      },
    },
    valueFormatter: { control: false },
    inputId: { control: false },
  },
} as Meta<SliderComponent>;

type Story = StoryObj<SliderComponent>;

export const Default: Story = {};

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
        <tedi-row cols="2" alignItems="center">
          <b>Default</b>
          <tedi-slider inputId="state-default" ariaLabel="Väärtus" [value]="50" minLabel="0%" maxLabel="100%" />
        </tedi-row>
        <tedi-row cols="2" alignItems="center">
          <b>Hover</b>
          <tedi-slider data-state="hover" inputId="state-hover" ariaLabel="Väärtus" [value]="50" minLabel="0%" maxLabel="100%" />
        </tedi-row>
        <tedi-row cols="2" alignItems="center">
          <b>Active</b>
          <tedi-slider data-state="active" inputId="state-active" ariaLabel="Väärtus" [value]="50" minLabel="0%" maxLabel="100%" />
        </tedi-row>
        <tedi-row cols="2" alignItems="center">
          <b>Disabled</b>
          <tedi-slider inputId="state-disabled" ariaLabel="Väärtus" [value]="50" [disabled]="true" minLabel="0%" maxLabel="100%" />
        </tedi-row>
        <tedi-row cols="2" alignItems="center">
          <b>Focus</b>
          <tedi-slider inputId="state-focus" ariaLabel="Väärtus" [value]="50" minLabel="0%" maxLabel="100%" />
        </tedi-row>
        <tedi-row cols="2" alignItems="center">
          <b>Error</b>
          <tedi-slider
            inputId="state-error"
            ariaLabel="Väärtus"
            [value]="50"
            [invalid]="true"
            minLabel="0%"
            maxLabel="100%"
            [feedbackText]="{ text: 'See väli on kohustuslik', type: 'error', position: 'left' }"
          />
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

export const WithHelper: Story = {
  args: {
    inputId: "slider-helper",
    value: 40,
    feedbackText: {
      text: "Liiguta nuppu, et väärtust muuta",
      type: "hint",
      position: "left",
    },
  },
};
