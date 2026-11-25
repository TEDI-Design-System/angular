import {
  argsToTemplate,
  type Meta,
  moduleMetadata,
  type StoryObj,
} from "@storybook/angular";
import { expect, waitFor, within } from "storybook/test";
import { SheetComponent } from "./sheet.component";
import { SheetContentDirective } from "./sheet-content.directive";
import { SheetTriggerDirective } from "./sheet-trigger.directive";
import { SheetCloseDirective } from "./sheet-close.directive";
import { SheetHeaderComponent } from "./sheet-header/sheet-header.component";
import { SheetBodyComponent } from "./sheet-body/sheet-body.component";
import { SheetFooterComponent } from "./sheet-footer/sheet-footer.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { ClosingButtonComponent } from "../../buttons/closing-button/closing-button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TextComponent } from "../../base/text/text.component";
import { TagComponent } from "../../tags/tag/tag.component";
import { CheckboxComponent } from "../../form/checkbox/checkbox.component";
import { CheckboxGroupComponent } from "../../form/checkbox-group/checkbox-group.component";
import { RadioComponent } from "../../form/radio/radio.component";
import { RadioGroupComponent } from "../../form/radio-group/radio-group.component";
import { LabelComponent } from "../../content/label/label.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { FormFieldComponent } from "../../form/form-field/form-field.component";
import { TextFieldComponent } from "../../form/text-field/text-field.component";
import { DateFieldComponent } from "../../form/date-field/date-field.component";
import { TimeFieldComponent } from "../../form/time-field/time-field.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";

const MAP_LAYERS = [
  "Hübriidkaart",
  "Reljeef",
  "Katastriüksused",
  "Kitsendused",
  "Aadressandmed",
];

const SCROLL_FIELDS = [
  "Eesnimi",
  "Perekonnanimi",
  "E-post",
  "Telefon",
  "Aadress",
  "Sihtnumber",
  "Linn",
  "Maakond",
  "Lisainfo",
];

const SENDERS = [
  "SK ID Solutions AS",
  "Politsei- ja Piirivalveamet",
  "Sihtasutus Kutsekoda",
  "Siseministeerium",
  "Riigi Infosüsteemide Amet",
];

// A dropdown-style row that spans the sheet, past the body's padding, as in Figma.
const NAV_ROW_STYLES = `
.tedi-sheet-story__nav-row {
  display: flex;
  gap: var(--layout-grid-gutters-08);
  align-items: center;
  justify-content: space-between;
  width: calc(100% + 2 * var(--tedi-sheet-body-padding));
  margin-inline: calc(-1 * var(--tedi-sheet-body-padding));
  padding: var(--dropdown-item-padding-y) var(--tedi-sheet-body-padding);
  font: inherit;
  color: var(--dropdown-item-default-text);
  text-align: left;
  cursor: pointer;
  background: none;
  border: none;
}

.tedi-sheet-story__nav-row:hover {
  color: var(--dropdown-item-hover-text);
  background: var(--dropdown-item-hover-background);
}
`;

// A divider that spans the whole sheet, past the body's padding, as in Figma.
const FULL_WIDTH_SEPARATOR = `<tedi-separator
  [spacing]="1"
  size="calc(100% + 2 * var(--tedi-sheet-body-padding))"
  style="margin-inline: calc(-1 * var(--tedi-sheet-body-padding))"
/>`;

