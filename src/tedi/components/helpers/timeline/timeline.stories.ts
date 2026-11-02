import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";

import { TimelineComponent } from "./timeline.component";
import { TimelineItemComponent } from "./timeline-item/timeline-item.component";
import { TimelineTitleComponent } from "./timeline-title/timeline-title.component";
import { TimelineDescriptionComponent } from "./timeline-description/timeline-description.component";
import { TimelineTimingsBottomDirective } from "./timeline-timings-bottom.directive";
import { CollapseComponent } from "../../content/collapse/collapse.component";
import { TextComponent } from "../../base/text/text.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { InfoButtonComponent } from "../../buttons/info-button/info-button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { RowComponent } from "../grid/row/row.component";
import { ColComponent } from "../grid/col/col.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.17.25?node-id=136-14995&m=dev&focus-id=25945-119670" target="_BLANK">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/27208b-timeline" target="_BLANK">Zeroheight ↗</a>
 *
 * This component is responsive and adapts to mobile layout when below LG (992px) breakpoint.<br />
 * Timeline consists of several sub-components:
 * - `TimelineItemComponent`: Used for showing single item in timeline. Item timings are not required. First timing is showed with 16px, rest 14px.
 * - `TimelineTitleComponent`: Used for showing title in timeline item. If you want to use heading element for title, put it inside title component, wrapping your text.
 * - `TimelineDescriptionComponent`: Used for showing description in timeline item.
 *
 * TimelineItemComponent can also contain any other content, it will be rendered under description.
 */

export default {
  title: "TEDI-Ready/Components/Helpers/Timeline",
  component: TimelineComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TimelineComponent,
        TimelineItemComponent,
        TimelineTitleComponent,
        TimelineDescriptionComponent,
        TimelineTimingsBottomDirective,
        CollapseComponent,
        TextComponent,
        ButtonComponent,
        InfoButtonComponent,
        IconComponent,
        RowComponent,
        ColComponent,
      ],
    }),
  ],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  argTypes: {
    activeIndex: {
      description: "Index of active item",
      control: "number",
      table: {
        category: "timeline",
        type: { summary: "number" },
      },
    },
    variant: {
      description:
        "Visual variant. 'card' wraps the timeline in the borders and paddings of a card.",
      control: { type: "radio" },
      options: ["default", "card"],
      table: {
        category: "timeline",
        type: { summary: "TimelineVariant" },
        defaultValue: { summary: "default" },
      },
    },
    cardPadding: {
      description:
        "Vertical padding of each item in the card variant, in rems (same scale as the Card component). Both the gaps between items and the card's top/bottom edges resolve to twice this value. Horizontal item padding is fixed at the card default.",
      control: { type: "select" },
      options: [0, 0.5, 0.75, 1, 1.5, 2, 2.5, 3],
      table: {
        category: "timeline",
        type: { summary: "TimelineCardPadding" },
        defaultValue: { summary: "0.5" },
      },
    },
    timings: {
      description: "Item timings",
      control: "object",
      table: {
        category: "timeline-item",
        type: { summary: "string[]" },
      },
    },
  },
} as Meta<TimelineComponent>;

type Story = StoryObj<TimelineComponent>;

const DEFAULT_TEMPLATE = `
      <tedi-timeline [activeIndex]="activeIndex" [variant]="variant" [cardPadding]="cardPadding">
        <tedi-timeline-item [timings]="['1990', '14. detsember']">
          <tedi-timeline-title>Staaži kogumise algus (I sammas)</tedi-timeline-title>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['2002', '04. oktoober']">
          <tedi-timeline-title>II sambaga liitumine</tedi-timeline-title>
          <tedi-timeline-description>Aktiivne fond: LHV XL (loositud)</tedi-timeline-description>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['2007', '07. aprill']">
          <tedi-timeline-title>Minimaalse staaži täitumine (I sammas)</tedi-timeline-title>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['2021', '13. mai']">
          <tedi-timeline-title>III sambaga liitumine</tedi-timeline-title>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['2022', '14. juuni']">
          <tedi-timeline-title>II sambast lahkumine</tedi-timeline-title>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['2024', '16. detsember']">
          <tedi-timeline-title>Taotluse esitamine</tedi-timeline-title>
          <tedi-timeline-description>Menetlemine võib võtta kuni 30 p</tedi-timeline-description>
          <button tedi-button size="small" style="width: fit-content;">Alusta taotlust</button>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['2032']">
          <tedi-timeline-title>II sambaga uuesti liitumise võimalus</tedi-timeline-title>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['2035']">
          <tedi-timeline-title>Vanaduspensioniiga</tedi-timeline-title>
        </tedi-timeline-item>
      </tedi-timeline>
    `;

