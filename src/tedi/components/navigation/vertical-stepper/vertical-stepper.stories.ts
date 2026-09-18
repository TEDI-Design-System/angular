import { expect, userEvent, waitFor, within } from "storybook/test";
import { NgTemplateOutlet } from "@angular/common";
import {
  ArgTypes,
  Meta,
  StoryObj,
  argsToTemplate,
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
import { VerticalStepperSubItemComponent } from "./vertical-stepper-sub-item/vertical-stepper-sub-item.component";

// Include current + status combinations to cover compact icon placement.
const ITEM_STATES = [
  { label: "Completed", state: "completed", current: false, hover: true },
  { label: "Has error", state: "error", current: false, hover: true },
  { label: "Default", state: "default", current: false, hover: true },
  { label: "Selected", state: "default", current: true, hover: true },
  {
    label: "Selected + completed",
    state: "completed",
    current: true,
    hover: true,
  },
  { label: "Selected + has error", state: "error", current: true, hover: true },
  { label: "Disabled", state: "disabled", current: false, hover: false },
];

const SUB_ITEM_STATES = [
  ...ITEM_STATES,
  { label: "Informative", state: "informative", current: false, hover: false },
];

const FRAME = "display: block; max-width: 360px;";

const itemArgTypes: ArgTypes = {
  label: {
    name: "label",
    description: "Step label.",
    type: { name: "string", required: true },
    table: { category: "inputs" },
  },
  state: {
    name: "state",
    description: "Progress state. Disabled labels render as text.",
    options: ["default", "completed", "error", "disabled"],
    table: {
      category: "inputs",
      type: { summary: '"default" | "completed" | "error" | "disabled"' },
      defaultValue: { summary: '"default"' },
    },
  },
  current: {
    name: "current",
    description:
      'Current step, independent of state. Sets aria-current="step".',
    type: "boolean",
    table: { category: "inputs", defaultValue: { summary: "false" } },
  },
  href: {
    name: "href",
    description: "Label link destination. See labelAs for element overrides.",
    type: "string",
    table: { category: "inputs" },
  },
  labelAs: {
    name: "labelAs",
    description:
      'Label element. Defaults to an anchor with href, otherwise text. Use "button" with stepSelect. Anchors require href. Disabled labels render as text.',
    table: { category: "inputs", type: { summary: '"a" | "button" | "text"' } },
  },
  stepSelect: {
    name: "stepSelect",
    description: "Emits when the label link or button is activated.",
    table: { category: "outputs", type: { summary: "Event" } },
  },
};

const subItemArgTypes: ArgTypes = {
  ...itemArgTypes,
  label: { ...itemArgTypes["label"], description: "Sub-step label." },
  state: {
    name: "state",
    ...itemArgTypes["state"],
    description:
      "Progress state. Disabled and informative labels render as text.",
    options: ["default", "completed", "error", "disabled", "informative"],
    table: {
      ...itemArgTypes["state"].table,
      type: {
        summary:
          '"default" | "completed" | "error" | "disabled" | "informative"',
      },
    },
  },
  labelAs: {
    name: "labelAs",
    ...itemArgTypes["labelAs"],
    description:
      'Label element. Defaults to an anchor with href, otherwise text. Use "button" with stepSelect. Anchors require href. Disabled and informative labels render as text.',
  },
};

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.75.91?node-id=4453-75678&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/25a440-stepper-vertical" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Navigation/VerticalStepper",
  component: VerticalStepperComponent,
  subcomponents: {
    VerticalStepperItem: VerticalStepperItemComponent,
    VerticalStepperSubItem: VerticalStepperSubItemComponent,
  },
  parameters: {
    docs: {
      // Compodoc currently excludes library sources; keep these API tables local.
      extractArgTypes: (component: unknown) => {
        if (component === VerticalStepperSubItemComponent)
          return subItemArgTypes;
        if (component === VerticalStepperItemComponent) {
          return {
            ...itemArgTypes,
            description: {
              name: "description",
              description: "Secondary text below the label.",
              type: "string",
              table: { category: "inputs" },
            },
            open: {
              name: "open",
              description:
                "Expand directly projected sub-steps. Supports [(open)].",
              type: "boolean",
              table: { category: "inputs", defaultValue: { summary: "false" } },
            },
            openChange: {
              name: "openChange",
              description:
                "Emits the expanded state when the toggle is activated.",
              table: { category: "outputs", type: { summary: "boolean" } },
            },
          };
        }
        return {};
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [
        NgTemplateOutlet,
        VerticalStepperComponent,
        VerticalStepperItemComponent,
        VerticalStepperSubItemComponent,
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
      description: "Smaller indicators and tighter rows.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "inputs",
      },
    },
    showNumbers: {
      control: "boolean",
      description:
        "Number compact labels. Regular indicators are always numbered.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "inputs",
      },
    },
  },
} as Meta<VerticalStepperComponent>;

