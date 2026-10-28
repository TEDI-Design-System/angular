import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  ArgTypes,
  Meta,
  StoryObj,
  argsToTemplate,
  moduleMetadata,
} from "@storybook/angular";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { CollapseComponent } from "../../content/collapse/collapse.component";
import { StatusBadgeComponent } from "../../tags/status-badge/status-badge.component";
import { LinkComponent } from "../link/link.component";
import { CardStepperComponent } from "./card-stepper.component";
import { CardStepperStepComponent } from "./card-stepper-step/card-stepper-step.component";
import { CardStepperStepContentDirective } from "./card-stepper-step/card-stepper-step-content.directive";
import { CardStepperSubStepComponent } from "./card-stepper-sub-step/card-stepper-sub-step.component";

const booleanArgType = (name: string, description: string) => ({
  name,
  description,
  type: "boolean" as const,
  table: { category: "inputs", defaultValue: { summary: "false" } },
});

const stepArgTypes: ArgTypes = {
  title: {
    name: "title",
    description: "Step title, shown as the card heading while active.",
    type: { name: "string", required: true },
    table: { category: "inputs" },
  },
  description: {
    name: "description",
    description:
      "Secondary line placed by `descriptionPosition` on the card, and under the title in the list.",
    type: "string",
    table: { category: "inputs" },
  },
  completed: booleanArgType(
    "completed",
    "Completed progress state, independent of `disabled`. Takes precedence over `error`.",
  ),
  error: booleanArgType(
    "error",
    "Error progress state, independent of `disabled`.",
  ),
  disabled: booleanArgType(
    "disabled",
    "Excludes the step from the arrows and the step list, and renders it as disabled.",
  ),
  opened: {
    name: "opened",
    description:
      "Whether this step's sub-steps start expanded. Defaults to expanded for the active step.",
    type: "boolean",
    table: { category: "inputs" },
  },
};

const subStepArgTypes: ArgTypes = {
  title: {
    name: "title",
    description: "Sub-step title.",
    type: { name: "string", required: true },
    table: { category: "inputs" },
  },
  completed: booleanArgType(
    "completed",
    "Completed progress state, independent of `disabled`. Takes precedence over `error`.",
  ),
  error: booleanArgType(
    "error",
    "Error progress state, independent of `disabled`.",
  ),
  selected: booleanArgType("selected", "Marks the sub-step the user is on."),
  disabled: booleanArgType(
    "disabled",
    "Renders the sub-step as disabled and non-interactive.",
  ),
  informative: booleanArgType(
    "informative",
    "Non-interactive, secondary text treatment, e.g. for a sub-step filled in by an official.",
  ),
  itemSelect: {
    name: "itemSelect",
    description:
      "Emitted when the sub-step is picked; also closes the list. Disabled and informative sub-steps cannot be picked.",
    table: { category: "outputs", type: { summary: "void" } },
  },
};

const FRAME = "max-width: 377px;";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.75.92?node-id=52291-184823&m=dev" target="_blank">Figma ↗</a><br>
 * `CardStepper` is a compact stepper for narrow screens. It shows the active step,
 * an `N / M` counter, a segmented progress bar, and a button that opens the full
 * step list in a bottom sheet. Use it on its own, or switch to `VerticalStepper`
 * at a breakpoint for wider screens.
 *
 * Declare steps with `tedi-card-stepper-step` children.
 *
 * To show each step as its own card instead, see <a href="?path=/docs/tedi-ready-components-buttons-cardbutton--card-stepper-button">CardButton → Card stepper button</a>.
 */
