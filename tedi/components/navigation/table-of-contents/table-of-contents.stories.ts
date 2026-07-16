import { isPlatformBrowser } from "@angular/common";
import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from "@angular/core";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";

import { IconComponent } from "../../base/icon/icon.component";
import { TextComponent } from "../../base/text/text.component";
import { HideAtDirective } from "../../../directives/hide-at/hide-at.directive";
import { ShowAtDirective } from "../../../directives/show-at/show-at.directive";
import { ColComponent } from "../../helpers/grid/col/col.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { LinkComponent } from "../link/link.component";
import { TableOfContentsComponent } from "./table-of-contents.component";
import { TableOfContentsCollapsibleComponent } from "./table-of-contents-collapsible/table-of-contents-collapsible.component";
import { TableOfContentsItemComponent } from "./table-of-contents-item/table-of-contents-item.component";

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor " +
  "incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud " +
  "exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const SECTIONS = [
  "Sissejuhatus",
  "Taust",
  "Meetodid",
  "Tulemused",
  "Arutelu",
  "Kokkuvõte",
];

/**
 * Scroll-spy demo: the article scrolls inside its own box and the sticky
 * sidebar highlights the section currently in view. Clicking an item scrolls
 * the article to that section.
 */
@Component({
  selector: "toc-sticky-demo",
  standalone: true,
  imports: [
    TableOfContentsComponent,
    TableOfContentsItemComponent,
    TableOfContentsCollapsibleComponent,
    LinkComponent,
    TextComponent,
    ShowAtDirective,
    HideAtDirective,
  ],
  template: `
    <div class="toc-sticky-demo">
      <div
        #scroller
        class="toc-sticky-demo__article"
        tabindex="0"
        role="region"
        aria-label="Sisu"
      >
        @for (label of sections; track label; let i = $index) {
          <section [id]="sectionId(i)" class="toc-sticky-demo__section">
            <h2 tedi-text modifiers="h3">{{ label }}</h2>
            <p tedi-text>{{ lorem }}</p>
            <p tedi-text>{{ lorem }}</p>
          </section>
        }
      </div>

      <div *showAt="'md'" class="toc-sticky-demo__aside">
        <tedi-table-of-contents
          heading="Sisukord"
          [sticky]="false"
          [activeId]="activeId()"
        >
          @for (label of sections; track label; let i = $index) {
            <tedi-table-of-contents-item [itemId]="sectionId(i)">
              <a
                tedi-link
                [href]="'#' + sectionId(i)"
                [underline]="false"
                (click)="selectSection(sectionId(i), $event)"
                >{{ label }}</a
              >
            </tedi-table-of-contents-item>
          }
        </tedi-table-of-contents>
      </div>

      <tedi-table-of-contents-collapsible
        *hideAt="'md'"
        heading="Sisukord"
        [activeId]="activeId()"
        [sticky]="false"
      >
        @for (label of sections; track label; let i = $index) {
          <tedi-table-of-contents-item [itemId]="sectionId(i)">
            <a
              tedi-link
              [href]="'#' + sectionId(i)"
              [underline]="false"
              (click)="selectSection(sectionId(i), $event)"
              >{{ label }}</a
            >
          </tedi-table-of-contents-item>
        }
      </tedi-table-of-contents-collapsible>
    </div>
  `,
  styles: [
    `
      .toc-sticky-demo {
        display: flex;
        flex-direction: column;
        height: 100dvh;
      }
      .toc-sticky-demo__article {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 1rem 1rem 0;
      }
      .toc-sticky-demo__section {
        margin-bottom: 1.5rem;
      }
      .toc-sticky-demo__section p {
        margin: 0.25rem 0 0;
      }

      @media (min-width: 48rem) {
        .toc-sticky-demo {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
          align-items: start;
          height: auto;
          padding: 2rem;
        }
        .toc-sticky-demo__article {
          flex: initial;
          max-height: 24rem;
          padding: 0 1rem 0 0;
        }
        .toc-sticky-demo__aside {
          position: sticky;
          top: 0;
        }
      }
    `,
  ],
})
class TocStickyDemoComponent {
  readonly sections = SECTIONS;
  readonly lorem = LOREM;
  readonly activeId = signal("sec-1");

