import {
  Component,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
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
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";

type StoryArgs = ComponentInputs<ProgressBarComponent>;

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.49.74?node-id=25616-189000&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/87bb13-progress-bar" target="_blank">Zeroheight ↗</a>
 *
 * Project a `<tedi-feedback-text>` inside `<tedi-progress-bar>` to add a hint
 * or error message below the bar.
 *
 * ### Responsive inputs
 *
 * `size`, `labelPosition`, `showValue`, `valuePosition` and `valueLabel` can be
 * overridden per breakpoint with the `xs`–`xxl` inputs. The base inputs describe
 * the smallest viewport; each breakpoint input takes a **partial** set of inputs
 * that layers on top from that breakpoint **and up** (mobile-first). See the
 * **Responsive** story below.
 *
 * ```html
 * <tedi-progress-bar
 *   [value]="40"
 *   label="Upload"
 *   labelPosition="top"
 *   valuePosition="bottom"
 *   [md]="{ labelPosition: 'horizontal', valuePosition: 'horizontal' }"
 * />
 * ```
 */
export default {
  title: "TEDI-Ready/Components/Loader/ProgressBar",
  component: ProgressBarComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ProgressBarComponent,
        FeedbackTextComponent,
        RowComponent,
        ColComponent,
        TextComponent,
      ],
    }),
  ],
  parameters: {
    status: {
      type: ["breakpointSupport"],
    },
    controls: {
      exclude: ["xs", "sm", "md", "lg", "xl", "xxl"],
    },
  },
  argTypes: {
    progressId: {
      description:
        "Optional id for the underlying `<progress>` element. Useful when an external `<label for>` should bind to it. Falls back to a generated id.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    value: {
      description: "Progress value between 0 and 100. Clamped automatically.",
      control: { type: "range", min: 0, max: 100, step: 1 },
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
  },
  args: {
    value: 40,
    ariaLabel: "Edenemisriba pealkiri",
  },
} as Meta<ProgressBarComponent>;

type Story = StoryObj<ProgressBarComponent>;

const renderPlain = (args: StoryArgs) => ({
  props: args,
  template: `<tedi-progress-bar ${argsToTemplate(args)} />`,
});

const renderWithFeedback =
  (text: string, type: "hint" | "error") => (args: StoryArgs) => ({
    props: args,
    template: `
      <tedi-progress-bar ${argsToTemplate(args)}>
        <tedi-feedback-text text="${text}" type="${type}" />
      </tedi-progress-bar>
    `,
  });

export const Default: Story = {
  render: renderPlain,
  args: { value: 60 },
};

/**
 * `default` renders an 8px bar, `small` a 4px one.
 */
