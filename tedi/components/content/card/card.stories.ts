import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { CardComponent } from "./card.component";
import { CardContentComponent } from "./card-content/card-content.component";
import { CardHeaderComponent } from "./card-header/card-header.component";
import { CardIconComponent } from "./card-icon/card-icon.component";
import { CardRowComponent } from "./card-row/card-row.component";
import { CardBackground, CardBorderType } from "./card.utils";
import { TextGroupComponent } from "../text-group/text-group.component";
import { TextGroupLabelComponent } from "../text-group/text-group-label.component";
import { TextGroupValueComponent } from "../text-group/text-group-value.component";
import { TextComponent } from "../../base/text/text.component";
import { IconComponent } from "../../base/icon/icon.component";
import { AlertComponent } from "../../notifications/alert/alert.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { InfoButtonComponent } from "../../buttons/info-button/info-button.component";
import { CollapseComponent } from "../../buttons/collapse/collapse.component";
import { LinkComponent } from "../../navigation/link/link.component";
import { StatusBadgeComponent } from "../../tags/status-badge/status-badge.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";
import { ShowAtDirective } from "../../../directives/show-at/show-at.directive";

const CARD_BACKGROUNDS: CardBackground[] = [
  "primary",
  "secondary",
  "tertiary",
  "accent",
  "brand-primary",
  "brand-secondary",
  "brand-tertiary",
  "brand-quaternary",
  "danger-primary",
  "danger-secondary",
  "success-primary",
  "success-secondary",
  "info-primary",
  "info-secondary",
  "warning-primary",
  "warning-secondary",
  "neutral-primary",
  "neutral-secondary",
];

const CARD_BORDERS: CardBorderType[] = [
  ...CARD_BACKGROUNDS,
  ...CARD_BACKGROUNDS.map((color): CardBorderType => `top-${color}`),
  ...CARD_BACKGROUNDS.map((color): CardBorderType => `left-${color}`),
];

const CABBAGE_TEXT =
  "Kapsas (Brassica oleracea) on rohelise, punase (lilla) või valge (kahvaturohelise) lehestikuga kaheaastane taim, mida kasvatatakse üheaastase köögiviljana selle tihedate lehtpeade saamiseks.";

const inputArg = (summary: string, description: string, defaultValue?: string) => ({
  description,
  table: {
    category: "inputs",
    type: { summary },
    ...(defaultValue ? { defaultValue: { summary: defaultValue } } : {}),
  },
});

const named = (argTypes: Record<string, ReturnType<typeof inputArg>>) =>
  Object.fromEntries(
    Object.entries(argTypes).map(([name, def]) => [name, { name, ...def }]),
  );

const CARD_CONTENT_ARG_TYPES = named({
  background: inputArg("CardBackground", "Background color.", "undefined"),
  padding: inputArg(
    "CardPadding",
    "Content padding. A predefined rem number, or an object of vertical/horizontal or top/right/bottom/left rem values.",
    "1",
  ),
  backgroundImage: inputArg("string", "Background image url."),
  backgroundPosition: inputArg("string", "Background position for the image."),
  backgroundSize: inputArg("string", "Background size for the image."),
  backgroundRepeat: inputArg("string", "Background repeat for the image."),
  autoWidth: inputArg(
    "boolean",
    "Takes only as much width as its content needs instead of growing. Useful for icon or date cells inside tedi-card-row.",
    "false",
  ),
  xs: inputArg("CardContentInputs", "Overrides inputs on the xs breakpoint (<576px)."),
  sm: inputArg("CardContentInputs", "Overrides inputs on the sm breakpoint (≥576px)."),
  md: inputArg("CardContentInputs", "Overrides inputs on the md breakpoint (≥768px)."),
  lg: inputArg("CardContentInputs", "Overrides inputs on the lg breakpoint (≥992px)."),
  xl: inputArg("CardContentInputs", "Overrides inputs on the xl breakpoint (≥1200px)."),
  xxl: inputArg("CardContentInputs", "Overrides inputs on the xxl breakpoint (≥1400px)."),
});

const CARD_HEADER_ARG_TYPES = named({
  ...CARD_CONTENT_ARG_TYPES,
  background: inputArg(
    "CardBackground",
    "Background color. Unlike content blocks, the header does not inherit the card background.",
    "brand-primary",
  ),
});

const CARD_ICON_ARG_TYPES = named({
  type: inputArg('"default" | "brand"', "Visual type of the icon cell.", "default"),
  size: inputArg(
    '"default" | "small"',
    "Size of the icon cell. Pair the small size with a 16px icon.",
    "default",
  ),
  background: inputArg(
    "CardBackground",
    "Background color. Defaults to brand-primary for the brand type, otherwise secondary.",
    "secondary",
  ),
  padding: inputArg("CardPadding", "Content padding.", "1 (0.75 for the small size)"),
});

