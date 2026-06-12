import {
  Meta,
  StoryObj,
  argsToTemplate,
  moduleMetadata,
} from "@storybook/angular";
import { ComponentInputs } from "../../../types/inputs.type";
import { ProgressBarComponent } from "./progress-bar.component";
import { FeedbackTextComponent } from "../../form/feedback-text/feedback-text.component";
import { RowComponent } from "../../helpers/grid/row/row.component";

type StoryArgs = ComponentInputs<ProgressBarComponent>;

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.70?node-id=25616-188999&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/87bb13-progress-bar" target="_blank">Zeroheight ↗</a>
 *
 * Project a `<tedi-feedback-text>` inside `<tedi-progress-bar>` to add a hint
 * or error message below the bar.
 */
export default {
  title: "TEDI-Ready/Components/Loader/ProgressBar",
  component: ProgressBarComponent,
  decorators: [
    moduleMetadata({
      imports: [ProgressBarComponent, FeedbackTextComponent, RowComponent],
    }),
  ],
  argTypes: {
    progressId: {
      description:
        "Optional id for the underlying `<progress>` element. Useful when an external `<label for>` should bind to it.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    value: {
      description: "Progress value between 0 and 100. Clamped automatically.",
      control: { type: "number", min: 0, max: 100, step: 1 },
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "0" },
      },
    },
    size: {
      description:
        "Size of the bar. `small` renders a 4px bar height instead of the default 8px.",
      control: { type: "radio" },
      options: ["default", "small"],
      table: {
        category: "inputs",
        type: { summary: "ProgressBarSize" },
        defaultValue: { summary: "default" },
      },
    },
    label: {
      description: "Optional title rendered above (or to the left of) the bar.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    labelPosition: {
      description:
        "Where to place the label relative to the bar. Ignored when `label` is not set.",
      control: { type: "radio" },
      options: ["top", "horizontal"],
      table: {
        category: "inputs",
        type: { summary: "ProgressBarLabelPosition" },
        defaultValue: { summary: "top" },
      },
    },
    required: {
      description:
        "Renders a red `*` after the label to mark the field required. Ignored when `label` is not set.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    showValue: {
      description: "Show or hide the percentage value.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    valuePosition: {
      description: "Where to place the percentage value.",
      control: { type: "radio" },
      options: ["horizontal", "bottom"],
      table: {
        category: "inputs",
        type: { summary: "ProgressBarValuePosition" },
        defaultValue: { summary: "horizontal" },
      },
    },
    valueLabel: {
      description:
        "Override the rendered value text. Defaults to `\"{value}%\"`. Use for non-percentage progress (e.g. `value=20` with `valueLabel=\"1/5\"`).",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    ariaLabel: {
      description:
        "Accessible label for the progress bar. Falls back to `label()` when omitted.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    mobile: {
      description:
        "Manually force the mobile variant. When `undefined`, derived from the viewport breakpoint; set to `false` to disable the automatic behavior. The mobile variant always renders the value below the bar.",
      control: { type: "radio" },
      options: [undefined, true, false],
      table: { category: "inputs", type: { summary: "boolean | undefined" } },
    },
    mobileBreakpoint: {
      description:
        "Viewport breakpoint below which the mobile variant is auto-applied.",
      control: { type: "radio" },
      options: ["xs", "sm", "md", "lg", "xl", "xxl"],
      table: {
        category: "inputs",
        type: { summary: "Breakpoint" },
        defaultValue: { summary: "sm" },
      },
    },
  },
  args: {
    value: 20,
  },
} as Meta<ProgressBarComponent>;

type Story = StoryObj<ProgressBarComponent>;

const renderPlain = (args: StoryArgs) => ({
  props: args,
  template: `<tedi-progress-bar ${argsToTemplate(args)} />`,
});

const renderWithFeedback = (text: string, type: "hint" | "error") =>
  (args: StoryArgs) => ({
    props: args,
    template: `
      <tedi-progress-bar ${argsToTemplate(args)}>
        <tedi-feedback-text text="${text}" type="${type}" />
      </tedi-progress-bar>
    `,
  });

export const Default: Story = {
  render: renderPlain,
};

export const Size: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        <div>Default</div>
        <tedi-progress-bar [value]="20" />
        <div>Small</div>
        <tedi-progress-bar [value]="20" size="small" />
      </tedi-row>
    `,
  }),
};

export const WithLabelTop: Story = {
  render: renderPlain,
  args: {
    label: "Edenemisriba pealkiri",
  },
};

export const WithLabelHorizontal: Story = {
  render: renderPlain,
  args: {
    label: "Edenemisriba pealkiri",
    labelPosition: "horizontal",
  },
};

export const RequiredLabel: Story = {
  render: renderPlain,
  args: {
    label: "Edenemisriba pealkiri",
    required: true,
  },
};

export const WithHint: Story = {
  render: renderWithFeedback("Üleslaadimine", "hint"),
};

export const WithError: Story = {
  render: renderWithFeedback(
    "Üleslaadimine ebaõnnestus, fail on liiga suur",
    "error",
  ),
};

export const ValueBelow: Story = {
  render: renderWithFeedback("Üleslaadimine", "hint"),
  args: {
    valuePosition: "bottom",
  },
};

/**
 * On mobile viewports (below the `mobileBreakpoint`, default `sm`) the value
 * always moves to the row beneath the bar, regardless of `valuePosition`.
 * Here the mobile variant is forced with `[mobile]="true"`.
 */
export const Mobile: Story = {
  render: renderWithFeedback("Üleslaadimine", "hint"),
  args: {
    mobile: true,
    label: "Edenemisriba pealkiri",
  },
};

export const CustomValueLabel: Story = {
  render: renderPlain,
  args: {
    value: 20,
    valueLabel: "1/5",
    label: "Steps completed",
  },
};

export const ValueHidden: Story = {
  render: renderPlain,
  args: {
    showValue: false,
  },
};
