import { expect, userEvent, waitFor, within } from "storybook/test";
import { Component, inject, OnInit, signal } from "@angular/core";
import {
  provideRouter,
  Router,
  withDisabledInitialNavigation,
  withHashLocation,
} from "@angular/router";
import { NgTemplateOutlet } from "@angular/common";
import {
  ArgTypes,
  Meta,
  StoryObj,
  argsToTemplate,
  applicationConfig,
  moduleMetadata,
} from "@storybook/angular";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TextComponent } from "../../base/text/text.component";
import { LinkComponent } from "../link/link.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { StatusBadgeComponent } from "../../tags/status-badge/status-badge.component";
import { VerticalStepperComponent } from "./vertical-stepper.component";
import { VerticalStepperItemComponent } from "./vertical-stepper-item/vertical-stepper-item.component";

type StateExample = {
  label: string;
  completed?: boolean;
  error?: boolean;
  selected?: boolean;
  disabled?: boolean;
  informative?: boolean;
  hover: boolean;
};

const ITEM_STATES: StateExample[] = [
  { label: "Completed", completed: true, hover: true },
  { label: "Has error", error: true, hover: true },
  { label: "Default", hover: true },
  { label: "Selected", selected: true, hover: true },
  {
    label: "Selected + completed",
    completed: true,
    selected: true,
    hover: true,
  },
  { label: "Selected + has error", error: true, selected: true, hover: true },
  { label: "Disabled", disabled: true, hover: false },
  {
    label: "Disabled + completed",
    completed: true,
    disabled: true,
    hover: false,
  },
  { label: "Disabled + has error", error: true, disabled: true, hover: false },
];

const SUB_ITEM_STATES: StateExample[] = [
  ...ITEM_STATES,
  { label: "Informative", informative: true, hover: false },
];

const FRAME = "display: block; max-width: 300px;";

const booleanArgType = (name: string, description: string) => ({
  name,
  description,
  type: "boolean" as const,
  table: { category: "inputs", defaultValue: { summary: "false" } },
});

const itemArgTypes: ArgTypes = {
  title: {
    name: "title",
    description:
      "Step label and accessible name for the sub-step toggle. Required even when using `[item-title]`.",
    type: { name: "string", required: true },
    table: { category: "inputs" },
  },
  completed: booleanArgType(
    "completed",
    "Marks the step as completed. Can be combined with `selected` or `disabled`. Takes precedence over `error`.",
  ),
  error: booleanArgType(
    "error",
    "Marks the step as having an error. Can be combined with `selected` or `disabled`.",
  ),
  selected: booleanArgType(
    "selected",
    'Marks the current step with `aria-current="step"`. Selecting a sub-step opens its parent.',
  ),
  disabled: booleanArgType(
    "disabled",
    "Disables the default label and sub-step toggle. Preserves the step's completed or error status.",
  ),
  informative: booleanArgType(
    "informative",
    "Displays the label as non-interactive secondary text, for example for a step handled by an official.",
  ),
  route: {
    name: "route",
    description:
      "Renders the default label as an Angular `RouterLink`. Accepts a string, command array, or `UrlTree`.",
    table: {
      category: "inputs",
      type: { summary: 'RouterLink["routerLink"]' },
    },
  },
  opened: {
    name: "opened",
    description:
      "Shows the item's sub-steps. Supports two-way binding with `[(opened)]`.",
    type: "boolean",
    table: { category: "inputs", defaultValue: { summary: "false" } },
  },
  openedChange: {
    name: "openedChange",
    description:
      "Emits the new `opened` value when the sub-steps expand or collapse.",
    table: { category: "outputs", type: { summary: "boolean" } },
  },
  itemSelect: {
    name: "itemSelect",
    description:
      "Emits when the default label button is activated or `route` becomes active, including through programmatic navigation. Update `selected` in response. Does not emit when the route becomes inactive.",
    table: { category: "outputs", type: { summary: "void" } },
  },
};

