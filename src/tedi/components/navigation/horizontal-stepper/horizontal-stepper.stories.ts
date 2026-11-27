import { Component, input, signal } from "@angular/core";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import {
  VISUAL_TEST_VIEWPORTS,
  visualTest,
} from "../../../../../.storybook/visual-test-story";
import { ButtonComponent } from "../../buttons/button/button.component";
import { HorizontalStepperComponent } from "./horizontal-stepper.component";
import { HorizontalStepperItemComponent } from "./horizontal-stepper-item/horizontal-stepper-item.component";

const STEPS = ["Kutse", "Tahteavaldus", "Geenianalüüs", "Vastus"];

@Component({
  selector: "story-step-click-navigation",
  standalone: true,
  imports: [HorizontalStepperComponent, HorizontalStepperItemComponent],
  template: `
    <tedi-horizontal-stepper [ariaLabel]="'Vormi edenemine'">
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
      <tedi-horizontal-stepper [ariaLabel]="ariaLabel()" [compact]="true">
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
  ariaLabel = input("Vormi edenemine");
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
      <tedi-horizontal-stepper
        [ariaLabel]="'Vormi edenemine'"
        style="width: 100%;"
      >
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
const meta = {
  title: "TEDI-Ready/Components/Navigation/HorizontalStepper",
  component: HorizontalStepperComponent,
  decorators: [
    moduleMetadata({
      imports: [HorizontalStepperComponent, HorizontalStepperItemComponent],
    }),
  ],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  argTypes: {
    ariaLabel: {
      name: "ariaLabel",
      control: "text",
      description: "Accessible label for the navigation landmark.",
      table: {
        type: { summary: "string" },
        category: "inputs",
      },
    },
    backgroundColor: {
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

export default meta;

type Story = StoryObj<HorizontalStepperComponent>;

export const Default: Story = {
  render: (props) => ({
    props,
    template: `
      <tedi-horizontal-stepper [ariaLabel]="ariaLabel" [backgroundColor]="backgroundColor" [compact]="compact">
        <tedi-horizontal-stepper-item label="Kutse" selected />
        <tedi-horizontal-stepper-item label="Tahteavaldus" />
        <tedi-horizontal-stepper-item label="Geenianalüüs" />
        <tedi-horizontal-stepper-item label="Vastus" />
      </tedi-horizontal-stepper>
    `,
  }),
  args: {
    ariaLabel: "Vormi edenemine",
    backgroundColor: "default",
    compact: "sm",
  },
};

export const SecondStep: Story = {
  render: (props) => ({
    props,
    template: `
      <tedi-horizontal-stepper [ariaLabel]="ariaLabel" [backgroundColor]="backgroundColor">
        <tedi-horizontal-stepper-item label="Kutse" completed />
        <tedi-horizontal-stepper-item label="Tahteavaldus" selected />
        <tedi-horizontal-stepper-item label="Geenianalüüs" />
        <tedi-horizontal-stepper-item label="Vastus" />
      </tedi-horizontal-stepper>
    `,
  }),
  args: {
    ariaLabel: "Vormi edenemine",
    backgroundColor: "default",
  },
};

export const ThirdStep: Story = {
  render: (props) => ({
    props,
    template: `
      <tedi-horizontal-stepper [ariaLabel]="ariaLabel" [backgroundColor]="backgroundColor">
        <tedi-horizontal-stepper-item label="Kutse" completed />
        <tedi-horizontal-stepper-item label="Tahteavaldus" completed />
        <tedi-horizontal-stepper-item label="Geenianalüüs" selected />
        <tedi-horizontal-stepper-item label="Vastus" />
      </tedi-horizontal-stepper>
    `,
  }),
  args: {
    ariaLabel: "Vormi edenemine",
    backgroundColor: "default",
  },
};

export const WithErrors: Story = {
  render: (props) => ({
    props,
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-horizontal-stepper [ariaLabel]="'Veaga vorm'" [backgroundColor]="backgroundColor">
          <tedi-horizontal-stepper-item label="Kutse" error />
          <tedi-horizontal-stepper-item label="Tahteavaldus" selected />
          <tedi-horizontal-stepper-item label="Geenianalüüs" />
          <tedi-horizontal-stepper-item label="Vastus" />
        </tedi-horizontal-stepper>
        <tedi-horizontal-stepper [ariaLabel]="'Vorm vea kirjeldusega'" [backgroundColor]="backgroundColor">
          <tedi-horizontal-stepper-item label="Kutse" completed />
          <tedi-horizontal-stepper-item label="Tahteavaldus" error description="Sammus esinevad vead" />
          <tedi-horizontal-stepper-item label="Geenianalüüs" selected />
          <tedi-horizontal-stepper-item label="Vastus" />
        </tedi-horizontal-stepper>
      </div>
    `,
  }),
  args: {
    backgroundColor: "default",
  },
};