const CARD_ROW_ARG_TYPES = named({});

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.53.75?node-id=4442-91315&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/35d515-card" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Content/Card",
  component: CardComponent,
  subcomponents: {
    CardHeaderComponent,
    CardContentComponent,
    CardRowComponent,
    CardIconComponent,
  },
  decorators: [
    moduleMetadata({
      imports: [
        CardComponent,
        CardContentComponent,
        CardHeaderComponent,
        AlertComponent,
        CardIconComponent,
        CardRowComponent,
        TextComponent,
        TextGroupComponent,
        TextGroupLabelComponent,
        TextGroupValueComponent,
        IconComponent,
        ButtonComponent,
        InfoButtonComponent,
        CollapseComponent,
        LinkComponent,
        StatusBadgeComponent,
        SeparatorComponent,
        RowComponent,
        ColComponent,
        TooltipComponent,
        TooltipTriggerComponent,
        TooltipContentComponent,
        VerticalSpacingDirective,
        ShowAtDirective,
      ],
    }),
  ],
  parameters: {
    controls: {
      exclude: ["xs", "sm", "md", "lg", "xl", "xxl"],
    },
    docs: {
      extractArgTypes: (component: unknown) => {
        if (component === CardContentComponent) return CARD_CONTENT_ARG_TYPES;
        if (component === CardHeaderComponent) return CARD_HEADER_ARG_TYPES;
        if (component === CardIconComponent) return CARD_ICON_ARG_TYPES;
        if (component === CardRowComponent) return CARD_ROW_ARG_TYPES;
        return null;
      },
    },
  },
  argTypes: {
    background: {
      description:
        "Default background color for child content blocks. Child blocks can override it with their own background input.",
      control: { type: "select" },
      options: CARD_BACKGROUNDS,
      table: {
        category: "inputs",
        type: { summary: "CardBackground" },
        defaultValue: { summary: "undefined" },
      },
    },
    padding: {
      description:
        "Default padding for child content blocks in rems. Accepts a predefined number or an object of vertical/horizontal or top/right/bottom/left values.",
      control: { type: "select" },
      options: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3],
      table: {
        category: "inputs",
        type: { summary: "CardPadding" },
        defaultValue: { summary: "1" },
      },
    },
    borderRadius: {
      description:
        "Controls card border radius. Accepts false to remove all radius or an object to control sides or individual corners. Corner values take precedence over sides.",
      control: { type: "object" },
      table: {
        category: "inputs",
        type: { summary: "CardBorderRadius" },
        defaultValue: { summary: "undefined" },
      },
    },
    borderless: {
      description: "Removes border from card.",
      control: { type: "boolean" },
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    border: {
      description:
        "Type of border. A plain background value colors the whole border, a top- or left- prefixed value draws a thick accent border on that side.",
      control: { type: "select" },
      options: CARD_BORDERS,
      table: {
        category: "inputs",
        type: { summary: "CardBorderType" },
        defaultValue: { summary: "undefined" },
      },
    },
    xs: {
      description: "Overrides inputs on xs breakpoint (<576px).",
      control: false,
      table: { category: "inputs", type: { summary: "CardInputs" } },
    },
    sm: {
      description: "Overrides inputs on sm breakpoint (≥576px).",
      control: false,
      table: { category: "inputs", type: { summary: "CardInputs" } },
    },
    md: {
      description: "Overrides inputs on md breakpoint (≥768px).",
      control: false,
      table: { category: "inputs", type: { summary: "CardInputs" } },
    },
    lg: {
      description: "Overrides inputs on lg breakpoint (≥992px).",
      control: false,
      table: { category: "inputs", type: { summary: "CardInputs" } },
    },
    xl: {
      description: "Overrides inputs on xl breakpoint (≥1200px).",
      control: false,
      table: { category: "inputs", type: { summary: "CardInputs" } },
    },
    xxl: {
      description: "Overrides inputs on xxl breakpoint (≥1400px).",
      control: false,
      table: { category: "inputs", type: { summary: "CardInputs" } },
    },
  },
} as Meta<CardComponent>;

type Story = StoryObj<CardComponent>;

