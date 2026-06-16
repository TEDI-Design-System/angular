import { CommonModule } from "@angular/common";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";
import { ButtonGroupComponent } from "../../buttons/button-group/button-group.component";
import { ButtonGroupButtonDirective } from "../../buttons/button-group/button-group-button/button-group-button.directive";
import { StatusBadgeComponent } from "../../tags/status-badge/status-badge.component";
import { StatusIndicatorComponent } from "../../tags/status-indicator/status-indicator.component";
import { TabsComponent } from "./tabs.component";
import { TabsListComponent } from "./tabs-list/tabs-list.component";
import { TabsTriggerComponent } from "./tabs-trigger/tabs-trigger.component";
import { TabsContentComponent } from "./tabs-content/tabs-content.component";

const TABS = [
  TabsComponent,
  TabsListComponent,
  TabsTriggerComponent,
  TabsContentComponent,
];

const PSEUDO_STATE = ["Default", "Hover", "Active", "Focus", "Selected"];

const content = {
  healthTimeline:
    "Kronoloogiline ülevaade teie tervisesündmustest – visiidid, analüüsid ja diagnoosid on koondatud ühele ajateljele.",
  diseaseCourse:
    "Diagnoositud haiguste ülevaade ja nende areng ajas koos ravi- ning jälgimismärkmetega.",
  medication:
    "Teile välja kirjutatud ja väljastatud ravimite loetelu koos annuste ja manustamisperioodidega.",
  table:
    "Andmed on kuvatud tabelina – sobib täpseks võrdluseks ja veergude kaupa sorteerimiseks.",
  grid: "Andmed on kuvatud ruudustikuna – sobib visuaalseks sirvimiseks ja kiireks ülevaateks.",
  unreadMessages:
    "Teil on uusi lugemata teateid tervishoiuteenuse osutajatelt. Avage teade üksikasjade nägemiseks.",
  declarations:
    "Teie tahteavaldused, näiteks elundidoonorluse ja ravisoovide kohta.",
  proceduresInProgress: "Hetkel töös olevad menetlused ja nende seis.",
  proceduresInPlanning: "Menetlused, mis on planeeritud, kuid pole veel alanud.",
  calendar: "Kalendrivaade teie eelseisvatest visiitidest ja tähtaegadest.",
};

const subTabContent: Record<string, string> = {
  "work-accidents": "Tööõnnetuste juhtumid ja nende menetluse seis.",
  "occupational-diseases": "Kutsehaiguste kirjed ja diagnoosid.",
  "work-related-illnesses": "Tööga seotud haiguste teated ja tulemused.",
};