/**
 * Vertical navigation with regular and compact layouts, progress states, and expandable
 * sub-steps. Supports Angular routing and custom labels and descriptions.
 *
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.102.102?node-id=4375-57529&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/25a440-stepper-vertical" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Navigation/VerticalStepper",
  component: VerticalStepperComponent,
  subcomponents: {
    VerticalStepperItem: VerticalStepperItemComponent,
  },
  parameters: {
    docs: {
      // Compodoc currently excludes library sources; keep these API tables local.
      extractArgTypes: (component: unknown) =>
        component === VerticalStepperItemComponent ? itemArgTypes : {},
    },
  },
  decorators: [
    moduleMetadata({
      imports: [
        NgTemplateOutlet,
        VerticalStepperComponent,
        VerticalStepperItemComponent,
        ButtonComponent,
        IconComponent,
        LinkComponent,
        TextComponent,
        RowComponent,
        ColComponent,
        SeparatorComponent,
        StatusBadgeComponent,
      ],
    }),
  ],
  argTypes: {
    ariaLabel: {
      control: "text",
      description: "Accessible name for the navigation landmark.",
      table: { type: { summary: "string" }, category: "inputs" },
    },
    compact: {
      control: "boolean",
      description: "Uses smaller indicators and less space between steps.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "inputs",
      },
    },
    enumerated: {
      control: "boolean",
      description:
        "Adds numbers to step labels in the compact layout. Regular indicators are always numbered.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "inputs",
      },
    },
  },
} as Meta<VerticalStepperComponent>;

type Story = StoryObj<VerticalStepperComponent>;

const ASSESSMENT_STEPS = `
  <tedi-vertical-stepper-item title="Sotsiaalne võrgustik" [selected]="selected === 1" (itemSelect)="selected = 1" />
  <tedi-vertical-stepper-item title="Sotsiaalsed suhted" completed [opened]="true">
    <tedi-vertical-stepper-item title="Sõbrad" completed [selected]="selected === 21" (itemSelect)="selected = 21" />
    <tedi-vertical-stepper-item title="Pere" [selected]="selected === 22" (itemSelect)="selected = 22" />
  </tedi-vertical-stepper-item>
  <tedi-vertical-stepper-item title="Vaimne tervis" completed [selected]="selected === 3" (itemSelect)="selected = 3" />
  <tedi-vertical-stepper-item title="Füüsiline tervis" completed [selected]="selected === 4" (itemSelect)="selected = 4" />
  <tedi-vertical-stepper-item title="Elukeskkond" completed [selected]="selected === 5" (itemSelect)="selected = 5" />
  <tedi-vertical-stepper-item title="Hõivatus" error [selected]="selected === 6" (itemSelect)="selected = 6" />
  <tedi-vertical-stepper-item title="Vaba aeg ja huvitegevused" completed [selected]="selected === 7" (itemSelect)="selected = 7" />
  <tedi-vertical-stepper-item title="Igapäevaelu toimingud" [selected]="selected === 8" (itemSelect)="selected = 8" />
`;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Sotsiaalsed suhted" });
    const subStep = canvas.getByRole("button", { name: "Pere" });

    await expect(subStep).toBeVisible();
    await userEvent.click(toggle);
    await waitFor(() => expect(subStep).not.toBeVisible());
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(subStep).toBeVisible());
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    toggle.blur();
  },
  args: {
    ariaLabel: "Hindamise edenemine",
    compact: false,
    enumerated: false,
  },
  render: (args) => ({
    props: { ...args, selected: 1 },
    template: `
      <tedi-vertical-stepper style="${FRAME}" ${argsToTemplate(args)}>
        ${ASSESSMENT_STEPS}
      </tedi-vertical-stepper>
    `,
  }),
};

export const WithDescriptions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Add a description below a step's label using `[item-description]`.",
      },
    },
  },
  render: () => ({
    template: `
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Taotluse menetlus">
        <tedi-vertical-stepper-item title="Kutse" completed />
        <tedi-vertical-stepper-item title="Tahteavaldus" completed>
          <span item-description>Ülevaatamine võib võtta kuni 30 tööpäeva</span>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Geenianalüüs" selected>
          <span item-description>Menetlemine võtab aega kuni 30 päeva</span>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Vastus" />
      </tedi-vertical-stepper>
    `,
  }),
};

export const WithStatusBadges: Story = {
  render: () => ({
    template: `
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Andmete kontroll">
        <tedi-vertical-stepper-item title="Isikuandmed" completed>
          <tedi-status-badge class="flex" color="success" variant="filled-bordered" text="Isik on tõestatud" />
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Üldandmed" completed />
        <tedi-vertical-stepper-item title="Terviseandmed" completed />
        <tedi-vertical-stepper-item title="Vastus" selected>
          <span item-description>Ametnik täidab</span>
        </tedi-vertical-stepper-item>
      </tedi-vertical-stepper>
    `,
  }),
};

export const WithButton: Story = {
  render: () => ({
    template: `
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Andmete sisestus">
        <tedi-vertical-stepper-item title="Isikuandmed" completed>
          <button tedi-button variant="secondary" size="small">
            <tedi-icon name="add" [size]="16" />
            Lisa isik
          </button>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Üldandmed" completed />
        <tedi-vertical-stepper-item title="Terviseandmed" completed />
        <tedi-vertical-stepper-item title="Ülevaade" selected />
      </tedi-vertical-stepper>
    `,
  }),
};

export const WithLinks: Story = {
  render: () => ({
    template: `
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Tervisevaldkonnad">
        <tedi-vertical-stepper-item title="Vaimne tervis" completed>
          <a tedi-link href="#read-1">Loe rohkem <tedi-icon name="arrow_forward" [size]="18" /></a>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Füüsiline tervis" completed>
          <a tedi-link href="#read-2">Loe rohkem <tedi-icon name="arrow_forward" [size]="18" /></a>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Üldandmed" completed />
        <tedi-vertical-stepper-item title="Ülevaade" selected />
      </tedi-vertical-stepper>
    `,
  }),
};

export const Compact: Story = {
  args: { enumerated: false },
  parameters: { controls: { include: ["enumerated"] } },
  render: (args) => ({
    props: { ...args, selected: 1 },
    template: `
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Hindamise edenemine" compact [enumerated]="enumerated">
        ${ASSESSMENT_STEPS}
      </tedi-vertical-stepper>
    `,
  }),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: [".stepper-hover .tedi-vertical-stepper-item__link"],
    },
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            // Disabled examples are exempt from WCAG 1.4.3.
            selector: ":not(.tedi-vertical-stepper-item--disabled *)",
          },
          // State examples repeat landmark names.
          { id: "landmark-unique", enabled: false },
        ],
      },
    },
  },
  render: () => ({
    props: { ITEM_STATES, SUB_ITEM_STATES },
    styles: [
      `
        .stepper-state-title { margin-bottom: var(--layout-grid-gutters-16); }
        .stepper-state-example { width: 100%; max-width: 8rem; }
        .stepper-state-example--fit { width: fit-content; }
        .stepper-state-label { margin-bottom: var(--layout-grid-gutters-04); }
        .stepper-state-hover-label { margin-top: var(--layout-grid-gutters-12); }
      `,
    ],
    template: `
      <tedi-row cols="1" [gapY]="4">
        <tedi-col>
          <p tedi-text modifiers="h5" class="stepper-state-title">Default</p>
          <tedi-row cols="2" [md]="{ cols: 3 }" [lg]="{ cols: 6 }" [gapY]="3" [gapX]="2">
            @for (state of ITEM_STATES; track state.label) {
              <tedi-col>
                <p tedi-text modifiers="bold">{{ state.label }}</p>
                <ng-container *ngTemplateOutlet="itemCell; context: { $implicit: state, compact: false }" />
              </tedi-col>
            }
          </tedi-row>
        </tedi-col>

        <tedi-col><tedi-separator /></tedi-col>

        <tedi-col>
          <p tedi-text modifiers="h5" class="stepper-state-title">Compact</p>
          <tedi-row cols="2" [md]="{ cols: 3 }" [lg]="{ cols: 6 }" [gapY]="3" [gapX]="2">
            @for (state of ITEM_STATES; track state.label) {
              <tedi-col>
                <p tedi-text modifiers="bold">{{ state.label }}</p>
                <ng-container *ngTemplateOutlet="itemCell; context: { $implicit: state, compact: true }" />
              </tedi-col>
            }
          </tedi-row>
        </tedi-col>

        <tedi-col><tedi-separator /></tedi-col>

        <tedi-col>
          <p tedi-text modifiers="h5" class="stepper-state-title">Sub-steps</p>
          <tedi-row cols="2" [md]="{ cols: 3 }" [lg]="{ cols: 6 }" [gapY]="3" [gapX]="2">
            @for (state of SUB_ITEM_STATES; track state.label) {
              <tedi-col>
                <p tedi-text modifiers="bold">{{ state.label }}</p>
                <ng-container *ngTemplateOutlet="subItemCell; context: { $implicit: state }" />
              </tedi-col>
            }
          </tedi-row>
        </tedi-col>
      </tedi-row>

      <ng-template #itemCell let-state let-compact="compact">
        <p tedi-text modifiers="small" color="tertiary" class="stepper-state-label">Default</p>
        <tedi-vertical-stepper class="stepper-state-example" ariaLabel="Sammu näide" [compact]="compact">
          <tedi-vertical-stepper-item title="Text" [completed]="state.completed" [error]="state.error" [disabled]="state.disabled" [selected]="state.selected" />
          <tedi-vertical-stepper-item title="Text" [completed]="state.completed" [error]="state.error" [disabled]="state.disabled" />
        </tedi-vertical-stepper>
        @if (state.hover) {
          <p tedi-text modifiers="small" color="tertiary" class="stepper-state-label stepper-state-hover-label">Hover</p>
          <div class="stepper-hover">
            <tedi-vertical-stepper class="stepper-state-example" ariaLabel="Sammu näide" [compact]="compact">
              <tedi-vertical-stepper-item title="Text" [completed]="state.completed" [error]="state.error" [disabled]="state.disabled" [selected]="state.selected" />
              <tedi-vertical-stepper-item title="Text" [completed]="state.completed" [error]="state.error" [disabled]="state.disabled" />
            </tedi-vertical-stepper>
          </div>
        }
      </ng-template>

      <ng-template #subItemCell let-state>
        <p tedi-text modifiers="small" color="tertiary" class="stepper-state-label">Default</p>
        <tedi-vertical-stepper class="stepper-state-example stepper-state-example--fit" ariaLabel="Alamsammu näide">
          <tedi-vertical-stepper-item title="Text" [opened]="true">
            <tedi-vertical-stepper-item title="Text" [completed]="state.completed" [error]="state.error" [disabled]="state.disabled" [informative]="state.informative" [selected]="state.selected" />
            <tedi-vertical-stepper-item title="Text" [completed]="state.completed" [error]="state.error" [disabled]="state.disabled" [informative]="state.informative" />
          </tedi-vertical-stepper-item>
        </tedi-vertical-stepper>
        @if (state.hover) {
          <p tedi-text modifiers="small" color="tertiary" class="stepper-state-label stepper-state-hover-label">Hover</p>
          <div class="stepper-hover">
            <tedi-vertical-stepper class="stepper-state-example stepper-state-example--fit" ariaLabel="Alamsammu näide">
              <tedi-vertical-stepper-item title="Text" [opened]="true">
                <tedi-vertical-stepper-item title="Text" [completed]="state.completed" [error]="state.error" [disabled]="state.disabled" [informative]="state.informative" [selected]="state.selected" />
                <tedi-vertical-stepper-item title="Text" [completed]="state.completed" [error]="state.error" [disabled]="state.disabled" [informative]="state.informative" />
              </tedi-vertical-stepper-item>
            </tedi-vertical-stepper>
          </div>
        }
      </ng-template>
    `,
  }),
};

export const WithNestedSteps: Story = {
  play: async ({ canvasElement }) => {
    const subStep = canvasElement.querySelector<HTMLElement>(
      ".tedi-vertical-stepper-item--sub-item",
    )!;
    const row = subStep.querySelector<HTMLElement>(
      ".tedi-vertical-stepper-item__row",
    )!;
    const dot = subStep.querySelector<HTMLElement>(
      ".tedi-vertical-stepper-item__dot",
    )!;
    const link = subStep.querySelector<HTMLElement>(
      ".tedi-vertical-stepper-item__link",
    )!;
    const icon = subStep.querySelector<HTMLElement>(
      ".tedi-vertical-stepper-item__label-icon",
    )!;
    await expect(row.getBoundingClientRect().height).toBe(28);
    await expect(dot.getBoundingClientRect().width).toBe(9);
    await expect(
      icon.getBoundingClientRect().left - link.getBoundingClientRect().right,
    ).toBeCloseTo(4);
    const informative = canvasElement.querySelector<HTMLElement>(
      ".tedi-vertical-stepper-item--informative .tedi-vertical-stepper-item__row",
    )!;
    await expect(informative.getBoundingClientRect().height).toBe(28);
  },
  parameters: {
    docs: {
      description: {
        story:
          "Nest `tedi-vertical-stepper-item` components to create sub-steps. Selecting a sub-step opens its parent. Use `[(opened)]` to keep the parent's expanded state in sync with your application.",
      },
    },
  },
  render: () => ({
    props: { selectedStep: 1, opened: true },
    template: `
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Taotluse sammud" compact enumerated>
        <tedi-vertical-stepper-item title="Isikuandmed" completed (itemSelect)="selectedStep = 0" [selected]="selectedStep === 0" />
        <tedi-vertical-stepper-item title="Terviseandmed" [(opened)]="opened">
          <tedi-vertical-stepper-item title="Vaimne tervis" completed [selected]="selectedStep === 1" (itemSelect)="selectedStep = 1" />
          <tedi-vertical-stepper-item title="Füüsiline tervis" [selected]="selectedStep === 2" (itemSelect)="selectedStep = 2" />
          <tedi-vertical-stepper-item title="Täidab ametnik" informative />
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Kinnitatud andmed" completed disabled />
        <tedi-vertical-stepper-item title="Ülevaade" [selected]="selectedStep === 3" (itemSelect)="selectedStep = 3" />
      </tedi-vertical-stepper>
    `,
  }),
};

export const WithCustomContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use `[item-title]` for a custom label and `[item-description]` for a custom description. Custom labels replace the default control, so handle their events, routing, disabled state, and accessibility attributes yourself.",
      },
    },
  },
  render: () => ({
    template: `
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Andmete kontroll">
        <tedi-vertical-stepper-item title="Isikuandmed" completed>
          <a tedi-link href="#custom-personal" item-title><strong>Isikuandmed</strong></a>
          <span item-description>Andmed on <strong>kontrollitud</strong>.</span>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item title="Terviseandmed" selected>
          <a tedi-link href="#custom-health" item-title aria-current="step">Terviseandmed</a>
          <div item-description>
            <p tedi-text modifiers="small">Vajadusel lisa täiendavad andmed.</p>
            <a tedi-link href="#custom-more">Loe rohkem</a>
          </div>
        </tedi-vertical-stepper-item>
      </tedi-vertical-stepper>
    `,
  }),
};

@Component({ template: "" })
class StepRoutePage {}

const ROUTE_STEPS = [
  { title: "Isikuandmed", route: "/stepper/personal" },
  { title: "Terviseandmed", route: "/stepper/health" },
  { title: "Ülevaade", route: "/stepper/review" },
];

@Component({
  selector: "app-vertical-stepper-routes-example",
  imports: [
    VerticalStepperComponent,
    VerticalStepperItemComponent,
    ButtonComponent,
  ],
  styles: `
    .stepper-routes-example {
      display: flex;
      flex-direction: column;
      gap: var(--layout-grid-gutters-16);
      align-items: flex-start;
    }
  `,
  template: `
    <div class="stepper-routes-example">
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Taotluse etapid">
        @for (step of steps; track step.route; let i = $index) {
          <tedi-vertical-stepper-item
            [title]="step.title"
            [route]="step.route"
            [selected]="selected() === i"
            (itemSelect)="selected.set(i)"
          />
        }
      </tedi-vertical-stepper>
      <button
        tedi-button
        [disabled]="selected() === steps.length - 1"
        (click)="next()"
      >
        Järgmine samm
      </button>
    </div>
  `,
})
class StepperRoutesExample implements OnInit {
  private readonly router = inject(Router);
  readonly steps = ROUTE_STEPS;
  readonly selected = signal(0);

  ngOnInit(): void {
    this.router.navigateByUrl(this.steps[0].route);
  }

  next(): void {
    this.router.navigateByUrl(this.steps[this.selected() + 1].route);
  }
}

export const WithRoutes: Story = {
  decorators: [
    moduleMetadata({ imports: [StepperRoutesExample] }),
    applicationConfig({
      providers: [
        provideRouter(
          [
            { path: "stepper/personal", component: StepRoutePage },
            { path: "stepper/health", component: StepRoutePage },
            { path: "stepper/review", component: StepRoutePage },
          ],
          withHashLocation(),
          withDisabledInitialNavigation(),
        ),
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Use `route` to link steps to Angular routes. `itemSelect` emits when a route becomes active, whether through a step link or programmatic navigation. Update `selected` in response to mark the current step.",
      },
    },
  },
  render: () => ({ template: "<app-vertical-stepper-routes-example />" }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const step = (name: string) => canvas.getByRole("link", { name });
    const next = canvas.getByRole("button", { name: "Järgmine samm" });

    await waitFor(() =>
      expect(step("Isikuandmed")).toHaveAttribute("aria-current", "step"),
    );
    await userEvent.click(step("Ülevaade"));
    await waitFor(() =>
      expect(step("Ülevaade")).toHaveAttribute("aria-current", "step"),
    );
    await expect(next).toBeDisabled();
    await userEvent.click(step("Isikuandmed"));
    await waitFor(() => expect(next).toBeEnabled());
    await userEvent.click(next);
    await waitFor(() =>
      expect(step("Terviseandmed")).toHaveAttribute("aria-current", "step"),
    );
    await expect(step("Isikuandmed")).not.toHaveAttribute("aria-current");
    next.blur();
  },
};
