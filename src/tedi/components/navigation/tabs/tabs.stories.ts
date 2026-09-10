import { CommonModule } from "@angular/common";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { TextComponent } from "../../base/text/text.component";
import { ButtonGroupComponent } from "../../buttons/button-group/button-group.component";
import { ButtonGroupButtonDirective } from "../../buttons/button-group/button-group-button/button-group-button.directive";
import { StatusBadgeComponent } from "../../tags/status-badge/status-badge.component";
import { StatusIndicatorComponent } from "../../tags/status-indicator/status-indicator.component";
import { EllipsisComponent } from "../../helpers/ellipsis/ellipsis.component";
import { CardContentComponent } from "../../content/card/card-content/card-content.component";
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
  proceduresInPlanning:
    "Menetlused, mis on planeeritud, kuid pole veel alanud.",
  calendar: "Kalendrivaade teie eelseisvatest visiitidest ja tähtaegadest.",
};

const subTabContent: Record<string, string> = {
  "work-accidents": "Tööõnnetuste juhtumid ja nende menetluse seis.",
  "occupational-diseases": "Kutsehaiguste kirjed ja diagnoosid.",
  "work-related-illnesses": "Tööga seotud haiguste teated ja tulemused.",
};

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
        EllipsisComponent,
        CardContentComponent,
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
    dropdownLabel: {
      description:
        "Label for the overflow dropdown trigger. Defaults to the `more` translation.",
      control: false,
      table: { category: "TabsList inputs", type: { summary: "string" } },
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
        'Unique tab id (required). Links to the matching panel via aria-controls="{id}-panel".',
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
    template: `
      <tedi-tabs defaultValue="tab-1">
        <tedi-tabs-list aria-label="Tervise sakid">
          <button tedi-tabs-trigger id="tab-1">Terviseteekond</button>
          <button tedi-tabs-trigger id="tab-2">Haiguste kulg</button>
          <button tedi-tabs-trigger id="tab-3">Ravimite ajalugu</button>
        </tedi-tabs-list>
        <tedi-tabs-content id="tab-1"><tedi-card-content><p tedi-text>{{ content.healthTimeline }}</p></tedi-card-content></tedi-tabs-content>
        <tedi-tabs-content id="tab-2"><tedi-card-content><p tedi-text>{{ content.diseaseCourse }}</p></tedi-card-content></tedi-tabs-content>
        <tedi-tabs-content id="tab-3"><tedi-card-content><p tedi-text>{{ content.medication }}</p></tedi-card-content></tedi-tabs-content>
      </tedi-tabs>
    `,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    props: { content },
    template: `
      <tedi-tabs defaultValue="tab-1">
        <tedi-tabs-list aria-label="Ikoonidega sakid">
          <button tedi-tabs-trigger id="tab-1" icon="table_chart">Tabel</button>
          <button tedi-tabs-trigger id="tab-2" icon="grid_on">Ruudustik</button>
        </tedi-tabs-list>
        <tedi-tabs-content id="tab-1"><tedi-card-content><p tedi-text>{{ content.table }}</p></tedi-card-content></tedi-tabs-content>
        <tedi-tabs-content id="tab-2"><tedi-card-content><p tedi-text>{{ content.grid }}</p></tedi-card-content></tedi-tabs-content>
      </tedi-tabs>
    `,
  }),
};