// TODO: `.tedi-tabs-demo-content` only imitates Card padding for
// these demos. Replace the wrapper `<div class="tedi-tabs-demo-content">` with the
// TEDI-Ready Card content block once the Card component (#453) lands.
const DEMO_STYLES = [
  `.tedi-tabs-demo-content {
     padding: var(--card-padding-lg) var(--card-padding-md-default);
   }`,
];

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.38.59?node-id=3419-38773&m=dev" target="_blank">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/9833df-tab" target="_blank">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Navigation/Tabs",
  component: TabsComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        ...TABS,
        RowComponent,
        ColComponent,
        TextComponent,
        ButtonGroupComponent,
        ButtonGroupButtonDirective,
        StatusBadgeComponent,
        StatusIndicatorComponent,
      ],
    }),
  ],
  argTypes: {
    value: {
      description:
        "Controlled active tab id. Use with `(valueChange)` or `[(value)]`.",
      control: false,
      table: {
        category: "Tabs inputs",
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    defaultValue: {
      description: "Initial active tab id for uncontrolled usage.",
      control: false,
      table: {
        category: "Tabs inputs",
        type: { summary: "string" },
        defaultValue: { summary: "''" },
      },
    },
    valueChange: {
      description: "Emitted when the active tab changes.",
      table: { category: "Tabs events", type: { summary: "string" } },
    },

    overflowMode: {
      description:
        "How tab overflow is handled: collapse into a 'More' dropdown or enable horizontal scrolling.",
      control: false,
      table: {
        category: "TabsList inputs",
        type: { summary: '"dropdown" | "scroll"' },
        defaultValue: { summary: "dropdown" },
      },
    },
    listAriaLabel: {
      name: "aria-label",
      description: "Accessible label for the tablist.",
      control: false,
      table: { category: "TabsList inputs", type: { summary: "string" } },
    },
    listAriaLabelledby: {
      name: "aria-labelledby",
      description: "Id of the element labelling the tablist.",
      control: false,
      table: { category: "TabsList inputs", type: { summary: "string" } },
    },

    triggerId: {
      name: "id",
      description:
        "Unique tab id (required). Links to the matching panel via aria-controls=\"{id}-panel\".",
      control: false,
      table: { category: "TabsTrigger inputs", type: { summary: "string" } },
    },
    icon: {
      description: "Material Symbols icon name shown before the label.",
      control: false,
      table: { category: "TabsTrigger inputs", type: { summary: "string" } },
    },
    disabled: {
      description: "Whether the tab is disabled.",
      control: false,
      table: {
        category: "TabsTrigger inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },

    contentId: {
      name: "id",
      description:
        "Panel id matching a trigger. Omit to always render the panel (e.g. a router outlet).",
      control: false,
      table: { category: "TabsContent inputs", type: { summary: "string" } },
    },
  },
} as Meta<TabsComponent>;

type Story = StoryObj<TabsComponent>;

export const Default: Story = {
  render: () => ({
    props: { content },
    styles: DEMO_STYLES,
    template: `
      <tedi-tabs defaultValue="tab-1">
        <tedi-tabs-list aria-label="Tervise sakid">
          <button tedi-tabs-trigger id="tab-1">Terviseteekond</button>
          <button tedi-tabs-trigger id="tab-2">Haiguste kulg</button>
          <button tedi-tabs-trigger id="tab-3">Ravimite ajalugu</button>
        </tedi-tabs-list>
        <tedi-tabs-content id="tab-1"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.healthTimeline }}</p></div></tedi-tabs-content>
        <tedi-tabs-content id="tab-2"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.diseaseCourse }}</p></div></tedi-tabs-content>
        <tedi-tabs-content id="tab-3"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.medication }}</p></div></tedi-tabs-content>
      </tedi-tabs>
    `,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    props: { content },
    styles: DEMO_STYLES,
    template: `
      <tedi-tabs defaultValue="tab-1">
        <tedi-tabs-list aria-label="Ikoonidega sakid">
          <button tedi-tabs-trigger id="tab-1" icon="table_chart">Tabel</button>
          <button tedi-tabs-trigger id="tab-2" icon="grid_on">Ruudustik</button>
        </tedi-tabs-list>
        <tedi-tabs-content id="tab-1"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.table }}</p></div></tedi-tabs-content>
        <tedi-tabs-content id="tab-2"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.grid }}</p></div></tedi-tabs-content>
      </tedi-tabs>
    `,
  }),
};

export const WithStatusBadge: Story = {
  render: () => ({
    props: { content },
    styles: DEMO_STYLES,
    template: `
      <tedi-tabs defaultValue="tab-1">
        <tedi-tabs-list aria-label="Olekumärgisega sakid">
          <button tedi-tabs-trigger id="tab-1">
            Terviseteekond <tedi-status-badge color="brand" text="Esitatud" />
          </button>
          <button tedi-tabs-trigger id="tab-2">
            <span style="position: relative">
              Lugemata teated&nbsp;<tedi-status-indicator type="danger" position="top-right" />
            </span>
          </button>
          <button tedi-tabs-trigger id="tab-3">Ravimite ajalugu</button>
        </tedi-tabs-list>
        <tedi-tabs-content id="tab-1"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.healthTimeline }}</p></div></tedi-tabs-content>
        <tedi-tabs-content id="tab-2"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.unreadMessages }}</p></div></tedi-tabs-content>
        <tedi-tabs-content id="tab-3"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.medication }}</p></div></tedi-tabs-content>
      </tedi-tabs>
    `,
  }),
};

export const States: Story = {
  parameters: {
    pseudo: {
      hover: "#Hover",
      active: "#Active",
      focusVisible: "#Focus",
    },
  },
  render: () => ({
    props: { PSEUDO_STATE },
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        <tedi-row cols="1" [sm]="{ cols: 6 }" *ngFor="let state of PSEUDO_STATE" alignItems="center">
          <tedi-col [width]="1">
            <p tedi-text [modifiers]="'bold'">{{ state }}</p>
          </tedi-col>
          <tedi-col [width]="5">
            <tedi-tabs [defaultValue]="state === 'Selected' ? state : ''">
              <tedi-tabs-list aria-label="Oleku näide">
                <button tedi-tabs-trigger [id]="state">Terviseteekond</button>
              </tedi-tabs-list>
            </tedi-tabs>
          </tedi-col>
        </tedi-row>
      </tedi-row>
    `,
  }),
};

export const Controlled: Story = {
  render: () => ({
    props: { currentTab: "tab-1", content },
    styles: DEMO_STYLES,
    template: `
      <tedi-row [cols]="1" [gapY]="2">
        <tedi-col>
          <p tedi-text>Current tab: <strong>{{ currentTab }}</strong></p>
        </tedi-col>
        <tedi-col>
          <tedi-tabs [value]="currentTab" (valueChange)="currentTab = $event">
            <tedi-tabs-list aria-label="Juhitavad sakid">
              <button tedi-tabs-trigger id="tab-1">Terviseteekond</button>
              <button tedi-tabs-trigger id="tab-2">Haiguste kulg</button>
              <button tedi-tabs-trigger id="tab-3">Ravimite ajalugu</button>
            </tedi-tabs-list>
            <tedi-tabs-content id="tab-1"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.healthTimeline }}</p></div></tedi-tabs-content>
            <tedi-tabs-content id="tab-2"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.diseaseCourse }}</p></div></tedi-tabs-content>
            <tedi-tabs-content id="tab-3"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.medication }}</p></div></tedi-tabs-content>
          </tedi-tabs>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const WithDisabledTab: Story = {
  render: () => ({
    props: { content },
    styles: DEMO_STYLES,
    template: `
      <tedi-tabs defaultValue="tab-1">
        <tedi-tabs-list aria-label="Keelatud sakiga sakid">
          <button tedi-tabs-trigger id="tab-1">Terviseteekond</button>
          <button tedi-tabs-trigger id="tab-2">Haiguste kulg</button>
          <button tedi-tabs-trigger id="tab-3" [disabled]="true">Ravimite ajalugu</button>
        </tedi-tabs-list>
        <tedi-tabs-content id="tab-1"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.healthTimeline }}</p></div></tedi-tabs-content>
        <tedi-tabs-content id="tab-2"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.diseaseCourse }}</p></div></tedi-tabs-content>
        <tedi-tabs-content id="tab-3"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.medication }}</p></div></tedi-tabs-content>
      </tedi-tabs>
    `,
  }),
};