const visualTest: StoryObj = {
  parameters: { chromatic: { disableSnapshot: false, viewports: [375, 1280] } },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() =>
      expect(body.getByRole("dialog")).toHaveAttribute("data-status", "open"),
    );
  },
};

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.102.102?node-id=65376-125297&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/502b36-sheet" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Overlay/Sheet",
  component: SheetComponent,
  decorators: [
    moduleMetadata({
      imports: [
        SheetComponent,
        SheetContentDirective,
        SheetTriggerDirective,
        SheetCloseDirective,
        SheetHeaderComponent,
        SheetBodyComponent,
        SheetFooterComponent,
        ButtonComponent,
        ClosingButtonComponent,
        IconComponent,
        TextComponent,
        TagComponent,
        CheckboxComponent,
        CheckboxGroupComponent,
        RadioComponent,
        RadioGroupComponent,
        LabelComponent,
        SeparatorComponent,
        FormFieldComponent,
        TextFieldComponent,
        DateFieldComponent,
        TimeFieldComponent,
        VerticalSpacingDirective,
      ],
    }),
  ],
  parameters: {
    chromatic: { disableSnapshot: true },
    status: { type: ["breakpointSupport"] },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.102.102?node-id=65376-125297&m=dev",
    },
  },
  argTypes: {
    open: {
      control: false,
      description:
        "Whether the sheet is open. Bind `[(open)]` to stay in sync when it closes itself.",
      table: {
        category: "tedi-sheet",
        type: { summary: "boolean (model)" },
        defaultValue: { summary: "false" },
      },
    },
    collapsed: {
      control: false,
      description:
        "Whether the sheet is collapsed to its header. Bind `[(collapsed)]` to stay in sync.",
      table: {
        category: "tedi-sheet",
        type: { summary: "boolean (model)" },
        defaultValue: { summary: "false" },
      },
    },
    closeOnBackdropClick: {
      control: "boolean",
      description: "Close the sheet on a click outside it.",
      table: { category: "tedi-sheet", defaultValue: { summary: "true" } },
    },
    closeOnEscape: {
      control: "boolean",
      description: "Close the sheet on Escape.",
      table: { category: "tedi-sheet", defaultValue: { summary: "true" } },
    },
    role: {
      control: "radio",
      options: ["dialog", "alertdialog"],
      description: "Use `alertdialog` for interruptive confirmations.",
      table: { category: "tedi-sheet", defaultValue: { summary: "dialog" } },
    },
    showHandle: {
      control: "boolean",
      description:
        "Show the drag handle and allow dragging from it and the header.",
      table: {
        category: "tediSheetContent",
        defaultValue: { summary: "true" },
      },
    },
    padding: {
      control: "radio",
      options: ["default", "small"],
      description: "Padding of the header, body and footer.",
      table: {
        category: "tediSheetContent",
        defaultValue: { summary: "default" },
      },
    },
    radius: {
      control: "radio",
      options: ["default", "card", "none"],
      description: "Top corner radius. Accepts a breakpoint object.",
      table: {
        category: "tediSheetContent",
        type: {
          summary: "BreakpointInput<'default' | 'card' | 'none'>",
          detail: "'card' or { xs: 'none', md: 'card' }",
        },
        defaultValue: { summary: "default" },
      },
    },
    trapFocus: {
      control: "boolean",
      description: "Trap focus inside the sheet while it's open.",
      table: {
        category: "tediSheetContent",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    returnFocus: {
      control: "boolean",
      description:
        "Return focus to the element that had it before the sheet opened.",
      table: {
        category: "tediSheetContent",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    showOverlay: {
      control: "boolean",
      description: "Show the dimmed backdrop.",
      table: {
        category: "tediSheetContent",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    lockScroll: {
      control: "boolean",
      description: "Block page scrolling while the sheet is open.",
      table: {
        category: "tediSheetContent",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    keepMounted: {
      control: "boolean",
      description:
        "Keep the content rendered while closed, so its state survives reopening.",
      table: {
        category: "tediSheetContent",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    snapPoints: {
      control: "object",
      description:
        "Rest heights as fractions of the viewport height, e.g. `[0.4, 0.9]`.",
      table: {
        category: "tediSheetContent",
        type: { summary: "number[]" },
      },
    },
    defaultSnapPoint: {
      control: "number",
      description: "Index into the sorted `snapPoints` to open at.",
      table: {
        category: "tediSheetContent",
        type: { summary: "number" },
        defaultValue: { summary: "the tallest" },
      },
    },
    snapPointChange: {
      control: false,
      description: "Emits the fraction the sheet snapped to after a drag.",
      table: {
        category: "tediSheetContent",
        type: { summary: "EventEmitter<number>" },
      },
    },
    visuallyHiddenDismiss: {
      control: "boolean",
      description:
        "Render hidden close buttons for touch screen reader users while focus is trapped.",
      table: {
        category: "tediSheetContent",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    ariaLabelledBy: {
      control: false,
      description:
        "Id of the element that labels the sheet, when the label isn't the header `title`.",
      table: {
        category: "tediSheetContent",
        type: { summary: "string" },
      },
    },
    ariaLabel: {
      control: false,
      description: "Accessible name for a sheet without a visible title.",
      table: {
        category: "tediSheetContent",
        type: { summary: "string" },
      },
    },
    minHeight: {
      control: "text",
      description:
        "Minimum panel height (any CSS length), not applied while collapsed.",
      table: {
        category: "tediSheetContent",
        type: { summary: "string" },
      },
    },
    maxHeight: {
      control: "text",
      description:
        "Maximum panel height (any CSS length); the body scrolls past it.",
      table: {
        category: "tediSheetContent",
        type: { summary: "string" },
        defaultValue: { summary: "90dvh" },
      },
    },
    panelClass: {
      control: false,
      description: "Extra class on the sheet panel.",
      table: {
        category: "tediSheetContent",
        type: { summary: "string" },
      },
    },
    title: {
      control: "text",
      description: "Title. Labels the sheet dialog.",
      table: { category: "tedi-sheet-header" },
    },
    headingLevel: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
      description: "Heading level of the title. It always looks like an H6.",
      table: { category: "tedi-sheet-header", defaultValue: { summary: "h3" } },
    },
    variant: {
      control: "radio",
      options: ["brand", "default"],
      description: "`brand` is a brand-blue header with white content.",
      table: {
        category: "tedi-sheet-header",
        defaultValue: { summary: "brand" },
      },
    },
    titlePosition: {
      control: "radio",
      options: ["start", "center"],
      description: "Where the title sits in the header.",
      table: {
        category: "tedi-sheet-header",
        defaultValue: { summary: "start" },
      },
    },
    collapsible: {
      control: "boolean",
      description: "Show a button that collapses the sheet to its header.",
      table: {
        category: "tedi-sheet-header",
        defaultValue: { summary: "false" },
      },
    },
    closeButton: {
      control: "boolean",
      description: "Show the close button.",
      table: {
        category: "tedi-sheet-header",
        defaultValue: { summary: "true" },
      },
    },
    align: {
      control: "radio",
      options: ["left", "center", "right"],
      description: "Placement of the footer actions.",
      table: {
        category: "tedi-sheet-footer",
        defaultValue: { summary: "left" },
      },
    },
    fullWidth: {
      control: "boolean",
      description: "Stretch the footer actions to share its width.",
      table: {
        category: "tedi-sheet-footer",
        defaultValue: { summary: "false" },
      },
    },
    bodyPadding: {
      name: "padding",
      control: false,
      description: "Use `none` for content that brings its own padding.",
      table: {
        category: "tedi-sheet-body",
        type: { summary: "'default' | 'none'" },
        defaultValue: { summary: "default" },
      },
    },
  },
} as Meta<SheetComponent>;

type Story = StoryObj;

export const Default: Story = {
  args: {
    closeOnBackdropClick: true,
    closeOnEscape: true,
    role: "dialog",
    showHandle: true,
    padding: "default",
    radius: "default",
    title: "Filtreerimine",
    headingLevel: "h3",
    variant: "default",
    titlePosition: "start",
    collapsible: false,
    closeButton: false,
    align: "left",
    fullWidth: true,
    trapFocus: true,
    returnFocus: true,
    showOverlay: true,
    lockScroll: true,
    keepMounted: false,
    visuallyHiddenDismiss: true,
  },
  render: (args) => ({
    props: args,
    template: `
<tedi-sheet ${argsToTemplate(args, { include: ["closeOnBackdropClick", "closeOnEscape", "role"] })}>
  <button tedi-button variant="neutral" tediSheetTrigger>
    <tedi-icon name="tune" />
    Filtreeri
  </button>
  <ng-template tediSheetContent ${argsToTemplate(args, { include: ["showHandle", "padding", "radius", "trapFocus", "returnFocus", "showOverlay", "lockScroll", "keepMounted", "visuallyHiddenDismiss", "snapPoints", "defaultSnapPoint", "minHeight", "maxHeight"] })}>
    <tedi-sheet-header ${argsToTemplate(args, { include: ["title", "headingLevel", "variant", "titlePosition", "collapsible", "closeButton"] })} />
    <tedi-sheet-body>
      <tedi-radio-group direction="vertical" ariaLabel="Kirjade olek" value="option-1">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" value="option-1" />
          Kõik
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" value="option-2" />
          Ainult lugemata
        </label>
      </tedi-radio-group>
      ${FULL_WIDTH_SEPARATOR}
      <tedi-radio-group direction="vertical" ariaLabel="Järjestus" value="option-1">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" value="option-1" />
          Lugemata kõige üleval
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" value="option-2" />
          Kuupäeva järgi
        </label>
      </tedi-radio-group>
    </tedi-sheet-body>
    <tedi-sheet-footer ${argsToTemplate(args, { include: ["align", "fullWidth"] })}>
      <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
      <button tedi-button>Rakenda</button>
      <button tedi-button variant="secondary" tedi-sheet-footer-end aria-label="Rohkem valikuid">
        <tedi-icon name="more_vert" />
      </button>
    </tedi-sheet-footer>
  </ng-template>
</tedi-sheet>
`,
  }),
};

export const ActionsSlot: Story = {
  name: "Actions slot",
  render: () => ({
    template: `
<div class="flex flex-wrap gap-3 align-items-start">
  <div [tediVerticalSpacing]="0.25">
    <p tedi-text modifiers="small" color="secondary">With footer</p>
    <tedi-sheet>
      <button tedi-button variant="secondary" tediSheetTrigger>
        <tedi-icon name="tune" />
        Seaded
      </button>
      <ng-template tediSheetContent>
        <tedi-sheet-header closeButton title="Seaded" variant="default" />
        <tedi-sheet-body>
          <tedi-checkbox-group direction="vertical">
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" checked />
              Näita pikkusi
            </label>
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" />
              Näita nurki
            </label>
          </tedi-checkbox-group>
        </tedi-sheet-body>
        <tedi-sheet-footer fullWidth>
          <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
          <button tedi-button>Rakenda</button>
          <button tedi-button variant="secondary" tedi-sheet-footer-end aria-label="Rohkem valikuid">
            <tedi-icon name="more_vert" />
          </button>
        </tedi-sheet-footer>
      </ng-template>
    </tedi-sheet>
  </div>
  <div [tediVerticalSpacing]="0.25">
    <p tedi-text modifiers="small" color="secondary">Without footer</p>
    <tedi-sheet>
      <button tedi-button variant="secondary" tediSheetTrigger>
        <tedi-icon name="info" />
        Loe lähemalt
      </button>
      <ng-template tediSheetContent>
        <tedi-sheet-header closeButton title="Loe lähemalt" variant="default" />
        <tedi-sheet-body>
          <p tedi-text>
            Orav ehk harilik orav ehk punaorav on oravlaste sugukonda kuuluv näriline. See on ainus Eestis
            pärismaisena elav orava perekonna liik. Orava karvastiku värvus varieerub ka Eesti ulatuses: Saaremaal
            on see valdavalt hallikam, mandril punakam.
          </p>
        </tedi-sheet-body>
      </ng-template>
    </tedi-sheet>
  </div>
</div>
`,
  }),
};

export const CornerRadius: Story = {
  name: "Corner radius",
  render: () => ({
    props: {
      radii: [
        { caption: "24px", radius: "default" },
        { caption: "4px", radius: "card" },
        { caption: "0px", radius: "none" },
      ],
    },
    template: `
<div class="flex flex-wrap gap-3 align-items-start">
  @for (example of radii; track example.radius) {
    <div [tediVerticalSpacing]="0.25">
      <p tedi-text modifiers="small" color="secondary">{{ example.caption }}</p>
      <tedi-sheet>
        <button tedi-button variant="secondary" tediSheetTrigger>
          <tedi-icon name="tune" />
          Seaded
        </button>
        <ng-template tediSheetContent [radius]="example.radius">
          <tedi-sheet-header closeButton title="Seaded" variant="default" />
          <tedi-sheet-body>
            <tedi-checkbox-group direction="vertical">
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" checked />
                Näita pikkusi
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" />
                Näita nurki
              </label>
            </tedi-checkbox-group>
          </tedi-sheet-body>
        </ng-template>
      </tedi-sheet>
    </div>
  }
  <div [tediVerticalSpacing]="0.25">
    <p tedi-text modifiers="small" color="secondary">0px → 4px from md</p>
    <tedi-sheet>
      <button tedi-button variant="secondary" tediSheetTrigger>
        <tedi-icon name="tune" />
        Seaded
      </button>
      <ng-template tediSheetContent [radius]="{ xs: 'none', md: 'card' }">
        <tedi-sheet-header closeButton title="Seaded" variant="default" />
        <tedi-sheet-body>
          <tedi-checkbox-group direction="vertical">
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" checked />
              Näita pikkusi
            </label>
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" />
              Näita nurki
            </label>
          </tedi-checkbox-group>
        </tedi-sheet-body>
      </ng-template>
    </tedi-sheet>
  </div>
</div>
`,
  }),
};

export const HeaderVariant: Story = {
  name: "Header variant",
  render: () => ({
    props: {
      variants: [
        { caption: "Default", variant: "default", trigger: "secondary" },
        { caption: "Brand", variant: "brand", trigger: "primary" },
      ],
    },
    template: `
<div class="flex flex-wrap gap-3 align-items-start">
  @for (example of variants; track example.variant) {
    <div [tediVerticalSpacing]="0.25">
      <p tedi-text modifiers="small" color="secondary">{{ example.caption }}</p>
      <tedi-sheet>
        <button tedi-button [variant]="example.trigger" tediSheetTrigger>
          <tedi-icon name="tune" />
          Seaded
        </button>
        <ng-template tediSheetContent>
          <tedi-sheet-header closeButton title="Seaded" [variant]="example.variant" />
          <tedi-sheet-body>
            <tedi-checkbox-group direction="vertical">
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" checked />
                Näita pikkusi
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" />
                Näita nurki
              </label>
            </tedi-checkbox-group>
          </tedi-sheet-body>
        </ng-template>
      </tedi-sheet>
    </div>
  }
</div>
`,
  }),
};

const HEADER_TYPE_SOURCE = `<!-- Default -->
<tedi-sheet-header closeButton title="Seaded" variant="default" />

<!-- Collapsible -->
<tedi-sheet-header closeButton title="Seaded" variant="default" collapsible />

<!-- Heading center -->
<tedi-sheet-header closeButton title="Seaded" variant="default" titlePosition="center" />

<!-- Without closing button -->
<tedi-sheet-header title="Seaded" variant="default" [closeButton]="false" />

<!-- Without handle: set on the content -->
<ng-template tediSheetContent [showHandle]="false">…</ng-template>

<!-- With custom button -->
<tedi-sheet-header title="Seaded" variant="default" titlePosition="center" [closeButton]="false">
  <button tedi-button variant="secondary" tedi-sheet-header-actions tediSheetClose aria-label="Sulge">
    <tedi-icon name="close" />
  </button>
</tedi-sheet-header>

<!-- With slots -->
<tedi-sheet-header closeButton title="Teated" variant="default" titlePosition="center">
  <button tedi-button variant="neutral" size="small" tedi-sheet-header-start tediSheetClose aria-label="Tagasi">
    <tedi-icon name="arrow_back" />
  </button>
  <tedi-tag type="primary" tedi-sheet-header-end>2</tedi-tag>
</tedi-sheet-header>

<!-- Custom header: label the sheet yourself -->
<ng-template tediSheetContent ariaLabelledBy="settings-title">
  <tedi-sheet-header closeButton variant="default">
    <div tedi-sheet-header-content class="flex align-items-center gap-2">
      <div class="flex-grow-1">
        <h3 tedi-text modifiers="h6" id="settings-title">Seaded</h3>
        <p tedi-text modifiers="small" color="secondary">Muudatused salvestatakse automaatselt</p>
      </div>
      <button tedi-closing-button tediSheetClose></button>
    </div>
  </tedi-sheet-header>
  …
</ng-template>`;

export const HeaderType: Story = {
  name: "Header type",
  parameters: {
    docs: { source: { language: "html", code: HEADER_TYPE_SOURCE } },
  },
  render: () => ({
    props: {
      groups: [
        {
          label: "Default",
          examples: [{ caption: "Default" }],
        },
        {
          label: "Collapsible",
          examples: [
            { caption: "Heading left", collapsible: true },
            {
              caption: "Heading center",
              collapsible: true,
              titlePosition: "center",
            },
          ],
        },
        {
          label: "Heading center",
          examples: [{ caption: "Heading center", titlePosition: "center" }],
        },
        {
          label: "Without closing button",
          examples: [
            { caption: "Heading left", closeButton: false },
            {
              caption: "Heading center",
              closeButton: false,
              titlePosition: "center",
            },
          ],
        },
        {
          label: "Without handle",
          examples: [
            { caption: "Heading left", showHandle: false },
            {
              caption: "Heading center",
              showHandle: false,
              titlePosition: "center",
            },
          ],
        },
      ],
    },
    template: `
<div [tediVerticalSpacing]="2">
  @for (group of groups; track group.label) {
    <div [tediVerticalSpacing]="0.75">
      <p tedi-text modifiers="bold">{{ group.label }}</p>
      <div class="flex flex-wrap gap-3 align-items-start">
        @for (example of group.examples; track example.caption) {
          <div [tediVerticalSpacing]="0.25">
            @if (example.caption !== group.label) {
              <p tedi-text modifiers="small" color="secondary">{{ example.caption }}</p>
            }
            <tedi-sheet>
              <button tedi-button variant="secondary" tediSheetTrigger>
                <tedi-icon name="tune" />
                Seaded
              </button>
              <ng-template tediSheetContent [showHandle]="example.showHandle ?? true">
                <tedi-sheet-header
                  title="Seaded"
                  variant="default"
                  [titlePosition]="example.titlePosition ?? 'start'"
                  [collapsible]="example.collapsible ?? false"
                  [closeButton]="example.closeButton ?? true"
                />
                <tedi-sheet-body>
                  <tedi-checkbox-group direction="vertical">
                    <label tedi-label color="primary" class="flex align-items-center gap-2">
                      <input tedi-checkbox type="checkbox" checked />
                      Näita pikkusi
                    </label>
                    <label tedi-label color="primary" class="flex align-items-center gap-2">
                      <input tedi-checkbox type="checkbox" />
                      Näita nurki
                    </label>
                  </tedi-checkbox-group>
                </tedi-sheet-body>
              </ng-template>
            </tedi-sheet>
          </div>
        }
      </div>
    </div>
  }

  <div [tediVerticalSpacing]="0.75">
    <p tedi-text modifiers="bold">With custom button</p>
    <div [tediVerticalSpacing]="0.25">
      <p tedi-text modifiers="small" color="secondary">Secondary closing button</p>
      <tedi-sheet>
        <button tedi-button variant="secondary" tediSheetTrigger>
          <tedi-icon name="tune" />
          Seaded
        </button>
        <ng-template tediSheetContent>
          <tedi-sheet-header title="Seaded" variant="default" titlePosition="center" [closeButton]="false">
            <button tedi-button variant="secondary" tedi-sheet-header-actions tediSheetClose aria-label="Sulge">
              <tedi-icon name="close" />
            </button>
          </tedi-sheet-header>
          <tedi-sheet-body>
            <tedi-checkbox-group direction="vertical">
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" checked />
                Näita pikkusi
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" />
                Näita nurki
              </label>
            </tedi-checkbox-group>
          </tedi-sheet-body>
        </ng-template>
      </tedi-sheet>
    </div>
  </div>

  <div [tediVerticalSpacing]="0.75">
    <p tedi-text modifiers="bold">With slot</p>
    <div class="flex flex-wrap gap-3 align-items-start">
      <div [tediVerticalSpacing]="0.25">
        <p tedi-text modifiers="small" color="secondary">Right slot</p>
        <tedi-sheet>
          <button tedi-button variant="secondary" tediSheetTrigger>
            <tedi-icon name="notifications" />
            Teated
          </button>
          <ng-template tediSheetContent>
            <tedi-sheet-header closeButton title="Teated" variant="default">
              <tedi-tag type="primary" tedi-sheet-header-end>2 uut teadet</tedi-tag>
            </tedi-sheet-header>
            <tedi-sheet-body>
              <div [tediVerticalSpacing]="0.75">
                <div>
                  <p tedi-text color="secondary" modifiers="small">Täna, 09:12</p>
                  <p tedi-text>Teie taotlus on menetlusse võetud</p>
                </div>
                <div>
                  <p tedi-text color="secondary" modifiers="small">Eile, 16:40</p>
                  <p tedi-text>Uus dokument on allkirjastamiseks valmis</p>
                </div>
              </div>
            </tedi-sheet-body>
          </ng-template>
        </tedi-sheet>
      </div>
      <div [tediVerticalSpacing]="0.25">
        <p tedi-text modifiers="small" color="secondary">Left slot</p>
        <tedi-sheet>
          <button tedi-button variant="secondary" tediSheetTrigger>
            <tedi-icon name="notifications" />
            Teated
          </button>
          <ng-template tediSheetContent>
            <tedi-sheet-header closeButton title="Teated" variant="default">
              <tedi-tag type="primary" tedi-sheet-header-start>2</tedi-tag>
            </tedi-sheet-header>
            <tedi-sheet-body>
              <div [tediVerticalSpacing]="0.75">
                <div>
                  <p tedi-text color="secondary" modifiers="small">Täna, 09:12</p>
                  <p tedi-text>Teie taotlus on menetlusse võetud</p>
                </div>
                <div>
                  <p tedi-text color="secondary" modifiers="small">Eile, 16:40</p>
                  <p tedi-text>Uus dokument on allkirjastamiseks valmis</p>
                </div>
              </div>
            </tedi-sheet-body>
          </ng-template>
        </tedi-sheet>
      </div>
      <div [tediVerticalSpacing]="0.25">
        <p tedi-text modifiers="small" color="secondary">Left and right slots</p>
        <tedi-sheet>
          <button tedi-button variant="secondary" tediSheetTrigger>
            <tedi-icon name="notifications" />
            Teated
          </button>
          <ng-template tediSheetContent>
            <tedi-sheet-header closeButton title="Teated" variant="default" titlePosition="center">
              <button tedi-button variant="neutral" size="small" tedi-sheet-header-start tediSheetClose aria-label="Tagasi">
                <tedi-icon name="arrow_back" />
              </button>
              <tedi-tag type="primary" tedi-sheet-header-end>2</tedi-tag>
            </tedi-sheet-header>
            <tedi-sheet-body>
              <div [tediVerticalSpacing]="0.75">
                <div>
                  <p tedi-text color="secondary" modifiers="small">Täna, 09:12</p>
                  <p tedi-text>Teie taotlus on menetlusse võetud</p>
                </div>
                <div>
                  <p tedi-text color="secondary" modifiers="small">Eile, 16:40</p>
                  <p tedi-text>Uus dokument on allkirjastamiseks valmis</p>
                </div>
              </div>
            </tedi-sheet-body>
          </ng-template>
        </tedi-sheet>
      </div>
    </div>
  </div>

  <div [tediVerticalSpacing]="0.75">
    <p tedi-text modifiers="bold">Custom header</p>
    <div [tediVerticalSpacing]="0.25">
      <p tedi-text modifiers="small" color="secondary">Title with description</p>
      <tedi-sheet>
        <button tedi-button variant="secondary" tediSheetTrigger>
          <tedi-icon name="tune" />
          Seaded
        </button>
        <ng-template tediSheetContent ariaLabelledBy="sheet-type-custom-title">
          <tedi-sheet-header closeButton variant="default">
            <div tedi-sheet-header-content class="flex align-items-center gap-2">
              <div class="flex-grow-1">
                <h3 tedi-text modifiers="h6" id="sheet-type-custom-title">Seaded</h3>
                <p tedi-text modifiers="small" color="secondary">Muudatused salvestatakse automaatselt</p>
              </div>
              <button tedi-closing-button tediSheetClose></button>
            </div>
          </tedi-sheet-header>
          <tedi-sheet-body>
            <tedi-checkbox-group direction="vertical">
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" checked />
                Näita pikkusi
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" />
                Näita nurki
              </label>
            </tedi-checkbox-group>
          </tedi-sheet-body>
        </ng-template>
      </tedi-sheet>
    </div>
  </div>
</div>
`,
  }),
};

/**
 * The sheet collapses to its header while the page stays usable: `collapsible` on the header,
 * `trapFocus` and `lockScroll` off on `tediSheetContent`, and `closeOnBackdropClick` off on the
 * sheet. The page is dimmed while the sheet is expanded and not while it's collapsed.
 */
export const DockedPeek: Story = {
  name: "Docked peek",
  render: () => ({
    template: `
<tedi-sheet [closeOnBackdropClick]="false">
  <button tedi-button tediSheetTrigger>
    <tedi-icon name="calendar_month" />
    Vali aeg
  </button>
  <ng-template tediSheetContent [trapFocus]="false" [lockScroll]="false">
    <tedi-sheet-header closeButton title="Vali aeg" variant="brand" collapsible />
    <tedi-sheet-body>
      <div [tediVerticalSpacing]="1">
        <tedi-form-field>
          <label tedi-label for="sheet-docked-date">Kuupäev</label>
          <tedi-date-field inputId="sheet-docked-date" />
        </tedi-form-field>
        <tedi-form-field>
          <label tedi-label for="sheet-docked-time">Aeg</label>
          <tedi-time-field inputId="sheet-docked-time" />
        </tedi-form-field>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" />
          Lisa meeldetuletus
        </label>
      </div>
    </tedi-sheet-body>
    <tedi-sheet-footer fullWidth>
      <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
      <button tedi-button>Rakenda</button>
    </tedi-sheet-footer>
  </ng-template>
</tedi-sheet>
`,
  }),
};

/**
 * Drag the handle or header and release to snap to 40% or 90% of the viewport height.
 * Dragging below the lowest point closes the sheet.
 */
export const SnapPoints: Story = {
  name: "Snap points",
  render: () => ({
    props: { layers: [...MAP_LAYERS, ...MAP_LAYERS] },
    template: `
<tedi-sheet>
  <button tedi-button tediSheetTrigger>
    <tedi-icon name="layers" />
    Kihid
  </button>
  <ng-template tediSheetContent [snapPoints]="[0.4, 0.9]">
    <tedi-sheet-header closeButton title="Kihid" variant="default" collapsible />
    <tedi-sheet-body>
      <tedi-checkbox-group direction="vertical">
        @for (layer of layers; track $index) {
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            {{ layer }}
          </label>
        }
      </tedi-checkbox-group>
    </tedi-sheet-body>
  </ng-template>
</tedi-sheet>
`,
  }),
};

/** Type into the field, close the sheet and reopen it: the value is kept. */
export const KeepMounted: Story = {
  render: () => ({
    template: `
<tedi-sheet>
  <button tedi-button tediSheetTrigger>
    <tedi-icon name="edit_note" />
    Märkmed
  </button>
  <ng-template tediSheetContent keepMounted>
    <tedi-sheet-header closeButton title="Märkmed" variant="default" />
    <tedi-sheet-body>
      <tedi-form-field>
        <label tedi-label for="sheet-persisted-note">Märkus</label>
        <input tedi-text-field id="sheet-persisted-note" placeholder="Kirjuta midagi…" />
      </tedi-form-field>
    </tedi-sheet-body>
  </ng-template>
</tedi-sheet>
`,
  }),
};

/**
 * Bind `[(open)]` two-way: when the sheet closes itself (Escape, backdrop, close button), `open` is
 * set back to `false`, so the button can open it again. With a one-way `[open]` it would stay `true`.
 * An external button like this one gets no `aria-expanded` or `aria-haspopup`; `tediSheetTrigger` adds those.
 */
export const Controlled: Story = {
  render: () => ({
    props: { open: false },
    template: `
<button tedi-button (click)="open = true">Ava seaded</button>
<tedi-sheet [(open)]="open">
  <ng-template tediSheetContent>
    <tedi-sheet-header closeButton title="Seaded" variant="default" />
    <tedi-sheet-body>
      <tedi-checkbox-group direction="vertical">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked />
          Näita pikkusi
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" />
          Näita nurki
        </label>
      </tedi-checkbox-group>
    </tedi-sheet-body>
    <tedi-sheet-footer fullWidth>
      <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
      <button tedi-button (click)="open = false">Salvesta</button>
    </tedi-sheet-footer>
  </ng-template>
</tedi-sheet>
`,
  }),
};

/**
 * Collapse the sheet from the page, e.g. while the user draws on a map, and expand it
 * once the drawing is confirmed. Collapsing keeps the form's values; closing removes them.
 */
export const ControlledCollapse: Story = {
  name: "Controlled collapse",
  render: () => ({
    props: { open: false, collapsed: false },
    template: `
<div class="flex flex-wrap gap-3 align-items-start">
  <button tedi-button variant="neutral" (click)="open = true; collapsed = true">
    <tedi-icon name="edit" />
    Alusta joonistamist
  </button>
  <button tedi-button variant="neutral" [disabled]="!open" (click)="collapsed = false">
    <tedi-icon name="check" />
    Kinnita joonis
  </button>
</div>
<tedi-sheet [(open)]="open" [(collapsed)]="collapsed" [closeOnBackdropClick]="false">
  <ng-template tediSheetContent [showOverlay]="false" [trapFocus]="false" [lockScroll]="false">
    <tedi-sheet-header closeButton title="Uus ala" variant="brand" collapsible />
    <tedi-sheet-body>
      <tedi-form-field>
        <label tedi-label for="sheet-controlled-collapse-name">Ala nimi</label>
        <input tedi-text-field id="sheet-controlled-collapse-name" />
      </tedi-form-field>
    </tedi-sheet-body>
    <tedi-sheet-footer fullWidth>
      <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
      <button tedi-button>Salvesta</button>
    </tedi-sheet-footer>
  </ng-template>
</tedi-sheet>
`,
  }),
};

/**
 * Open **Saatja**, change the selection, then return with the back button. Both views stay
 * mounted, so their form values survive moving between them.
 */
export const ContentNavigation: Story = {
  name: "Content navigation",
  render: () => ({
    styles: [NAV_ROW_STYLES],
    props: {
      step: "filters",
      senders: SENDERS,
      selected: SENDERS.slice(0, 2),
      toggleSender(this: { selected: string[] }, sender: string) {
        this.selected = this.selected.includes(sender)
          ? this.selected.filter((value) => value !== sender)
          : [...this.selected, sender];
      },
    },
    template: `
<tedi-sheet (openChange)="$event && (step = 'filters')">
  <button tedi-button variant="neutral" tediSheetTrigger>
    <tedi-icon name="tune" />
    Filtreeri
  </button>
  <ng-template tediSheetContent>
    <tedi-sheet-header closeButton variant="default" [title]="step === 'filters' ? 'Filtreerimine' : 'Saatja'">
      @if (step === "senders") {
        <button tedi-button variant="neutral" size="small" tedi-sheet-header-start aria-label="Tagasi" (click)="step = 'filters'">
          <tedi-icon name="arrow_back" />
        </button>
      }
    </tedi-sheet-header>
    <tedi-sheet-body>
      <div [hidden]="step !== 'filters'">
        <button type="button" class="tedi-sheet-story__nav-row" (click)="step = 'senders'">
          <span tedi-text>Saatja</span>
          <span class="flex align-items-center gap-2">
            @if (selected.length) {
              <tedi-tag type="primary">{{ selected.length }}</tedi-tag>
            }
            <tedi-icon name="arrow_forward" color="brand" />
          </span>
        </button>
        ${FULL_WIDTH_SEPARATOR}
        <tedi-radio-group direction="vertical" ariaLabel="Kirjade olek" value="option-1">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" value="option-1" />
            Kõik
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" value="option-2" />
            Ainult lugemata
          </label>
        </tedi-radio-group>
        ${FULL_WIDTH_SEPARATOR}
        <tedi-radio-group direction="vertical" ariaLabel="Järjestus" value="option-1">
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" value="option-1" />
            Lugemata kõige üleval
          </label>
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-radio type="radio" value="option-2" />
            Kuupäeva järgi
          </label>
        </tedi-radio-group>
      </div>
      <div [hidden]="step !== 'senders'">
        <tedi-checkbox-group direction="vertical">
          @for (sender of senders; track sender) {
            <label tedi-label color="primary" class="flex align-items-center gap-2">
              <input tedi-checkbox type="checkbox" [checked]="selected.includes(sender)" (change)="toggleSender(sender)" />
              {{ sender }}
            </label>
          }
        </tedi-checkbox-group>
      </div>
    </tedi-sheet-body>
    @if (step === "filters") {
      <tedi-sheet-footer fullWidth>
        <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
        <button tedi-button>Rakenda</button>
      </tedi-sheet-footer>
    } @else {
      <tedi-sheet-footer fullWidth>
        <button tedi-button variant="secondary" (click)="step = 'filters'">Tagasi</button>
        <button tedi-button (click)="step = 'filters'">Rakenda</button>
      </tedi-sheet-footer>
    }
  </ng-template>
</tedi-sheet>
`,
  }),
};

/** `maxHeight` limits the sheet height; the body scrolls between the header and footer. */
export const ScrollableContent: Story = {
  name: "Scrollable content",
  render: () => ({
    props: { fields: SCROLL_FIELDS },
    template: `
<tedi-sheet>
  <button tedi-button tediSheetTrigger>
    <tedi-icon name="edit" />
    Ava vorm
  </button>
  <ng-template tediSheetContent maxHeight="32rem">
    <tedi-sheet-header closeButton title="Andmete sisestamine" variant="default" />
    <tedi-sheet-body>
      <div [tediVerticalSpacing]="1">
        @for (field of fields; track field) {
          <tedi-form-field>
            <label tedi-label [attr.for]="'sheet-scroll-field-' + $index">{{ field }}</label>
            <input tedi-text-field [id]="'sheet-scroll-field-' + $index" />
          </tedi-form-field>
        }
      </div>
    </tedi-sheet-body>
    <tedi-sheet-footer fullWidth>
      <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
      <button tedi-button>Rakenda</button>
    </tedi-sheet-footer>
  </ng-template>
</tedi-sheet>
`,
  }),
};

/**
 * `padding` on `tediSheetContent` tightens the header, body and footer together.
 * For edge-to-edge body content, use `padding="none"` on `<tedi-sheet-body>` instead.
 */
export const Padding: Story = {
  render: () => ({
    props: { paddings: ["default", "small"] },
    template: `
<div class="flex flex-wrap gap-3 align-items-start">
  @for (padding of paddings; track padding) {
    <div [tediVerticalSpacing]="0.25">
      <p tedi-text modifiers="small" color="secondary">padding="{{ padding }}"</p>
      <tedi-sheet>
        <button tedi-button variant="secondary" tediSheetTrigger>
          <tedi-icon name="tune" />
          Seaded
        </button>
        <ng-template tediSheetContent [padding]="padding">
          <tedi-sheet-header closeButton title="Seaded" variant="default" />
          <tedi-sheet-body>
            <tedi-checkbox-group direction="vertical">
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" checked />
                Näita pikkusi
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" />
                Näita nurki
              </label>
            </tedi-checkbox-group>
          </tedi-sheet-body>
          <tedi-sheet-footer fullWidth>
            <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
            <button tedi-button>Rakenda</button>
            <button tedi-button variant="secondary" tedi-sheet-footer-end aria-label="Rohkem valikuid">
              <tedi-icon name="more_vert" />
            </button>
          </tedi-sheet-footer>
        </ng-template>
      </tedi-sheet>
    </div>
  }
</div>
`,
  }),
};

export const FooterAlignment: Story = {
  name: "Footer alignment",
  render: () => ({
    props: {
      examples: [
        { caption: 'align="left"', align: "left" },
        { caption: 'align="center"', align: "center" },
        { caption: 'align="right"', align: "right" },
        { caption: "fullWidth", align: "left", fullWidth: true },
        {
          caption: "fullWidth + end",
          align: "left",
          fullWidth: true,
          end: true,
        },
      ],
    },
    template: `
<div class="flex flex-wrap gap-3 align-items-start">
  @for (example of examples; track example.caption) {
    <div [tediVerticalSpacing]="0.25">
      <p tedi-text modifiers="small" color="secondary">{{ example.caption }}</p>
      <tedi-sheet>
        <button tedi-button variant="secondary" tediSheetTrigger>
          <tedi-icon name="tune" />
          Seaded
        </button>
        <ng-template tediSheetContent>
          <tedi-sheet-header closeButton title="Seaded" variant="default" />
          <tedi-sheet-body>
            <tedi-checkbox-group direction="vertical">
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" checked />
                Näita pikkusi
              </label>
              <label tedi-label color="primary" class="flex align-items-center gap-2">
                <input tedi-checkbox type="checkbox" />
                Näita nurki
              </label>
            </tedi-checkbox-group>
          </tedi-sheet-body>
          <tedi-sheet-footer [align]="example.align" [fullWidth]="example.fullWidth ?? false">
            <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
            <button tedi-button>Rakenda</button>
            @if (example.end) {
              <button tedi-button variant="secondary" tedi-sheet-footer-end aria-label="Rohkem valikuid">
                <tedi-icon name="more_vert" />
              </button>
            }
          </tedi-sheet-footer>
        </ng-template>
      </tedi-sheet>
    </div>
  }
</div>
`,
  }),
};

export const OpenForVisualTest: Story = {
  ...visualTest,
  tags: ["!dev", "!autodocs"],
  render: () => ({
    template: `
<tedi-sheet [open]="true">
  <ng-template tediSheetContent>
    <tedi-sheet-header closeButton title="Filtreerimine" variant="default" />
    <tedi-sheet-body>
      <tedi-radio-group direction="vertical" ariaLabel="Kirjade olek" value="option-1">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" value="option-1" />
          Kõik
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" value="option-2" />
          Ainult lugemata
        </label>
      </tedi-radio-group>
      ${FULL_WIDTH_SEPARATOR}
      <tedi-radio-group direction="vertical" ariaLabel="Järjestus" value="option-1">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" value="option-1" />
          Lugemata kõige üleval
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-radio type="radio" value="option-2" />
          Kuupäeva järgi
        </label>
      </tedi-radio-group>
    </tedi-sheet-body>
    <tedi-sheet-footer fullWidth>
      <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
      <button tedi-button>Rakenda</button>
      <button tedi-button variant="secondary" tedi-sheet-footer-end aria-label="Rohkem valikuid">
        <tedi-icon name="more_vert" />
      </button>
    </tedi-sheet-footer>
  </ng-template>
</tedi-sheet>
`,
  }),
};

export const OpenBrandForVisualTest: Story = {
  ...visualTest,
  tags: ["!dev", "!autodocs"],
  render: () => ({
    template: `
<tedi-sheet [open]="true">
  <ng-template tediSheetContent>
    <tedi-sheet-header closeButton title="Vali aeg" variant="brand" collapsible />
    <tedi-sheet-body>
      <div [tediVerticalSpacing]="1">
        <tedi-form-field>
          <label tedi-label for="sheet-visual-brand-date">Kuupäev</label>
          <tedi-date-field inputId="sheet-visual-brand-date" />
        </tedi-form-field>
        <tedi-form-field>
          <label tedi-label for="sheet-visual-brand-time">Aeg</label>
          <tedi-time-field inputId="sheet-visual-brand-time" />
        </tedi-form-field>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" />
          Lisa meeldetuletus
        </label>
      </div>
    </tedi-sheet-body>
    <tedi-sheet-footer fullWidth>
      <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
      <button tedi-button>Rakenda</button>
    </tedi-sheet-footer>
  </ng-template>
</tedi-sheet>
`,
  }),
};

export const OpenSmallForVisualTest: Story = {
  ...visualTest,
  tags: ["!dev", "!autodocs"],
  render: () => ({
    template: `
<tedi-sheet [open]="true">
  <ng-template tediSheetContent padding="small" radius="card">
    <tedi-sheet-header closeButton title="Teated" variant="default">
      <tedi-tag type="primary" tedi-sheet-header-start>2</tedi-tag>
    </tedi-sheet-header>
    <tedi-sheet-body>
      <div [tediVerticalSpacing]="0.75">
        <div>
          <p tedi-text color="secondary" modifiers="small">Täna, 09:12</p>
          <p tedi-text>Teie taotlus on menetlusse võetud</p>
        </div>
        <div>
          <p tedi-text color="secondary" modifiers="small">Eile, 16:40</p>
          <p tedi-text>Uus dokument on allkirjastamiseks valmis</p>
        </div>
      </div>
    </tedi-sheet-body>
    <tedi-sheet-footer align="right">
      <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
      <button tedi-button>Rakenda</button>
    </tedi-sheet-footer>
  </ng-template>
</tedi-sheet>
`,
  }),
};

export const OpenWithoutHandleForVisualTest: Story = {
  ...visualTest,
  tags: ["!dev", "!autodocs"],
  render: () => ({
    template: `
<tedi-sheet [open]="true">
  <ng-template tediSheetContent [showHandle]="false" radius="none">
    <tedi-sheet-header title="Seaded" variant="default" titlePosition="center" [closeButton]="false">
      <button tedi-button variant="secondary" tedi-sheet-header-actions tediSheetClose aria-label="Sulge">
        <tedi-icon name="close" />
      </button>
    </tedi-sheet-header>
    <tedi-sheet-body>
      <tedi-checkbox-group direction="vertical">
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" checked />
          Näita pikkusi
        </label>
        <label tedi-label color="primary" class="flex align-items-center gap-2">
          <input tedi-checkbox type="checkbox" />
          Näita nurki
        </label>
      </tedi-checkbox-group>
    </tedi-sheet-body>
  </ng-template>
</tedi-sheet>
`,
  }),
};

export const CollapsedForVisualTest: Story = {
  ...visualTest,
  tags: ["!dev", "!autodocs"],
  render: () => ({
    template: `
<tedi-sheet [open]="true" [collapsed]="true" [closeOnBackdropClick]="false">
  <ng-template tediSheetContent [showOverlay]="false" [trapFocus]="false" [lockScroll]="false">
    <tedi-sheet-header closeButton title="Vali aeg" variant="brand" collapsible />
    <tedi-sheet-body>
      <tedi-form-field>
        <label tedi-label for="sheet-visual-collapsed-date">Kuupäev</label>
        <tedi-date-field inputId="sheet-visual-collapsed-date" />
      </tedi-form-field>
    </tedi-sheet-body>
    <tedi-sheet-footer fullWidth>
      <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
      <button tedi-button>Rakenda</button>
    </tedi-sheet-footer>
  </ng-template>
</tedi-sheet>
`,
  }),
};

export const OpenSnapPointForVisualTest: Story = {
  ...visualTest,
  tags: ["!dev", "!autodocs"],
  render: () => ({
    props: { layers: [...MAP_LAYERS, ...MAP_LAYERS] },
    template: `
<tedi-sheet [open]="true">
  <ng-template tediSheetContent [snapPoints]="[0.4, 0.9]" [defaultSnapPoint]="0">
    <tedi-sheet-header closeButton title="Kihid" variant="default" collapsible />
    <tedi-sheet-body>
      <tedi-checkbox-group direction="vertical">
        @for (layer of layers; track $index) {
          <label tedi-label color="primary" class="flex align-items-center gap-2">
            <input tedi-checkbox type="checkbox" />
            {{ layer }}
          </label>
        }
      </tedi-checkbox-group>
    </tedi-sheet-body>
  </ng-template>
</tedi-sheet>
`,
  }),
};

export const OpenScrollableForVisualTest: Story = {
  ...visualTest,
  tags: ["!dev", "!autodocs"],
  render: () => ({
    props: { fields: SCROLL_FIELDS },
    template: `
<tedi-sheet [open]="true">
  <ng-template tediSheetContent maxHeight="32rem">
    <tedi-sheet-header closeButton title="Andmete sisestamine" variant="default" />
    <tedi-sheet-body>
      <div [tediVerticalSpacing]="1">
        @for (field of fields; track field) {
          <tedi-form-field>
            <label tedi-label [attr.for]="'sheet-visual-scroll-field-' + $index">{{ field }}</label>
            <input tedi-text-field [id]="'sheet-visual-scroll-field-' + $index" />
          </tedi-form-field>
        }
      </div>
    </tedi-sheet-body>
    <tedi-sheet-footer fullWidth>
      <button tedi-button variant="secondary" tediSheetClose>Tühista</button>
      <button tedi-button>Rakenda</button>
    </tedi-sheet-footer>
  </ng-template>
</tedi-sheet>
`,
  }),
};