type Story = StoryObj<VerticalStepperComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Sotsiaalsed suhted" });
    const subStep = canvas.getByRole("link", { name: "Pere" });

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
    showNumbers: false,
  },
  render: (args) => ({
    props: { ...args },
    template: `
      <tedi-vertical-stepper style="${FRAME}" ${argsToTemplate(args)}>
        <tedi-vertical-stepper-item label="Sotsiaalne võrgustik" current href="#step-1" />
        <tedi-vertical-stepper-item label="Sotsiaalsed suhted" state="completed" [open]="true">
          <tedi-vertical-stepper-sub-item label="Sõbrad" state="completed" href="#step-2-1" />
          <tedi-vertical-stepper-sub-item label="Pere" href="#step-2-2" />
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item label="Vaimne tervis" state="completed" href="#step-3" />
        <tedi-vertical-stepper-item label="Füüsiline tervis" state="completed" href="#step-4" />
        <tedi-vertical-stepper-item label="Elukeskkond" state="completed" href="#step-5" />
        <tedi-vertical-stepper-item label="Hõivatus" state="error" href="#step-6" />
        <tedi-vertical-stepper-item label="Vaba aeg ja huvitegevused" state="completed" href="#step-7" />
        <tedi-vertical-stepper-item label="Igapäevaelu toimingud" href="#step-8" />
      </tedi-vertical-stepper>
    `,
  }),
};

export const WithDescriptions: Story = {
  render: () => ({
    template: `
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Taotluse menetlus">
        <tedi-vertical-stepper-item label="Kutse" state="completed" href="#k1" />
        <tedi-vertical-stepper-item
          label="Tahteavaldus"
          description="Ülevaatamine võib võtta kuni 30 tööpäeva"
          state="completed"
          href="#k2"
        />
        <tedi-vertical-stepper-item
          label="Geenianalüüs"
          description="Menetlemine võtab aega kuni 30 päeva"
          current
          href="#k3"
        />
        <tedi-vertical-stepper-item label="Vastus" href="#k4" />
      </tedi-vertical-stepper>
    `,
  }),
};

export const WithStatusBadges: Story = {
  render: () => ({
    template: `
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Andmete kontroll">
        <tedi-vertical-stepper-item label="Isikuandmed" state="completed" href="#i1">
          <tedi-status-badge color="success" variant="bordered" text="Isik on tõestatud" />
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item label="Üldandmed" state="completed" href="#i2" />
        <tedi-vertical-stepper-item label="Terviseandmed" state="completed" href="#i3" />
        <tedi-vertical-stepper-item label="Vastus" current href="#i4">
          <span tedi-text modifiers="small" color="tertiary">Täidab ametnik</span>
        </tedi-vertical-stepper-item>
      </tedi-vertical-stepper>
    `,
  }),
};

export const WithButton: Story = {
  render: () => ({
    template: `
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Andmete sisestus">
        <tedi-vertical-stepper-item label="Isikuandmed" state="completed" href="#b1">
          <button tedi-button variant="secondary" size="small">
            <tedi-icon name="add" [size]="16" />
            Lisa isik
          </button>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item label="Üldandmed" state="completed" href="#b2" />
        <tedi-vertical-stepper-item label="Terviseandmed" state="completed" href="#b3" />
        <tedi-vertical-stepper-item label="Ülevaade" current href="#b4" />
      </tedi-vertical-stepper>
    `,
  }),
};

export const WithLinks: Story = {
  render: () => ({
    template: `
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Tervisevaldkonnad">
        <tedi-vertical-stepper-item label="Vaimne tervis" state="completed" href="#l1">
          <a tedi-link href="#read-1">Loe rohkem <tedi-icon name="arrow_forward" [size]="16" /></a>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item label="Füüsiline tervis" state="completed" href="#l2">
          <a tedi-link href="#read-2">Loe rohkem <tedi-icon name="arrow_forward" [size]="16" /></a>
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item label="Üldandmed" state="completed" href="#l3" />
        <tedi-vertical-stepper-item label="Ülevaade" current href="#l4" />
      </tedi-vertical-stepper>
    `,
  }),
};

