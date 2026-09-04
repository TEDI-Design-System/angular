import { isPlatformBrowser } from "@angular/common";
import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from "@angular/core";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";

import { IconComponent } from "../../base/icon/icon.component";
import { TextComponent } from "../../base/text/text.component";
import { HideAtDirective } from "../../../directives/hide-at/hide-at.directive";
import { ShowAtDirective } from "../../../directives/show-at/show-at.directive";
import { LinkComponent } from "../link/link.component";
import { TableOfContentsComponent } from "./table-of-contents.component";
import { TableOfContentsCollapsibleComponent } from "./table-of-contents-collapsible/table-of-contents-collapsible.component";
import { TableOfContentsItemComponent } from "./table-of-contents-item/table-of-contents-item.component";
import { TableOfContentsItemSuffixDirective } from "./table-of-contents-item/table-of-contents-item-suffix.directive";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { TagComponent } from "../../tags/tag/tag.component";

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
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.66.83?node-id=8469-72329&m=dev" target="_blank">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/467bb3-table-of-contents" target="_blank">Zeroheight ↗</a>
 *
 * Compose the list from `tedi-table-of-contents-item` elements. Each item's
 * link/label is its default projected content, project optional trailing content
 * with the `[tediTocItemSuffix]` directive to render it right-aligned at the end
 * of the row (see the WithSlot story).
 */