export const WithStatusBadge: Story = {
  render: () => ({
    props: { content },
    template: `
      <tedi-tabs defaultValue="tab-1">
        <tedi-tabs-list aria-label="Olekumärgisega sakid">
          <button tedi-tabs-trigger id="tab-1">
            <tedi-ellipsis [lineClamp]="1" [tooltip]="false">Terviseteekond</tedi-ellipsis>
            <tedi-status-badge color="brand" text="Esitatud" />
          </button>
          <button tedi-tabs-trigger id="tab-2">
            <span style="position: relative">
              Lugemata teated&nbsp;<tedi-status-indicator type="danger" position="top-right" />
            </span>
          </button>
          <button tedi-tabs-trigger id="tab-3">Ravimite ajalugu</button>
        </tedi-tabs-list>
        <tedi-tabs-content id="tab-1"><tedi-card-content><p tedi-text>{{ content.healthTimeline }}</p></tedi-card-content></tedi-tabs-content>
        <tedi-tabs-content id="tab-2"><tedi-card-content><p tedi-text>{{ content.unreadMessages }}</p></tedi-card-content></tedi-tabs-content>
        <tedi-tabs-content id="tab-3"><tedi-card-content><p tedi-text>{{ content.medication }}</p></tedi-card-content></tedi-tabs-content>
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
    // This story only demonstrates the trigger's visual states, so the triggers
    // intentionally have no panels — the resulting dangling `aria-controls` is a
    // demo artifact, not a real defect.
    a11y: {
      config: { rules: [{ id: "aria-valid-attr-value", enabled: false }] },
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
    template: `
      <div class="flex flex-column gap-2">
        <p tedi-text>Current tab: <strong>{{ currentTab }}</strong></p>
        <tedi-tabs [value]="currentTab" (valueChange)="currentTab = $event">
          <tedi-tabs-list aria-label="Juhitavad sakid">
            <button tedi-tabs-trigger id="tab-1">Terviseteekond</button>
            <button tedi-tabs-trigger id="tab-2">Haiguste kulg</button>
            <button tedi-tabs-trigger id="tab-3">Ravimite ajalugu</button>
          </tedi-tabs-list>
          <tedi-tabs-content id="tab-1"><tedi-card-content><p tedi-text>{{ content.healthTimeline }}</p></tedi-card-content></tedi-tabs-content>
          <tedi-tabs-content id="tab-2"><tedi-card-content><p tedi-text>{{ content.diseaseCourse }}</p></tedi-card-content></tedi-tabs-content>
          <tedi-tabs-content id="tab-3"><tedi-card-content><p tedi-text>{{ content.medication }}</p></tedi-card-content></tedi-tabs-content>
        </tedi-tabs>
      </div>
    `,
  }),
};

export const AsLinks: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Render triggers as `<a>` instead of `<button>` when a tab navigates to a route — this gives real link affordances (open in new tab, copy address, works without JS) as WCAG expects for navigation. The anchor keeps `role="tab"` semantics. Unlike button tabs (automatic activation), anchor tabs use **manual activation**: arrow keys only move focus and Enter/Space follows the link, so arrowing across route-links doesn\'t navigate on every keypress. Use `routerLink` for Angular routing and bind `[value]` to the current route; this demo uses plain `href` hash links with in-page panels.',
      },
    },
  },
  render: () => ({
    props: { content },
    template: `
      <tedi-tabs defaultValue="link-1">
        <tedi-tabs-list aria-label="Lingina sakid">
          <a tedi-tabs-trigger id="link-1" href="#link-1-panel">Terviseteekond</a>
          <a tedi-tabs-trigger id="link-2" href="#link-2-panel">Haiguste kulg</a>
          <a tedi-tabs-trigger id="link-3" href="#link-3-panel">Ravimite ajalugu</a>
        </tedi-tabs-list>
        <tedi-tabs-content id="link-1"><tedi-card-content><p tedi-text>{{ content.healthTimeline }}</p></tedi-card-content></tedi-tabs-content>
        <tedi-tabs-content id="link-2"><tedi-card-content><p tedi-text>{{ content.diseaseCourse }}</p></tedi-card-content></tedi-tabs-content>
        <tedi-tabs-content id="link-3"><tedi-card-content><p tedi-text>{{ content.medication }}</p></tedi-card-content></tedi-tabs-content>
      </tedi-tabs>
    `,
  }),
};

export const WithDisabledTab: Story = {
  render: () => ({
    props: { content },
    template: `
      <tedi-tabs defaultValue="tab-1">
        <tedi-tabs-list aria-label="Keelatud sakiga sakid">
          <button tedi-tabs-trigger id="tab-1">Terviseteekond</button>
          <button tedi-tabs-trigger id="tab-2">Haiguste kulg</button>
          <button tedi-tabs-trigger id="tab-3" [disabled]="true">Ravimite ajalugu</button>
        </tedi-tabs-list>
        <tedi-tabs-content id="tab-1"><tedi-card-content><p tedi-text>{{ content.healthTimeline }}</p></tedi-card-content></tedi-tabs-content>
        <tedi-tabs-content id="tab-2"><tedi-card-content><p tedi-text>{{ content.diseaseCourse }}</p></tedi-card-content></tedi-tabs-content>
        <tedi-tabs-content id="tab-3"><tedi-card-content><p tedi-text>{{ content.medication }}</p></tedi-card-content></tedi-tabs-content>
      </tedi-tabs>
    `,
  }),
};

export const OverflowBehavior: Story = {
  render: () => ({
    props: { content },
    styles: [`.tedi-tabs-demo-overflow { max-width: 400px; }`],
    template: `
      <div class="flex flex-column gap-3">
        <p tedi-text [modifiers]="'bold'">Dropdown (default)</p>
        <div class="tedi-tabs-demo-overflow">
          <tedi-tabs defaultValue="more-1">
            <tedi-tabs-list aria-label="Ületäituvad sakid rippmenüüga">
              <button tedi-tabs-trigger id="more-1">Terviseteekond</button>
              <button tedi-tabs-trigger id="more-2">Haiguste kulg</button>
              <button tedi-tabs-trigger id="more-3">Ravimite ajalugu</button>
              <button tedi-tabs-trigger id="more-4">Tahteavaldused</button>
            </tedi-tabs-list>
            <tedi-tabs-content id="more-1"><tedi-card-content><p tedi-text>{{ content.healthTimeline }}</p></tedi-card-content></tedi-tabs-content>
            <tedi-tabs-content id="more-2"><tedi-card-content><p tedi-text>{{ content.diseaseCourse }}</p></tedi-card-content></tedi-tabs-content>
            <tedi-tabs-content id="more-3"><tedi-card-content><p tedi-text>{{ content.medication }}</p></tedi-card-content></tedi-tabs-content>
            <tedi-tabs-content id="more-4"><tedi-card-content><p tedi-text>{{ content.declarations }}</p></tedi-card-content></tedi-tabs-content>
          </tedi-tabs>
        </div>
        <p tedi-text [modifiers]="'bold'">Horizontal scroll</p>
        <div class="tedi-tabs-demo-overflow">
          <tedi-tabs defaultValue="scroll-1">
            <tedi-tabs-list aria-label="Ületäituvad sakid kerimisega" overflowMode="scroll">
              <button tedi-tabs-trigger id="scroll-1">Terviseteekond</button>
              <button tedi-tabs-trigger id="scroll-2">Haiguste kulg</button>
              <button tedi-tabs-trigger id="scroll-3">Ravimite ajalugu</button>
              <button tedi-tabs-trigger id="scroll-4">Tahteavaldused</button>
            </tedi-tabs-list>
            <tedi-tabs-content id="scroll-1"><tedi-card-content><p tedi-text>{{ content.healthTimeline }}</p></tedi-card-content></tedi-tabs-content>
            <tedi-tabs-content id="scroll-2"><tedi-card-content><p tedi-text>{{ content.diseaseCourse }}</p></tedi-card-content></tedi-tabs-content>
            <tedi-tabs-content id="scroll-3"><tedi-card-content><p tedi-text>{{ content.medication }}</p></tedi-card-content></tedi-tabs-content>
            <tedi-tabs-content id="scroll-4"><tedi-card-content><p tedi-text>{{ content.declarations }}</p></tedi-card-content></tedi-tabs-content>
          </tedi-tabs>
        </div>
      </div>
    `,
  }),
};

export const WithSubTabs: Story = {
  render: () => ({
    props: { content, subTabContent, activeSubTab: "work-accidents" },
    template: `
      <tedi-tabs defaultValue="tab-3">
        <tedi-tabs-list aria-label="Töötervishoiu ja -ohutuse sakid">
          <button tedi-tabs-trigger id="tab-1">Käimasolevad menetlused</button>
          <button tedi-tabs-trigger id="tab-2">Planeeritavad menetlused</button>
          <button tedi-tabs-trigger id="tab-3">Õnnetused ja haigused</button>
          <button tedi-tabs-trigger id="tab-4">Kalender</button>
        </tedi-tabs-list>
        <tedi-tabs-content id="tab-1"><tedi-card-content><p tedi-text>{{ content.proceduresInProgress }}</p></tedi-card-content></tedi-tabs-content>
        <tedi-tabs-content id="tab-2"><tedi-card-content><p tedi-text>{{ content.proceduresInPlanning }}</p></tedi-card-content></tedi-tabs-content>
        <tedi-tabs-content id="tab-3">
          <tedi-card-content>
            <div class="flex flex-column gap-2">
              <tedi-button-group
                variant="secondary-button-group"
                ariaLabel="Õnnetuste ja haiguste alamnavigatsioon"
                [enableMobileDropdown]="true"
                dropdownLabelMode="selected"
                [(value)]="activeSubTab"
              >
                <button tedi-button-group-button value="work-accidents" label="Tööõnnetused">Tööõnnetused</button>
                <button tedi-button-group-button value="occupational-diseases" label="Kutsehaigused">Kutsehaigused</button>
                <button tedi-button-group-button value="work-related-illnesses" label="Tööga seotud haigused">Tööga seotud haigused</button>
              </tedi-button-group>
              <p tedi-text>{{ subTabContent[activeSubTab] }}</p>
            </div>
          </tedi-card-content>
        </tedi-tabs-content>
        <tedi-tabs-content id="tab-4"><tedi-card-content><p tedi-text>{{ content.calendar }}</p></tedi-card-content></tedi-tabs-content>
      </tedi-tabs>
    `,
  }),
};
