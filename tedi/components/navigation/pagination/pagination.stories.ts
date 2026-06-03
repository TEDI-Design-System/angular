import { argsToTemplate, Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { PaginationComponent } from "./pagination.component";
import { TediPaginationResultsDirective } from "./pagination-results.directive";

/**
 * Navigation between paginated sets of content. Renders a row of page buttons
 * with optional results label and page-size selector.
 *
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.70?node-id=8478-72385&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/35aad8-pagination" target="_BLANK">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Components/Navigation/Pagination",
  component: PaginationComponent,
  decorators: [
    moduleMetadata({
      imports: [PaginationComponent, TediPaginationResultsDirective],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.45.70?node-id=8478-72385&m=dev",
    },
  },
  args: {
    pageCount: 10,
    page: 3,
    boundaryCount: 1,
    siblingCount: 1,
  },
  argTypes: {
    pageCount: {
      description: "Total number of pages.",
      control: "number",
      table: { category: "inputs", type: { summary: "number" } },
    },
    page: {
      description: "Current page (1-based). Two-way bindable via `[(page)]`.",
      control: "number",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    totalItems: {
      description:
        "Total number of items across all pages. When set, the 'X results' label is rendered.",
      control: "number",
      table: { category: "inputs", type: { summary: "number" } },
    },
    pageSize: {
      description: "Current page size.",
      control: "number",
      table: { category: "inputs", type: { summary: "number" } },
    },
    pageSizeOptions: {
      description:
        "Options shown in the page-size dropdown. Empty array hides the dropdown.",
      control: "object",
      table: {
        category: "inputs",
        type: { summary: "number[]" },
        defaultValue: { summary: "[]" },
      },
    },
    boundaryCount: {
      description: "Pages always shown at the start and end of the range.",
      control: "number",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    siblingCount: {
      description: "Pages shown on either side of the current page.",
      control: "number",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    labels: {
      description: "Override any of the default text labels / aria labels.",
      control: "object",
      table: {
        category: "inputs",
        type: { summary: "Partial<PaginationLabels>" },
      },
    },
    background: {
      description:
        "Background variant. `transparent` removes the surface fill and top border.",
      control: { type: "radio" },
      options: ["white", "transparent"],
      table: {
        category: "inputs",
        type: { summary: "PaginationBackground", detail: "white \ntransparent" },
        defaultValue: { summary: "white" },
      },
    },
    dividerPosition: {
      description:
        "Position of the divider line. `'none'` removes it entirely.",
      control: { type: "radio" },
      options: ["top", "bottom", "none"],
      table: {
        category: "inputs",
        type: { summary: "PaginationDividerPosition" },
        defaultValue: { summary: "top" },
      },
    },
    disableArrowsAtBoundary: {
      description:
        "Keep the prev/next button rendered (but disabled) at the first/last page instead of removing it from the DOM.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    arrowVariant: {
      description:
        "Variant for the prev/next arrow buttons. Accepts any `tedi-button` variant.",
      control: { type: "select" },
      options: [
        "primary",
        "secondary",
        "neutral",
        "success",
        "danger",
        "danger-neutral",
        "primary-inverted",
        "secondary-inverted",
        "neutral-inverted",
      ],
      table: {
        category: "inputs",
        type: { summary: "ButtonVariant" },
        defaultValue: { summary: "neutral" },
      },
    },
    showArrowLabels: {
      description:
        "Render the `previous` / `next` labels as visible text next to the arrow icon. When false, the buttons are icon-only.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    previousIcon: {
      description: "Material Symbols icon name for the previous-page arrow.",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "arrow_back" },
      },
    },
    nextIcon: {
      description: "Material Symbols icon name for the next-page arrow.",
      control: "text",
      table: {
        category: "inputs",
        type: { summary: "string" },
        defaultValue: { summary: "arrow_forward" },
      },
    },
    hideArrows: {
      description:
        "Hide the prev/next arrows. `true` = always hidden, a breakpoint name = hidden below that breakpoint.",
      control: { type: "select" },
      options: [false, true, "sm", "md", "lg", "xl", "xxl"],
      table: {
        category: "inputs",
        type: { summary: "PaginationVisibility" },
        defaultValue: { summary: "false" },
      },
    },
    showModalTitle: {
      description:
        "Show a heading inside the mobile page-jump / page-size picker modals.",
      control: "boolean",
      table: {
        category: "inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    hideResults: {
      description:
        'Hide the "X results" label. `true` = always hidden, a breakpoint name (e.g. `"md"`) = hidden below that breakpoint.',
      control: { type: "select" },
      options: [false, true, "sm", "md", "lg", "xl", "xxl"],
      table: {
        category: "inputs",
        type: { summary: "PaginationVisibility" },
        defaultValue: { summary: "false" },
      },
    },
    hidePageSize: {
      description:
        "Hide the page-size dropdown. `true` = always hidden, a breakpoint name = hidden below that breakpoint.",
      control: { type: "select" },
      options: [false, true, "sm", "md", "lg", "xl", "xxl"],
      table: {
        category: "inputs",
        type: { summary: "PaginationVisibility" },
        defaultValue: { summary: "false" },
      },
    },
    hidePager: {
      description:
        "Hide the pager (prev/next + page list). `true` = always hidden, a breakpoint name = hidden below that breakpoint.",
      control: { type: "select" },
      options: [false, true, "sm", "md", "lg", "xl", "xxl"],
      table: {
        category: "inputs",
        type: { summary: "PaginationVisibility" },
        defaultValue: { summary: "false" },
      },
    },
    pageChange: {
      description: "Emits the new 1-based page when navigation happens.",
      table: { category: "outputs", type: { summary: "EventEmitter<number>" } },
    },
    pageSizeChange: {
      description: "Emits the new page size when the dropdown changes.",
      table: { category: "outputs", type: { summary: "EventEmitter<number>" } },
    },
  },
} as Meta<PaginationComponent>;

type Story = StoryObj<PaginationComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
};

export const First: Story = {
  args: { pageCount: 10, page: 1 },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
};

export const Last: Story = {
  args: { pageCount: 10, page: 10 },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
};

export const AllPropertiesShown: Story = {
  args: {
    pageCount: 10,
    page: 3,
    totalItems: 97,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
};

export const WithoutResultsNumber: Story = {
  args: {
    pageCount: 10,
    page: 3,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
};

export const WithoutDropdown: Story = {
  args: { pageCount: 10, page: 3, totalItems: 97 },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
};

export const ControlledPage: Story = {
  args: { pageCount: 10, page: 3 },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
};

export const FewPages: Story = {
  args: { pageCount: 4, page: 2 },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
};

export const ManyPagesEllipsis: Story = {
  args: { pageCount: 50, page: 12 },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
};

export const HugePageCount: Story = {
  args: { pageCount: 5000, page: 2500 },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Stress-test with a very large page count (5000 pages). The pager still renders a compact range with ellipses on both sides, and the mobile page-jump modal stays usable.",
      },
    },
  },
};

export const WiderSiblings: Story = {
  args: { pageCount: 40, page: 20, boundaryCount: 2, siblingCount: 2 },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
};

export const Transparent: Story = {
  args: {
    pageCount: 10,
    page: 3,
    totalItems: 97,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    background: "transparent",
  },
  render: (args) => ({
    props: args,
    template: `<div style="background: var(--general-surface-secondary); padding: 16px;"><tedi-pagination ${argsToTemplate(args)} /></div>`,
  }),
};

export const TopBottomSplit: Story = {
  args: {
    pageCount: 10,
    page: 3,
    totalItems: 97,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-pagination ${argsToTemplate(args)} [hidePager]="true" dividerPosition="bottom" />
      <div style="padding: 24px 0; color: var(--general-text-tertiary); text-align: center;">— table content goes here —</div>
      <tedi-pagination ${argsToTemplate(args)} [hideResults]="true" [hidePageSize]="true" />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Use the per-slot hide toggles to render different parts of the pagination above and below a table. Top row shows results + page-size; bottom row shows only the pager.",
      },
    },
  },
};

export const ResponsiveVisibility: Story = {
  args: {
    pageCount: 10,
    page: 3,
    totalItems: 97,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    hidePageSize: "md",
  },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Pass a breakpoint name to any of `hideResults`, `hidePageSize`, `hidePager` to hide that slot only below that breakpoint. Mirrors `tedi-modal`'s `fullscreen` input. Here, `hidePageSize=\"md\"` hides the page-size dropdown on screens smaller than `md`. Resize the viewport to see it appear/disappear.",
      },
    },
  },
};

export const DividerBottom: Story = {
  args: {
    pageCount: 10,
    page: 3,
    totalItems: 97,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    dividerPosition: "bottom",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-pagination ${argsToTemplate(args)} />
      <div style="padding: 24px 0; color: var(--general-text-tertiary); text-align: center;">— table content goes here —</div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "When pagination sits *above* the content, set `dividerPosition=\"bottom\"` so the line separates the strip from the rows below it. Use `\"none\"` to remove the divider when the wrapping container already has one.",
      },
    },
  },
};

export const DisabledBoundaryArrows: Story = {
  args: {
    pageCount: 10,
    page: 1,
    totalItems: 97,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    disableArrowsAtBoundary: true,
  },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "By default the prev/next button is removed from the DOM at the first/last page so the pager looks balanced. Set `disableArrowsAtBoundary=true` to keep it rendered as a disabled button instead — useful when a stable footprint matters more than a clean look.",
      },
    },
  },
};

export const ArrowsWithLabels: Story = {
  args: {
    pageCount: 10,
    page: 3,
    totalItems: 97,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    showArrowLabels: true,
  },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Set `showArrowLabels=true` to render the `previous` / `next` translation labels as visible text next to the icon. Use the `labels` input to override the wording (e.g. \"Previous\" instead of \"Previous page\") when shorter button text is preferred.",
      },
    },
  },
};

export const CustomArrowIcons: Story = {
  args: {
    pageCount: 10,
    page: 3,
    totalItems: 97,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    previousIcon: "chevron_left",
    nextIcon: "chevron_right",
  },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Override the default `arrow_back` / `arrow_forward` Material Symbols icons via `previousIcon` and `nextIcon`. Useful when the surrounding design system uses a different arrow style (chevrons, double arrows, etc.).",
      },
    },
  },
};

export const ArrowsPrimaryVariant: Story = {
  args: {
    pageCount: 10,
    page: 3,
    totalItems: 97,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    arrowVariant: "primary",
    showArrowLabels: true,
  },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Use `arrowVariant` to apply any `tedi-button` variant to the prev/next buttons. Pair with `showArrowLabels` to render a regular labelled button — useful when the pager needs to read as a primary navigation action rather than a subtle icon-only control.",
      },
    },
  },
};

export const CustomResultsSlot: Story = {
  args: {
    pageCount: 10,
    page: 3,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-pagination ${argsToTemplate(args)}>
        <span tediPaginationResults class="text-small">1000+ tulemust</span>
      </tedi-pagination>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Project `[tediPaginationResults]` content to replace the default \"X results\" label entirely — useful when the count is an approximation (`1000+`), a status pill, or a more complex DOM than a plain count.",
      },
    },
  },
};

export const CustomLabels: Story = {
  args: {
    pageCount: 10,
    page: 1,
    totalItems: 97,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50],
    labels: {
      ariaLabel: "Lehekülgede sirvimine",
      previous: "Eelmine lehekülg",
      next: "Järgmine lehekülg",
      pageAriaLabel: (page) => `Mine leheküljele ${page}`,
      currentPageAriaLabel: (page) => `Praegune lehekülg, lehekülg ${page}`,
      results: (count) => `${count} rida`,
      pageSize: "Kirjete arv lehel",
      pageTitle: "Vali lehekülg",
      pageSizeTitle: "Kirjete arv lehel",
    },
  },
  render: (args) => ({
    props: args,
    template: `<tedi-pagination ${argsToTemplate(args)} />`,
  }),
};