export const OverflowBehavior: Story = {
  render: () => ({
    props: { content },
    styles: [...DEMO_STYLES, `.tedi-tabs-demo-overflow { max-width: 400px; }`],
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        <tedi-col>
          <p tedi-text [modifiers]="'bold'">Dropdown (default)</p>
        </tedi-col>
        <tedi-col class="tedi-tabs-demo-overflow">
          <tedi-tabs defaultValue="more-1">
            <tedi-tabs-list aria-label="Ületäituvad sakid rippmenüüga">
              <button tedi-tabs-trigger id="more-1">Terviseteekond</button>
              <button tedi-tabs-trigger id="more-2">Haiguste kulg</button>
              <button tedi-tabs-trigger id="more-3">Ravimite ajalugu</button>
              <button tedi-tabs-trigger id="more-4">Tahteavaldused</button>
          </tedi-tabs-list>
            <tedi-tabs-content id="more-1"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.healthTimeline }}</p></div></tedi-tabs-content>
            <tedi-tabs-content id="more-2"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.diseaseCourse }}</p></div></tedi-tabs-content>
            <tedi-tabs-content id="more-3"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.medication }}</p></div></tedi-tabs-content>
            <tedi-tabs-content id="more-4"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.declarations }}</p></div></tedi-tabs-content>
        </tedi-tabs>
        </tedi-col>
        <tedi-col>
          <p tedi-text [modifiers]="'bold'">Horizontal scroll</p>
        </tedi-col>
        <tedi-col class="tedi-tabs-demo-overflow">
          <tedi-tabs defaultValue="scroll-1">
            <tedi-tabs-list aria-label="Ületäituvad sakid kerimisega" overflowMode="scroll">
              <button tedi-tabs-trigger id="scroll-1">Terviseteekond</button>
              <button tedi-tabs-trigger id="scroll-2">Haiguste kulg</button>
              <button tedi-tabs-trigger id="scroll-3">Ravimite ajalugu</button>
              <button tedi-tabs-trigger id="scroll-4">Tahteavaldused</button>
            </tedi-tabs-list>
            <tedi-tabs-content id="scroll-1"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.healthTimeline }}</p></div></tedi-tabs-content>
            <tedi-tabs-content id="scroll-2"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.diseaseCourse }}</p></div></tedi-tabs-content>
            <tedi-tabs-content id="scroll-3"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.medication }}</p></div></tedi-tabs-content>
            <tedi-tabs-content id="scroll-4"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.declarations }}</p></div></tedi-tabs-content>
          </tedi-tabs>
        </tedi-col>
      </tedi-row>
    `,
  }),
};

export const WithSubTabs: Story = {
  render: () => ({
    props: { content, subTabContent, activeSubTab: "work-accidents" },
    styles: DEMO_STYLES,
    template: `
      <tedi-tabs defaultValue="tab-3">
        <tedi-tabs-list aria-label="Töötervishoiu ja -ohutuse sakid">
          <button tedi-tabs-trigger id="tab-1">Käimasolevad menetlused</button>
          <button tedi-tabs-trigger id="tab-2">Planeeritavad menetlused</button>
          <button tedi-tabs-trigger id="tab-3">Õnnetused ja haigused</button>
          <button tedi-tabs-trigger id="tab-4">Kalender</button>
        </tedi-tabs-list>
        <tedi-tabs-content id="tab-1"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.proceduresInProgress }}</p></div></tedi-tabs-content>
        <tedi-tabs-content id="tab-2"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.proceduresInPlanning }}</p></div></tedi-tabs-content>
        <tedi-tabs-content id="tab-3">
          <div class="tedi-tabs-demo-content">
            <tedi-row [cols]="1" [gapY]="2">
              <tedi-col>
                <tedi-button-group
                  variant="secondary-button-group"
                  ariaLabel="Õnnetuste ja haiguste alamnavigatsioon"
                  [(value)]="activeSubTab"
                >
                  <button tedi-button-group-button value="work-accidents" label="Tööõnnetused">Tööõnnetused</button>
                  <button tedi-button-group-button value="occupational-diseases" label="Kutsehaigused">Kutsehaigused</button>
                  <button tedi-button-group-button value="work-related-illnesses" label="Tööga seotud haigused">Tööga seotud haigused</button>
                </tedi-button-group>
              </tedi-col>
              <tedi-col>
                <p tedi-text>{{ subTabContent[activeSubTab] }}</p>
              </tedi-col>
            </tedi-row>
          </div>
        </tedi-tabs-content>
        <tedi-tabs-content id="tab-4"><div class="tedi-tabs-demo-content"><p tedi-text>{{ content.calendar }}</p></div></tedi-tabs-content>
      </tedi-tabs>
    `,
  }),
};