  private readonly scroller =
    viewChild.required<ElementRef<HTMLDivElement>>("scroller");
  private readonly platformId = inject(PLATFORM_ID);

  private seeking = false;
  private seekEndTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    afterNextRender(() => this.trackActiveSection());
  }

  sectionId(index: number): string {
    return `sec-${index + 1}`;
  }

  selectSection(id: string, event: Event): void {
    event.preventDefault();
    const root = this.scroller().nativeElement;
    const target = root.querySelector<HTMLElement>(`#${id}`);
    if (!target) return;
    this.seeking = true;
    this.activeId.set(id);
    clearTimeout(this.seekEndTimeout);
    this.seekEndTimeout = setTimeout(() => {
      this.seeking = false;
    }, 700);
    root.scrollTo({
      top:
        root.scrollTop +
        target.getBoundingClientRect().top -
        root.getBoundingClientRect().top,
      behavior: "smooth",
    });
  }

  private trackActiveSection(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = this.scroller().nativeElement;
    const ids = this.sections.map((_, index) => this.sectionId(index));
    const visibility = new Map<string, boolean>();

    const pickActive = () => {
      if (this.seeking) return;
      const atBottom =
        root.scrollTop + root.clientHeight >= root.scrollHeight - 2;
      if (atBottom) {
        this.activeId.set(ids[ids.length - 1]);
        return;
      }
      const active = ids.find((id) => visibility.get(id));
      if (active) this.activeId.set(active);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          visibility.set(
            (entry.target as HTMLElement).id,
            entry.isIntersecting,
          ),
        );
        pickActive();
      },
      { root, rootMargin: "0px 0px -55% 0px" },
    );

    ids.forEach((id) => {
      const element = root.querySelector(`#${id}`);
      if (element) observer.observe(element);
    });

    root.addEventListener(
      "scroll",
      () => {
        if (!this.seeking) return;
        clearTimeout(this.seekEndTimeout);
        this.seekEndTimeout = setTimeout(() => {
          this.seeking = false;
          pickActive();
        }, 120);
      },
      { passive: true },
    );
  }
}

@Component({
  selector: "toc-item-states",
  standalone: true,
  imports: [
    LinkComponent,
    IconComponent,
    TextComponent,
    RowComponent,
    ColComponent,
  ],
  template: `
    <tedi-row [cols]="1" [sm]="{ cols: 2 }" [lg]="{ cols: 3 }" [gapY]="3">
      @for (column of columns; track column.header) {
        <tedi-col>
          <div class="toc-item-states__col">
            <p tedi-text modifiers="bold">{{ column.header }}</p>
            @for (state of states; track state.label) {
              <div class="toc-item-states__row">
                <span
                  class="toc-item-states__label"
                  tedi-text
                  color="secondary"
                >
                  {{ state.label }}
                </span>
                <span
                  class="toc-item-states__item"
                  [class.toc-item-states__item--active]="state.active"
                >
                  @if (column.number) {
                    <span class="toc-item-states__number" aria-hidden="true"
                      >1.</span
                    >
                  }
                  <a
                    tedi-link
                    href="#"
                    [underline]="false"
                    [id]="state.hover ? 'Hover' : null"
                  >
                    @if (column.icon) {
                      <tedi-icon name="mail" [size]="18" />
                    }
                    Pealkiri
                  </a>
                </span>
              </div>
            }
          </div>
        </tedi-col>
      }
    </tedi-row>
  `,
  styles: [
    `
      .toc-item-states__col {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .toc-item-states__row {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .toc-item-states__label {
        min-width: 5rem;
      }
      .toc-item-states__item {
        display: inline-flex;
        gap: var(--layout-grid-gutters-04);
        align-items: center;
        padding-left: calc(
          var(--table-of-contents-padding-level-1) - var(
              --table-of-contents-active-item-border-width
            )
        );
        border-left: var(--table-of-contents-active-item-border-width) solid
          transparent;
      }
      .toc-item-states__item--active {
        --link-primary-default: var(--link-primary-active);

        border-left-color: var(--general-border-brand);
      }
      .toc-item-states__number {
        min-width: 1.5rem;
        color: var(--link-primary-default);
        text-align: right;
      }
    `,
  ],
})
class TocItemStatesComponent {
  readonly columns = [
    { header: "Default", number: false, icon: false },
    { header: "With number", number: true, icon: false },
    { header: "With icon", number: false, icon: true },
  ];
  readonly states = [
    { label: "Default", active: false, hover: false },
    { label: "Hover", active: false, hover: true },
    { label: "Selected", active: true, hover: false },
  ];
}

