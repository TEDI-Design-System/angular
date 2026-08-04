import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import { SideNavComponent } from "./sidenav.component";
import { SideNavListComponent } from "./sidenav-list/sidenav-list.component";
import { SideNavItemComponent } from "./sidenav-item/sidenav-item.component";
import { SideNavDropdownComponent } from "./sidenav-dropdown/sidenav-dropdown.component";
import { SideNavDropdownItemComponent } from "./sidenav-dropdown-item/sidenav-dropdown-item.component";
import { SideNavDropdownGroupComponent } from "./sidenav-dropdown-group/sidenav-dropdown-group.component";
import { SideNavDropdownGroupParentDirective } from "./sidenav-dropdown-group/sidenav-dropdown-group-parent.directive";
import { SideNavDropdownGroupListComponent } from "./sidenav-dropdown-group/sidenav-dropdown-group-list.component";
import { SideNavGroupTitleComponent } from "./sidenav-group-title/sidenav-group-title.component";
import { SideNavToggleComponent } from "./sidenav-toggle/sidenav-toggle.component";
import { SideNavOverlayComponent } from "./sidenav-overlay/sidenav-overlay.component";
import { RowComponent } from "../../helpers/grid/row/row.component";
import { InfoButtonComponent } from "../../buttons/info-button/info-button.component";
import { InfoTooltipComponent } from "../../overlay/info-tooltip/info-tooltip.component";

/** Args for the arg-driven `Default` story: the SideNav inputs plus a single
 * driveable item and dropdown item (mapped into the template by `render`). */