export const Sizes: Story = {
  render: () => ({
    template: `
      <tedi-row [cols]="4" [alignItems]="'center'" [gapX]="4" [gapY]="3">
        <p tedi-text [modifiers]="['small']">Default</p>
        <tedi-col [width]="3">
          <tedi-progress-bar [value]="20" ariaLabel="Edenemisriba pealkiri">
            <tedi-feedback-text text="Üleslaadimine" type="hint" />
          </tedi-progress-bar>
        </tedi-col>

        <p tedi-text [modifiers]="['small']">Small</p>
        <tedi-col [width]="3">
          <tedi-progress-bar [value]="20" size="small" ariaLabel="Edenemisriba pealkiri">
            <tedi-feedback-text text="Üleslaadimine" type="hint" />
          </tedi-progress-bar>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

@Component({
  standalone: true,
  selector: "tedi-progress-bar-position-demo",
  imports: [ProgressBarComponent, FeedbackTextComponent, TextComponent],
  styles: [
    `
      .progress-bar-position-matrix {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--layout-grid-gutters-16);
        align-items: start;
        width: 100%;
      }

      @media (min-width: 768px) {
        .progress-bar-position-matrix {
          grid-template-columns: max-content 1fr;
          column-gap: var(--layout-grid-gutters-24);
        }
      }
    `,
  ],
  template: `
    <div class="progress-bar-position-matrix">
      <div>
        <p tedi-text [modifiers]="['small']">Top title</p>
        <p tedi-text [modifiers]="['small']">Horizontal value</p>
        <p tedi-text [modifiers]="['small']">Bottom hint</p>
      </div>
      <tedi-progress-bar [value]="20" label="Edenemisriba pealkiri" [required]="true" labelPosition="top" valuePosition="horizontal">
        <tedi-feedback-text text="Üleslaadimine" type="hint" />
      </tedi-progress-bar>

      <div>
        <p tedi-text [modifiers]="['small']">Top title</p>
        <p tedi-text [modifiers]="['small']">Bottom value</p>
        <p tedi-text [modifiers]="['small']">Bottom hint</p>
      </div>
      <tedi-progress-bar [value]="20" label="Edenemisriba pealkiri" [required]="true" labelPosition="top" valuePosition="bottom">
        <tedi-feedback-text text="Üleslaadimine" type="hint" />
      </tedi-progress-bar>

      <div>
        <p tedi-text [modifiers]="['small']">Horizontal title</p>
        <p tedi-text [modifiers]="['small']">Horizontal value</p>
        <p tedi-text [modifiers]="['small']">Bottom hint</p>
      </div>
      <tedi-progress-bar [value]="20" label="Edenemisriba pealkiri" [required]="true" labelPosition="horizontal" valuePosition="horizontal">
        <tedi-feedback-text text="Üleslaadimine" type="hint" />
      </tedi-progress-bar>

      <div>
        <p tedi-text [modifiers]="['small']">Horizontal title</p>
        <p tedi-text [modifiers]="['small']">Bottom value</p>
        <p tedi-text [modifiers]="['small']">Bottom hint</p>
      </div>
      <tedi-progress-bar [value]="20" label="Edenemisriba pealkiri" [required]="true" labelPosition="horizontal" valuePosition="bottom">
        <tedi-feedback-text text="Üleslaadimine" type="hint" />
      </tedi-progress-bar>
    </div>
  `,
})
class PositionMatrixDemo {}

/**
 * Every combination of `labelPosition` (`top` / `horizontal`) and
 * `valuePosition` (`horizontal` / `bottom`).
 */
export const Position: Story = {
  render: () => ({
    moduleMetadata: { imports: [PositionMatrixDemo] },
    template: `<tedi-progress-bar-position-demo />`,
  }),
};

export const WithLabel: Story = {
  render: () => ({
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        <tedi-progress-bar [value]="40" label="Progress" [required]="true" valuePosition="bottom">
          <tedi-feedback-text text="Üleslaadimine" type="hint" />
        </tedi-progress-bar>
        <tedi-progress-bar [value]="40" label="Küsitluses osalenutest olid vanuses 15-18" labelPosition="top" [md]="{ labelPosition: 'horizontal' }" />
      </tedi-row>
    `,
  }),
};

export const Regular: Story = {
  render: () => ({
    template: `
      <tedi-row [cols]="1" [gapY]="4">
        <tedi-progress-bar [value]="40" ariaLabel="Edenemisriba pealkiri" />
        <tedi-progress-bar [value]="40" ariaLabel="Edenemisriba pealkiri" valueLabel="1 / 5" />
        <tedi-progress-bar [value]="40" ariaLabel="Edenemisriba pealkiri" valuePosition="bottom" />
      </tedi-row>
    `,
  }),
};

export const WithHint: Story = {
  render: renderWithFeedback("Üleslaadimine", "hint"),
};

/**
 * An error row below the bar (announced via `role="alert"`).
 */
export const WithError: Story = {
  render: renderWithFeedback(
    "Üleslaadimine ebaõnnestus, fail on liiga suur",
    "error",
  ),
};

export const ValueHidden: Story = {
  render: renderPlain,
  args: {
    value: 60,
    showValue: false,
  },
};

/**
 * Override any input per breakpoint with the `xs`–`xxl` inputs. Each override
 * layers over the base inputs at that viewport and up. Here the narrow (base)
 * layout stacks the label on top with the value below the bar; from `md` up the
 * label moves inline to the left and the value sits next to the bar. Resize the
 * preview to see the switch.
 */
export const Responsive: Story = {
  render: () => ({
    template: `
      <tedi-progress-bar
        [value]="40"
        label="Edenemisriba pealkiri"
        [required]="true"
        labelPosition="top"
        valuePosition="bottom"
        [md]="{ labelPosition: 'horizontal', valuePosition: 'horizontal' }"
      >
        <tedi-feedback-text text="Üleslaadimine" type="hint" />
      </tedi-progress-bar>
    `,
  }),
};

@Component({
  standalone: true,
  selector: "tedi-animated-progress-bar-demo",
  imports: [ProgressBarComponent],
  template: `<tedi-progress-bar [value]="value()" label="Üleslaadimine..." />`,
})
class AnimatedProgressBarDemo implements OnInit, OnDestroy {
  protected value = signal(0);
  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.value.update((v) => (v >= 100 ? 0 : v + 5));
    }, 300);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

/**
 * Use `tedi-progress-bar` as a busy / loader indicator by owning the `value`
 * from outside the component — there's no built-in indeterminate animation,
 * but a stateful consumer can drive the bar however it likes.
 */
export const Animated: Story = {
  render: () => ({
    moduleMetadata: { imports: [AnimatedProgressBarDemo] },
    template: `<tedi-animated-progress-bar-demo />`,
  }),
};