export default {
  title: "TEDI-Ready/Components/Navigation/CardStepper",
  component: CardStepperComponent,
  subcomponents: {
    CardStepperStep: CardStepperStepComponent,
    CardStepperSubStep: CardStepperSubStepComponent,
  },
  parameters: {
    docs: {
      // Compodoc does not cover library sources, so Storybook cannot generate
      // argTypes for the subcomponents; keep their API tables here.
      extractArgTypes: (component: unknown) => {
        if (component === CardStepperStepComponent) return stepArgTypes;
        if (component === CardStepperSubStepComponent) return subStepArgTypes;
        return {};
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [
        CardStepperComponent,
        CardStepperStepComponent,
        CardStepperStepContentDirective,
        CardStepperSubStepComponent,
        AlertComponent,
        CollapseComponent,
        StatusBadgeComponent,
        ButtonComponent,
        IconComponent,
        LinkComponent,
      ],
    }),
  ],
  argTypes: {
    ariaLabel: {
      control: "text",
      description: "Accessible name for the card group.",
      table: { type: { summary: "string" }, category: "inputs" },
    },
    activeStep: {
      control: "number",
      description: "Active step index (0-based). Supports `[(activeStep)]`.",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "0" },
        category: "inputs",
      },
    },
    showStepNumber: {
      control: "boolean",
      description:
        "Show the active step's number in a ring. Ignored with `showNavigation`.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "inputs",
      },
    },
    showStatusIcon: {
      control: "boolean",
      description:
        "Show the active step's completed or error icon in the title row.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "inputs",
      },
    },
    descriptionPosition: {
      control: "radio",
      options: ["bottom", "top"],
      description: "Where the active step's description sits.",
      table: {
        type: { summary: '"top" | "bottom"' },
        defaultValue: { summary: '"bottom"' },
        category: "inputs",
      },
    },
    counterPosition: {
      control: "radio",
      options: ["inline", "top", "bottom"],
      description:
        "Counter position: beside the controls, above the label, or below the label and description.",
      table: {
        type: { summary: '"inline" | "top" | "bottom"' },
        defaultValue: { summary: '"inline"' },
        category: "inputs",
      },
    },
    showProgress: {
      control: "boolean",
      description: "Show the segmented progress bar.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "inputs",
      },
    },
    showNavigation: {
      control: "boolean",
      description: "Show previous and next arrows, skipping disabled steps.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "inputs",
      },
    },
    showStepList: {
      control: "boolean",
      description: "Show the list button and the step-list modal.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "inputs",
      },
    },
    allowJump: {
      control: "select",
      options: [true, false, "completed", "completed-or-next"],
      description: "Which steps can be jumped to from the modal.",
      table: {
        type: { summary: 'boolean | "completed" | "completed-or-next"' },
        defaultValue: { summary: "true" },
        category: "inputs",
      },
    },
    headingLevel: {
      control: "select",
      options: [1, 2, 3, 4, 5, 6],
      description: "Heading level for the label. The visual size is unchanged.",
      table: {
        type: { summary: "1 | 2 | 3 | 4 | 5 | 6" },
        defaultValue: { summary: "4" },
        category: "inputs",
      },
    },
  },
} as Meta<CardStepperComponent>;

type Story = StoryObj<CardStepperComponent>;

export const Default: Story = {
  args: {
    ariaLabel: "Tervisetõendi taotlemine",
    activeStep: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The modal moves itself to document.body, so it is outside the canvas.
    const page = within(document.body);
    const openList = canvas.getByRole("button", { name: "Ava sammud" });

    await expect(openList).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(openList);
    await waitFor(() =>
      expect(openList).toHaveAttribute("aria-expanded", "true"),
    );

    await userEvent.click(
      page.getByRole("button", { name: /Taotleja andmed/ }),
    );
    await waitFor(() =>
      expect(openList).toHaveAttribute("aria-expanded", "false"),
    );
    await expect(canvas.getByRole("heading")).toHaveTextContent(
      "Taotleja andmed",
    );
  },
  render: (args) => ({
    props: { ...args },
    template: `
      <tedi-card-stepper style="${FRAME}" ${argsToTemplate(args)}>
        <tedi-card-stepper-step title="Taotleja andmed" completed />
        <tedi-card-stepper-step title="Dokumendid" completed />
        <tedi-card-stepper-step title="Elukoht" />
        <tedi-card-stepper-step title="Ülevaade" />
      </tedi-card-stepper>
    `,
  }),
};

export const WithoutStepNumber: Story = {
  render: () => ({
    template: `
      <tedi-card-stepper style="${FRAME}" ariaLabel="Tervisetõendi taotlemine" [activeStep]="2" [showStepNumber]="false">
        <tedi-card-stepper-step title="Taotleja andmed" completed />
        <tedi-card-stepper-step title="Dokumendid" completed />
        <tedi-card-stepper-step title="Elukoht" />
        <tedi-card-stepper-step title="Ülevaade" />
      </tedi-card-stepper>
    `,
  }),
};