export const Default: Story = {
  args: {
    borderless: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-card ${argsToTemplate(args)}>
        <tedi-card-content>
          <p tedi-text color="secondary">Kirjeldus</p>
        </tedi-card-content>
      </tedi-card>
    `,
  }),
};

export const HeaderTypes: Story = {
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="1">
        <tedi-card>
          <tedi-card-header background="primary">
            <h3 tedi-text>Pealkiri</h3>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="primary">
            <h3 tedi-text>Pealkiri</h3>
            <p tedi-text color="secondary">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="primary">
            <div class="flex align-items-center justify-content-between gap-3">
              <h3 tedi-text>Pealkiri</h3>
              <button tedi-button>Lisa uus</button>
            </div>
            <p tedi-text color="secondary">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="primary">
            <div class="flex align-items-center justify-content-between gap-3">
              <h3 tedi-text>Pealkiri</h3>
              <div class="flex gap-2">
                <tedi-tooltip>
                  <tedi-tooltip-trigger>
                    <button tedi-button variant="secondary" aria-label="Jaga">
                      <tedi-icon name="share" />
                      <span *showAt="'sm'">Jaga</span>
                    </button>
                  </tedi-tooltip-trigger>
                  <tedi-tooltip-content>Jaga</tedi-tooltip-content>
                </tedi-tooltip>
                <tedi-tooltip>
                  <tedi-tooltip-trigger>
                    <button tedi-button variant="secondary" aria-label="Prindi">
                      <tedi-icon name="print" />
                      <span *showAt="'sm'">Prindi</span>
                    </button>
                  </tedi-tooltip-trigger>
                  <tedi-tooltip-content>Prindi</tedi-tooltip-content>
                </tedi-tooltip>
              </div>
            </div>
            <p tedi-text color="secondary">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="primary">
            <div class="flex align-items-center justify-content-between gap-3">
              <h3 tedi-text>Pealkiri</h3>
              <a tedi-link href="#">
                Vaata tulemust
                <tedi-icon name="arrow_right_alt" />
              </a>
            </div>
            <p tedi-text color="secondary">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="primary">
            <div class="flex align-items-center justify-content-between gap-3">
              <h3 tedi-text>Pealkiri</h3>
              <tedi-status-badge color="brand" text="Kinnitatud" />
            </div>
            <p tedi-text color="secondary">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="secondary">
            <div class="flex align-items-center justify-content-between gap-3">
              <h3 tedi-text>Pealkiri</h3>
              <button tedi-button>Lisa uus</button>
            </div>
            <p tedi-text color="secondary">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="tertiary">
            <div class="flex align-items-center justify-content-between gap-3">
              <h3 tedi-text>Pealkiri</h3>
              <button tedi-button>Lisa uus</button>
            </div>
            <p tedi-text color="secondary">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="brand-primary">
            <div class="flex align-items-center justify-content-between gap-3">
              <h3 tedi-text color="white">Pealkiri</h3>
              <button tedi-button variant="primary-inverted">Lisa uus</button>
            </div>
            <p tedi-text color="white">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="brand-secondary">
            <div class="flex align-items-center justify-content-between gap-3">
              <h3 tedi-text color="white">Pealkiri</h3>
              <button tedi-button variant="primary-inverted">Lisa uus</button>
            </div>
            <p tedi-text color="white">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
      </div>
    `,
  }),
};

export const CardSimple: Story = {
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="1">
        <tedi-card>
          <tedi-card-content>
            <p tedi-text color="secondary">Kirjeldus</p>
          </tedi-card-content>
        </tedi-card>
        <tedi-card>
          <tedi-card-content>
            <p tedi-text color="secondary">Kirjeldus</p>
            <tedi-status-badge color="brand" text="Kinnitatud" />
          </tedi-card-content>
        </tedi-card>
        <tedi-card>
          <tedi-card-content>
            <p tedi-text modifiers="bold">Pealkiri</p>
            <div class="flex align-items-center justify-content-between gap-3">
              <p tedi-text color="secondary">Kirjeldus</p>
              <tedi-status-badge color="brand" text="Kinnitatud" />
            </div>
          </tedi-card-content>
        </tedi-card>
        <tedi-card>
          <tedi-card-content>
            <div class="flex align-items-center gap-3">
              <tedi-icon name="monitor_heart" />
              <p tedi-text color="secondary">Kirjeldus</p>
            </div>
          </tedi-card-content>
        </tedi-card>
        <tedi-card>
          <tedi-card-content>
            <div class="flex align-items-center gap-3">
              <tedi-icon name="monitor_heart" />
              <div>
                <p tedi-text modifiers="bold">Pealkiri</p>
                <p tedi-text color="secondary">Kirjeldus</p>
              </div>
            </div>
          </tedi-card-content>
        </tedi-card>
        <tedi-card>
          <tedi-card-content>
            <div class="flex align-items-center justify-content-between gap-3">
              <div class="flex align-items-center gap-3">
                <tedi-icon name="monitor_heart" />
                <div>
                  <p tedi-text modifiers="bold">Pealkiri</p>
                  <p tedi-text color="secondary">Kirjeldus</p>
                </div>
              </div>
              <button tedi-button>Lisa uus</button>
            </div>
          </tedi-card-content>
        </tedi-card>
        <tedi-row [cols]="1" [lg]="{ cols: 2 }">
          <tedi-col>
            <tedi-card>
              <tedi-card-content>
                <p tedi-text modifiers="bold">Pealkiri</p>
                <p tedi-text color="secondary">Kirjeldus</p>
                <tedi-separator [spacing]="1.5" />
                <div class="flex justify-content-center">
                  <button tedi-button>Lisa uus</button>
                </div>
              </tedi-card-content>
            </tedi-card>
          </tedi-col>
        </tedi-row>
      </div>
    `,
  }),
};

export const CardInfo: Story = {
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="1">
        <tedi-card [padding]="{ vertical: 0.75, horizontal: 1.25 }">
          <tedi-card-content background="brand-tertiary">
            <div class="flex align-items-center gap-3">
              <tedi-icon name="assignment_late" background="primary" />
              <div>
                <p tedi-text modifiers="bold">Pealkiri</p>
                <p tedi-text color="secondary">Kirjeldus</p>
              </div>
            </div>
          </tedi-card-content>
        </tedi-card>
        <tedi-card [padding]="{ vertical: 0.75, horizontal: 1.25 }">
          <tedi-card-content
            background="brand-tertiary"
            backgroundImage="card-background-example.svg"
            backgroundSize="75px"
            backgroundPosition="right center"
            backgroundRepeat="no-repeat"
          >
            <div class="flex align-items-center gap-3">
              <tedi-icon name="assignment_late" background="primary" />
              <div>
                <p tedi-text modifiers="bold">Pealkiri</p>
                <p tedi-text color="secondary">Kirjeldus</p>
              </div>
            </div>
          </tedi-card-content>
        </tedi-card>
        <tedi-card border="accent" [padding]="{ vertical: 0.75, horizontal: 1.25 }">
          <tedi-card-content background="accent">
            <div class="flex align-items-center gap-3">
              <tedi-icon name="assignment_late" background="primary" />
              <div>
                <p tedi-text modifiers="bold">Pealkiri</p>
                <p tedi-text color="secondary">Kirjeldus</p>
              </div>
            </div>
          </tedi-card-content>
        </tedi-card>
        <tedi-card border="neutral-primary" [padding]="{ vertical: 0.75, horizontal: 1.25 }">
          <tedi-card-content background="neutral-primary">
            <div class="flex align-items-center gap-3">
              <tedi-icon name="calendar_today" background="primary" variant="filled" />
              <p tedi-text color="secondary">Haigusleht: <strong>118.</strong> päev</p>
            </div>
          </tedi-card-content>
        </tedi-card>
      </div>
    `,
  }),
};