export const Default: Story = {
  args: {
    activeIndex: 2,
    variant: "default",
  },
  render: (args) => ({
    props: args,
    template: DEFAULT_TEMPLATE,
  }),
};

const TITLE_ONLY_TEMPLATE = `
      <tedi-timeline [activeIndex]="activeIndex">
        <tedi-timeline-item>
          <tedi-timeline-title>Taotluse esitamine</tedi-timeline-title>
        </tedi-timeline-item>
        <tedi-timeline-item>
          <tedi-timeline-title>Menetlemine</tedi-timeline-title>
        </tedi-timeline-item>
        <tedi-timeline-item>
          <tedi-timeline-title>Otsus</tedi-timeline-title>
        </tedi-timeline-item>
      </tedi-timeline>
    `;

export const TitleOnly: Story = {
  args: {
    activeIndex: 1,
  },
  render: (args) => ({
    props: args,
    template: TITLE_ONLY_TEMPLATE,
  }),
};

const WITH_DESCRIPTION_TEMPLATE = `
      <tedi-timeline [activeIndex]="activeIndex">
        <tedi-timeline-item>
          <tedi-timeline-title>Taotluse esitamine</tedi-timeline-title>
          <tedi-timeline-description>Pärast taotluse esitamist võetakse see menetlusse.</tedi-timeline-description>
        </tedi-timeline-item>
        <tedi-timeline-item>
          <tedi-timeline-title>Menetlemine</tedi-timeline-title>
          <tedi-timeline-description>Menetlemine võib võtta kuni 30 päeva.</tedi-timeline-description>
        </tedi-timeline-item>
        <tedi-timeline-item>
          <tedi-timeline-title>Otsus</tedi-timeline-title>
          <tedi-timeline-description>Otsus tehakse teatavaks.</tedi-timeline-description>
        </tedi-timeline-item>
      </tedi-timeline>
    `;

export const WithDescription: Story = {
  args: {
    activeIndex: 1,
  },
  render: (args) => ({
    props: args,
    template: WITH_DESCRIPTION_TEMPLATE,
  }),
};

const WITH_INFO_BUTTON_TEMPLATE = `
      <tedi-timeline [activeIndex]="activeIndex">
        <tedi-timeline-item>
          <tedi-timeline-title>
            Taotluse esitamine
            <button tedi-info-button></button>
          </tedi-timeline-title>
          <tedi-timeline-description>Pärast taotluse esitamist võetakse see menetlusse.</tedi-timeline-description>
        </tedi-timeline-item>
        <tedi-timeline-item>
          <tedi-timeline-title>
            Menetlemine
            <button tedi-info-button></button>
          </tedi-timeline-title>
          <tedi-timeline-description>Menetlemine võib võtta kuni 30 päeva.</tedi-timeline-description>
        </tedi-timeline-item>
        <tedi-timeline-item>
          <tedi-timeline-title>
            Otsus
            <button tedi-info-button></button>
          </tedi-timeline-title>
          <tedi-timeline-description>Otsus tehakse teatavaks.</tedi-timeline-description>
        </tedi-timeline-item>
      </tedi-timeline>
    `;

export const WithInfoButton: Story = {
  args: {
    activeIndex: 1,
  },
  render: (args) => ({
    props: args,
    template: WITH_INFO_BUTTON_TEMPLATE,
  }),
};

const WITHOUT_TITLE_TEMPLATE = `
      <tedi-timeline [activeIndex]="activeIndex">
        <tedi-timeline-item>
          <tedi-timeline-description>Pärast taotluse esitamist võetakse see menetlusse.</tedi-timeline-description>
        </tedi-timeline-item>
        <tedi-timeline-item>
          <tedi-timeline-description>Menetlemine võib võtta kuni 30 päeva.</tedi-timeline-description>
        </tedi-timeline-item>
        <tedi-timeline-item>
          <tedi-timeline-description>Otsus tehakse teatavaks.</tedi-timeline-description>
        </tedi-timeline-item>
      </tedi-timeline>
    `;

export const WithoutTitle: Story = {
  args: {
    activeIndex: 1,
  },
  render: (args) => ({
    props: args,
    template: WITHOUT_TITLE_TEMPLATE,
  }),
};