export const WithStatusIcon: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-card-stepper style="${FRAME}" ariaLabel="Lõpetatud samm" [activeStep]="2" [showStatusIcon]="true">
          <tedi-card-stepper-step title="Taotleja andmed" completed />
          <tedi-card-stepper-step title="Dokumendid" completed />
          <tedi-card-stepper-step title="Elukoht" completed />
          <tedi-card-stepper-step title="Ülevaade" />
        </tedi-card-stepper>
        <tedi-card-stepper style="${FRAME}" ariaLabel="Vigane samm" [activeStep]="2" [showStatusIcon]="true">
          <tedi-card-stepper-step title="Taotleja andmed" completed />
          <tedi-card-stepper-step title="Dokumendid" completed />
          <tedi-card-stepper-step title="Elukoht" error />
          <tedi-card-stepper-step title="Ülevaade" />
        </tedi-card-stepper>
      </div>
    `,
  }),
};

export const WithInfoBottom: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-card-stepper style="${FRAME}" ariaLabel="Ilma numbrita" [activeStep]="2" [showStepNumber]="false">
          <tedi-card-stepper-step title="Isikuandmed" description="Taotleja või esindatav" completed />
          <tedi-card-stepper-step title="Üldandmed" description="Taotleja või esindatav" completed />
          <tedi-card-stepper-step title="Taotleja andmed" description="Taotleja või esindatav" />
          <tedi-card-stepper-step title="Ülevaade" description="Taotleja või esindatav" />
        </tedi-card-stepper>
        <tedi-card-stepper
          style="${FRAME}"
          ariaLabel="Nooltega"
          [activeStep]="1"
          [showNavigation]="true"
          counterPosition="bottom"
        >
          <tedi-card-stepper-step title="Taotleja andmed" completed />
          <tedi-card-stepper-step title="Dokumendid" completed />
          <tedi-card-stepper-step title="Elukoht" />
          <tedi-card-stepper-step title="Ülevaade" />
        </tedi-card-stepper>
        <tedi-card-stepper style="${FRAME}" ariaLabel="Numbriga" [activeStep]="2">
          <tedi-card-stepper-step title="Isikuandmed" description="Taotleja või esindatav" completed />
          <tedi-card-stepper-step title="Üldandmed" description="Taotleja või esindatav" completed />
          <tedi-card-stepper-step title="Taotleja andmed" description="Taotleja või esindatav" />
          <tedi-card-stepper-step title="Ülevaade" description="Taotleja või esindatav" />
        </tedi-card-stepper>
      </div>
    `,
  }),
};

export const WithInfoTop: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-card-stepper
          style="${FRAME}"
          ariaLabel="Loendur pealkirja kohal"
          [activeStep]="1"
          counterPosition="top"
          [showStepNumber]="false"
        >
          <tedi-card-stepper-step title="Taotleja andmed" completed />
          <tedi-card-stepper-step title="Dokumendid" completed />
          <tedi-card-stepper-step title="Elukoht" />
          <tedi-card-stepper-step title="Ülevaade" />
        </tedi-card-stepper>
        <tedi-card-stepper style="${FRAME}" ariaLabel="Numbriga" [activeStep]="2" descriptionPosition="top">
          <tedi-card-stepper-step title="Isikuandmed" description="Taotleja või esindatav" completed />
          <tedi-card-stepper-step title="Üldandmed" description="Taotleja või esindatav" completed />
          <tedi-card-stepper-step title="Taotleja andmed" description="Taotleja või esindatav" />
          <tedi-card-stepper-step title="Ülevaade" description="Taotleja või esindatav" />
        </tedi-card-stepper>
        <tedi-card-stepper
          style="${FRAME}"
          ariaLabel="Nooltega"
          [activeStep]="1"
          descriptionPosition="top"
          [showNavigation]="true"
        >
          <tedi-card-stepper-step title="Isikuandmed" description="Taotleja või esindatav" completed />
          <tedi-card-stepper-step title="Üldandmed" description="Taotleja või esindatav" completed />
          <tedi-card-stepper-step title="Taotleja andmed" description="Taotleja või esindatav" />
          <tedi-card-stepper-step title="Ülevaade" description="Taotleja või esindatav" />
        </tedi-card-stepper>
        <tedi-card-stepper
          style="${FRAME}"
          ariaLabel="Ilma numbrita"
          [activeStep]="2"
          descriptionPosition="top"
          [showStepNumber]="false"
        >
          <tedi-card-stepper-step title="Isikuandmed" description="Taotleja või esindatav" completed />
          <tedi-card-stepper-step title="Üldandmed" description="Taotleja või esindatav" completed />
          <tedi-card-stepper-step title="Taotleja andmed" description="Taotleja või esindatav" />
          <tedi-card-stepper-step title="Ülevaade" description="Taotleja või esindatav" />
        </tedi-card-stepper>
      </div>
    `,
  }),
};

export const HasNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole("button", { name: "Järgmine samm" });
    const previous = canvas.getByRole("button", { name: "Eelmine samm" });

    next.focus();
    await expect(next).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(canvas.getByRole("heading")).toHaveTextContent("Ülevaade"),
    );
    // Last step: forward is spent, back still works.
    await expect(next).toBeDisabled();

    previous.focus();
    await userEvent.keyboard(" ");
    await waitFor(() =>
      expect(canvas.getByRole("heading")).toHaveTextContent("Elukoht"),
    );
    previous.blur();
  },
  render: () => ({
    template: `
      <tedi-card-stepper style="${FRAME}" ariaLabel="Tervisetõendi taotlemine" [activeStep]="2" [showNavigation]="true">
        <tedi-card-stepper-step title="Taotleja andmed" completed />
        <tedi-card-stepper-step title="Dokumendid" completed />
        <tedi-card-stepper-step title="Elukoht" />
        <tedi-card-stepper-step title="Ülevaade" />
      </tedi-card-stepper>
    `,
  }),
};

export const WithoutProgressbar: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-card-stepper style="${FRAME}" ariaLabel="Ilma edenemisribata" [activeStep]="2" [showProgress]="false">
          <tedi-card-stepper-step title="Taotleja andmed" completed />
          <tedi-card-stepper-step title="Dokumendid" completed />
          <tedi-card-stepper-step title="Elukoht" />
          <tedi-card-stepper-step title="Ülevaade" />
        </tedi-card-stepper>
        <tedi-card-stepper
          style="${FRAME}"
          ariaLabel="Ilma edenemisribata, nooltega"
          [activeStep]="2"
          [showProgress]="false"
          [showNavigation]="true"
        >
          <tedi-card-stepper-step title="Taotleja andmed" completed />
          <tedi-card-stepper-step title="Dokumendid" completed />
          <tedi-card-stepper-step title="Elukoht" />
          <tedi-card-stepper-step title="Ülevaade" />
        </tedi-card-stepper>
      </div>
    `,
  }),
};