export const AlternativeCards: Story = {
  render: () => ({
    template: `
      <div [tediVerticalSpacing]="1.5">
        <tedi-row [cols]="1" [lg]="{ cols: 2 }" [gap]="2">
          <tedi-col>
            <tedi-card>
              <tedi-card-content>
                <div [tediVerticalSpacing]="0.5">
                  <div class="flex align-items-center gap-3">
                    <tedi-icon name="assignment_ind" color="brand" />
                    <h3 tedi-text color="brand">Minu tahteavaldus</h3>
                  </div>
                  <p tedi-text color="secondary">Näiteks elundidoonorlus ja vereülekanne</p>
                </div>
                <tedi-separator [spacing]="1" />
                <button tedi-button variant="secondary">Vaata tahteavaldusi</button>
              </tedi-card-content>
            </tedi-card>
          </tedi-col>
          <tedi-col>
            <tedi-card>
              <tedi-card-content>
                <div [tediVerticalSpacing]="1">
                  <div [tediVerticalSpacing]="0.5">
                    <p tedi-text modifiers="bold">Pealkiri</p>
                    <p tedi-text color="secondary">Näiteks elundidoonorlus ja vereülekanne</p>
                  </div>
                  <button tedi-button variant="secondary">Vaata tahteavaldusi</button>
                </div>
              </tedi-card-content>
            </tedi-card>
          </tedi-col>
          <tedi-col>
            <tedi-card>
              <tedi-card-header background="brand-primary">
                <h3 tedi-text color="white">Lühike pealkiri</h3>
              </tedi-card-header>
              <tedi-card-content>
                <div [tediVerticalSpacing]="1">
                  <p tedi-text color="secondary">Näiteks elundidoonorlus ja vereülekanne</p>
                  <button tedi-button variant="secondary">Vaata tahteavaldusi</button>
                </div>
              </tedi-card-content>
            </tedi-card>
          </tedi-col>
          <tedi-col>
            <tedi-card>
              <tedi-card-content>
                <div [tediVerticalSpacing]="1">
                  <p tedi-text color="secondary">Näiteks elundidoonorlus ja vereülekanne</p>
                  <button tedi-button variant="secondary">Vaata tahteavaldusi</button>
                </div>
              </tedi-card-content>
            </tedi-card>
          </tedi-col>
        </tedi-row>
        <tedi-card border="left-danger-secondary">
          <tedi-card-content>
            <p tedi-text>Tähtis kaart</p>
          </tedi-card-content>
        </tedi-card>
      </div>
    `,
  }),
};

