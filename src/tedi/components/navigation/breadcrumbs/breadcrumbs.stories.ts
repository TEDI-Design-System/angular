import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { LinkComponent } from "../link/link.component";
import { IconComponent } from "../../base/icon/icon.component";
import { createBreakpointArgTypes } from "../../../../dev-tools/createBreakpointArgTypes";
import { BreadcrumbsComponent } from "./breadcrumbs.component";
import { BreadcrumbItemDirective } from "./breadcrumb-item.directive";
import { BreadcrumbSeparatorDirective } from "./breadcrumb-separator.directive";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.65.81?node-id=3486-65554&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/43adad-breadcrumbs" target="_blank">Zeroheight ↗</a><br/>
 * Breadcrumbs show the user's location within the page hierarchy.
 * - Mark each crumb with `*tediBreadcrumbItem`, in order from the root to the current page.
 * - Use `a tedi-link` for navigable crumbs and a plain element (e.g. `span`) for the current page — add `aria-current="page"` to it yourself.
 * - Crumb links are underlined by default; set `[underline]="false"` on the `tedi-link` for non-underlined crumbs (recommended for the `short` back-link). Crumbs collapsed into the ellipsis dropdown are always non-underlined.
 * - `long` shows the full trail; `short` shows only the parent crumb as a back-link (mobile).
 * - Set `maxItems` to collapse the middle of a long trail into an ellipsis dropdown.
 */
export default {
  title: "TEDI-Ready/Components/Navigation/Breadcrumbs",
  component: BreadcrumbsComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BreadcrumbItemDirective,
        BreadcrumbSeparatorDirective,
        LinkComponent,
        IconComponent,
      ],
    }),
  ],
  parameters: {
    status: {
      type: ["breakpointSupport"],
    },
  },
  argTypes: {
    variant: {
      description:
        "`long` shows the full trail; `short` shows only the parent crumb as a back-link.",
      control: "radio",
      options: ["long", "short"],
      table: {
        category: "inputs",
        type: { summary: "BreadcrumbsVariant", detail: "long \nshort" },
        defaultValue: { summary: "long" },
      },
    },
    maxItems: {
      description:
        "Max crumbs before the middle collapses into an ellipsis dropdown. Long variant only.",
      control: "number",
      table: { category: "inputs", type: { summary: "number" } },
    },
    itemsBeforeCollapse: {
      description:
        "Crumbs kept visible at the start of the trail when collapsed.",
      control: "number",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    itemsAfterCollapse: {
      description:
        "Crumbs kept visible at the end of the trail when collapsed.",
      control: "number",
      table: {
        category: "inputs",
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    separator: {
      description:
        "Separator between crumbs. Defaults to a chevron icon; a `[tediBreadcrumbSeparator]` template overrides this.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    ariaLabel: {
      description:
        "Accessible label for the `nav` landmark. Falls back to the `breadcrumbs` translation.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    showMoreLabel: {
      description:
        "Accessible label for the ellipsis button. Falls back to the `breadcrumbs.show-more` translation.",
      control: "text",
      table: { category: "inputs", type: { summary: "string" } },
    },
    ...createBreakpointArgTypes("BreadcrumbsInputs"),
  },
} as Meta<BreadcrumbsComponent>;

type Story = StoryObj<BreadcrumbsComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-breadcrumbs ${argsToTemplate(args)}>
        <a *tediBreadcrumbItem tedi-link href="#">Töölaud</a>
        <a *tediBreadcrumbItem tedi-link href="#">Taotlused</a>
        <span *tediBreadcrumbItem aria-current="page">Taotlus nr 506</span>
      </tedi-breadcrumbs>
    `,
  }),
};

/**
 * The `short` back-link reads better without an underline — set
 * `[underline]="false"` on its `tedi-link`.
 */
export const Short: Story = {
  args: {
    variant: "short",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-breadcrumbs ${argsToTemplate(args)}>
        <a *tediBreadcrumbItem tedi-link [underline]="false" href="#">Töölaud</a>
        <span *tediBreadcrumbItem aria-current="page">Taotlus nr 506</span>
      </tedi-breadcrumbs>
    `,
  }),
};