/**
 * Use `ng-template tediCardStepperStepContent` for content at the bottom of
 * the card, shown only while its step is active.
 */
export const WithBottomSlot: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <tedi-card-stepper style="${FRAME}" ariaLabel="Hoiatusega samm" [activeStep]="2" [showProgress]="false">
          <tedi-card-stepper-step title="Taotleja andmed" completed />
          <tedi-card-stepper-step title="Üldandmed" completed />
          <tedi-card-stepper-step title="Dokumendid">
            <ng-template tediCardStepperStepContent>
              <tedi-alert type="warning" icon="warning" size="small">
                Andmeväljad sisaldavad ebatäpseid väärtuseid
              </tedi-alert>
            </ng-template>
          </tedi-card-stepper-step>
          <tedi-card-stepper-step title="Ülevaade" />
        </tedi-card-stepper>

        <tedi-card-stepper style="${FRAME}" ariaLabel="Õnnestumisega samm" [activeStep]="2">
          <tedi-card-stepper-step title="Taotleja andmed" completed />
          <tedi-card-stepper-step title="Üldandmed" completed />
          <tedi-card-stepper-step title="Minu andmed">
            <ng-template tediCardStepperStepContent>
              <tedi-status-badge
                color="success"
                icon="check"
                text="Isikuandmed vastavad nõuetele"
              />
            </ng-template>
          </tedi-card-stepper-step>
          <tedi-card-stepper-step title="Ülevaade" />
        </tedi-card-stepper>

        <tedi-card-stepper
          style="${FRAME}"
          ariaLabel="Lisainfoga samm"
          [activeStep]="2"
          [showProgress]="false"
          [showNavigation]="true"
        >
          <tedi-card-stepper-step title="Taotleja andmed" completed />
          <tedi-card-stepper-step title="Üldandmed" completed />
          <tedi-card-stepper-step title="Dokumendid">
            <ng-template tediCardStepperStepContent>
              <tedi-collapse openText="Loe lähemalt" closeText="Sulge">
                <p tedi-text>Lisainfo dokumentide kohta, mida selles sammus on vaja esitada.</p>
              </tedi-collapse>
            </ng-template>
          </tedi-card-stepper-step>
          <tedi-card-stepper-step title="Ülevaade" />
        </tedi-card-stepper>

        <tedi-card-stepper
          style="${FRAME}"
          ariaLabel="Nupuga samm"
          [activeStep]="2"
          [showProgress]="false"
          [showNavigation]="true"
        >
          <tedi-card-stepper-step title="Taotleja andmed" completed />
          <tedi-card-stepper-step title="Üldandmed" completed />
          <tedi-card-stepper-step title="Dokumendid">
            <ng-template tediCardStepperStepContent>
              <div>
                <button tedi-button variant="secondary">
                  <tedi-icon name="add" [size]="18" />
                  Lisa dokument
                </button>
              </div>
            </ng-template>
          </tedi-card-stepper-step>
          <tedi-card-stepper-step title="Ülevaade" />
        </tedi-card-stepper>
      </div>
    `,
  }),
};

export const ManySteps: Story = {
  render: () => ({
    template: `
      <tedi-card-stepper style="${FRAME}" ariaLabel="Geeniuuring" [activeStep]="2">
        <tedi-card-stepper-step title="Isikuandmed" completed />
        <tedi-card-stepper-step title="Tahteavaldus" completed />
        <tedi-card-stepper-step title="Geeniuuring" />
        <tedi-card-stepper-step title="Järeltestimine" />
        <tedi-card-stepper-step title="Tervise ajalugu" />
        <tedi-card-stepper-step title="Küsitlus" />
        <tedi-card-stepper-step title="Analüüs" />
        <tedi-card-stepper-step title="Testid" />
        <tedi-card-stepper-step title="Uuringud" />
        <tedi-card-stepper-step title="Dokumenteerimine" />
        <tedi-card-stepper-step title="Korduv geeniuuring" />
        <tedi-card-stepper-step title="Vastused" />
      </tedi-card-stepper>
    `,
  }),
};

/**
 * Sub-steps appear in an expandable list. Picking one emits `itemSelect` and
 * closes the list.
 */
export const WithSubSteps: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);

    await userEvent.click(canvas.getByRole("button", { name: "Ava sammud" }));
    await waitFor(() =>
      expect(page.getByRole("button", { name: /Sõbrad/ })).toBeVisible(),
    );
    await expect(page.getByRole("button", { name: /Pere/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
  },
  render: () => ({
    template: `
      <tedi-card-stepper style="${FRAME}" ariaLabel="Hindamise edenemine" [activeStep]="1">
        <tedi-card-stepper-step title="Sotsiaalne võrgustik" completed />
        <tedi-card-stepper-step title="Sotsiaalsed suhted">
          <tedi-card-stepper-sub-step title="Sõbrad" completed />
          <tedi-card-stepper-sub-step title="Pere" selected />
          <tedi-card-stepper-sub-step title="Kolleegid" />
        </tedi-card-stepper-step>
        <tedi-card-stepper-step title="Vaimne tervis" />
        <tedi-card-stepper-step title="Ülevaade" />
      </tedi-card-stepper>
    `,
  }),
};

/**
 * `allowJump="completed-or-next"` allows completed steps and the next step
 * in the list. Arrows remain sequential and skip disabled steps.
 */
export const WithLimitedJumping: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            // Only the list's disabled rows are exempt from WCAG 1.4.3.
            selector: ":not(.tedi-vertical-stepper-item--disabled *)",
          },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);

    await userEvent.click(canvas.getByRole("button", { name: "Ava sammud" }));
    // The next step is selectable; disabled and later steps are not.
    await waitFor(() =>
      expect(page.getByRole("button", { name: /Elukoht/ })).toBeVisible(),
    );
    await expect(
      page.queryByRole("button", { name: /Lisadokumendid/ }),
    ).toBeNull();
    await expect(page.queryByRole("button", { name: /Ülevaade/ })).toBeNull();
    // Leave the list open for the accessibility scan.
  },
  render: () => ({
    template: `
      <tedi-card-stepper
        style="${FRAME}"
        ariaLabel="Tervisetõendi taotlemine"
        [activeStep]="1"
        [showNavigation]="true"
        allowJump="completed-or-next"
      >
        <tedi-card-stepper-step title="Taotleja andmed" completed />
        <tedi-card-stepper-step title="Dokumendid" completed />
        <tedi-card-stepper-step title="Elukoht" description="Täidab ametnik" />
        <tedi-card-stepper-step title="Lisadokumendid" [disabled]="true" />
        <tedi-card-stepper-step title="Ülevaade" />
      </tedi-card-stepper>
    `,
  }),
};