export const Spacing: Story = {
  render: () => ({
    props: { CABBAGE_TEXT },
    template: `
      <tedi-row [cols]="1" [sm]="{ cols: 2 }" [lg]="{ cols: 3 }" [gap]="2">
        <tedi-col>
          <tedi-card>
            <tedi-card-content [padding]="0.25">
              <p tedi-text>{{ CABBAGE_TEXT }}</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card>
            <tedi-card-content [padding]="0.5">
              <p tedi-text>{{ CABBAGE_TEXT }}</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card>
            <tedi-card-content [padding]="0.75">
              <p tedi-text>{{ CABBAGE_TEXT }}</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card>
            <tedi-card-content [padding]="1">
              <p tedi-text>{{ CABBAGE_TEXT }}</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card>
            <tedi-card-content [padding]="1.5">
              <p tedi-text>{{ CABBAGE_TEXT }}</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const Border: Story = {
  render: () => ({
    template: `
      <tedi-row [cols]="1" [lg]="{ cols: 2 }" [gap]="2">
        <tedi-col>
          <tedi-card>
            <tedi-card-content>
              <p tedi-text>Äärtega</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderless]="true">
            <tedi-card-content>
              <p tedi-text>Ilma äärteta</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const BorderRadius: Story = {
  render: () => ({
    template: `
      <tedi-row [cols]="1" [lg]="{ cols: 4 }" [gap]="2">
        <tedi-col>
          <tedi-card>
            <tedi-card-content>
              <p tedi-text>Vaikimisi nurgaraadius</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="false">
            <tedi-card-content>
              <p tedi-text>Nurgaraadius puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="{ top: false }">
            <tedi-card-content>
              <p tedi-text>Ülemine nurgaraadius puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="{ bottom: false }">
            <tedi-card-content>
              <p tedi-text>Alumine nurgaraadius puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="{ left: false }">
            <tedi-card-content>
              <p tedi-text>Vasak nurgaraadius puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="{ right: false }">
            <tedi-card-content>
              <p tedi-text>Parem nurgaraadius puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="{ topLeft: false }">
            <tedi-card-content>
              <p tedi-text>Ülemine vasak nurgaraadius puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="{ bottomRight: false }">
            <tedi-card-content>
              <p tedi-text>Alumine parem nurgaraadius puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

const BACKGROUND_EXAMPLES: { name: CardBackground; light: boolean }[] =
  CARD_BACKGROUNDS.map((name) => ({
    name,
    light: [
      "brand-primary",
      "brand-secondary",
      "info-secondary",
      "success-secondary",
      "danger-secondary",
      "warning-secondary",
      "neutral-secondary",
    ].includes(name),
  }));

export const Backgrounds: Story = {
  render: () => ({
    props: { backgrounds: BACKGROUND_EXAMPLES, CABBAGE_TEXT },
    template: `
      <tedi-row [cols]="1" [sm]="{ cols: 2 }" [lg]="{ cols: 3 }" [gap]="2">
        @for (bg of backgrounds; track bg.name) {
          <tedi-card [background]="bg.name">
            <tedi-card-content>
              <p tedi-text [color]="bg.light ? 'white' : 'primary'">{{ CABBAGE_TEXT }}</p>
            </tedi-card-content>
          </tedi-card>
        }
      </tedi-row>
    `,
  }),
};

export const MultipleContent: Story = {
  render: () => ({
    template: `
      <tedi-card>
        <tedi-card-header background="brand-primary">
          <h3 tedi-text color="white">Pealkiri</h3>
        </tedi-card-header>
        <tedi-card-content>
          <p tedi-text>Esimene sisuplokk</p>
        </tedi-card-content>
        <tedi-separator />
        <tedi-card-content>
          <p tedi-text>Teine sisuplokk</p>
        </tedi-card-content>
        <tedi-separator />
        <tedi-card-content>
          <p tedi-text>Kolmas sisuplokk</p>
        </tedi-card-content>
      </tedi-card>
    `,
  }),
};

export const NestedCards: Story = {
  render: () => ({
    template: `
      <tedi-card>
        <tedi-card-header background="brand-primary">
          <h3 tedi-text color="white">Pealkiri</h3>
        </tedi-card-header>
        <tedi-card-content>
          <div [tediVerticalSpacing]="1">
            <h4 tedi-text color="brand">Püsiravi</h4>
            <p tedi-text>Sinu püsiravimid ja meditsiiniseadmed, mis on väljastatud viimase 6 kuu jooksul.</p>
            <h5 tedi-text>Ravimid</h5>
            <tedi-card [borderless]="true">
              <tedi-card-content background="brand-tertiary">
                <tedi-row [cols]="1" [md]="{ cols: 3 }" [gap]="2">
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>HJERTEMAGNYL TBL 150MG+21MG N100</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>150 MG+21 MG</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>Pidev ravi: 1 tk 1 kord nädalas</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                </tedi-row>
              </tedi-card-content>
            </tedi-card>
            <tedi-card [borderless]="true">
              <tedi-card-content background="brand-tertiary">
                <tedi-row [cols]="1" [md]="{ cols: 3 }" [gap]="2">
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>HJERTEMAGNYL TBL 150MG+21MG N100</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>150 MG+21 MG</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>Pidev ravi: 1 tk 1 kord nädalas</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                </tedi-row>
              </tedi-card-content>
            </tedi-card>
            <tedi-card [borderless]="true">
              <tedi-card-content background="brand-tertiary">
                <tedi-row [cols]="1" [md]="{ cols: 3 }" [gap]="2">
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>HJERTEMAGNYL TBL 150MG+21MG N100</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>150 MG+21 MG</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>Pidev ravi: 1 tk 1 kord nädalas</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                </tedi-row>
              </tedi-card-content>
            </tedi-card>
          </div>
        </tedi-card-content>
        <tedi-separator />
        <tedi-card-content>
          <div [tediVerticalSpacing]="1">
            <h4 tedi-text color="brand">Ajutine ravi</h4>
            <p tedi-text>Sinu ravimid ja meditsiiniseadmed, mida kasutatakse vajadusel või teatud perioodil.</p>
            <h5 tedi-text>Ravimid</h5>
            <tedi-card [borderless]="true">
              <tedi-card-content background="brand-tertiary">
                <tedi-row [cols]="1" [md]="{ cols: 3 }" [gap]="2">
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>HJERTEMAGNYL TBL 150MG+21MG N100</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>150 MG+21 MG</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>Pidev ravi: 1 tk 1 kord nädalas</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                </tedi-row>
              </tedi-card-content>
            </tedi-card>
            <tedi-card [borderless]="true">
              <tedi-card-content background="brand-tertiary">
                <tedi-row [cols]="1" [md]="{ cols: 3 }" [gap]="2">
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>HJERTEMAGNYL TBL 150MG+21MG N100</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>150 MG+21 MG</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                  <tedi-col>
                    <tedi-text-group type="vertical">
                      <tedi-text-group-label>Silt</tedi-text-group-label>
                      <tedi-text-group-value>Pidev ravi: 1 tk 1 kord nädalas</tedi-text-group-value>
                    </tedi-text-group>
                  </tedi-col>
                </tedi-row>
              </tedi-card-content>
            </tedi-card>
          </div>
        </tedi-card-content>
      </tedi-card>
    `,
  }),
};

export const WithDottedSeparator: Story = {
  render: () => ({
    template: `
      <tedi-card>
        <tedi-card-row>
          <tedi-card-icon>
            <tedi-icon name="monitor_heart" />
          </tedi-card-icon>
          <tedi-separator axis="vertical" color="accent" variant="dotted-small" size="auto" />
          <tedi-card-content class="flex align-items-center justify-content-between gap-3">
            <div>
              <p tedi-text modifiers="bold">COVID-19</p>
              <tedi-collapse openText="Näita kokkuvõtet" closeText="Peida kokkuvõte">
                <p tedi-text color="secondary">
                  COVID-19 vastane immuniseerimine, lõpetatud 08.12.2024.
                </p>
              </tedi-collapse>
            </div>
            <a tedi-link href="#">
              <span *showAt="'sm'" aria-hidden="true">Vaata</span>
              <tedi-icon name="arrow_right_alt" label="Vaata" />
            </a>
          </tedi-card-content>
        </tedi-card-row>
        <tedi-separator />
        <tedi-card-row>
          <tedi-card-icon>
            <tedi-icon name="monitor_heart" />
          </tedi-card-icon>
          <tedi-separator axis="vertical" color="accent" variant="dotted-small" size="auto" />
          <tedi-card-content class="flex align-items-center justify-content-between gap-3">
            <div>
              <p tedi-text modifiers="bold">COVID-19</p>
              <tedi-collapse openText="Näita kokkuvõtet" closeText="Peida kokkuvõte">
                <p tedi-text color="secondary">
                  COVID-19 vastane immuniseerimine, lõpetatud 08.12.2024.
                </p>
              </tedi-collapse>
            </div>
            <a tedi-link href="#">
              <span *showAt="'sm'" aria-hidden="true">Vaata</span>
              <tedi-icon name="arrow_right_alt" label="Vaata" />
            </a>
          </tedi-card-content>
        </tedi-card-row>
        <tedi-separator />
        <tedi-card-row>
          <tedi-card-icon>
            <tedi-icon name="monitor_heart" />
          </tedi-card-icon>
          <tedi-separator axis="vertical" color="accent" variant="dotted-small" size="auto" />
          <tedi-card-content class="flex align-items-center justify-content-between gap-3">
            <div>
              <p tedi-text modifiers="bold">COVID-19</p>
              <tedi-collapse openText="Näita kokkuvõtet" closeText="Peida kokkuvõte">
                <p tedi-text color="secondary">
                  COVID-19 vastane immuniseerimine, lõpetatud 08.12.2024.
                </p>
              </tedi-collapse>
            </div>
            <a tedi-link href="#">
              <span *showAt="'sm'" aria-hidden="true">Vaata</span>
              <tedi-icon name="arrow_right_alt" label="Vaata" />
            </a>
          </tedi-card-content>
        </tedi-card-row>
      </tedi-card>
    `,
  }),
};

export const CardIcon: Story = {
  render: () => ({
    template: `
      <tedi-row [cols]="1" [lg]="{ cols: 2 }" [gap]="2">
        <tedi-card>
          <tedi-card-row>
            <tedi-card-icon>
              <tedi-icon name="monitor_heart" />
            </tedi-card-icon>
            <tedi-card-content>
              <p tedi-text modifiers="bold">Vaikimisi</p>
              <p tedi-text color="secondary">Kirjeldus</p>
            </tedi-card-content>
          </tedi-card-row>
        </tedi-card>
        <tedi-card>
          <tedi-card-row>
            <tedi-card-icon type="brand">
              <tedi-icon name="monitor_heart" />
            </tedi-card-icon>
            <tedi-card-content>
              <p tedi-text modifiers="bold">Bränd</p>
              <p tedi-text color="secondary">Kirjeldus</p>
            </tedi-card-content>
          </tedi-card-row>
        </tedi-card>
        <tedi-card>
          <tedi-card-row>
            <tedi-card-icon size="small">
              <tedi-icon name="monitor_heart" [size]="16" />
            </tedi-card-icon>
            <tedi-card-content>
              <p tedi-text modifiers="bold">Väike</p>
              <p tedi-text color="secondary">Kirjeldus</p>
            </tedi-card-content>
          </tedi-card-row>
        </tedi-card>
        <tedi-card>
          <tedi-card-row>
            <tedi-card-icon type="brand" size="small">
              <tedi-icon name="monitor_heart" [size]="16" />
            </tedi-card-icon>
            <tedi-card-content>
              <p tedi-text modifiers="bold">Väike bränd</p>
              <p tedi-text color="secondary">Kirjeldus</p>
            </tedi-card-content>
          </tedi-card-row>
        </tedi-card>
      </tedi-row>
    `,
  }),
};

export const PrescriptionExample: Story = {
  render: () => ({
    template: `
      <tedi-card background="secondary">
        <tedi-card-row>
          <tedi-card-icon type="brand">
            <tedi-icon name="prescriptions" />
          </tedi-card-icon>
          <tedi-card-content>
            <div [tediVerticalSpacing]="1">
              <div class="flex flex-wrap justify-content-between gap-3">
                <div class="flex flex-wrap align-items-center gap-2">
                  <p tedi-text modifiers="bold">Amlodipiin 50mg:</p>
                  <p tedi-text>Amlodipin-rathiopharm 50mg</p>
                  <tedi-tooltip>
                    <tedi-tooltip-trigger>
                      <button tedi-info-button></button>
                    </tedi-tooltip-trigger>
                    <tedi-tooltip-content>
                      Toimeaine: amlodipiin. Kasutatakse kõrge vererõhu ja stenokardia raviks.
                    </tedi-tooltip-content>
                  </tedi-tooltip>
                </div>
                <div [tediVerticalSpacing]="0.25">
                  <p tedi-text><a tedi-link href="#">Vaata retsepti</a></p>
                  <p tedi-text modifiers="small" color="secondary">Kehtiv kuni 12.05.2024</p>
                </div>
              </div>
              <tedi-collapse openText="Välja ostmata 5 / 6 retsepti" closeText="Välja ostmata 5 / 6 retsepti" [defaultOpen]="true">
              <tedi-row [cols]="1" [lg]="{ cols: 2 }" [gap]="2">
                <tedi-card>
                  <tedi-card-row>
                    <tedi-card-icon type="brand" size="small">
                      <tedi-icon name="prescriptions" [size]="16" />
                    </tedi-card-icon>
                    <tedi-card-content [padding]="0.5" class="flex align-items-center gap-2">
                      <p tedi-text>Amlodipiin</p>
                      <tedi-separator axis="vertical" size="auto" />
                      <p tedi-text>30 tk</p>
                    </tedi-card-content>
                  </tedi-card-row>
                </tedi-card>
                <tedi-card>
                  <tedi-card-row>
                    <tedi-card-icon type="brand" size="small">
                      <tedi-icon name="prescriptions" [size]="16" />
                    </tedi-card-icon>
                    <tedi-card-content [padding]="0.5" class="flex align-items-center gap-2">
                      <p tedi-text>Amlodipiin</p>
                      <tedi-separator axis="vertical" size="auto" />
                      <p tedi-text>30 tk</p>
                    </tedi-card-content>
                  </tedi-card-row>
                </tedi-card>
                <tedi-card>
                  <tedi-card-row>
                    <tedi-card-icon type="brand" size="small">
                      <tedi-icon name="prescriptions" [size]="16" />
                    </tedi-card-icon>
                    <tedi-card-content [padding]="0.5" class="flex align-items-center gap-2">
                      <p tedi-text>Amlodipiin</p>
                      <tedi-separator axis="vertical" size="auto" />
                      <p tedi-text>30 tk</p>
                    </tedi-card-content>
                  </tedi-card-row>
                </tedi-card>
                <tedi-card>
                  <tedi-card-row>
                    <tedi-card-icon size="small">
                      <tedi-icon name="check_box" [size]="16" />
                    </tedi-card-icon>
                    <tedi-separator axis="vertical" size="auto" />
                    <tedi-card-content [padding]="0.5" class="flex flex-wrap align-items-center gap-2">
                      <p tedi-text>Amlodipiin</p>
                      <tedi-separator axis="vertical" size="auto" />
                      <p tedi-text>30 tk</p>
                      <tedi-status-badge text="Ostetud 12.04.2024" />
                    </tedi-card-content>
                  </tedi-card-row>
                </tedi-card>
              </tedi-row>
              </tedi-collapse>
            </div>
          </tedi-card-content>
        </tedi-card-row>
      </tedi-card>
    `,
  }),
};

export const SplitCardBody: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**Tip**: `tedi-card-row` lays its blocks out in a row by default. Since it is a flex container, you can change its direction at lower breakpoints with flex-direction utility classes. Here `class=\"flex-column flex-sm-row\"` stacks the two content blocks vertically below the `sm` breakpoint",
      },
    },
  },
  render: () => ({
    template: `
      <tedi-card>
        <tedi-card-row class="flex-column flex-sm-row">
          <tedi-card-content>
            <p tedi-text>Vasak</p>
            <p tedi-text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
              convallis mollis augue, vitae aliquet elit congue a. Donec
              vitae sagittis odio, et maximus nulla. Quisque metus augue,
              euismod non auctor sed, consequat in ligula.
            </p>
          </tedi-card-content>
          <tedi-card-content background="secondary">
            <p tedi-text>Parem</p>
          </tedi-card-content>
        </tedi-card-row>
      </tedi-card>
    `,
  }),
};

export const TwoTonedCard: Story = {
  render: () => ({
    template: `
      <tedi-card>
        <tedi-card-row>
          <tedi-card-icon>
            <tedi-icon name="straighten" />
          </tedi-card-icon>
          <tedi-separator axis="vertical" size="auto" />
          <tedi-card-content>
            <p tedi-text modifiers="bold">Statistika: x kg</p>
            <p tedi-text>Kirjeldus</p>
          </tedi-card-content>
        </tedi-card-row>
      </tedi-card>
    `,
  }),
};

const LOREM_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab ad expedita iste itaque laborum magnam non nulla tempora ullam! A consequuntur dicta et incidunt nisi pariatur sapiente, temporibus unde voluptatem?";

export const EqualHeight: Story = {
  render: () => ({
    props: { LOREM_TEXT },
    template: `
      <tedi-row [cols]="1" [lg]="{ cols: 3 }" [gap]="2">
        <tedi-card>
          <tedi-card-header background="brand-primary">
            <h2 tedi-text color="white">Pikema sisuga kaart</h2>
          </tedi-card-header>
          <tedi-card-content class="flex flex-column justify-content-between gap-3">
            <div [tediVerticalSpacing]="1">
              <p tedi-text>{{ LOREM_TEXT }}</p>
              <p tedi-text>{{ LOREM_TEXT }}</p>
            </div>
            <div>
              <button tedi-button>Vaata lähemalt</button>
            </div>
          </tedi-card-content>
        </tedi-card>
        <tedi-col>
          <tedi-card>
            <tedi-card-header background="brand-primary">
              <h2 tedi-text color="white">Venitamata kaart</h2>
            </tedi-card-header>
            <tedi-card-content class="flex flex-column justify-content-between gap-3">
              <p tedi-text>{{ LOREM_TEXT }}</p>
              <div>
                <button tedi-button>Vaata lähemalt</button>
              </div>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-card>
          <tedi-card-header background="brand-primary">
            <h2 tedi-text color="white">Venitatud sisuga kaart</h2>
          </tedi-card-header>
          <tedi-card-content class="flex flex-column justify-content-between gap-3">
            <p tedi-text>{{ LOREM_TEXT }}</p>
            <div>
              <button tedi-button>Vaata lähemalt</button>
            </div>
          </tedi-card-content>
        </tedi-card>
      </tedi-row>
    `,
  }),
};

export const WithNotification: Story = {
  render: () => ({
    template: `
      <tedi-card [padding]="0.75">
        <tedi-card-header background="primary">
          <h3 tedi-text>Kaardi pealkiri</h3>
        </tedi-card-header>
        <tedi-alert variant="noSideBorders">
          <p tedi-text>Kaardi teavitus</p>
        </tedi-alert>
        <tedi-card-content>
          <p tedi-text color="secondary">Kirjeldus</p>
        </tedi-card-content>
      </tedi-card>
    `,
  }),
};

export const BreakpointProps: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Padding and background change at md and lg breakpoints. Resize the viewport to see the effect.",
      },
    },
  },
  render: () => ({
    props: { CABBAGE_TEXT },
    template: `
      <tedi-card
        [padding]="0.5"
        [md]="{ padding: 1.5, background: 'brand-tertiary' }"
        [lg]="{ padding: 2.5, background: 'success-primary' }"
      >
        <tedi-card-content>
          <p tedi-text>{{ CABBAGE_TEXT }}</p>
        </tedi-card-content>
      </tedi-card>
    `,
  }),
};