export const WithDescriptions: Story = {
  render: (props) => ({
    props,
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-horizontal-stepper [ariaLabel]="'Kirjeldustega sammud (samm 1)'" [backgroundColor]="backgroundColor">
          <tedi-horizontal-stepper-item label="Kutse" selected />
          <tedi-horizontal-stepper-item label="Tahteavaldus" />
          <tedi-horizontal-stepper-item label="Geenianalüüs" description="Ametnik täidab" />
          <tedi-horizontal-stepper-item label="Vastus" description="Ametnik täidab" />
        </tedi-horizontal-stepper>
        <tedi-horizontal-stepper [ariaLabel]="'Kirjeldustega sammud (samm 2)'" [backgroundColor]="backgroundColor">
          <tedi-horizontal-stepper-item label="Kutse" completed />
          <tedi-horizontal-stepper-item label="Tahteavaldus" selected />
          <tedi-horizontal-stepper-item label="Geenianalüüs" description="Ametnik täidab" />
          <tedi-horizontal-stepper-item label="Vastus" description="Ametnik täidab" />
        </tedi-horizontal-stepper>
        <tedi-horizontal-stepper [ariaLabel]="'Kirjeldustega sammud (samm 3)'" [backgroundColor]="backgroundColor">
          <tedi-horizontal-stepper-item label="Kutse" completed />
          <tedi-horizontal-stepper-item label="Tahteavaldus" completed />
          <tedi-horizontal-stepper-item label="Geenianalüüs" selected description="Ametnik täidab" />
          <tedi-horizontal-stepper-item label="Vastus" description="Ametnik täidab" />
        </tedi-horizontal-stepper>
        <tedi-horizontal-stepper [ariaLabel]="'Kirjeldustega sammud (samm 4)'" [backgroundColor]="backgroundColor">
          <tedi-horizontal-stepper-item label="Kutse" completed />
          <tedi-horizontal-stepper-item label="Tahteavaldus" completed />
          <tedi-horizontal-stepper-item label="Geenianalüüs" completed description="Ametnik täidab" />
          <tedi-horizontal-stepper-item label="Vastus" selected description="Ametnik täidab" />
        </tedi-horizontal-stepper>
      </div>
    `,
  }),
  args: {
    backgroundColor: "default",
  },
};

export const TransparentBackground: Story = {
  render: (props) => ({
    props,
    template: `
      <tedi-horizontal-stepper [ariaLabel]="ariaLabel" backgroundColor="transparent">
        <tedi-horizontal-stepper-item label="Kutse" completed />
        <tedi-horizontal-stepper-item label="Tahteavaldus" selected />
        <tedi-horizontal-stepper-item label="Geenianalüüs" />
        <tedi-horizontal-stepper-item label="Vastus" />
      </tedi-horizontal-stepper>
    `,
  }),
  args: {
    ariaLabel: "Vormi edenemine",
  },
};

/**
 * Collapsed — only indicators plus the selected step's label are shown.
 * Use `[compact]="true"` for always-on, or pass a breakpoint (e.g. `compact="md"`)
 * to collapse only below that viewport width. Each indicator is clickable so the
 * user can jump between steps.
 */
export const Compact: Story = {
  render: (args) => ({
    moduleMetadata: { imports: [CompactNavigationDemoComponent] },
    props: { ariaLabel: args.ariaLabel },
    template: `<story-compact-navigation [ariaLabel]="ariaLabel" />`,
  }),
  parameters: {
    docs: {
      source: {
        type: "code",
        language: "ts",
        code: `@Component({
  imports: [HorizontalStepperComponent, HorizontalStepperItemComponent],
  template: \`
    <tedi-horizontal-stepper [ariaLabel]="'Vormi edenemine'" [compact]="true">
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
  args: {
    ariaLabel: "Vormi edenemine",
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
    visualTest: false,
    docs: {
      source: {
        type: "code",
        language: "ts",
        code: `@Component({
  imports: [HorizontalStepperComponent, HorizontalStepperItemComponent],
  template: \`
    <tedi-horizontal-stepper [ariaLabel]="'Vormi edenemine'">
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
    <tedi-horizontal-stepper [ariaLabel]="'Vormi edenemine'">
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

/** Chromatic snapshot for HorizontalStepper: add every new visual variant here too. */
export const VisualTest: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: {
    controls: { disable: true },
    chromatic: { disableSnapshot: false, viewports: VISUAL_TEST_VIEWPORTS },
  },
  render: () =>
    visualTest(
      [
        {
          label: "First step",
          story: Default,
          args: { ariaLabel: "Vormi edenemine (samm 1)" },
        },
        {
          label: "Second step",
          story: SecondStep,
          args: { ariaLabel: "Vormi edenemine (samm 2)" },
        },
        {
          label: "Third step",
          story: ThirdStep,
          args: { ariaLabel: "Vormi edenemine (samm 3)" },
        },
        { label: "With errors", story: WithErrors },
        { label: "With descriptions", story: WithDescriptions },
        {
          label: "Transparent background",
          story: TransparentBackground,
          args: { ariaLabel: "Vormi edenemine (läbipaistev)" },
        },
        {
          label: "Compact",
          story: Compact,
          args: { ariaLabel: "Vormi edenemine (kompaktne)" },
        },
        { label: "External navigation", story: ExternalNavigation },
      ],
      { args: meta.args },
    ),
};