const WITH_ACTION_TEMPLATE = `
      <tedi-timeline [activeIndex]="activeIndex">
        <tedi-timeline-item>
          <tedi-timeline-title>Taotluse esitamine</tedi-timeline-title>
          <tedi-timeline-description>Pärast taotluse esitamist võetakse see menetlusse.</tedi-timeline-description>
          <button tedi-button size="small" variant="secondary" style="width: fit-content;">
            <tedi-icon name="add" />
            Lisa kaastaotleja
          </button>
        </tedi-timeline-item>
        <tedi-timeline-item>
          <tedi-timeline-title>Menetlemine</tedi-timeline-title>
          <tedi-timeline-description>Menetlemine võib võtta kuni 30 päeva.</tedi-timeline-description>
          <button tedi-button size="small" style="width: fit-content;">Vaata menetlust</button>
        </tedi-timeline-item>
        <tedi-timeline-item>
          <tedi-timeline-title>Otsus</tedi-timeline-title>
          <tedi-timeline-description>Otsus tehakse teatavaks.</tedi-timeline-description>
          <tedi-collapse openText="Näita rohkem" closeText="Näita vähem">
            <small tedi-text color="tertiary">Pärast otsuse teatavaks tegemist saab seda vajadusel vaidlustada.</small>
          </tedi-collapse>
        </tedi-timeline-item>
      </tedi-timeline>
    `;

export const WithAction: Story = {
  args: {
    activeIndex: 3,
  },
  render: (args) => ({
    props: args,
    template: WITH_ACTION_TEMPLATE,
  }),
};

const WITH_SINGLE_DATE_TEMPLATE = `
      <tedi-timeline [activeIndex]="activeIndex">
        <tedi-timeline-item [timings]="['1990']">
          <tedi-timeline-title>Taotluse esitamine</tedi-timeline-title>
          <tedi-timeline-description>Pärast taotluse esitamist võetakse see menetlusse.</tedi-timeline-description>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['1990']">
          <tedi-timeline-title>Menetlemine</tedi-timeline-title>
          <tedi-timeline-description>Menetlemine võib võtta kuni 30 päeva.</tedi-timeline-description>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['1991']">
          <tedi-timeline-title>Otsus</tedi-timeline-title>
          <tedi-timeline-description>Otsus tehakse teatavaks.</tedi-timeline-description>
        </tedi-timeline-item>
      </tedi-timeline>
    `;

export const WithSingleDate: Story = {
  args: {
    activeIndex: 1,
  },
  render: (args) => ({
    props: args,
    template: WITH_SINGLE_DATE_TEMPLATE,
  }),
};

const WITH_MULTIPLE_DATES_TEMPLATE = `
      <tedi-timeline [activeIndex]="activeIndex">
        <tedi-timeline-item [timings]="['1990', '14. detsember']">
          <tedi-timeline-title>Taotluse esitamine</tedi-timeline-title>
          <tedi-timeline-description>Pärast taotluse esitamist võetakse see menetlusse.</tedi-timeline-description>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['1990', '15. detsember']">
          <tedi-timeline-title>Menetlemine</tedi-timeline-title>
          <tedi-timeline-description>Menetlemine võib võtta kuni 30 päeva.</tedi-timeline-description>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['1991', '15. jaanuar']">
          <tedi-timeline-title>Otsus</tedi-timeline-title>
          <tedi-timeline-description>Otsus tehakse teatavaks.</tedi-timeline-description>
        </tedi-timeline-item>
      </tedi-timeline>
    `;

export const WithMultipleDates: Story = {
  args: {
    activeIndex: 1,
  },
  render: (args) => ({
    props: args,
    template: WITH_MULTIPLE_DATES_TEMPLATE,
  }),
};