type SideNavStoryArgs = SideNavComponent & {
  itemSelected: boolean;
  itemIcon: string;
  itemHref: string;
  itemRoute: string;
  itemCollapsedText: string;
  dropdownItemSelected: boolean;
  dropdownItemHref: string;
  dropdownItemRoute: string;
};

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.66.83?node-id=6367-171750&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/136091-side-navigation" target="_BLANK">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Layout/SideNav",
  component: SideNavComponent,
  decorators: [
    moduleMetadata({
      imports: [
        SideNavComponent,
        SideNavListComponent,
        SideNavItemComponent,
        SideNavDropdownComponent,
        SideNavDropdownItemComponent,
        SideNavDropdownGroupComponent,
        SideNavDropdownGroupParentDirective,
        SideNavDropdownGroupListComponent,
        SideNavGroupTitleComponent,
        SideNavToggleComponent,
        SideNavOverlayComponent,
        RowComponent,
        InfoButtonComponent,
        InfoTooltipComponent,
      ],
    }),
  ],
  argTypes: {
    dividers: {
      description: "Show a divider line between items.",
      control: "boolean",
      table: {
        category: "sidenav",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    size: {
      description: "Size of navigation item.",
      control: "radio",
      options: ["small", "medium", "large"],
      table: {
        category: "sidenav",
        type: { summary: "SideNavItemSize", detail: "small \nmedium \nlarge" },
        defaultValue: { summary: "large" },
      },
    },
    collapsible: {
      description: "Allow collapsing the desktop nav to a narrow rail.",
      control: "boolean",
      table: {
        category: "sidenav",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    defaultCollapsed: {
      description: "Start collapsed on desktop (requires `collapsible`).",
      control: "boolean",
      table: {
        category: "sidenav",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    desktopBreakpoint: {
      description:
        "Breakpoint at/above which the desktop nav shows; below it becomes the mobile drawer.",
      control: "radio",
      options: ["xs", "sm", "md", "lg", "xl", "xxl"],
      table: {
        category: "sidenav",
        type: { summary: "Breakpoint", detail: "xs \nsm \nmd \nlg \nxl \nxxl" },
        defaultValue: { summary: "lg" },
      },
    },
    ariaLabel: {
      description: "Accessible name for the `<nav>` landmark.",
      control: "text",
      table: {
        category: "sidenav",
        type: { summary: "string" },
      },
    },
    backToMainMenuLabel: {
      description:
        "Override for the mobile 'back to main menu' button text. Falls back to the translated `sidenav.backToMainMenu` label. Visible once the mobile drawer drills into an item's submenu.",
      control: "text",
      table: {
        category: "sidenav",
        type: { summary: "string" },
      },
    },
    backToParentMenuLabel: {
      description:
        "Override for the mobile 'back to parent menu' button text. Falls back to the translated `sidenav.backToParentMenu` label (which includes the parent item's name). Visible when a non-link group is drilled open.",
      control: "text",
      table: {
        category: "sidenav",
        type: { summary: "string" },
      },
    },
    itemSelected: {
      name: "selected",
      description: "Mark the item as the current page.",
      control: "boolean",
      table: {
        category: "sidenav-item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    itemIcon: {
      name: "icon",
      description: "Icon name shown before the label.",
      control: "text",
      table: {
        category: "sidenav-item",
        type: { summary: "string" },
      },
    },
    itemHref: {
      name: "href",
      description: "Anchor link (`<a href>`).",
      control: "text",
      table: {
        category: "sidenav-item",
        type: { summary: "string" },
      },
    },
    itemRoute: {
      name: "route",
      description: "Router link; takes precedence over `href`.",
      control: "text",
      table: {
        category: "sidenav-item",
        type: { summary: "string" },
      },
    },
    itemCollapsedText: {
      name: "collapsedText",
      description:
        "Shorter label shown in the narrow rail when the nav is collapsed (enable `collapsible`, then toggle it). The full label still shows expanded and in the tooltip.",
      control: "text",
      table: {
        category: "sidenav-item",
        type: { summary: "string" },
      },
    },
    dropdownItemSelected: {
      name: "selected",
      description: "Mark the dropdown item as the current page.",
      control: "boolean",
      table: {
        category: "sidenav-dropdown-item",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    dropdownItemHref: {
      name: "href",
      description: "Anchor link (`<a href>`).",
      control: "text",
      table: {
        category: "sidenav-dropdown-item",
        type: { summary: "string" },
      },
    },
    dropdownItemRoute: {
      name: "route",
      description: "Router link; takes precedence over `href`.",
      control: "text",
      table: {
        category: "sidenav-dropdown-item",
        type: { summary: "string" },
      },
    },
  },
  args: {
    ariaLabel: "Peamenüü",
  },
} as Meta<SideNavStoryArgs>;

// The demo page: full viewport height on desktop so the sidebar fills the
// column, but natural height once the nav collapses to the mobile drawer so the
// page scrolls, and only when the items don't fit.
const storyLayout = (inner: string, fullHeight = true) => `
  <style>
    .tedi-sidenav-demo { height: ${fullHeight ? "100dvh" : "auto"}; }
    .tedi-sidenav-demo:has(.tedi-sidenav--mobile) { height: auto; }
  </style>
  <button tedi-sidenav-toggle></button>
  <tedi-sidenav-overlay></tedi-sidenav-overlay>
  <div class="tedi-sidenav-demo">
    ${inner}
  </div>
`;

const leadingItems = `
  <li tedi-sidenav-item icon="dashboard" href="#">Minu töölaud</li>
  <li tedi-sidenav-item icon="event" href="#">Vastuvõtud ja saatekirjad</li>
  <li tedi-sidenav-item icon="medication" href="#">Retseptid ja meditsiiniseadmed</li>
`;

const trailingItems = `
  <li tedi-sidenav-item icon="dentistry" href="#">Hammaste tervis</li>
  <li tedi-sidenav-item icon="vaccines" href="#">Vaktsineerimine</li>
  <li tedi-sidenav-item icon="content_paste" href="#">Tervisetõendid ja -deklaratsioonid</li>
  <li tedi-sidenav-item icon="business_center" href="#">Töövõime</li>
  <li tedi-sidenav-item icon="credit_card" href="#">Raviarved</li>
  <li tedi-sidenav-item icon="settings" href="#">Minu seaded</li>
`;

const healthHistory = `
  <li tedi-sidenav-item icon="account_circle"${"$LINK"}>
    Tervise ajalugu
    <ul tedi-sidenav-dropdown>
      <li tedi-sidenav-dropdown-item href="#">Eelmised retseptid</li>
      <li tedi-sidenav-dropdown-item href="#">Haiguslugu</li>
    </ul>
  </li>
`;

const healthHistoryGroupsPlain = `
  <li tedi-sidenav-item icon="account_circle">
    Tervise ajalugu
    <ul tedi-sidenav-dropdown>
      <li tedi-sidenav-dropdown-group>
        <span tedi-sidenav-dropdown-group-parent>Minu tervise ajalugu</span>
        <ul tedi-sidenav-dropdown-group-list>
          <li tedi-sidenav-dropdown-item href="#">Eelmised retseptid</li>
          <li tedi-sidenav-dropdown-item href="#">Haiguslugu</li>
        </ul>
      </li>
      <li tedi-sidenav-dropdown-group>
        <span tedi-sidenav-dropdown-group-parent>Minu lapse tervise ajalugu</span>
        <ul tedi-sidenav-dropdown-group-list>
          <li tedi-sidenav-dropdown-item href="#">Eelmised retseptid</li>
          <li tedi-sidenav-dropdown-item href="#">Haiguslugu</li>
        </ul>
      </li>
    </ul>
  </li>
`;

const healthHistoryGroups = `
  <li tedi-sidenav-item icon="account_circle" href="#">
    Tervise ajalugu
    <ul tedi-sidenav-dropdown>
      <li tedi-sidenav-dropdown-group>
        <a tedi-sidenav-dropdown-group-parent href="#">Minu tervise ajalugu</a>
        <ul tedi-sidenav-dropdown-group-list>
          <li tedi-sidenav-dropdown-item href="#">Eelmised retseptid</li>
          <li tedi-sidenav-dropdown-item href="#">Haiguslugu</li>
        </ul>
      </li>
      <li tedi-sidenav-dropdown-group>
        <a tedi-sidenav-dropdown-group-parent href="#">Minu lapse tervise ajalugu</a>
        <ul tedi-sidenav-dropdown-group-list>
          <li tedi-sidenav-dropdown-item href="#">Eelmised retseptid</li>
          <li tedi-sidenav-dropdown-item href="#">Haiguslugu</li>
        </ul>
      </li>
    </ul>
  </li>
`;

export const Default: StoryObj<SideNavStoryArgs> = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story: `
The sidenav displays the left-side navigation. Author it with semantic list markup: a \`nav[tedi-sidenav]\` containing a \`ul[tedi-sidenav-list]\` of \`li[tedi-sidenav-item]\`s. Items may contain a nested \`ul[tedi-sidenav-dropdown]\` of \`li[tedi-sidenav-dropdown-item]\`s, and dropdowns may contain \`li[tedi-sidenav-dropdown-group]\`s (a parent link + \`ul[tedi-sidenav-dropdown-group-list]\`). The \`nav\` also accepts your own sibling content (header/footer) alongside the list.

To test the mobile layout, resize the window or use Storybook's viewport tools; toggle the drawer with \`button[tedi-sidenav-toggle]\`.

It consists of several sub-components:
- \`SideNavListComponent\` (\`ul[tedi-sidenav-list]\`): The menu container that holds the items, so the \`nav\` can also host your own header/footer content.
- \`SideNavItemComponent\` (\`li[tedi-sidenav-item]\`): Used for showing an item which can be text, external link or router link. And can contain a dropdown.
- \`SideNavDropdownComponent\` (\`ul[tedi-sidenav-dropdown]\`): Used for showing subitems in a dropdown.
- \`SideNavDropdownItemComponent\` (\`li[tedi-sidenav-dropdown-item]\`): Dropdown item component. Subitems can be text, external link or router link.
- \`SideNavDropdownGroupComponent\` (\`li[tedi-sidenav-dropdown-group]\`): Used for grouping items in a dropdown — a parent link (\`[tedi-sidenav-dropdown-group-parent]\`) styled to suggest it is the parent, plus a nested list (\`ul[tedi-sidenav-dropdown-group-list]\`) of its children.
- \`SideNavGroupTitleComponent\` (\`li[tedi-sidenav-group-title]\`): Used for showing a title in the menu and grouping similar items.
- \`SideNavToggleComponent\` (\`button[tedi-sidenav-toggle]\`): Used for toggling the side navigation in mobile layout.
- \`SideNavOverlayComponent\` (\`tedi-sidenav-overlay\`): Used for showing a dark overlay when the side navigation is open in mobile layout.
`,
      },
    },
  },
  args: {
    dividers: true,
    size: "large",
    collapsible: false,
    desktopBreakpoint: "lg",
    itemSelected: false,
    itemIcon: "account_circle",
    itemHref: "#",
    itemRoute: "",
    itemCollapsedText: "Ajalugu",
    dropdownItemSelected: false,
    dropdownItemHref: "#",
    dropdownItemRoute: "",
  },
  render: (args) => ({
    props: args,
    // The `sidenav-item` / `sidenav-dropdown-item` controls drive the single
    // configurable item below; the surrounding items are static for context.
    template: storyLayout(`
      <nav tedi-sidenav ${argsToTemplate(args, {
        include: [
          "ariaLabel",
          "dividers",
          "size",
          "collapsible",
          "defaultCollapsed",
          "desktopBreakpoint",
          "backToMainMenuLabel",
          "backToParentMenuLabel",
        ],
      })}>
        <ul tedi-sidenav-list>
          <li tedi-sidenav-item icon="dashboard" href="#">Minu töölaud</li>
          <li tedi-sidenav-item icon="event" href="#">Vastuvõtud ja saatekirjad</li>
          <li tedi-sidenav-item icon="medication" href="#">Retseptid ja meditsiiniseadmed</li>
          <li
            tedi-sidenav-item
            [icon]="itemIcon"
            [href]="itemHref"
            [route]="itemRoute"
            [selected]="itemSelected"
            [collapsedText]="itemCollapsedText"
          >
            Tervise ajalugu
            <ul tedi-sidenav-dropdown>
              <li
                tedi-sidenav-dropdown-item
                [href]="dropdownItemHref"
                [route]="dropdownItemRoute"
                [selected]="dropdownItemSelected"
              >
                Eelmised retseptid
              </li>
              <li tedi-sidenav-dropdown-item href="#">Haiguslugu</li>
            </ul>
          </li>
          ${trailingItems}
        </ul>
      </nav>
    `),
  }),
};

export const ItemStates: StoryObj<SideNavComponent> = {
  parameters: {
    pseudo: {
      hover: "#state-hover .tedi-sidenav-item__trigger",
      focusVisible: "#state-focus .tedi-sidenav-item__title",
    },
  },
  render: () => {
    const row = (
      label: string,
      opts: { id?: string; selected?: boolean } = {},
    ) => `
      <strong>${label}</strong>
      <nav tedi-sidenav ariaLabel="${label}" [desktopBreakpoint]="'xs'" style="width: 240px; min-height: auto;">
        <ul tedi-sidenav-list ${opts.id ? `id="${opts.id}"` : ""}>
          <li tedi-sidenav-item icon="dashboard" href="#"${opts.selected ? ' [selected]="true"' : ""}>Tekst</li>
        </ul>
      </nav>`;
    const dropdownRow = (label: string, dropdown: string, href = false) => `
      <strong>${label}</strong>
      <nav tedi-sidenav ariaLabel="${label}" [desktopBreakpoint]="'xs'" style="width: 240px; min-height: auto;">
        <ul tedi-sidenav-list>
          <li tedi-sidenav-item icon="dashboard"${href ? ' href="#"' : ""} [defaultOpen]="true">
            Tekst
            ${dropdown}
          </li>
        </ul>
      </nav>`;
    const subitems = `
      <ul tedi-sidenav-dropdown>
        <li tedi-sidenav-dropdown-item href="#">Alamelement 1</li>
        <li tedi-sidenav-dropdown-item href="#" [selected]="true">Alamelement 2</li>
      </ul>`;
    const group = `
      <ul tedi-sidenav-dropdown>
        <li tedi-sidenav-dropdown-group>
          <a tedi-sidenav-dropdown-group-parent href="#">Ülemelement</a>
          <ul tedi-sidenav-dropdown-group-list>
            <li tedi-sidenav-dropdown-item href="#">Kolmas tase</li>
            <li tedi-sidenav-dropdown-item href="#">Kolmas tase</li>
          </ul>
        </li>
      </ul>`;
    return {
      template: `
        <tedi-row [cols]="1" [sm]="{ cols: 2 }" [gapY]="3" style="align-items: start;">
          ${row("Default")}
          ${row("Hover", { id: "state-hover" })}
          ${row("Focus", { id: "state-focus" })}
          ${row("Selected", { selected: true })}
          ${dropdownRow("With subitems", subitems)}
          ${dropdownRow("Parent is link with subitems", subitems, true)}
          ${dropdownRow("Sub item is parent", group)}
        </tedi-row>
      `,
    };
  },
};

export const SecondLevelMenuItems: StoryObj<SideNavComponent> = {
  parameters: {
    layout: "fullscreen",
  },
  args: {
    dividers: true,
    size: "large",
    collapsible: false,
  },
  render: (args) => ({
    props: args,
    template: storyLayout(`
      <nav tedi-sidenav ${argsToTemplate(args)}>
        <ul tedi-sidenav-list>
          ${leadingItems}
          ${healthHistory.replace("$LINK", "")}
          ${trailingItems}
        </ul>
      </nav>
    `),
  }),
};

export const SecondLevelMenuItemsParentsAreLinks: StoryObj<SideNavComponent> = {
  parameters: {
    layout: "fullscreen",
  },
  args: {
    dividers: true,
    size: "large",
    collapsible: false,
  },
  render: (args) => ({
    props: args,
    template: storyLayout(`
      <nav tedi-sidenav ${argsToTemplate(args)}>
        <ul tedi-sidenav-list>
          ${leadingItems}
          ${healthHistory.replace("$LINK", ' href="#"')}
          ${trailingItems}
        </ul>
      </nav>
    `),
  }),
};

export const ThirdLevelMenuItems: StoryObj<SideNavComponent> = {
  parameters: {
    layout: "fullscreen",
  },
  args: {
    dividers: true,
    size: "large",
    collapsible: false,
  },
  render: (args) => ({
    props: args,
    template: storyLayout(`
      <nav tedi-sidenav ${argsToTemplate(args)}>
        <ul tedi-sidenav-list>
          ${leadingItems}
          ${healthHistoryGroupsPlain}
          ${trailingItems}
        </ul>
      </nav>
    `),
  }),
};

export const ThirdLevelMenuItemsParentsAreLinks: StoryObj<SideNavComponent> = {
  parameters: {
    layout: "fullscreen",
  },
  args: {
    dividers: true,
    size: "large",
    collapsible: false,
  },
  render: (args) => ({
    props: args,
    template: storyLayout(`
      <nav tedi-sidenav ${argsToTemplate(args)}>
        <ul tedi-sidenav-list>
          ${leadingItems}
          ${healthHistoryGroups}
          ${trailingItems}
        </ul>
      </nav>
    `),
  }),
};

/**
 * When collapsed, the rail is icon-first with little room for text. Give items a
 * shorter `collapsedText` for that state (e.g. "Töölaud" for "Minu töölaud"); the
 * full label still shows expanded and in the hover tooltip. Items without a
 * `collapsedText` simply truncate.
 */
export const Collapsible: StoryObj<SideNavComponent> = {
  parameters: {
    layout: "fullscreen",
  },
  args: {
    dividers: true,
    size: "large",
    collapsible: true,
    defaultCollapsed: true,
  },
  render: (args) => ({
    props: args,
    template: storyLayout(`
      <nav tedi-sidenav ${argsToTemplate(args)}>
        <ul tedi-sidenav-list>
          <li tedi-sidenav-item icon="dashboard" href="#" collapsedText="Töölaud">Minu töölaud</li>
          <li tedi-sidenav-item icon="event" href="#">Vastuvõtud ja saatekirjad</li>
          <li tedi-sidenav-item icon="medication" href="#">Retseptid ja meditsiiniseadmed</li>
          <li tedi-sidenav-item icon="account_circle" collapsedText="Ajalugu">
            Tervise ajalugu
            <ul tedi-sidenav-dropdown>
              <li tedi-sidenav-group-title>Minu tervise ajalugu</li>
              <li tedi-sidenav-dropdown-item href="#">Eelmised retseptid</li>
              <li tedi-sidenav-dropdown-item href="#">Haiguslugu</li>
              <li tedi-sidenav-group-title>Minu lapse tervise ajalugu</li>
              <li tedi-sidenav-dropdown-item href="#">Eelmised retseptid</li>
              <li tedi-sidenav-dropdown-item href="#">Haiguslugu</li>
            </ul>
          </li>
          <li tedi-sidenav-item icon="dentistry" href="#" collapsedText="Hambad">Hammaste tervis</li>
          <li tedi-sidenav-item icon="vaccines" href="#">Vaktsineerimine</li>
          <li tedi-sidenav-item icon="content_paste" href="#">Tervisetõendid ja -deklaratsioonid</li>
          <li tedi-sidenav-item icon="business_center" href="#">Töövõime</li>
          <li tedi-sidenav-item icon="credit_card" href="#" collapsedText="Arved">Raviarved</li>
          <li tedi-sidenav-item icon="settings" href="#" collapsedText="Seaded">Minu seaded</li>
        </ul>
      </nav>
    `),
  }),
};

export const CollapsibleParentIsLink: StoryObj<SideNavComponent> = {
  parameters: {
    layout: "fullscreen",
  },
  args: {
    dividers: true,
    size: "large",
    collapsible: true,
    defaultCollapsed: true,
  },
  render: (args) => ({
    props: args,
    template: storyLayout(`
      <nav tedi-sidenav ${argsToTemplate(args)}>
        <ul tedi-sidenav-list>
          <li tedi-sidenav-item icon="dashboard" href="#" collapsedText="Töölaud">Minu töölaud</li>
          <li tedi-sidenav-item icon="event" href="#">Vastuvõtud ja saatekirjad</li>
          <li tedi-sidenav-item icon="medication" href="#">Retseptid ja meditsiiniseadmed</li>
          <li tedi-sidenav-item icon="account_circle" href="#" collapsedText="Ajalugu">
            Minu tervise ajalugu
            <ul tedi-sidenav-dropdown>
              <li tedi-sidenav-dropdown-item href="#">Eelmised retseptid</li>
              <li tedi-sidenav-dropdown-item href="#">Haiguslugu</li>
            </ul>
          </li>
          <li tedi-sidenav-item icon="dentistry" href="#" collapsedText="Hambad">Hammaste tervis</li>
          <li tedi-sidenav-item icon="vaccines" href="#">Vaktsineerimine</li>
          <li tedi-sidenav-item icon="content_paste" href="#">Tervisetõendid ja -deklaratsioonid</li>
          <li tedi-sidenav-item icon="business_center" href="#">Töövõime</li>
          <li tedi-sidenav-item icon="credit_card" href="#" collapsedText="Arved">Raviarved</li>
          <li tedi-sidenav-item icon="settings" href="#" collapsedText="Seaded">Minu seaded</li>
        </ul>
      </nav>
    `),
  }),
};

/**
 * An item's dropdown can be expanded on first render via `defaultOpen`. This only
 * applies on desktop.
 */
export const DefaultOpen: StoryObj<SideNavComponent> = {
  parameters: { layout: "fullscreen" },
  args: {
    dividers: true,
    size: "large",
    collapsible: false,
  },
  render: (args) => ({
    props: args,
    template: storyLayout(`
      <nav tedi-sidenav ${argsToTemplate(args)}>
        <ul tedi-sidenav-list>
          ${leadingItems}
          <li tedi-sidenav-item icon="account_circle" [defaultOpen]="true">
            Tervise ajalugu
            <ul tedi-sidenav-dropdown>
              <li tedi-sidenav-group-title>Minu tervise ajalugu</li>
              <li tedi-sidenav-dropdown-item href="#">Eelmised retseptid</li>
              <li tedi-sidenav-dropdown-item href="#">Haiguslugu</li>
              <li tedi-sidenav-group-title>Minu lapse tervise ajalugu</li>
              <li tedi-sidenav-dropdown-item href="#">Eelmised retseptid</li>
              <li tedi-sidenav-dropdown-item href="#">Haiguslugu</li>
            </ul>
          </li>
          ${trailingItems}
        </ul>
      </nav>
    `),
  }),
};

export const MediumSidenavItems: StoryObj<SideNavComponent> = {
  parameters: {
    layout: "fullscreen",
  },
  args: {
    dividers: true,
    size: "medium",
    collapsible: false,
  },
  render: (args) => ({
    props: args,
    template: storyLayout(
      `
      <nav tedi-sidenav ${argsToTemplate(args)}>
        <ul tedi-sidenav-list>
          ${leadingItems}
          ${healthHistoryGroups}
          ${trailingItems}
        </ul>
      </nav>
    `,
      false,
    ),
  }),
};

export const SmallSidenavItems: StoryObj<SideNavComponent> = {
  parameters: {
    layout: "fullscreen",
  },
  args: {
    dividers: true,
    size: "small",
    collapsible: false,
  },
  render: (args) => ({
    props: args,
    template: storyLayout(
      `
      <nav tedi-sidenav ${argsToTemplate(args)}>
        <ul tedi-sidenav-list>
          ${leadingItems}
          ${healthHistoryGroups}
          ${trailingItems}
        </ul>
      </nav>
    `,
      false,
    ),
  }),
};

/**
 * A `li[tedi-sidenav-group-title]` can also head a section directly in the main
 * `ul[tedi-sidenav-list]` — here labelling the settings section. When the nav is
 * collapsed to the narrow rail, it renders as a plain separator line between the sections instead.
 * Toggle the collapse button to see it switch.
 */
export const WithGroupTitle: StoryObj<SideNavComponent> = {
  parameters: {
    layout: "fullscreen",
  },
  args: {
    dividers: false,
    size: "small",
    collapsible: true,
    defaultCollapsed: false,
  },
  render: (args) => ({
    props: args,
    template: storyLayout(
      `
      <nav tedi-sidenav ${argsToTemplate(args)}>
        <ul tedi-sidenav-list>
          <li tedi-sidenav-item icon="dashboard" href="#" collapsedText="Töölaud">Minu töölaud</li>
          <li tedi-sidenav-item icon="event" href="#">Vastuvõtud ja saatekirjad</li>
          <li tedi-sidenav-item icon="medication" href="#">Retseptid ja meditsiiniseadmed</li>
          <li tedi-sidenav-item icon="account_circle" collapsedText="Ajalugu">
            Minu tervise ajalugu
            <ul tedi-sidenav-dropdown>
              <li tedi-sidenav-dropdown-item href="#">Eelmised retseptid</li>
              <li tedi-sidenav-dropdown-item href="#">Haiguslugu</li>
            </ul>
          </li>
          <li tedi-sidenav-item icon="dentistry" href="#" collapsedText="Hambad">Hammaste tervis</li>
          <li tedi-sidenav-item icon="vaccines" href="#">Vaktsineerimine</li>
          <li tedi-sidenav-item icon="content_paste" href="#" collapsedText="Tõendid">Tervisetõendid ja -deklaratsioonid</li>
          <li tedi-sidenav-item icon="business_center" href="#">Töövõime</li>
          <li tedi-sidenav-group-title>
            Seaded
            <tedi-info-tooltip color="inverted">Sinu konto ja rakenduse seaded.</tedi-info-tooltip>
          </li>
          <li tedi-sidenav-item icon="credit_card" href="#" collapsedText="Arved">Raviarved</li>
          <li tedi-sidenav-item icon="settings" href="#" collapsedText="Seaded">Minu seaded</li>
        </ul>
      </nav>
    `,
      false,
    ),
  }),
};

/**
 * The `nav` accepts arbitrary sibling content, so you can add your own header and
 * footer around the `ul[tedi-sidenav-list]`.
 */
export const WithHeaderAndFooter: StoryObj<SideNavComponent> = {
  parameters: {
    layout: "fullscreen",
  },
  args: {
    dividers: true,
    size: "large",
    collapsible: false,
  },
  render: (args) => ({
    props: args,
    template: storyLayout(`
      <nav tedi-sidenav ${argsToTemplate(args)}>
        <div style="padding: 1rem;">
          <img src="header-logo-white.svg" alt="Logo" />
        </div>
        <ul tedi-sidenav-list>
          ${leadingItems}
          ${healthHistory.replace("$LINK", "")}
          ${trailingItems}
        </ul>
        <div style="margin-top: auto; padding: 1rem; color: var(--tedi-neutral-100);">v1.2.3</div>
      </nav>
    `),
  }),
};
