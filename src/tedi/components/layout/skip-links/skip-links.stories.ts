import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { SkipLinksComponent } from "./skip-links.component";
import { SkipLinkDirective } from "./skip-link.directive";
import { LinkComponent } from "../../navigation/link/link.component";
import { TextComponent } from "../../base/text/text.component";
import {
  HeaderActionsComponent,
  HeaderComponent,
  HeaderLanguageComponent,
  HeaderLogoComponent,
  HeaderLogoDarkDirective,
  HeaderLogoutComponent,
  HeaderProfileComponent,
  HeaderRoleComponent,
} from "../header";
import {
  SideNavComponent,
  SideNavDropdownComponent,
  SideNavDropdownItemComponent,
  SideNavItemComponent,
  SideNavOverlayComponent,
  SideNavToggleComponent,
} from "../sidenav";
import {
  BreadcrumbItemDirective,
  BreadcrumbsComponent,
} from "../../navigation/breadcrumbs";
import { CardComponent, CardContentComponent } from "../../content/card";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { ShowAtDirective } from "../../../directives/show-at/show-at.directive";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-Ready-2.109.105?node-id=65487-242481&m=dev" target="_blank">Figma ↗</a>
 *
 * Links that let keyboard users bypass repeated content such as the header and navigation (WCAG 2.4.1 Bypass Blocks).
 * The links are hidden until one of them receives focus, then appear as a strip over the top of the page.
 *
 * Render `tedi-skip-links` as the first element on the page, before the header. Every `href` must point to an
 * element `id` on the page.
 */
export default {
  title: "TEDI-Ready/Layout/SkipLinks",
  component: SkipLinksComponent,
  decorators: [
    moduleMetadata({
      imports: [
        SkipLinksComponent,
        SkipLinkDirective,
        LinkComponent,
        TextComponent,
        HeaderComponent,
        HeaderLogoComponent,
        HeaderLogoDarkDirective,
        HeaderActionsComponent,
        HeaderRoleComponent,
        HeaderLanguageComponent,
        HeaderProfileComponent,
        HeaderLogoutComponent,
        SideNavComponent,
        SideNavItemComponent,
        SideNavDropdownComponent,
        SideNavDropdownItemComponent,
        SideNavOverlayComponent,
        SideNavToggleComponent,
        BreadcrumbsComponent,
        BreadcrumbItemDirective,
        CardComponent,
        CardContentComponent,
        SeparatorComponent,
        ShowAtDirective,
        VerticalSpacingDirective,
      ],
    }),
  ],
  parameters: {
    layout: "fullscreen",
    docs: { story: { height: "300px" } },
  },
} as Meta<SkipLinksComponent>;

const pageStyles = `
  .story-page-padding {
    padding: var(--layout-grid-gutters-16);
  }
`;

const page = (skipLinks: string, mainId: string, footerId: string) => `
  <div class="story-page-padding">
    ${skipLinks}
    <p tedi-text>Click the empty area at the bottom, press Tab, choose a skip link, then press Tab again.</p>
    <main id="${mainId}">
      <p tedi-text>Main content</p>
      <a tedi-link href="#">Link in main content</a>
    </main>
    <footer id="${footerId}">
      <p tedi-text>Footer</p>
      <a tedi-link href="#">Link in footer</a>
    </footer>
  </div>
`;

export const Default: StoryObj<SkipLinksComponent> = {
  render: () => ({
    styles: [pageStyles],
    template: `
      ${page("<tedi-skip-links />", "main-content", "footer")}
    `,
  }),
};

export const MultipleLinks: StoryObj<SkipLinksComponent> = {
  render: () => ({
    styles: [pageStyles],
    template: `
      ${page(
        `<tedi-skip-links>
          <a tedi-link *tediSkipLink href="#multiple-links-main">Liigu edasi põhisisu juurde</a>
          <a tedi-link *tediSkipLink href="#multiple-links-footer">Liigu edasi jaluse juurde</a>
        </tedi-skip-links>`,
        "multiple-links-main",
        "multiple-links-footer",
      )}
    `,
  }),
};

const usageStyles = `
  .story-page {
    min-height: 100dvh;
  }

  .story-page__main {
    padding: var(--layout-grid-gutters-24) var(--layout-grid-gutters-32);
    background-color: var(--general-surface-tertiary);
  }
`;