const TIMELINE_CARD_TEMPLATE = `
      <tedi-timeline [activeIndex]="activeIndex" [variant]="variant" [cardPadding]="cardPadding">
        <tedi-timeline-item [timings]="['11.01.2024 12:23', 'Kersti Ööviul']">
          <p *tediTimelineTimingsBottom tedi-text modifiers="small" color="tertiary">
            Muudetud 08.02.2024 12:23
          </p>
          <tedi-timeline-title>Suhtlus isikuga</tedi-timeline-title>
          <tedi-collapse openText="Näita rohkem" closeText="Näita vähem" [defaultOpen]="true">
            <p tedi-text modifiers="small" color="secondary">Lisainfo: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </tedi-collapse>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['08.02.2024 12:23', 'Kersti Ööviul']">
          <p *tediTimelineTimingsBottom tedi-text modifiers="small" color="tertiary">
            Muudetud 12.03.2024 12:23
          </p>
          <tedi-timeline-title>Suhtlus isikuga</tedi-timeline-title>
          <tedi-collapse openText="Näita rohkem" closeText="Näita vähem">
            <p tedi-text modifiers="small" color="secondary">Lisainfo: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </tedi-collapse>
        </tedi-timeline-item>
        <tedi-timeline-item [timings]="['12.05.2024 12:23', 'Kersti Ööviul']">
          <tedi-timeline-title>Suhtlus isikuga</tedi-timeline-title>
          <tedi-collapse openText="Näita rohkem" closeText="Näita vähem">
            <p tedi-text modifiers="small" color="secondary">Lisainfo: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </tedi-collapse>
        </tedi-timeline-item>
      </tedi-timeline>
    `;

export const TimelineCard: Story = {
  args: {
    activeIndex: 1,
    variant: "card",
  },
  render: (args) => ({
    props: args,
    template: TIMELINE_CARD_TEMPLATE,
  }),
};

/** Chromatic snapshot for Timeline: add every new visual variant here too. */
export const VisualTest: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: { chromatic: { disableSnapshot: false } },
  render: () => ({
    template: `
      <tedi-row [cols]="1" [gapY]="5">
        <tedi-col>
          <p tedi-text modifiers="bold">Default</p>
          <ng-container *ngTemplateOutlet="vt1; context: { activeIndex: 2, variant: 'default' }" />
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Title only</p>
          <ng-container *ngTemplateOutlet="vt2; context: { activeIndex: 1 }" />
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">With description</p>
          <ng-container *ngTemplateOutlet="vt3; context: { activeIndex: 1 }" />
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">With info button</p>
          <ng-container *ngTemplateOutlet="vt4; context: { activeIndex: 1 }" />
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Without title</p>
          <ng-container *ngTemplateOutlet="vt5; context: { activeIndex: 1 }" />
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">With action</p>
          <ng-container *ngTemplateOutlet="vt6; context: { activeIndex: 3 }" />
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">With single date</p>
          <ng-container *ngTemplateOutlet="vt7; context: { activeIndex: 1 }" />
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">With multiple dates</p>
          <ng-container *ngTemplateOutlet="vt8; context: { activeIndex: 1 }" />
        </tedi-col>
        <tedi-col>
          <p tedi-text modifiers="bold">Timeline card</p>
          <ng-container *ngTemplateOutlet="vt9; context: { activeIndex: 1, variant: 'card' }" />
        </tedi-col>
      </tedi-row>
      <ng-template #vt1 let-activeIndex="activeIndex" let-variant="variant" let-cardPadding="cardPadding">${DEFAULT_TEMPLATE}</ng-template>
      <ng-template #vt2 let-activeIndex="activeIndex" let-variant="variant" let-cardPadding="cardPadding">${TITLE_ONLY_TEMPLATE}</ng-template>
      <ng-template #vt3 let-activeIndex="activeIndex" let-variant="variant" let-cardPadding="cardPadding">${WITH_DESCRIPTION_TEMPLATE}</ng-template>
      <ng-template #vt4 let-activeIndex="activeIndex" let-variant="variant" let-cardPadding="cardPadding">${WITH_INFO_BUTTON_TEMPLATE}</ng-template>
      <ng-template #vt5 let-activeIndex="activeIndex" let-variant="variant" let-cardPadding="cardPadding">${WITHOUT_TITLE_TEMPLATE}</ng-template>
      <ng-template #vt6 let-activeIndex="activeIndex" let-variant="variant" let-cardPadding="cardPadding">${WITH_ACTION_TEMPLATE}</ng-template>
      <ng-template #vt7 let-activeIndex="activeIndex" let-variant="variant" let-cardPadding="cardPadding">${WITH_SINGLE_DATE_TEMPLATE}</ng-template>
      <ng-template #vt8 let-activeIndex="activeIndex" let-variant="variant" let-cardPadding="cardPadding">${WITH_MULTIPLE_DATES_TEMPLATE}</ng-template>
      <ng-template #vt9 let-activeIndex="activeIndex" let-variant="variant" let-cardPadding="cardPadding">${TIMELINE_CARD_TEMPLATE}</ng-template>
    `,
  }),
};
