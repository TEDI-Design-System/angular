import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { ProgressBarComponent } from "./progress-bar.component";

export default {
  title: "Community/Helpers/ProgressBar",
  component: ProgressBarComponent,
  parameters: {
    status: {
      type: ["deprecated", "existsInTediReady"],
    },
  },
  decorators: [
    moduleMetadata({
      imports: [ProgressBarComponent],
    }),
  ],
  argTypes: {
    progressId: {
      description:
        "Optional id for the progress element to bind with label etc.",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    value: {
      description: "Progress value between 0 and 100",
      control: { type: "number", min: 0, max: 100, step: 1 },
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "0" },
      },
    },
    direction: {
      description: "Orientation of the progress bar",
      control: { type: "radio" },
      options: ["horizontal", "vertical"],
      table: {
        type: { summary: "'horizontal' | 'vertical'" },
        defaultValue: { summary: "horizontal" },
      },
    },
    small: {
      description: "Whether it's the small variant",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    feedbackText: {
      description:
        "Optional feedback text displayed alongside the progress bar. Accepts `FeedbackTextComponent` inputs.",
      control: "object",
      table: {
        type: { summary: "ComponentInputs<FeedbackTextComponent>" },
      },
    },
  },
} as Meta<ProgressBarComponent>;

export const Default: StoryObj<ProgressBarComponent> = {
  args: {
    value: 50,
    direction: "horizontal",
    small: false,
  },
};

export const Small: StoryObj<ProgressBarComponent> = {
  args: {
    value: 50,
    direction: "horizontal",
    small: true,
  },
};

export const WithFeedback: StoryObj<ProgressBarComponent> = {
  args: {
    value: 50,
    feedbackText: { text: "Uploading…", type: "hint", position: "left" },
  },
};

export const Vertical: StoryObj<ProgressBarComponent> = {
  args: {
    value: 50,
    feedbackText: { text: "Uploading…", type: "hint", position: "left" },
    direction: "vertical",
  },
};