const TABLE_OF_CONTENTS = [
  TableOfContentsComponent,
  TableOfContentsItemComponent,
  TableOfContentsCollapsibleComponent,
  LinkComponent,
  IconComponent,
  TextComponent,
  ShowAtDirective,
  HideAtDirective,
  TocStickyDemoComponent,
  TocItemStatesComponent,
];

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.66.83?node-id=8469-72329&m=dev" target="_blank">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/467bb3-table-of-contents" target="_blank">Zeroheight ↗</a>
 */

const meta = {
  title: "TEDI-Ready/Components/Navigation/TableOfContents",
  component: TableOfContentsComponent,
  decorators: [
    moduleMetadata({ imports: TABLE_OF_CONTENTS }),
    (story, context) => {
      const rendered = story();
      // `fullscreen` layout avoids Storybook's padded-layout scrollbar at fixed
      // viewports; add the padding back here for the constrained card stories.
      // Full-width stories manage their own layout/padding.
      const wrapper = context.parameters["fullWidth"]
        ? ""
        : "max-width: 320px; padding: 1rem;";
      return {
        ...rendered,
        template: `<div style="${wrapper}">${rendered.template}</div>`,
      };
    },
  ],
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.66.83?node-id=8469-72329&m=dev",
    },
  },
  argTypes: {
    heading: {
      description:
        "Heading rendered above the list. Defaults to the localised title; pass `null` to render it headless.",
      control: "text",
      table: {
        category: "Table of Contents",
        type: { summary: "string | null" },
        defaultValue: { summary: "table-of-contents.title" },
      },
    },
    headingLevel: {
      description:
        "Semantic level of the heading element. The visual style stays H4; match it to the page's heading outline.",
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
      table: {
        category: "Table of Contents",
        type: { summary: "TableOfContentsHeadingLevel" },
        defaultValue: { summary: "h3" },
      },
    },
    variant: {
      description: "Visual variant of the container.",
      control: "radio",
      options: ["default", "transparent"],
      table: {
        category: "Table of Contents",
        type: {
          summary: "TableOfContentsVariant",
          detail: "default \ntransparent",
        },
        defaultValue: { summary: "default" },
      },
    },
    activeId: {
      description:
        "Id of the currently active item. It gets the accent bar and active colour, and its branch auto-expands.",
      control: "text",
      table: {
        category: "Table of Contents",
        type: { summary: "string" },
      },
    },
    padding: {
      description: "Inner padding of the container, in rem.",
      control: "number",
      table: {
        category: "Table of Contents",
        type: { summary: "number" },
        defaultValue: { summary: "card-padding-md-default" },
      },
    },
    showIcons: {
      description:
        "Show a validation glyph before each item (multistep-form usage).",
      control: "boolean",
      table: {
        category: "Table of Contents",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    numbered: {
      description:
        "Show auto-generated hierarchical numbers (`1.`, `2.`, `2.1`, …).",
      control: "boolean",
      table: {
        category: "Table of Contents",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    sticky: {
      description:
        "Stick to the viewport while scrolling — on `tedi-table-of-contents` this sticks the card; on `tedi-table-of-contents-collapsible` it pins the bar to the bottom of the viewport. Set `false` to render inline.",
      control: "boolean",
      table: {
        category: "Table of Contents",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    ariaLabel: {
      description:
        "Accessible name for the `nav` landmark. Overrides the default (the heading, or the localised title when headless).",
      control: "text",
      table: {
        category: "Table of Contents",
        type: { summary: "string" },
      },
    },
    itemId: {
      name: "itemId",
      description:
        "Marks the item active (via the parent's `activeId`) and parents nested items.",
      control: false,
      table: {
        category: "Table of Contents Item",
        type: { summary: "string" },
      },
    },
    isValid: {
      name: "isValid",
      description:
        "Validation state rendered when `showIcons` is on: `true` valid, `false` invalid, `undefined` not yet validated.",
      control: { type: "radio" },
      options: [true, false, undefined],
      table: {
        category: "Table of Contents Item",
        type: { summary: "boolean | undefined" },
      },
    },
    separator: {
      name: "separator",
      description: "Render a separator below the item.",
      control: "boolean",
      table: {
        category: "Table of Contents Item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    hideIcon: {
      name: "hideIcon",
      description:
        "Hide the validation glyph for this item even when `showIcons` is on.",
      control: "boolean",
      table: {
        category: "Table of Contents Item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
} as Meta<TableOfContentsComponent>;

export default meta;

type Story = StoryObj<
  TableOfContentsComponent & {
    isValid?: boolean;
    separator?: boolean;
    hideIcon?: boolean;
  }
>;

const sectionItems = `
  <tedi-table-of-contents-item itemId="section-1">
    <a tedi-link href="#section-1" [underline]="false">Sissejuhatus</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="section-2">
    <a tedi-link href="#section-2" [underline]="false">Taust</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="section-3">
    <a tedi-link href="#section-3" [underline]="false">Meetodid</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="section-4">
    <a tedi-link href="#section-4" [underline]="false">Tulemused</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="section-5">
    <a tedi-link href="#section-5" [underline]="false">Arutelu</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="section-6">
    <a tedi-link href="#section-6" [underline]="false">Kokkuvõte</a>
  </tedi-table-of-contents-item>
`;

const nestedItems = `
  <tedi-table-of-contents-item itemId="intro">
    <a tedi-link href="#intro" [underline]="false">Sissejuhatus</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="methods">
    <a tedi-link href="#methods" [underline]="false">Meetodid</a>
    <tedi-table-of-contents-item itemId="methods-1">
      <a tedi-link href="#methods-1" [underline]="false">Andmete kogumine</a>
    </tedi-table-of-contents-item>
    <tedi-table-of-contents-item itemId="methods-2">
      <a tedi-link href="#methods-2" [underline]="false">Analüüs</a>
    </tedi-table-of-contents-item>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="results">
    <a tedi-link href="#results" [underline]="false">Tulemused</a>
    <tedi-table-of-contents-item itemId="results-1">
      <a tedi-link href="#results-1" [underline]="false">Joonised</a>
    </tedi-table-of-contents-item>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="discussion">
    <a tedi-link href="#discussion" [underline]="false">Arutelu</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="conclusion">
    <a tedi-link href="#conclusion" [underline]="false">Kokkuvõte</a>
  </tedi-table-of-contents-item>
`;


const controllableItems = SECTIONS.map(
  (label, index) => `
      <tedi-table-of-contents-item
        itemId="section-${index + 1}"
        [isValid]="isValid"
        [separator]="separator"
        [hideIcon]="hideIcon"
      >
        <a tedi-link href="#section-${index + 1}" [underline]="false">${label}</a>
      </tedi-table-of-contents-item>`,
).join("");

export const Default: Story = {
  args: {
    heading: "Sisukord",
    headingLevel: "h3",
    variant: "default",
    activeId: "section-3",
    showIcons: false,
    numbered: false,
    sticky: false,
    isValid: true,
    separator: false,
    hideIcon: false,
  },
  render: (args) => ({
    props: { ...args, isValid: args.isValid ?? null },
    template: `
      <tedi-table-of-contents
        [heading]="heading"
        [headingLevel]="headingLevel"
        [variant]="variant"
        [activeId]="activeId"
        [padding]="padding"
        [showIcons]="showIcons"
        [numbered]="numbered"
        [sticky]="sticky"
      >
        ${controllableItems}
      </tedi-table-of-contents>
    `,
  }),
};

export const Transparent: Story = {
  render: () => ({
    template: `
      <tedi-table-of-contents heading="Sisukord" variant="transparent" [sticky]="false" activeId="section-3">
        ${sectionItems}
      </tedi-table-of-contents>
    `,
  }),
};

export const Headless: Story = {
  render: () => ({
    template: `
      <tedi-table-of-contents [heading]="null" [sticky]="false" [numbered]="true" activeId="section-3">
        ${sectionItems}
      </tedi-table-of-contents>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    template: `
      <tedi-table-of-contents heading="Sisukord" [sticky]="false" activeId="section-3">
        <tedi-table-of-contents-item itemId="section-1">
          <a tedi-link href="#section-1" [underline]="false">
            Sissejuhatus
          </a>
        </tedi-table-of-contents-item>
        <tedi-table-of-contents-item itemId="section-2">
          <a tedi-link href="#section-2" [underline]="false">
            Taust
          </a>
        </tedi-table-of-contents-item>
        <tedi-table-of-contents-item itemId="section-3">
          <a tedi-link href="#section-3" [underline]="false">
            Meetodid
          </a>
        </tedi-table-of-contents-item>
        <tedi-table-of-contents-item itemId="section-4">
          <a tedi-link href="#section-4" [underline]="false">
            <tedi-icon name="description" [size]="18" />Kokkuvõte
          </a>
        </tedi-table-of-contents-item>
      </tedi-table-of-contents>
    `,
  }),
};

export const Nested: Story = {
  render: () => ({
    template: `
      <tedi-table-of-contents heading="Sisukord" [sticky]="false" activeId="methods-2">
        ${nestedItems}
      </tedi-table-of-contents>
    `,
  }),
};

export const Numbered: Story = {
  render: () => ({
    template: `
      <tedi-table-of-contents heading="Sisukord" [sticky]="false" [numbered]="true" activeId="methods">
        ${nestedItems}
      </tedi-table-of-contents>
    `,
  }),
};

// The story renders a private styleguide matrix, so surface how each state maps
// to the real component as the "Show code" snippet.
const ITEM_STATES_SOURCE = `<!-- Selected: mark the item's id as active. Hover is the link's native state. -->
<tedi-table-of-contents [heading]="null" activeId="selected">
  <tedi-table-of-contents-item itemId="default">
    <a tedi-link href="#default" [underline]="false">Default</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="selected">
    <a tedi-link href="#selected" [underline]="false">Selected</a>
  </tedi-table-of-contents-item>
</tedi-table-of-contents>

<!-- With number: enable numbered. -->
<tedi-table-of-contents [heading]="null" [numbered]="true" activeId="selected">
  <tedi-table-of-contents-item itemId="default">
    <a tedi-link href="#default" [underline]="false">Default</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="selected">
    <a tedi-link href="#selected" [underline]="false">Selected</a>
  </tedi-table-of-contents-item>
</tedi-table-of-contents>

<!-- With icon: compose a leading <tedi-icon> inside the link. -->
<tedi-table-of-contents [heading]="null" activeId="selected">
  <tedi-table-of-contents-item itemId="default">
    <a tedi-link href="#default" [underline]="false">
      <tedi-icon name="mail" [size]="18" />Default
    </a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="selected">
    <a tedi-link href="#selected" [underline]="false">
      <tedi-icon name="mail" [size]="18" />Selected
    </a>
  </tedi-table-of-contents-item>
</tedi-table-of-contents>`;

export const ItemStates: Story = {
  parameters: {
    fullWidth: true,
    pseudo: { hover: "#Hover" },
    docs: { source: { language: "html", code: ITEM_STATES_SOURCE } },
  },
  render: () => ({
    template: `<div style="padding: 1rem;"><toc-item-states /></div>`,
  }),
};

// The story renders a private demo component, so surface a representative,
// copy-pasteable usage as the "Show code" snippet instead of `<toc-sticky-demo />`.
const STICKY_LAYOUT_SOURCE = `@Component({
  selector: "app-article-with-toc",
  imports: [
    TableOfContentsComponent,
    TableOfContentsItemComponent,
    TableOfContentsCollapsibleComponent,
    LinkComponent,
    TextComponent,
    ShowAtDirective,
    HideAtDirective,
  ],
  template: \`
    <div class="layout">
      <div #scroller class="layout__article" tabindex="0" role="region" aria-label="Sisu">
        @for (label of sections; track label; let i = $index) {
          <section [id]="'sec-' + (i + 1)">
            <h2 tedi-text modifiers="h3">{{ label }}</h2>
            <p tedi-text>{{ lorem }}</p>
          </section>
        }
      </div>
      <!-- Desktop: sticky sidebar card -->
      <div *showAt="'md'" class="layout__aside">
        <tedi-table-of-contents heading="Sisukord" [activeId]="activeId()">
          @for (label of sections; track label; let i = $index) {
            <tedi-table-of-contents-item [itemId]="'sec-' + (i + 1)">
              <a tedi-link [href]="'#sec-' + (i + 1)" [underline]="false"
                 (click)="selectSection('sec-' + (i + 1), $event)">{{ label }}</a>
            </tedi-table-of-contents-item>
          }
        </tedi-table-of-contents>
      </div>
    </div>

    <!-- Mobile: collapse into a bottom-sheet -->
    <tedi-table-of-contents-collapsible *hideAt="'md'" heading="Sisukord" [activeId]="activeId()">
      @for (label of sections; track label; let i = $index) {
        <tedi-table-of-contents-item [itemId]="'sec-' + (i + 1)">
          <a tedi-link [href]="'#sec-' + (i + 1)" [underline]="false"
             (click)="selectSection('sec-' + (i + 1), $event)">{{ label }}</a>
        </tedi-table-of-contents-item>
      }
    </tedi-table-of-contents-collapsible>
  \`,
})
export class ArticleWithTocComponent {
  readonly sections = ["Sissejuhatus", "Taust", "Meetodid", "Tulemused", "Arutelu", "Kokkuvõte"];
  readonly activeId = signal("sec-1");

  private readonly scroller = viewChild.required<ElementRef<HTMLDivElement>>("scroller");
  private seeking = false;

  constructor() {
    afterNextRender(() => this.trackActiveSection());
  }

  // Smooth-scroll to the section on click; guard the observer during the scroll
  // so the active marker doesn't flicker through the sections it passes over.
  selectSection(id: string, event: Event): void {
    event.preventDefault();
    this.seeking = true;
    this.activeId.set(id);
    this.scroller().nativeElement
      .querySelector("#" + id)
      ?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => (this.seeking = false), 700);
  }

  // Scroll-spy: highlight the section currently in view.
  private trackActiveSection(): void {
    const root = this.scroller().nativeElement;
    const observer = new IntersectionObserver(
      (entries) => {
        if (this.seeking) return;
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) this.activeId.set((visible.target as HTMLElement).id);
      },
      { root, rootMargin: "0px 0px -55% 0px" },
    );
    this.sections.forEach((_, i) => {
      const el = root.querySelector("#sec-" + (i + 1));
      if (el) observer.observe(el);
    });
  }
}`;

/**
 * A sticky sidebar next to scrollable content. The component is controlled via
 * `activeId`, so the consumer owns scroll behavior: this demo wires an
 * `IntersectionObserver` to highlight the section currently in view (scroll-spy)
 * and smooth-scrolls the article when an item is clicked.
 */
export const StickyInLayout: Story = {
  parameters: {
    layout: "fullscreen",
    fullWidth: true,
    docs: { source: { language: "typescript", code: STICKY_LAYOUT_SOURCE } },
  },
  render: () => ({
    template: `<toc-sticky-demo />`,
  }),
};

// Nested items whose `isValid` / `separator` / `hideIcon` inputs are bound to the
// story args, so the "Table of Contents Item" controls drive the Collapsible story too.
const controllableNestedItems = `
  <tedi-table-of-contents-item itemId="intro" [isValid]="isValid" [separator]="separator" [hideIcon]="hideIcon">
    <a tedi-link href="#intro" [underline]="false">Sissejuhatus</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="methods" [isValid]="isValid" [separator]="separator" [hideIcon]="hideIcon">
    <a tedi-link href="#methods" [underline]="false">Meetodid</a>
    <tedi-table-of-contents-item itemId="methods-1" [isValid]="isValid" [separator]="separator" [hideIcon]="hideIcon">
      <a tedi-link href="#methods-1" [underline]="false">Andmete kogumine</a>
    </tedi-table-of-contents-item>
    <tedi-table-of-contents-item itemId="methods-2" [isValid]="isValid" [separator]="separator" [hideIcon]="hideIcon">
      <a tedi-link href="#methods-2" [underline]="false">Analüüs</a>
    </tedi-table-of-contents-item>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="results" [isValid]="isValid" [separator]="separator" [hideIcon]="hideIcon">
    <a tedi-link href="#results" [underline]="false">Tulemused</a>
    <tedi-table-of-contents-item itemId="results-1" [isValid]="isValid" [separator]="separator" [hideIcon]="hideIcon">
      <a tedi-link href="#results-1" [underline]="false">Joonised</a>
    </tedi-table-of-contents-item>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="discussion" [isValid]="isValid" [separator]="separator" [hideIcon]="hideIcon">
    <a tedi-link href="#discussion" [underline]="false">Arutelu</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="conclusion" [isValid]="isValid" [separator]="separator" [hideIcon]="hideIcon">
    <a tedi-link href="#conclusion" [underline]="false">Kokkuvõte</a>
  </tedi-table-of-contents-item>
`;

/**
 * Responsive page usage. On desktop (`md` and up) the table of contents is a
 * sticky sidebar card next to the content; below `md` it collapses into
 * `tedi-table-of-contents-collapsible` — a bottom bar that opens the list in a
 * bottom-sheet overlay. Resize the canvas to switch between the two.
 *
 * `tedi-table-of-contents-collapsible` accepts the same inputs as the root
 * component (`heading`, `activeId`, `showIcons`, `numbered`, `sticky`,
 * `ariaLabel`) — everything except `variant`, `padding` and `headingLevel` — so
 * the controls above apply here too.
 */
export const Collapsible: Story = {
  // The collapsible takes the same inputs as the root, so this story reuses the
  // shared controls. Hide the root-only ones that don't apply here.
  parameters: {
    layout: "fullscreen",
    fullWidth: true,
    controls: { exclude: ["variant", "padding", "itemId", "headingLevel"] },
  },
  args: {
    heading: "Sisukord",
    activeId: "methods",
    showIcons: false,
    numbered: false,
    sticky: false,
    isValid: undefined,
    separator: false,
    hideIcon: false,
  },
  render: (args) => ({
    props: { ...args, isValid: args.isValid ?? null },
    template: `
      <div *showAt="'md'" style="background: var(--general-surface-primary); padding: 2rem;">
        <h2 tedi-text modifiers="h1">Tervisedeklaratsioon</h2>
        <p tedi-text color="secondary" style="margin: 0.5rem 0 0;">
          Tervisedeklaratsioon koosneb 22 kohustuslikust küsimusest. Alusta või
          jätka selle koostamisega allpool.
        </p>
        <div style="display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 1.5rem; align-items: start; margin-top: 1.5rem;">
          <div style="min-height: 35rem; background: var(--general-surface-primary); border: 1px solid var(--general-border-primary); border-radius: var(--card-radius-rounded);"></div>
          <tedi-table-of-contents
            [heading]="heading"
            [sticky]="false"
            [activeId]="activeId"
            [showIcons]="showIcons"
            [numbered]="numbered"
            [ariaLabel]="ariaLabel"
          >
            ${controllableNestedItems}
          </tedi-table-of-contents>
        </div>
      </div>

      <div *hideAt="'md'" style="display: flex; flex-direction: column; min-height: 100vh; background: var(--general-surface-tertiary); gap: 3px;">
        <div style="display: flex; flex-direction: column; flex: 1 1 auto; padding: var(--layout-page-spacing-top) var(--layout-page-spacing-x) 0 var(--layout-page-spacing-x);">
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <a tedi-link href="#" [underline]="false">
              <tedi-icon name="arrow_back" [size]="18" />Tervisetõendid ja -deklaratsioonid
            </a>

            <div>
              <h2 tedi-text modifiers="h1">Tervisedeklaratsioon</h2>
              <p tedi-text color="secondary">
                Tervisedeklaratsioon koosneb 22 kohustuslikust küsimusest. Alusta või
                jätka selle koostamisega allpool.
              </p>
            </div>
          </div>
          <div
            style="flex: 1 1 auto; margin-top: 1rem; background: var(--general-surface-primary); border: 1px solid var(--general-border-primary); border-radius: var(--card-radius-rounded);"
          ></div>
        </div>
        <tedi-table-of-contents-collapsible
          [heading]="heading"
          [activeId]="activeId"
          [showIcons]="showIcons"
          [numbered]="numbered"
          [sticky]="sticky"
          [ariaLabel]="ariaLabel"
        >
          ${controllableNestedItems}
        </tedi-table-of-contents-collapsible>
      </div>
    `,
  }),
};