const meta = {
  title: "TEDI-Ready/Components/Navigation/TableOfContents",
  component: TableOfContentsComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TableOfContentsComponent,
        TableOfContentsItemComponent,
        TableOfContentsItemSuffixDirective,
        TableOfContentsCollapsibleComponent,
        LinkComponent,
        IconComponent,
        TextComponent,
        ShowAtDirective,
        HideAtDirective,
        SeparatorComponent,
        TagComponent,
      ],
    }),
    (story, context) => {
      const rendered = story();
      // `fullscreen` layout avoids Storybook's padded-layout scrollbar at fixed
      // viewports; add the padding back here for the constrained card stories.
      // Full-width stories manage their own layout/padding.
      const wrapper = context.parameters["fullWidth"]
        ? ""
        : "max-width: 390px; padding: 1.5rem;";
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
        "Id of the currently active item. It gets the accent bar and active colour.",
      control: "text",
      table: {
        category: "Table of Contents",
        type: { summary: "string" },
      },
    },
    defaultOpen: {
      description:
        "Whether nested items are expanded by default. When `false`, a branch reveals its sub-items only while it is on the active trail.",
      control: "boolean",
      table: {
        category: "Table of Contents",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
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
    bordered: {
      description:
        "Draw a divider under each item except the last (sub-items included) so the list reads as separated rows.",
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
    stickyOffset: {
      description:
        "Distance from the top of the scroll container at which the sticky TOC pins, as a CSS length or expression. Raise it to clear a fixed header, e.g. `calc(var(--layout-header-height) + 1.5rem)`. Drives both `top` and the default `max-height`. Only applies while `sticky` is `true`.",
      control: "text",
      table: {
        category: "Table of Contents",
        type: { summary: "string" },
        defaultValue: { summary: "1.5rem" },
      },
    },
    stickyMaxHeight: {
      description:
        "Overrides the sticky height cap. The default keeps the TOC within the viewport (`calc(100dvh - offset - 1.5rem)`); set it when the TOC scrolls inside a fixed-height container rather than the window, e.g. `calc(30rem - 3rem)`. Only applies while `sticky` is `true`.",
      control: "text",
      table: {
        category: "Table of Contents",
        type: { summary: "string" },
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
  },
} as Meta<TableOfContentsComponent>;

export default meta;

type Story = StoryObj<
  TableOfContentsComponent & {
    separator?: boolean;
  }
>;

const items = ({
  icon = false,
  separator = false,
  slot = false,
}: { icon?: boolean; separator?: boolean; slot?: boolean } = {}) => `
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
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="discussion" ${separator ? ' [separator]="true"' : ""}>
    <a tedi-link href="#discussion" [underline]="false">Arutelu</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="conclusion">
    <a tedi-link href="#conclusion" [underline]="false">
      ${icon ? '<tedi-icon name="description" [size]="18" /> ' : ""}Kokkuvõte
    </a>
    ${slot ? "<tedi-tag tediTocItemSuffix>43 tulemust</tedi-tag>" : ""}
  </tedi-table-of-contents-item>
`;

const controllableItems = SECTIONS.map((label, index) => {
  const id = `section-${index + 1}`;

  const subItems =
    label === "Meetodid"
      ? `
        <tedi-table-of-contents-item itemId="${id}-1" [separator]="separator">
          <a tedi-link href="#${id}-1" [underline]="false">Andmete kogumine</a>
        </tedi-table-of-contents-item>
        <tedi-table-of-contents-item itemId="${id}-2" [separator]="separator">
          <a tedi-link href="#${id}-2" [underline]="false">Analüüs</a>
        </tedi-table-of-contents-item>`
      : "";
  return `
      <tedi-table-of-contents-item itemId="${id}" [separator]="separator">
        <a tedi-link href="#${id}" [underline]="false">${label}</a>${subItems}
      </tedi-table-of-contents-item>`;
}).join("");

export const Default: Story = {
  args: {
    heading: "Sisukord",
    headingLevel: "h3",
    variant: "default",
    activeId: "section-3",
    defaultOpen: true,
    numbered: false,
    sticky: false,
    separator: false,
    bordered: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-table-of-contents
        [heading]="heading"
        [headingLevel]="headingLevel"
        [variant]="variant"
        [activeId]="activeId"
        [defaultOpen]="defaultOpen"
        [numbered]="numbered"
        [sticky]="sticky"
        [bordered]="bordered"
      >
        ${controllableItems}
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
</tedi-table-of-contents>

<!-- With separator: add an inset divider under an item via its separator input. -->
<tedi-table-of-contents [heading]="null" activeId="selected">
  <tedi-table-of-contents-item itemId="default" [separator]="true">
    <a tedi-link href="#default" [underline]="false">Default</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="selected" [separator]="true">
    <a tedi-link href="#selected" [underline]="false">Selected</a>
  </tedi-table-of-contents-item>
</tedi-table-of-contents>

<!-- With border: enable bordered for a full-width divider under every row. -->
<tedi-table-of-contents [heading]="null" [bordered]="true" activeId="selected">
  <tedi-table-of-contents-item itemId="default">
    <a tedi-link href="#default" [underline]="false">Default</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="selected">
    <a tedi-link href="#selected" [underline]="false">Selected</a>
  </tedi-table-of-contents-item>
</tedi-table-of-contents>`;

export const ItemStates: Story = {
  parameters: {
    fullWidth: true,
    pseudo: { hover: ".toc-item-states__hover" },
    docs: { source: { language: "html", code: ITEM_STATES_SOURCE } },
  },
  render: () => ({
    props: {
      variants: [
        {
          header: "Default",
          numbered: false,
          icon: false,
          separator: false,
          bordered: false,
        },
        {
          header: "With number",
          numbered: true,
          icon: false,
          separator: false,
          bordered: false,
        },
        {
          header: "With icon",
          numbered: false,
          icon: true,
          separator: false,
          bordered: false,
        },
        {
          header: "With separator",
          numbered: false,
          icon: false,
          separator: true,
          bordered: false,
        },
        {
          header: "With border",
          numbered: false,
          icon: false,
          separator: false,
          bordered: true,
        },
      ],
      states: [
        { id: "default", label: "Default", hover: false },
        { id: "hover", label: "Hover", hover: true },
        { id: "selected", label: "Selected", hover: false },
      ],
    },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 1.5rem; padding: 1rem;">
        @for (variant of variants; track variant.header) {
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <p tedi-text modifiers="bold">{{ variant.header }}</p>
            <tedi-table-of-contents
              [heading]="null"
              [sticky]="false"
              [numbered]="variant.numbered"
              [bordered]="variant.bordered"
              activeId="selected"
              [ariaLabel]="variant.header + ' states'"
            >
              @for (state of states; track state.id) {
                <tedi-table-of-contents-item [itemId]="state.id" [separator]="variant.separator">
                  <a tedi-link href="#" [underline]="false" [class.toc-item-states__hover]="state.hover">
                    @if (variant.icon) {
                      <tedi-icon name="mail" [size]="18" />
                    }
                    {{ state.label }}
                  </a>
                </tedi-table-of-contents-item>
              }
              @if (variant.bordered) {
                <!--
                  'bordered' drops the divider under the last item (the card supplies
                  that edge in real use). This inert trailing row keeps the Selected
                  state above it non-last, so it shows its real divider like the design.
                -->
                <tedi-table-of-contents-item itemId="filler" aria-hidden="true" />
              }
            </tedi-table-of-contents>
          </div>
        }
      </div>
    `,
  }),
};

export const Transparent: Story = {
  render: () => ({
    template: `
      <tedi-table-of-contents heading="Sisukord" variant="transparent" [sticky]="false" activeId="methods">
        ${items()}
      </tedi-table-of-contents>
    `,
  }),
};

export const WithSlot: Story = {
  render: () => ({
    template: `
      <tedi-table-of-contents heading="Sisukord" [sticky]="false" activeId="methods">
        ${items({ slot: true })}
      </tedi-table-of-contents>
    `,
  }),
};

export const Numbered: Story = {
  render: () => ({
    template: `
      <tedi-table-of-contents heading="Sisukord" [sticky]="false" [numbered]="true" activeId="methods">
        ${items()}
      </tedi-table-of-contents>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    template: `
      <tedi-table-of-contents heading="Sisukord" [sticky]="false" activeId="methods">
        ${items({ icon: true })}
      </tedi-table-of-contents>
    `,
  }),
};

export const Headless: Story = {
  render: () => ({
    template: `
      <tedi-table-of-contents [heading]="null" [sticky]="false" [numbered]="true" activeId="methods">
        ${items()}
      </tedi-table-of-contents>
    `,
  }),
};

export const WithSeparator: Story = {
  render: () => ({
    template: `
      <tedi-table-of-contents heading="Sisukord" [sticky]="false" activeId="methods">
        ${items({ icon: true, separator: true })}
      </tedi-table-of-contents>
    `,
  }),
};

export const Bordered: Story = {
  render: () => ({
    template: `
      <tedi-table-of-contents heading="Sisukord" [sticky]="false" activeId="methods" [bordered]="true">
        ${items({ icon: true })}
      </tedi-table-of-contents>
    `,
  }),
};

interface DemoSection {
  id: string;
  label: string;
  children?: { id: string; label: string }[];
}

const CHAPTERS: DemoSection[] = Array.from({ length: 30 }, (_, i) => {
  const chapter: DemoSection = {
    id: `chapter-${i + 1}`,
    label: `Peatükk ${i + 1}`,
  };
  if (i === 2) {
    chapter.children = [
      { id: "chapter-3-1", label: "Peatükk 3.1" },
      { id: "chapter-3-2", label: "Peatükk 3.2" },
    ];
  }
  return chapter;
});

/**
 * Example for the StickyInLayout story: a documentation page with a sticky
 * table-of-contents sidebar inside a fixed-height scrollable region. The page
 * scrolls, the sticky TOC stays alongside it — heading pinned, list scrolling on
 * its own when taller than the space available. The component is controlled via
 * `activeId`: an `IntersectionObserver` highlights the section in view (scroll-spy)
 * and clicking an item smooth-scrolls the page to it.
 */
@Component({
  selector: "toc-sticky-demo",
  standalone: true,
  imports: [
    TableOfContentsComponent,
    TableOfContentsItemComponent,
    LinkComponent,
    TextComponent,
  ],
  template: `
    <div #page class="scroll-page">
      <div class="scroll-page__grid">
        <article>
          <h1 tedi-text modifiers="h1">Pealkiri</h1>
          @for (chapter of chapters; track chapter.id) {
            <section [id]="chapter.id" class="scroll-page__section">
              <h2 tedi-text modifiers="h3">{{ chapter.label }}</h2>
              <p tedi-text>{{ lorem }}</p>
              <p tedi-text>{{ lorem }}</p>
            </section>
            @for (child of chapter.children ?? []; track child.id) {
              <section [id]="child.id" class="scroll-page__section">
                <h3 tedi-text modifiers="h4">{{ child.label }}</h3>
                <p tedi-text>{{ lorem }}</p>
              </section>
            }
          }
        </article>
        <tedi-table-of-contents
          heading="Sisukord"
          [activeId]="activeId()"
          stickyMaxHeight="calc(30rem - 3rem)"
        >
          @for (chapter of chapters; track chapter.id) {
            <tedi-table-of-contents-item [itemId]="chapter.id">
              <a
                tedi-link
                [href]="'#' + chapter.id"
                [underline]="false"
                (click)="selectSection(chapter.id, $event)"
                >{{ chapter.label }}</a
              >
              @for (child of chapter.children ?? []; track child.id) {
                <tedi-table-of-contents-item [itemId]="child.id">
                  <a
                    tedi-link
                    [href]="'#' + child.id"
                    [underline]="false"
                    (click)="selectSection(child.id, $event)"
                    >{{ child.label }}</a
                  >
                </tedi-table-of-contents-item>
              }
            </tedi-table-of-contents-item>
          }
        </tedi-table-of-contents>
      </div>
    </div>
  `,
  styles: [
    `
      .scroll-page {
        height: 30rem;
        overflow-y: auto;
        border: var(--tedi-borders-01) solid var(--card-border-primary);
        border-radius: var(--card-radius-rounded);
      }
      .scroll-page__grid {
        display: grid;
        grid-template-columns: 1fr 16rem;
        gap: 2rem;
        padding: 2rem;
      }
      .scroll-page article > h1 {
        margin-bottom: 1rem;
      }
      .scroll-page__section {
        margin-bottom: 2rem;
      }
      .scroll-page__section p {
        margin: 0.25rem 0 0;
      }
    `,
  ],
})
class TocStickyDemoComponent implements OnDestroy {
  readonly chapters = CHAPTERS;
  readonly lorem = LOREM;
  readonly activeId = signal(CHAPTERS[0].id);

  private readonly page =
    viewChild.required<ElementRef<HTMLDivElement>>("page");
  private readonly platformId = inject(PLATFORM_ID);
  private seeking = false;
  private seekTimeout?: ReturnType<typeof setTimeout>;
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => this.trackActiveSection());
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    clearTimeout(this.seekTimeout);
  }

  // Smooth-scroll the page to the clicked section; guard the observer during the
  // scroll so the active marker doesn't flicker through the sections it passes.
  selectSection(id: string, event: Event): void {
    event.preventDefault();
    const root = this.page().nativeElement;
    const target = root.querySelector<HTMLElement>(`#${id}`);
    if (!target) return;
    this.seeking = true;
    this.activeId.set(id);
    clearTimeout(this.seekTimeout);
    this.seekTimeout = setTimeout(() => (this.seeking = false), 700);
    root.scrollTo({
      top:
        root.scrollTop +
        target.getBoundingClientRect().top -
        root.getBoundingClientRect().top,
      behavior: "smooth",
    });
  }

  // Scroll-spy: highlight the chapter currently in view.
  private trackActiveSection(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = this.page().nativeElement;
    const ids = this.chapters.flatMap((c) => [
      c.id,
      ...(c.children ?? []).map((child) => child.id),
    ]);
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
    this.observer = observer;
    ids.forEach((id) => {
      const el = root.querySelector(`#${id}`);
      if (el) observer.observe(el);
    });
  }
}

// The story renders a private demo component, so surface a representative,
// copy-pasteable page as the "Show code" snippet instead of `<toc-sticky-demo />`.
const STICKY_LAYOUT_SOURCE = `@Component({
  selector: "app-doc-page",
  imports: [
    TableOfContentsComponent,
    TableOfContentsItemComponent,
    LinkComponent,
    TextComponent,
  ],
  template: \`
    <!-- A fixed-height scroll region: the page scrolls, the TOC sticks and (when
         the list is taller than the space) scrolls on its own. -->
    <div #page class="doc-page">
      <article>
        @for (chapter of chapters; track chapter.id) {
          <section [id]="chapter.id">
            <h2 tedi-text modifiers="h3">{{ chapter.label }}</h2>
            <p tedi-text>…</p>
          </section>
        }
      </article>
      <!-- The scroll region is 30rem, not the viewport, so cap the sticky
           height to it via stickyMaxHeight (the 100dvh default is the wrong
           basis here). -->
      <tedi-table-of-contents
        heading="Sisukord"
        [activeId]="activeId()"
        stickyMaxHeight="calc(30rem - 3rem)"
      >
        @for (chapter of chapters; track chapter.id) {
          <tedi-table-of-contents-item [itemId]="chapter.id">
            <a tedi-link [href]="'#' + chapter.id" [underline]="false"
               (click)="selectSection(chapter.id, $event)">{{ chapter.label }}</a>
          </tedi-table-of-contents-item>
        }
      </tedi-table-of-contents>
    </div>
  \`,
  styles: \`
    .doc-page {
      display: grid;
      grid-template-columns: 1fr 16rem;
      gap: 2rem;
      height: 30rem;
      overflow-y: auto;
    }
  \`,
})
export class DocPageComponent implements OnDestroy {
  readonly chapters = [
    { id: "intro", label: "Sissejuhatus" },
    { id: "methods", label: "Meetodid" },
    // …
  ];
  readonly activeId = signal(this.chapters[0].id);

  private readonly page = viewChild.required<ElementRef<HTMLDivElement>>("page");
  private observer?: IntersectionObserver;
  private seeking = false;
  private seekTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    afterNextRender(() => this.trackActiveSection());
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    clearTimeout(this.seekTimeout);
  }

  // Smooth-scroll the page to the clicked section; guard the observer during the
  // scroll so the active marker doesn't flicker through the sections it passes.
  selectSection(id: string, event: Event): void {
    event.preventDefault();
    const root = this.page().nativeElement;
    const target = root.querySelector<HTMLElement>("#" + id);
    if (!target) return;
    this.seeking = true;
    this.activeId.set(id);
    clearTimeout(this.seekTimeout);
    this.seekTimeout = setTimeout(() => (this.seeking = false), 700);
    root.scrollTo({
      top:
        root.scrollTop +
        target.getBoundingClientRect().top -
        root.getBoundingClientRect().top,
      behavior: "smooth",
    });
  }

  // Scroll-spy: highlight the section currently in view.
  private trackActiveSection(): void {
    const root = this.page().nativeElement;
    const observer = new IntersectionObserver(
      (entries) => {
        if (this.seeking) return;
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) this.activeId.set((visible.target as HTMLElement).id);
      },
      { root, rootMargin: "0px 0px -55% 0px" },
    );
    this.observer = observer;
    this.chapters.forEach((chapter) => {
      const el = root.querySelector("#" + chapter.id);
      if (el) observer.observe(el);
    });
  }
}`;

/**
 * A documentation page with a sticky table-of-contents sidebar. The page scrolls
 * inside a fixed-height region, and the sticky TOC stays alongside it — its
 * heading pinned while the list scrolls on its own when it is taller than the
 * space available. The component is controlled via `activeId`, so the consumer
 * owns scroll behavior: this demo wires an `IntersectionObserver` to highlight the
 * section in view (scroll-spy) and smooth-scrolls the page to a section when its
 * item is clicked.
 */
export const StickyInLayout: Story = {
  parameters: {
    layout: "fullscreen",
    fullWidth: true,
    docs: { source: { language: "typescript", code: STICKY_LAYOUT_SOURCE } },
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
  render: () => ({
    moduleMetadata: { imports: [TocStickyDemoComponent] },
    template: `<toc-sticky-demo />`,
  }),
};

// Nested items whose `separator` input is bound to the story args, so the
// "Table of Contents Item" control drives the Collapsible story too.
const controllableNestedItems = `
  <tedi-table-of-contents-item itemId="intro" [separator]="separator">
    <a tedi-link href="#intro" [underline]="false">Sissejuhatus</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="methods" [separator]="separator">
    <a tedi-link href="#methods" [underline]="false">Meetodid</a>
    <tedi-table-of-contents-item itemId="methods-1" [separator]="separator">
      <a tedi-link href="#methods-1" [underline]="false">Andmete kogumine</a>
    </tedi-table-of-contents-item>
    <tedi-table-of-contents-item itemId="methods-2" [separator]="separator">
      <a tedi-link href="#methods-2" [underline]="false">Analüüs</a>
    </tedi-table-of-contents-item>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="results" [separator]="separator">
    <a tedi-link href="#results" [underline]="false">Tulemused</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="discussion" [separator]="separator">
    <a tedi-link href="#discussion" [underline]="false">Arutelu</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="conclusion" [separator]="separator">
    <a tedi-link href="#conclusion" [underline]="false">Kokkuvõte</a>
  </tedi-table-of-contents-item>
`;

/**
 * Responsive page usage. On desktop (`lg` and up) the table of contents is a
 * sticky sidebar card next to the content; below `lg` it collapses into
 * `tedi-table-of-contents-collapsible` — a bottom bar that opens the list in a
 * bottom-sheet overlay. Resize the canvas to switch between the two.
 *
 * `tedi-table-of-contents-collapsible` accepts the same inputs as the root
 * component (`heading`, `activeId`, `numbered`, `sticky`, `ariaLabel`) —
 * everything except `variant` and `headingLevel` — so the controls above apply
 * here too.
 */
export const Collapsible: Story = {
  parameters: {
    layout: "fullscreen",
    fullWidth: true,
    controls: { exclude: ["variant", "itemId", "headingLevel"] },
  },
  args: {
    heading: "Sisukord",
    activeId: "methods",
    numbered: false,
    sticky: false,
    separator: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div *showAt="'lg'" style="background: var(--general-surface-primary); padding: 2rem;">
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
            [numbered]="numbered"
            [ariaLabel]="ariaLabel"
          >
            ${controllableNestedItems}
          </tedi-table-of-contents>
        </div>
      </div>

      <div *hideAt="'lg'" style="display: flex; flex-direction: column; min-height: 100vh; background: var(--general-surface-tertiary); gap: 3px;">
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
