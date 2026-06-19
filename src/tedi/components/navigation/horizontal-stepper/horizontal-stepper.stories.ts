import { Component, signal } from "@angular/core";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { ButtonComponent } from "../../buttons/button/button.component";
import { HorizontalStepperComponent } from "./horizontal-stepper.component";
import { HorizontalStepperItemComponent } from "./horizontal-stepper-item/horizontal-stepper-item.component";

const STEPS = ["Kutse", "Tahteavaldus", "Geenianalüüs", "Vastus"];

@Component({
  selector: "story-step-click-navigation",
  standalone: true,
  imports: [HorizontalStepperComponent, HorizontalStepperItemComponent],
  template: `
    <tedi-horizontal-stepper ariaLabel="Form progress">
      @for (label of steps; track label; let i = $index) {
        <tedi-horizontal-stepper-item
          [label]="label"
          [completed]="i < current()"
          [selected]="i === current()"
          (stepSelect)="current.set(i)"
        />
      }
    </tedi-horizontal-stepper>
  `,
})
class StepClickNavigationDemoComponent {
  steps = STEPS;
  current = signal(1);
}

@Component({
  selector: "story-compact-navigation",
  standalone: true,
  imports: [HorizontalStepperComponent, HorizontalStepperItemComponent],
  template: `
    <div style="max-width: 480px;">
      <tedi-horizontal-stepper ariaLabel="Form progress" [compact]="true">
        @for (label of steps; track label; let i = $index) {
          <tedi-horizontal-stepper-item
            [label]="label"
            description="Ametnik täidab"
            [completed]="i < current()"
            [selected]="i === current()"
            (stepSelect)="current.set(i)"
          />
        }
      </tedi-horizontal-stepper>
    </div>
  `,
})
class CompactNavigationDemoComponent {
  steps = STEPS;
  current = signal(1);
}

@Component({
  selector: "story-external-navigation",
  standalone: true,
  imports: [
    HorizontalStepperComponent,
    HorizontalStepperItemComponent,
    ButtonComponent,
  ],
  template: `
    <div
      style="display: flex; flex-direction: column; gap: 24px; align-items: flex-start;"
    >
      <tedi-horizontal-stepper ariaLabel="Form progress" style="width: 100%;">
        @for (label of steps; track label; let i = $index) {
          <tedi-horizontal-stepper-item
            [label]="label"
            [completed]="i < current()"
            [selected]="i === current()"
            [disabled]="i > current()"
            (stepSelect)="current.set(i)"
          />
        }
      </tedi-horizontal-stepper>
      <div style="display: flex; gap: 8px;">
        <button
          tedi-button
          variant="secondary"
          [disabled]="current() === 0"
          (click)="back()"
        >
          Tagasi
        </button>
        <button
          tedi-button
          [disabled]="current() === steps.length - 1"
          (click)="next()"
        >
          Edasi
        </button>
      </div>
    </div>
  `,
})
class ExternalNavigationDemoComponent {
  steps = STEPS;
  current = signal(0);

  back(): void {
    this.current.update((s) => Math.max(0, s - 1));
  }

