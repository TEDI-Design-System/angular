import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { HorizontalStepperComponent } from "./horizontal-stepper.component";
import { HorizontalStepperItemComponent } from "./horizontal-stepper-item/horizontal-stepper-item.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.68?node-id=11201-120695&m=dev" target="_blank">Figma ↗</a><br>
 * A horizontal stepper component for displaying multi-step progress flows.
 * Each step can be in default, selected, completed, or error state.
 */
export default {
  title: "TEDI-Ready/Components/Navigation/HorizontalStepper",
  component: HorizontalStepperComponent,
  decorators: [
    moduleMetadata({
      imports: [HorizontalStepperComponent, HorizontalStepperItemComponent],
    }),
  ],
  argTypes: {
    ariaLabel: {
      control: "text",
      description: "Accessible label for the navigation landmark.",
      table: {
        type: { summary: "string" },
        category: "inputs",
      },
    },
    background: {
      control: "select",
      options: ["default", "transparent"],
      description: "Background style of the stepper container.",
      table: {
        defaultValue: { summary: "default" },
        type: { summary: "'default' | 'transparent'" },
        category: "inputs",
      },
    },
  },
} as Meta<HorizontalStepperComponent>;

type Story = StoryObj<HorizontalStepperComponent>;

export const Default: Story = {
  render: (props) => ({
    props,
    template: `
      <tedi-horizontal-stepper ariaLabel="Form progress" [background]="background">
        <tedi-horizontal-stepper-item label="Kutse" selected />
        <tedi-horizontal-stepper-item label="Tahteavaldus" />
        <tedi-horizontal-stepper-item label="Geenianalüüs" />
        <tedi-horizontal-stepper-item label="Vastus" />
      </tedi-horizontal-stepper>
    `,
  }),
  args: {
    background: "default",
  },
};

export const SecondStep: Story = {
  render: (props) => ({
    props,
    template: `
      <tedi-horizontal-stepper ariaLabel="Form progress" [background]="background">
        <tedi-horizontal-stepper-item label="Kutse" completed />
        <tedi-horizontal-stepper-item label="Tahteavaldus" selected />
        <tedi-horizontal-stepper-item label="Geenianalüüs" />
        <tedi-horizontal-stepper-item label="Vastus" />
      </tedi-horizontal-stepper>
    `,
  }),
  args: {
    background: "default",
  },
};

export const ThirdStep: Story = {
  render: (props) => ({
    props,
    template: `
      <tedi-horizontal-stepper ariaLabel="Form progress" [background]="background">
        <tedi-horizontal-stepper-item label="Kutse" completed />
        <tedi-horizontal-stepper-item label="Tahteavaldus" completed />
        <tedi-horizontal-stepper-item label="Geenianalüüs" selected />
        <tedi-horizontal-stepper-item label="Vastus" />
      </tedi-horizontal-stepper>
    `,
  }),
  args: {
    background: "default",
  },
};

export const WithErrors: Story = {
  render: (props) => ({
    props,
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-horizontal-stepper ariaLabel="Form with errors" [background]="background">
          <tedi-horizontal-stepper-item label="Kutse" error />
          <tedi-horizontal-stepper-item label="Tahteavaldus" selected />
          <tedi-horizontal-stepper-item label="Geenianalüüs" />
          <tedi-horizontal-stepper-item label="Vastus" />
        </tedi-horizontal-stepper>
        <tedi-horizontal-stepper ariaLabel="Form with error description" [background]="background">
          <tedi-horizontal-stepper-item label="Kutse" completed />
          <tedi-horizontal-stepper-item label="Tahteavaldus" error description="Sammus esinevad vead" />
          <tedi-horizontal-stepper-item label="Geenianalüüs" selected />
          <tedi-horizontal-stepper-item label="Vastus" />
        </tedi-horizontal-stepper>
      </div>
    `,
  }),
  args: {
    background: "default",
  },
};

export const WithDescriptions: Story = {
  render: (props) => ({
    props,
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-horizontal-stepper ariaLabel="Steps with descriptions" [background]="background">
          <tedi-horizontal-stepper-item label="Kutse" selected />
          <tedi-horizontal-stepper-item label="Tahteavaldus" />
          <tedi-horizontal-stepper-item label="Geenianalüüs" description="Ametnik täidab" />
          <tedi-horizontal-stepper-item label="Vastus" description="Ametnik täidab" />
        </tedi-horizontal-stepper>
        <tedi-horizontal-stepper ariaLabel="Steps with descriptions" [background]="background">
          <tedi-horizontal-stepper-item label="Kutse" completed />
          <tedi-horizontal-stepper-item label="Tahteavaldus" selected />
          <tedi-horizontal-stepper-item label="Geenianalüüs" description="Ametnik täidab" />
          <tedi-horizontal-stepper-item label="Vastus" description="Ametnik täidab" />
        </tedi-horizontal-stepper>
        <tedi-horizontal-stepper ariaLabel="Steps with descriptions" [background]="background">
          <tedi-horizontal-stepper-item label="Kutse" completed />
          <tedi-horizontal-stepper-item label="Tahteavaldus" completed />
          <tedi-horizontal-stepper-item label="Geenianalüüs" selected description="Ametnik täidab" />
          <tedi-horizontal-stepper-item label="Vastus" description="Ametnik täidab" />
        </tedi-horizontal-stepper>
        <tedi-horizontal-stepper ariaLabel="Steps with descriptions" [background]="background">
          <tedi-horizontal-stepper-item label="Kutse" completed />
          <tedi-horizontal-stepper-item label="Tahteavaldus" completed />
          <tedi-horizontal-stepper-item label="Geenianalüüs" completed description="Ametnik täidab" />
          <tedi-horizontal-stepper-item label="Vastus" selected description="Ametnik täidab" />
        </tedi-horizontal-stepper>
      </div>
    `,
  }),
  args: {
    background: "default",
  },
};

export const TransparentBackground: Story = {
  render: (props) => ({
    props,
    template: `
      <tedi-horizontal-stepper ariaLabel="Form progress" background="transparent">
        <tedi-horizontal-stepper-item label="Kutse" completed />
        <tedi-horizontal-stepper-item label="Tahteavaldus" selected />
        <tedi-horizontal-stepper-item label="Geenianalüüs" />
        <tedi-horizontal-stepper-item label="Vastus" />
      </tedi-horizontal-stepper>
    `,
  }),
};