/**
 * When the trail is long, set `maxItems` to collapse the middle into an
 * ellipsis button. Clicking it opens a dropdown listing the hidden crumbs.
 * `itemsBeforeCollapse` / `itemsAfterCollapse` control how many crumbs stay
 * visible on each side.
 */
export const Collapsed: Story = {
  args: {
    maxItems: 4,
    itemsBeforeCollapse: 1,
    itemsAfterCollapse: 2,
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-breadcrumbs ${argsToTemplate(args)}>
        <a *tediBreadcrumbItem tedi-link href="#">Töölaud</a>
        <a *tediBreadcrumbItem tedi-link href="#">Patsiendid</a>
        <a *tediBreadcrumbItem tedi-link href="#">Anna Tamm</a>
        <a *tediBreadcrumbItem tedi-link href="#">Visiidid</a>
        <a *tediBreadcrumbItem tedi-link href="#">2024-05-12</a>
        <span *tediBreadcrumbItem aria-current="page">Piirangud</span>
      </tedi-breadcrumbs>
    `,
  }),
};

/**
 * `variant` is breakpoint-aware. Common mobile pattern: short back-link below
 * `md`, full trail from `md` up — resize the viewport to see it switch.
 */
export const ResponsiveVariant: Story = {
  args: {
    variant: "short",
    md: { variant: "long" },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-breadcrumbs ${argsToTemplate(args)}>
        <a *tediBreadcrumbItem tedi-link href="#">Töölaud</a>
        <a *tediBreadcrumbItem tedi-link href="#">Dokumendid</a>
        <a *tediBreadcrumbItem tedi-link href="#">Minu dokumendid</a>
        <a *tediBreadcrumbItem tedi-link href="#">Taotlus nr 506</a>
        <span *tediBreadcrumbItem aria-current="page">Piirangud</span>
      </tedi-breadcrumbs>
    `,
  }),
};

/**
 * Replace the default chevron with a string via the `separator` input, or with
 * arbitrary markup (e.g. a different icon) via a `*tediBreadcrumbSeparator`
 * template. The separator is hidden from assistive technology.
 */
export const CustomSeparator: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-column gap-3">
        <tedi-breadcrumbs ${argsToTemplate(args)} separator="/">
          <a *tediBreadcrumbItem tedi-link href="#">Töölaud</a>
          <a *tediBreadcrumbItem tedi-link href="#">Dokumendid</a>
          <span *tediBreadcrumbItem aria-current="page">Piirangud</span>
        </tedi-breadcrumbs>
        <tedi-breadcrumbs ${argsToTemplate(args)}>
          <a *tediBreadcrumbItem tedi-link href="#">Töölaud</a>
          <a *tediBreadcrumbItem tedi-link href="#">Dokumendid</a>
          <span *tediBreadcrumbItem aria-current="page">Piirangud</span>
          <tedi-icon *tediBreadcrumbSeparator name="arrow_forward" [size]="16" color="brand" />
        </tedi-breadcrumbs>
      </div>
    `,
  }),
};

/**
 * A crumb can be any element, not just an anchor. Use a `button tedi-link` for
 * crumbs that trigger an action (e.g. navigating a wizard step) instead of
 * following an `href`. Keep the current page as a plain element with
 * `aria-current="page"` — it should not be a button.
 */
export const ButtonCrumbs: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tedi-breadcrumbs ${argsToTemplate(args)}>
        <button *tediBreadcrumbItem tedi-link type="button">Töölaud</button>
        <button *tediBreadcrumbItem tedi-link type="button">Taotlused</button>
        <span *tediBreadcrumbItem aria-current="page">Taotlus nr 506</span>
      </tedi-breadcrumbs>
    `,
  }),
};