export const Compact: Story = {
  args: { showNumbers: false },
  parameters: { controls: { include: ["showNumbers"] } },
  render: (args) => ({
    props: { ...args },
    template: `
      <tedi-vertical-stepper style="${FRAME}" ariaLabel="Hindamise edenemine" compact [showNumbers]="showNumbers">
        <tedi-vertical-stepper-item label="Sotsiaalne võrgustik" current href="#c1" />
        <tedi-vertical-stepper-item label="Sotsiaalsed suhted" state="completed" [open]="true">
          <tedi-vertical-stepper-sub-item label="Sõbrad" state="completed" href="#c2-1" />
          <tedi-vertical-stepper-sub-item label="Pere" href="#c2-2" />
        </tedi-vertical-stepper-item>
        <tedi-vertical-stepper-item label="Vaimne tervis" state="completed" href="#c3" />
        <tedi-vertical-stepper-item label="Füüsiline tervis" state="completed" href="#c4" />
        <tedi-vertical-stepper-item label="Elukeskkond" state="completed" href="#c5" />
        <tedi-vertical-stepper-item label="Hõivatus" state="error" href="#c6" />
        <tedi-vertical-stepper-item label="Vaba aeg ja huvitegevused" state="completed" href="#c7" />
        <tedi-vertical-stepper-item label="Igapäevaelu toimingud" href="#c8" />
      </tedi-vertical-stepper>
    `,
  }),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    pseudo: {
      hover: [
        ".stepper-hover .tedi-vertical-stepper-item__link",
        ".stepper-hover .tedi-vertical-stepper-sub-item__link",
      ],
    },
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            // Disabled examples are exempt from WCAG 1.4.3.
            selector:
              ":not(.tedi-vertical-stepper-item--disabled *, .tedi-vertical-stepper-sub-item--disabled *)",
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
        .stepper-state-example { width: 100%; max-width: 8rem; }
        .stepper-state-example--fit { width: fit-content; }
        .stepper-state-label { margin-bottom: var(--layout-grid-gutters-04); }
        .stepper-state-hover-label { margin-top: var(--layout-grid-gutters-12); }
      `,
    ],
    template: `
      <tedi-row cols="1" [gapY]="4">
        <tedi-col>
          <p tedi-text modifiers="h5">Default</p>
          <tedi-row cols="2" [md]="{ cols: 3 }" [lg]="{ cols: 4 }" [gapY]="3" [gapX]="2">
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
          <p tedi-text modifiers="h5">Compact</p>
          <tedi-row cols="2" [md]="{ cols: 3 }" [lg]="{ cols: 4 }" [gapY]="3" [gapX]="2">
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
          <p tedi-text modifiers="h5">Sub-steps</p>
          <tedi-row cols="2" [md]="{ cols: 3 }" [lg]="{ cols: 4 }" [gapY]="3" [gapX]="2">
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
          <tedi-vertical-stepper-item label="Text" labelAs="button" [state]="state.state" [current]="state.current" />
          <tedi-vertical-stepper-item label="Text" labelAs="button" [state]="state.state" />
        </tedi-vertical-stepper>
        @if (state.hover) {
          <p tedi-text modifiers="small" color="tertiary" class="stepper-state-label stepper-state-hover-label">Hover</p>
          <div class="stepper-hover">
            <tedi-vertical-stepper class="stepper-state-example" ariaLabel="Sammu näide" [compact]="compact">
              <tedi-vertical-stepper-item label="Text" labelAs="button" [state]="state.state" [current]="state.current" />
              <tedi-vertical-stepper-item label="Text" labelAs="button" [state]="state.state" />
            </tedi-vertical-stepper>
          </div>
        }
      </ng-template>

      <ng-template #subItemCell let-state>
        <p tedi-text modifiers="small" color="tertiary" class="stepper-state-label">Default</p>
        <tedi-vertical-stepper class="stepper-state-example stepper-state-example--fit" ariaLabel="Alamsammu näide">
          <tedi-vertical-stepper-item label="Text" [open]="true">
            <tedi-vertical-stepper-sub-item label="Text" labelAs="button" [state]="state.state" [current]="state.current" />
            <tedi-vertical-stepper-sub-item label="Text" labelAs="button" [state]="state.state" />
          </tedi-vertical-stepper-item>
        </tedi-vertical-stepper>
        @if (state.hover) {
          <p tedi-text modifiers="small" color="tertiary" class="stepper-state-label stepper-state-hover-label">Hover</p>
          <div class="stepper-hover">
            <tedi-vertical-stepper class="stepper-state-example stepper-state-example--fit" ariaLabel="Alamsammu näide">
              <tedi-vertical-stepper-item label="Text" [open]="true">
                <tedi-vertical-stepper-sub-item label="Text" labelAs="button" [state]="state.state" [current]="state.current" />
                <tedi-vertical-stepper-sub-item label="Text" labelAs="button" [state]="state.state" />
              </tedi-vertical-stepper-item>
            </tedi-vertical-stepper>
          </div>
        }
      </ng-template>
    `,
  }),
};