  next(): void {
    this.current.update((s) => Math.min(this.steps.length - 1, s + 1));
  }
}

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.68?node-id=11201-120695&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/42d5cb-stepper-horizontal" target="_blank">Zeroheight ↗</a><br>
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
    compact: {
      control: "select",
      options: [true, false, "sm", "md", "lg", "xl", "xxl"],
      description:
        "Collapse labels (show only indicators + selected step's label). `true` = always; a breakpoint string = collapse below that breakpoint.",
      table: {
        defaultValue: { summary: "'sm'" },
        type: { summary: "boolean | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'" },
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
      <tedi-horizontal-stepper [ariaLabel]="ariaLabel" [background]="background" [compact]="compact">
        <tedi-horizontal-stepper-item label="Kutse" selected />
        <tedi-horizontal-stepper-item label="Tahteavaldus" />
        <tedi-horizontal-stepper-item label="Geenianalüüs" />
        <tedi-horizontal-stepper-item label="Vastus" />
      </tedi-horizontal-stepper>
    `,
  }),
  args: {
    ariaLabel: "Form progress",
    background: "default",
    compact: "sm",
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

/**
 * Collapsed — only indicators plus the selected step's label are shown.
 * Use `[compact]="true"` for always-on, or pass a breakpoint (e.g. `compact="md"`)
 * to collapse only below that viewport width. Each indicator is clickable so the
 * user can jump between steps.
 */
export const Compact: Story = {
  render: () => ({
    moduleMetadata: { imports: [CompactNavigationDemoComponent] },
    template: `<story-compact-navigation />`,
  }),
  parameters: {
    docs: {
      source: {
        type: "code",
        language: "ts",
        code: `@Component({
  imports: [HorizontalStepperComponent, HorizontalStepperItemComponent],
  template: \`
    <tedi-horizontal-stepper ariaLabel="Form progress" [compact]="true">
      @for (label of steps; track label; let i = $index) {
        <tedi-horizontal-stepper-item
          [label]="label"
          description="Ametnik täidab"
          [completed]="i < current()"
          [selected]="i === current()"
          (stepSelect)="current.set(i)"
        />
      }
    </tedi-horizontal-stepper>
  \`,
})
export class FormWizardComponent {
  steps = ["Kutse", "Tahteavaldus", "Geenianalüüs", "Vastus"];
  current = signal(1);
}`,
      },
    },
  },
};

/**
 * Validation runs at the end of the form — every step is reachable via the
 * header. Each item listens to `stepSelect` and updates the active step.
 * Past steps render as `completed`, future steps stay default.
 */
export const ClickToNavigate: Story = {
  render: () => ({
    moduleMetadata: { imports: [StepClickNavigationDemoComponent] },
    template: `<story-step-click-navigation />`,
  }),
  parameters: {
    docs: {
      source: {
        type: "code",
        language: "ts",
        code: `@Component({
  imports: [HorizontalStepperComponent, HorizontalStepperItemComponent],
  template: \`
    <tedi-horizontal-stepper ariaLabel="Form progress">
      @for (label of steps; track label; let i = $index) {
        <tedi-horizontal-stepper-item
          [label]="label"
          [completed]="i < current()"
          [selected]="i === current()"
          (stepSelect)="current.set(i)"
        />
      }
    </tedi-horizontal-stepper>
  \`,
})
export class FormWizardComponent {
  steps = ["Kutse", "Tahteavaldus", "Geenianalüüs", "Vastus"];
  current = signal(1);
}`,
      },
    },
  },
};

/**
 * Step-by-step validation — the user advances with `Edasi`/`Tagasi`.
 * Past steps render as `completed` and are clickable for back-navigation;
 * future steps are `disabled` so the user can't skip ahead from the header.
 */
export const ExternalNavigation: Story = {
  render: () => ({
    moduleMetadata: { imports: [ExternalNavigationDemoComponent] },
    template: `<story-external-navigation />`,
  }),
  parameters: {
    docs: {
      source: {
        type: "code",
        language: "ts",
        code: `@Component({
  imports: [
    HorizontalStepperComponent,
    HorizontalStepperItemComponent,
    ButtonComponent,
  ],
  template: \`
    <tedi-horizontal-stepper ariaLabel="Form progress">
      @for (label of steps; track label; let i = $index) {
        <tedi-horizontal-stepper-item
          [label]="label"
          [completed]="i < current()"
          [selected]="i === current()"
          [disabled]="i > current()"
          (stepSelect)="current.set(i)"
        />
      }
    </tedi-horizontal-stepper>
    <button tedi-button variant="secondary" [disabled]="current() === 0" (click)="back()">
      Tagasi
    </button>
    <button tedi-button [disabled]="current() === steps.length - 1" (click)="next()">
      Edasi
    </button>
  \`,
})
export class FormWizardComponent {
  steps = ["Kutse", "Tahteavaldus", "Geenianalüüs", "Vastus"];
  current = signal(0);

  back(): void {
    this.current.update((s) => Math.max(0, s - 1));
  }

  next(): void {
    this.current.update((s) => Math.min(this.steps.length - 1, s + 1));
  }
}`,
      },
    },
  },
};
