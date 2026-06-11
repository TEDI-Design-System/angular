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
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";

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

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.53.75?node-id=4442-91315&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/35d515-card" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Content/Card",
  component: CardComponent,
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
        VerticalSpacingDirective,
      ],
    }),
  ],
  parameters: {
    controls: {
      exclude: ["xs", "sm", "md", "lg", "xl", "xxl"],
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
      options: [0, 0.5, 0.75, 1, 1.5, 2, 2.5, 3],
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
              <button tedi-button>Loo</button>
            </div>
            <p tedi-text color="secondary">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="primary">
            <div class="flex align-items-center justify-content-between gap-3">
              <h3 tedi-text>Pealkiri</h3>
              <div class="flex gap-3">
                <button tedi-button variant="secondary">
                  <tedi-icon name="share" />
                  Jaga
                </button>
                <button tedi-button variant="secondary">
                  <tedi-icon name="print" />
                  Prindi
                </button>
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
              <button tedi-button>Loo</button>
            </div>
            <p tedi-text color="secondary">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="tertiary">
            <div class="flex align-items-center justify-content-between gap-3">
              <h3 tedi-text>Pealkiri</h3>
              <button tedi-button>Loo</button>
            </div>
            <p tedi-text color="secondary">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="brand-primary">
            <div class="flex align-items-center justify-content-between gap-3">
              <h3 tedi-text color="white">Pealkiri</h3>
              <button tedi-button variant="primary-inverted">Loo</button>
            </div>
            <p tedi-text color="white">Kirjeldus</p>
          </tedi-card-header>
        </tedi-card>
        <tedi-card>
          <tedi-card-header background="brand-secondary">
            <div class="flex align-items-center justify-content-between gap-3">
              <h3 tedi-text color="white">Pealkiri</h3>
              <button tedi-button variant="primary-inverted">Loo</button>
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
              <button tedi-button>Loo</button>
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
                  <button tedi-button>Loo</button>
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
        <tedi-card>
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
        <tedi-card>
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
        <tedi-card border="accent">
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
        <tedi-card border="neutral-primary">
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
      <div [tediVerticalSpacing]="1">
        <tedi-row [cols]="1" [lg]="{ cols: 2 }" [gap]="1">
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
      <tedi-row [cols]="1" [lg]="{ cols: 3 }" [gap]="1">
        <tedi-col>
          <tedi-card>
            <tedi-card-content [padding]="0.5">
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
      <tedi-row [cols]="1" [lg]="{ cols: 2 }" [gap]="1">
        <tedi-col>
          <tedi-card>
            <tedi-card-content>
              <p tedi-text>Äärisega</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderless]="true">
            <tedi-card-content>
              <p tedi-text>Ääriseta</p>
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
      <tedi-row [cols]="1" [lg]="{ cols: 4 }" [gap]="1">
        <tedi-col>
          <tedi-card>
            <tedi-card-content>
              <p tedi-text>Vaikimisi raadius</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="false">
            <tedi-card-content>
              <p tedi-text>Raadius puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="{ top: false }">
            <tedi-card-content>
              <p tedi-text>Ülemine raadius puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="{ bottom: false }">
            <tedi-card-content>
              <p tedi-text>Alumine raadius puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="{ left: false }">
            <tedi-card-content>
              <p tedi-text>Vasak raadius puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="{ right: false }">
            <tedi-card-content>
              <p tedi-text>Parem raadius puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="{ topLeft: false }">
            <tedi-card-content>
              <p tedi-text>Vasak ülanurk puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
        <tedi-col>
          <tedi-card [borderRadius]="{ bottomRight: false }">
            <tedi-card-content>
              <p tedi-text>Parem alanurk puudub</p>
            </tedi-card-content>
          </tedi-card>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const Backgrounds: Story = {
  render: () => ({
    props: { CABBAGE_TEXT },
    template: `
      <tedi-row [cols]="1" [lg]="{ cols: 3 }" [gap]="1">
        <tedi-card background="primary">
          <tedi-card-content>
            <p tedi-text>{{ CABBAGE_TEXT }}</p>
          </tedi-card-content>
        </tedi-card>
        <tedi-card background="secondary" [borderless]="true">
          <tedi-card-content>
            <p tedi-text>{{ CABBAGE_TEXT }}</p>
          </tedi-card-content>
        </tedi-card>
        <tedi-card background="tertiary" [borderless]="true">
          <tedi-card-content>
            <p tedi-text>{{ CABBAGE_TEXT }}</p>
          </tedi-card-content>
        </tedi-card>
        <tedi-card background="brand-primary" [borderless]="true">
          <tedi-card-content>
            <p tedi-text color="white">{{ CABBAGE_TEXT }}</p>
          </tedi-card-content>
        </tedi-card>
        <tedi-card background="brand-secondary" [borderless]="true">
          <tedi-card-content>
            <p tedi-text color="white">{{ CABBAGE_TEXT }}</p>
          </tedi-card-content>
        </tedi-card>
        <tedi-card background="brand-tertiary" [borderless]="true">
          <tedi-card-content>
            <p tedi-text>{{ CABBAGE_TEXT }}</p>
          </tedi-card-content>
        </tedi-card>
        <tedi-card background="brand-quaternary" [borderless]="true">
          <tedi-card-content>
            <p tedi-text>{{ CABBAGE_TEXT }}</p>
          </tedi-card-content>
        </tedi-card>
        <tedi-card background="success-primary" [borderless]="true">
          <tedi-card-content>
            <p tedi-text>{{ CABBAGE_TEXT }}</p>
          </tedi-card-content>
        </tedi-card>
        <tedi-card background="accent" [borderless]="true">
          <tedi-card-content>
            <p tedi-text>{{ CABBAGE_TEXT }}</p>
          </tedi-card-content>
        </tedi-card>
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
                <tedi-row [cols]="1" [md]="{ cols: 3 }" [gap]="1">
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
                <tedi-row [cols]="1" [md]="{ cols: 3 }" [gap]="1">
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
                <tedi-row [cols]="1" [md]="{ cols: 3 }" [gap]="1">
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
                <tedi-row [cols]="1" [md]="{ cols: 3 }" [gap]="1">
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
                <tedi-row [cols]="1" [md]="{ cols: 3 }" [gap]="1">
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
              Vaata
              <tedi-icon name="arrow_right_alt" />
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
              Vaata
              <tedi-icon name="arrow_right_alt" />
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
              Vaata
              <tedi-icon name="arrow_right_alt" />
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
      <tedi-row [cols]="1" [lg]="{ cols: 2 }" [gap]="1">
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
              <div class="flex justify-content-between gap-3">
                <div class="flex align-items-center gap-2">
                  <p tedi-text modifiers="bold">Amlodipiin 50mg:</p>
                  <p tedi-text>Amlodipin-rathiopharm 50mg</p>
                  <button tedi-info-button></button>
                </div>
                <div [tediVerticalSpacing]="0.25" class="text-right">
                  <p tedi-text><a tedi-link href="#">Vaata retsepti</a></p>
                  <p tedi-text modifiers="small" color="secondary">Kehtiv kuni 12.05.2024</p>
                </div>
              </div>
              <tedi-collapse openText="Välja ostmata 5 / 6 retsepti" closeText="Välja ostmata 5 / 6 retsepti" [defaultOpen]="true">
              <tedi-row [cols]="1" [lg]="{ cols: 2 }" [gap]="1">
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
                    <tedi-card-content [padding]="0.5" class="flex align-items-center gap-2">
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
  render: () => ({
    template: `
      <tedi-card>
        <tedi-card-row>
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
      <tedi-row [cols]="1" [lg]="{ cols: 3 }" [gap]="1">
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
              <button tedi-button>Vajuta mind</button>
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
                <button tedi-button>Vajuta mind</button>
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
              <button tedi-button>Vajuta mind</button>
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