export const UsageExample: StoryObj<SkipLinksComponent> = {
  parameters: {
    docs: { story: { height: "800px" } },
    controls: { disable: true },
    // TODO(a11y): the sidenav projects its items straight into a <ul>, failing the "list" rule; fixed by #307.
    a11y: { test: "todo" },
  },
  render: () => ({
    styles: [usageStyles],
    template: `
      <div class="story-page flex flex-column">
        <tedi-skip-links>
          <a tedi-link *tediSkipLink href="#usage-example-main">Liigu edasi põhisisu juurde</a>
        </tedi-skip-links>
        <header tedi-header>
          <button tedi-sidenav-toggle></button>
          <tedi-header-logo href="/">
            <img src="header-logo.svg" alt="Logo" />
            <img tedi-header-logo-dark src="header-logo-white.svg" alt="Logo" />
          </tedi-header-logo>
          <tedi-header-actions>
            <tedi-header-role
              *showAt="'lg'"
              label="Isikukood:"
              description="49504080934"
              [representatives]="representatives"
              [currentRepresentative]="representatives[0]"
            />
            <tedi-separator *showAt="'lg'" axis="vertical" />
            <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
            <tedi-separator axis="vertical" />
            <tedi-header-profile>
              <a tedi-link href="#" [underline]="false">Minu andmed</a>
              <tedi-header-logout href="#" />
            </tedi-header-profile>
          </tedi-header-actions>
        </header>
        <tedi-sidenav-overlay />
        <div class="flex flex-fill">
          <nav tedi-sidenav aria-label="Peamenüü">
            <tedi-sidenav-item icon="dashboard" href="#">Minu töölaud</tedi-sidenav-item>
            <tedi-sidenav-item icon="calendar_today" href="#">Vastuvõtud ja saatekirjad</tedi-sidenav-item>
            <tedi-sidenav-item icon="medication" href="#">Retseptid ja meditsiiniseadmed</tedi-sidenav-item>
            <tedi-sidenav-item icon="history">
              Minu tervise ajalugu
              <tedi-sidenav-dropdown>
                <tedi-sidenav-dropdown-item href="#">Eelmised retseptid</tedi-sidenav-dropdown-item>
                <tedi-sidenav-dropdown-item href="#">Haiguslugu</tedi-sidenav-dropdown-item>
              </tedi-sidenav-dropdown>
            </tedi-sidenav-item>
            <tedi-sidenav-item icon="dentistry" href="#">Hammaste tervis</tedi-sidenav-item>
            <tedi-sidenav-item icon="vaccines" href="#">Vaktsineerimine</tedi-sidenav-item>
            <tedi-sidenav-item icon="assignment" href="#">Tervisetõendid ja -&#8288;deklaratsioonid</tedi-sidenav-item>
            <tedi-sidenav-item icon="business_center" href="#">Töövõime</tedi-sidenav-item>
            <tedi-sidenav-item icon="credit_card" href="#">Raviarved</tedi-sidenav-item>
            <tedi-sidenav-item icon="settings" href="#">Minu seaded</tedi-sidenav-item>
          </nav>
          <main id="usage-example-main" class="story-page__main flex flex-column flex-fill">
            <div [tediVerticalSpacing]="1" class="flex flex-column flex-fill">
              <tedi-breadcrumbs>
                <a *tediBreadcrumbItem tedi-link href="#">Link</a>
                <a *tediBreadcrumbItem tedi-link href="#">Link</a>
                <span *tediBreadcrumbItem aria-current="page">Aktiivne link</span>
              </tedi-breadcrumbs>
              <h1 tedi-text modifiers="h1">Pealkiri</h1>
              <p tedi-text>Kirjeldus</p>
              <tedi-card class="flex-fill">
                <tedi-card-content>
                  <p tedi-text>On a real page, the first Tab after load shows the skip link. Here, open the story in isolation mode and press Tab, or click an empty part of the header and press Shift+Tab.</p>
                </tedi-card-content>
              </tedi-card>
            </div>
          </main>
        </div>
      </div>
    `,
    props: {
      representatives: [
        {
          id: "1",
          icon: "person",
          name: "Mari Maasikas",
          description: "49504080934",
        },
      ],
    },
  }),
};
