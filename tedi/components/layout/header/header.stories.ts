import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  Directive,
  inject,
  Pipe,
  PipeTransform,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { ThemeService } from "../../../services/theme/theme.service";
import {
  Language,
  TediTranslationService,
} from "../../../services/translation/translation.service";
import { HeaderComponent } from "./header.component";
import { HeaderContentComponent } from "./header-content/header-content.component";
import { HeaderActionsComponent } from "./header-actions/header-actions.component";
import { HeaderRoleComponent } from "./header-role/header-role.component";
import { HeaderRoleTitleDirective } from "./header-role/header-role-title.directive";
import { HeaderLanguageComponent } from "./header-language/header-language.component";
import { HeaderProfileComponent } from "./header-profile/header-profile.component";
import { HeaderLoginComponent } from "./header-login/header-login.component";
import { HeaderLogoComponent } from "./header-logo/header-logo.component";
import { HeaderLogoDarkDirective } from "./header-logo/header-logo-dark.directive";
import { HeaderLogoutComponent } from "./header-logout/header-logout.component";
import { LinkComponent } from "../../navigation/link/link.component";
import { IconComponent } from "../../base/icon/icon.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { ShowAtDirective } from "../../../directives/show-at/show-at.directive";
import { HideAtDirective } from "../../../directives/hide-at/hide-at.directive";
import { SideNavToggleComponent } from "../sidenav/sidenav-toggle/sidenav-toggle.component";
import { SideNavComponent } from "../sidenav/sidenav.component";
import { SideNavItemComponent } from "../sidenav/sidenav-item/sidenav-item.component";
import { SideNavDropdownComponent } from "../sidenav/sidenav-dropdown/sidenav-dropdown.component";
import { SideNavDropdownItemComponent } from "../sidenav/sidenav-dropdown-item/sidenav-dropdown-item.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { HeaderSearchComponent } from "./header-search/header-search.component";
import { HeaderBottomComponent } from "./header-bottom/header-bottom.component";
import { FormFieldComponent } from "../../form/form-field/form-field.component";
import { LabelComponent } from "../../form/label/label.component";
import { TextFieldComponent } from "../../form/text-field/text-field.component";
// TODO: replace with TEDI-Ready Search component once it lands. Community Search is
// used here only to demo HeaderSearch consumption — do NOT mirror this import from
// any non-story file inside `tedi/`.
import { SearchComponent } from "community/components/form";
import { TagComponent } from "../../tags/tag/tag.component";
import { ToggleComponent } from "../../form/toggle/toggle.component";

const profileTranslations = {
  myData: { et: "Minu andmed", en: "My data", ru: "Мои данные" },
  representatives: {
    et: "Esindatavad",
    en: "Representatives",
    ru: "Представители",
  },
  contacts: { et: "Kontaktid", en: "Contacts", ru: "Контакты" },
  darkMode: { et: "Tume režiim", en: "Dark mode", ru: "Тёмная тема" },
  notifications: {
    et: "Riiklikud teated",
    en: "National notifications",
    ru: "Государственные уведомления",
  },
  accessibility: {
    et: "Ligipääsetavus",
    en: "Accessibility",
    ru: "Доступность",
  },
  home: { et: "Avaleht", en: "Home", ru: "Главная" },
  services: { et: "Teenused", en: "Services", ru: "Услуги" },
  blog: { et: "Blogi", en: "Blog", ru: "Блог" },
  contact: { et: "Kontakt", en: "Contact", ru: "Контакт" },
} as const satisfies Record<string, Record<Language, string>>;

type ProfileTranslationKey = keyof typeof profileTranslations;

/**
 * Story-local translation pipe that resolves `profileTranslations` keys against
 * the current `TediTranslationService` language.
 */
@Pipe({ name: "storyTranslate", standalone: true, pure: false })
class StoryTranslatePipe implements PipeTransform {
  private translation = inject(TediTranslationService);

  transform(key: ProfileTranslationKey): string {
    const lang = this.translation.getLanguage();
    return profileTranslations[key][lang] ?? profileTranslations[key].et;
  }
}

@Component({
  selector: "story-theme-toggle",
  standalone: true,
  imports: [LabelComponent, ToggleComponent, StoryTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div
      style="display: flex; gap: var(--layout-grid-gutters-08); align-items: center;"
    >
      <label tedi-label for="theme-toggle">
        {{ "darkMode" | storyTranslate }}
      </label>
      <tedi-toggle
        inputId="theme-toggle"
        [checked]="isDark()"
        (checkedChange)="handleToggle($event)"
      />
    </div>
  `,
})
class StoryThemeToggleComponent {
  private themeService = inject(ThemeService);

  isDark = computed(() => this.themeService.theme() === "dark");

  handleToggle(checked: boolean) {
    this.themeService.theme.set(checked ? "dark" : "default");
  }
}

@Directive({
  selector: "tedi-header-logo[storyResponsive]",
  exportAs: "storyResponsive",
  standalone: true,
})
class StoryResponsiveLogoDirective {
  readonly show = signal(true);

  constructor() {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(min-width: 420px)");
    this.show.set(mql.matches);

    const handler = (event: MediaQueryListEvent) =>
      this.show.set(event.matches);
    mql.addEventListener("change", handler);
    inject(DestroyRef).onDestroy(() =>
      mql.removeEventListener("change", handler),
    );
  }
}

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.13.19?node-id=2137-19318&m=dev&focus-id=6380-53060" target="_BLANK">Figma ↗</a><br/>
 * <a href="https://www.tedi.ee/1ee8444b7/p/68343d-header" target="_BLANK">Zeroheight ↗</a>
 */
export default {
  title: "TEDI-Ready/Layout/Header",
  component: HeaderComponent,
  decorators: [
    moduleMetadata({
      imports: [
        HeaderComponent,
        HeaderContentComponent,
        HeaderActionsComponent,
        HeaderRoleComponent,
        HeaderLanguageComponent,
        HeaderProfileComponent,
        HeaderLoginComponent,
        HeaderLogoComponent,
        HeaderLogoDarkDirective,
        HeaderLogoutComponent,
        SeparatorComponent,
        LinkComponent,
        IconComponent,
        ButtonComponent,
        ShowAtDirective,
        HideAtDirective,
        SideNavComponent,
        SideNavItemComponent,
        SideNavToggleComponent,
        SideNavDropdownComponent,
        SideNavDropdownItemComponent,
        HeaderSearchComponent,
        HeaderBottomComponent,
        FormFieldComponent,
        LabelComponent,
        TextFieldComponent,
        SearchComponent,
        TagComponent,
        HeaderRoleTitleDirective,
        ToggleComponent,
        StoryThemeToggleComponent,
        StoryResponsiveLogoDirective,
        StoryTranslatePipe,
      ],
    }),
  ],
  parameters: {
    layout: "fullscreen",
    docs: { toc: false },
  },
  argTypes: {
    logoHref: {
      name: "href",
      description:
        "URL to wrap the logo with an anchor. When omitted, the logo renders without a link.",
      table: { category: "header-logo", type: { summary: "string" } },
    },
    showLogo: {
      description:
        "Controls visibility of the logo. Useful for conditionally hiding the logo based on application state, feature flags, or custom media queries that fall between standard breakpoints (e.g. 420px). For responsive hiding at standard breakpoints, prefer wrapping `<tedi-header-logo>` with the `*hideAt` / `*showAt` directives.",
      table: {
        category: "header-logo",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    alignment: {
      description: "Horizontal alignment of content area.",
      table: {
        category: "header-content",
        type: { summary: "'flex-start' | 'center' | 'space-between'" },
        defaultValue: { summary: "'center'" },
      },
    },
    languages: {
      description:
        "Languages object. Key is the value in `Language` type; value is the text shown in the UI.",
      table: {
        category: "header-language",
        type: { summary: "HeaderLanguage" },
      },
    },
    languageChange: {
      description: "Emitted when the active language is changed.",
      table: {
        category: "header-language",
        type: { summary: "EventEmitter<Language>" },
      },
    },
    loginSize: {
      name: "size",
      description:
        "Visual size of the login button. Auto-selected from the viewport when omitted.",
      table: {
        category: "header-login",
        type: { summary: "'default' | 'small'" },
      },
    },
    loginLabel: {
      name: "label",
      description:
        "Custom label text. Falls back to the `header.login` / `header.login-small` translation key.",
      table: { category: "header-login", type: { summary: "string" } },
    },
    loginHref: {
      name: "href",
      description:
        "URL — when provided, renders as `<a>`. Otherwise renders as `<button>`.",
      table: { category: "header-login", type: { summary: "string" } },
    },
    logoutSize: {
      name: "size",
      description:
        "Visual size of the logout button. Auto-selected from the viewport when omitted.",
      table: {
        category: "header-logout",
        type: { summary: "'default' | 'small'" },
      },
    },
    logoutLabel: {
      name: "label",
      description:
        "Custom label text. Falls back to the `header.logout` / `header.logout-small` translation key.",
      table: { category: "header-logout", type: { summary: "string" } },
    },
    logoutHref: {
      name: "href",
      description:
        "URL — when provided, renders as `<a>`. Otherwise renders as `<button>`.",
      table: { category: "header-logout", type: { summary: "string" } },
    },
    profileLabel: {
      name: "label",
      description: "Custom label text shown next to the profile icon.",
      table: { category: "header-profile", type: { summary: "string" } },
    },
    showPopover: {
      description:
        "Breakpoint from which the profile menu is rendered as a popover. Below it, the menu is rendered as a modal.",
      table: {
        category: "header-profile",
        type: { summary: "Breakpoint", detail: "xs \nsm \nmd \nlg \nxl \nxxl" },
        defaultValue: { summary: "'lg'" },
      },
    },
    profileNoStyle: {
      name: "noStyle",
      description:
        "Removes default item styles from the mobile modal content. When `true`, children are rendered without padding, borders, or background applied by the component. Use when the content requires custom item styling.",
      table: {
        category: "header-profile",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    profileSize: {
      name: "size",
      description:
        "Visual size of the profile trigger. Auto-selected from the viewport when omitted.",
      table: {
        category: "header-profile",
        type: { summary: "'default' | 'small'" },
      },
    },
    label: {
      description:
        "Role label text. Replaced by content projected via `[tedi-header-role-title]` when present.",
      table: { category: "header-role", type: { summary: "string" } },
    },
    description: {
      description: "Description text shown next to the representative name.",
      table: { category: "header-role", type: { summary: "string" } },
    },
    showInput: {
      description:
        "Show a search input above the representative list. Useful for long lists.",
      table: {
        category: "header-role",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    representatives: {
      description: "List of selectable representatives.",
      table: {
        category: "header-role",
        type: { summary: "Representative[]" },
      },
    },
    currentRepresentative: {
      description:
        "Currently selected representative. Two-way bindable via `[(currentRepresentative)]`.",
      table: {
        category: "header-role",
        type: { summary: "Representative" },
      },
    },
    currentRepresentativeChange: {
      description:
        "Emitted when the selected representative changes. Auto-generated by the `model()` API — fires alongside two-way binding.",
      table: {
        category: "header-role",
        type: { summary: "EventEmitter<Representative>" },
      },
    },
    roleSelectionToggle: {
      description:
        "Emitted when the role selection (mobile collapse or desktop popover) opens or closes. Payload is the new open state.",
      table: {
        category: "header-role",
        type: { summary: "EventEmitter<boolean>" },
      },
    },
    mobileVariant: {
      description:
        "Mobile presentation of the search. `'modal'` opens a full-screen modal; other variants render inline.",
      table: {
        category: "header-search",
        type: { summary: "HeaderSearchMobileVariant" },
        defaultValue: { summary: "'modal'" },
      },
    },
    mobileLabels: {
      description: "Custom labels for the mobile search UI.",
      table: {
        category: "header-search",
        type: { summary: "HeaderSearchMobileLabels" },
        defaultValue: { summary: "{}" },
      },
    },
    searchDisabled: {
      name: "disabled",
      description: "Disable the search trigger.",
      table: {
        category: "header-search",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
} as Meta<HeaderComponent>;

const accessibilityLink = `
  <a tedi-link href="#" [underline]="false">
    {{ 'accessibility' | storyTranslate }}
    <tedi-icon name="north_east" [size]="16" />
  </a>
`;

const representatives = `
  [
    { id: '1', icon: 'person', name: 'Mari Maasikas', description: '49504080934' },
    { id: '2', icon: 'supervised_user_circle', name: 'Juulia Sarapuu', description: '62004122984' },
    { id: '3', icon: 'supervised_user_circle', name: 'Marta Sarapuu', description: '62204115671' },
    { id: '4', icon: 'supervised_user_circle', name: 'Helgi Sarapuu', description: '62407194692' }
  ]
`;

const representatives2 = `
  [
    { id: '1', icon: 'person', name: 'Mari Maasikas', description: '49504080934' }
  ]
`;
const currentRepresentative = `{ id: '1', icon: 'person', name: 'Mari Maasikas', description: '49504080934' }`;

const organizations = `[
  { id: 'org-1', name: 'Pärnu linnavolikogu' },
  { id: 'org-2', name: 'Tartu Linnavalitsus' }
]`;
const organizations2 = `[
  { id: 'org-2', name: 'Tartu Linnavalitsus' }
]`;
const currentOrganization = `{ id: 'org-1', name: 'Pärnu linnavolikogu' }`;
const currentOrganization2 = `{ id: 'org-2', name: 'Tartu Linnavalitsus' }`;

const profileMenuContent = `
  <a tedi-link href="#" [underline]="false">{{ 'myData' | storyTranslate }}</a>
  <a tedi-link href="#" [underline]="false">{{ 'representatives' | storyTranslate }}</a>
  <a tedi-link href="#" [underline]="false">{{ 'contacts' | storyTranslate }}</a>
  <tedi-separator *showAt="'lg'" />

  <story-theme-toggle />

  <tedi-separator *showAt="'lg'" />
  <a tedi-link href="#" [underline]="false">
    <tedi-icon name="notifications" />
    {{ 'notifications' | storyTranslate }}
  </a>
  <tedi-separator *showAt="'lg'" />
  <tedi-header-logout href="#" />
`;

const logo = `
  <tedi-header-logo href="/">
    <img src="header-logo.svg" alt="Logo" />
    <img tediHeaderLogoDark src="header-logo-white.svg" alt="Logo (Dark Mode)" />
  </tedi-header-logo>
`;

const responsiveLogo = `
  <tedi-header-logo
    storyResponsive
    #responsive="storyResponsive"
    [showLogo]="responsive.show()"
    href="/"
  >
    <img src="header-logo.svg" alt="Logo" />
    <img tediHeaderLogoDark src="header-logo-white.svg" alt="Logo (Dark Mode)" />
  </tedi-header-logo>
`;

const mobileSidenavWrapperStyles = `
  .story-mobile-sidenav-wrapper {
    display: flex;
    flex-direction: column;
  }

  .story-mobile-sidenav-wrapper:has(.tedi-sidenav:not(.tedi-sidenav--hidden):not(.tedi-sidenav--collapsed)) {
    min-height: 100dvh;
  }
`;

export const Default: StoryObj<HeaderComponent> = {
  parameters: {
    docs: {
      description: {
        story: `
The Header component renders the page header. It can contain a SideNav toggle, logo, content links, language and role selection, profile menu, login / logout buttons, and more.
Header is responsive and adapts to mobile layouts automatically, but some subcomponents move between breakpoints. For example, \`HeaderRoleComponent\` lives in the main header on desktop and inside the \`HeaderProfileComponent\` menu on mobile. Use the \`*showAt\` and \`*hideAt\` structural directives to render each subcomponent in the right place at each breakpoint.
To preview the mobile layout, resize the browser window or use Storybook's viewport tools.

Header consists of several sub-components:
- \`HeaderLogoComponent\`: Wraps the project logo. Project the light/default logo as direct content; optionally project a dark-theme variant marked with \`tediHeaderLogoDark\` for automatic swap when the active theme is \`dark\`.
- \`HeaderContentComponent\`: Used for showing links in desktop view.
- \`HeaderActionsComponent\`: Used for showing and styling actions in header (placed at the right side).
- \`HeaderRoleComponent\`: Used for showing role selection. Accepts an optional title element projected via the \`[tedi-header-role-title]\` slot when richer markup (e.g. a tag) is needed instead of the plain \`label\` text.
- \`HeaderLanguageComponent\`: Used for selecting language.
- \`HeaderProfileComponent\`: Used for showing profile menu. Projected children render inside the popover (desktop) and modal (mobile).
- \`HeaderLoginComponent\`: Used for showing login button.
- \`HeaderLogoutComponent\`: Used for showing logout button.
- \`HeaderSearchComponent\`: Used for the search input that adapts between an inline desktop field and a mobile modal/inline variant.
- \`HeaderBottomComponent\`: Optional secondary row rendered below the main header bar on mobile (typically a compact search bar or contextual nav).

Example with theme-aware logo:
\`\`\`html
<tedi-header-logo href="/">
  <img src="logo.svg" alt="Logo" />
  <img tediHeaderLogoDark src="logo-white.svg" alt="Logo (dark mode)" />
</tedi-header-logo>
\`\`\`
        `,
      },
    },
  },
  render: (args) => ({
    props: args,
    styles: [mobileSidenavWrapperStyles],
    template: `
      <div class="story-mobile-sidenav-wrapper">
        <header tedi-header>
          <button tedi-sidenav-toggle></button>
          ${logo}
          <tedi-header-content *showAt="'lg'">
            <a tedi-link href="#" [underline]="false">Link text</a>
            <a tedi-link href="#" [underline]="false">Link text</a>
            <a tedi-link href="#" [underline]="false">Link text</a>
          </tedi-header-content>
          <tedi-header-actions>
            <tedi-header-language
              [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }"
              currentLanguage="et"
            />
            <tedi-separator axis="vertical" />
            <tedi-header-login />
          </tedi-header-actions>
        </header>
        <nav tedi-sidenav *hideAt="'lg'" style="flex: 1;">
          <tedi-sidenav-item href="#">
            Link text
          </tedi-sidenav-item>
          <tedi-sidenav-item href="#">
            Link text
          </tedi-sidenav-item>
          <tedi-sidenav-item href="#">
            Link text
          </tedi-sidenav-item>
        </nav>
      </div>
    `,
  }),
};

export const LoggedOut1: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    styles: [mobileSidenavWrapperStyles],
    template: `
      <div class="story-mobile-sidenav-wrapper">
        <header tedi-header>
          <button tedi-sidenav-toggle></button>
          ${logo}
          <tedi-header-content *showAt="'lg'">
            <a tedi-link href="#" [underline]="false">Link text</a>
            <a tedi-link href="#" [underline]="false">Link text</a>
            <a tedi-link href="#" [underline]="false">Link text</a>
            <a tedi-link href="#" [underline]="false">Link text</a>
            <a tedi-link href="#" [underline]="false">Link text</a>
          </tedi-header-content>
          <tedi-header-actions>
            <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
            <tedi-separator axis="vertical" />
            <tedi-header-login />
          </tedi-header-actions>
        </header>
        <nav tedi-sidenav *hideAt="'lg'" style="flex: 1;">
          <tedi-sidenav-item href="#">
            Link text
          </tedi-sidenav-item>
          <tedi-sidenav-item href="#">
            Link text
          </tedi-sidenav-item>
          <tedi-sidenav-item href="#">
            Link text
          </tedi-sidenav-item>
          <tedi-sidenav-item href="#">
            Link text
          </tedi-sidenav-item>
          <tedi-sidenav-item href="#">
            Link text
          </tedi-sidenav-item>
        </nav>
      </div>
    `,
  }),
};

export const LoggedOut2: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    styles: [mobileSidenavWrapperStyles],
    template: `
      <div class="story-mobile-sidenav-wrapper">
        <header tedi-header>
          <button tedi-sidenav-toggle></button>
          ${responsiveLogo}
          <tedi-header-content alignment="space-between" *showAt="'lg'">
            <div>
              <a tedi-link href="#" [underline]="false">{{ 'home' | storyTranslate }}</a>
              <a tedi-link href="#" [underline]="false">{{ 'services' | storyTranslate }}</a>
              <a tedi-link href="#" [underline]="false">{{ 'blog' | storyTranslate }}</a>
              <a tedi-link href="#" [underline]="false">{{ 'contact' | storyTranslate }}</a>
            </div>
            <tedi-header-search>
              <div style="width: 100%; max-width: 22.5rem;">
                <tedi-search inputId="logged-out-2-search" />
              </div>
            </tedi-header-search>
          </tedi-header-content>
          <tedi-header-actions>
            <tedi-header-search *hideAt="'lg'">
              <tedi-search inputId="logged-out-2-search" />
            </tedi-header-search>
            <tedi-separator axis="vertical" />
            <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
            <tedi-separator axis="vertical" />
            <tedi-header-login />
          </tedi-header-actions>
        </header>
        <nav tedi-sidenav *hideAt="'lg'" style="flex: 1;">
          <tedi-sidenav-item href="#">{{ 'home' | storyTranslate }}</tedi-sidenav-item>
          <tedi-sidenav-item href="#">{{ 'services' | storyTranslate }}</tedi-sidenav-item>
          <tedi-sidenav-item href="#">{{ 'blog' | storyTranslate }}</tedi-sidenav-item>
          <tedi-sidenav-item href="#">{{ 'contact' | storyTranslate }}</tedi-sidenav-item>
        </nav>
      </div>
    `,
  }),
};

export const LoggedIn1: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        ${logo}
        <tedi-header-actions>
          <ng-container *showAt="'lg'">
            ${accessibilityLink}
            <tedi-separator axis="vertical" />
            <tedi-header-role
              label="Roll:"
              description="49504080934"
              [showInput]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile>
            <tedi-header-role
              label="Roll:"
              description="49504080934"
              [showInput]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
              *hideAt="'lg'"
            />
            <ng-container *hideAt="'lg'">${accessibilityLink}</ng-container>
            ${profileMenuContent}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const LoggedIn2: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        ${logo}
        <tedi-header-actions>
          <ng-container *showAt="'lg'">
            ${accessibilityLink}
            <tedi-separator axis="vertical" />
            <tedi-header-role
              [showInput]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
            >
              <tedi-tag tedi-header-role-title>Esindatav:</tedi-tag>
            </tedi-header-role>
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile>
            <tedi-header-role
              [showInput]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
              *hideAt="'lg'"
            >
              <tedi-tag tedi-header-role-title>Esindatav:</tedi-tag>
            </tedi-header-role>
            <ng-container *hideAt="'lg'">${accessibilityLink}</ng-container>
            ${profileMenuContent}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithOrganizationSelection1: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        ${logo}
        <tedi-header-actions>
          <ng-container *showAt="'lg'">
            ${accessibilityLink}
            <tedi-separator axis="vertical" />
            <tedi-header-role
              label="Asutus"
              [showInput]="true"
              [representatives]="${organizations}"
              [currentRepresentative]="${currentOrganization}"
            />
            <tedi-separator axis="vertical" />
            <tedi-header-role
              label="Roll:"
              description="49504080934"
              [showInput]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile>
            <ng-container *hideAt="'lg'">
              <tedi-header-role
                label="Asutus:"
                [showInput]="true"
                [representatives]="${organizations}"
                [currentRepresentative]="${currentOrganization}"
              />
              <tedi-header-role
                label="Roll:"
                description="49504080934"
                [showInput]="true"
                [representatives]="${representatives}"
                [currentRepresentative]="${currentRepresentative}"
              />
              ${accessibilityLink}
            </ng-container>
            ${profileMenuContent}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithOrganizationSelection2: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        ${logo}
        <tedi-header-actions>
          <ng-container *showAt="'lg'">
            ${accessibilityLink}
            <tedi-separator axis="vertical" />
            <tedi-header-role
              label="Asutus"
              [showInput]="true"
              [representatives]="${organizations2}"
              [currentRepresentative]="${currentOrganization2}"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile>
            <ng-container *hideAt="'lg'">
              <tedi-header-role
                label="Asutus:"
                [showInput]="true"
                [representatives]="${organizations2}"
                [currentRepresentative]="${currentOrganization2}"
              />
              ${accessibilityLink}
            </ng-container>
            ${profileMenuContent}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const AlternativeProfileAndLogoutButton1: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        ${logo}
        <tedi-header-actions>
          <ng-container *showAt="'lg'">
            ${accessibilityLink}
            <tedi-separator axis="vertical" />
            <tedi-header-role
              label="Asutus"
              [showInput]="true"
              [representatives]="${organizations}"
              [currentRepresentative]="${currentOrganization}"
            />
            <tedi-separator axis="vertical" />
            <tedi-header-role
              label="Isikukood:"
              description="49504080934"
              [showInput]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile [showLabel]="true">
            <ng-container *hideAt="'lg'">
              <tedi-header-role
                label="Asutus:"
                [showInput]="true"
                [representatives]="${organizations}"
                [currentRepresentative]="${currentOrganization}"
              />
              <tedi-header-role
                label="Isikukood:"
                description="49504080934"
                [showInput]="true"
                [representatives]="${representatives}"
                [currentRepresentative]="${currentRepresentative}"
              />
              ${accessibilityLink}
            </ng-container>
            ${profileMenuContent}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const AlternativeProfileAndLogoutButton2: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        ${logo}
        <tedi-header-actions>
          <ng-container *showAt="'lg'">
            ${accessibilityLink}
            <tedi-separator axis="vertical" />
            <tedi-header-role
              label="Isikukood:"
              description="49504080934"
              [showInput]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile [showLabel]="true">
            <ng-container *hideAt="'lg'">
              <tedi-header-role
                label="Isikukood:"
                description="49504080934"
                [showInput]="true"
                [representatives]="${representatives}"
                [currentRepresentative]="${currentRepresentative}"
              />
              ${accessibilityLink}
            </ng-container>
            ${profileMenuContent}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const AlternativeProfileAndLogoutButton3: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        ${logo}
        <tedi-header-actions>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile [showLabel]="true" [md]="{ label: 'Mari Maasikas' }">
              <tedi-header-role
                *hideAt="'lg'"
                description="49504080934"
                [showInput]="true"
                [representatives]="${representatives2}"
                [currentRepresentative]="${currentRepresentative}"
              />
              ${accessibilityLink}
            ${profileMenuContent}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const AlternativeProfileAndLogoutButton4: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        ${logo}
        <tedi-header-actions>
          <ng-container *showAt="'lg'">
            ${accessibilityLink}
            <tedi-separator axis="vertical" />
            <tedi-header-role
              label="Asutus"
              [showInput]="true"
              [representatives]="${organizations}"
              [currentRepresentative]="${currentOrganization}"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <ng-container *hideAt="'lg'">
            <tedi-separator axis="vertical" />
            <tedi-header-profile>
              <tedi-header-role
                label="Asutus:"
                [showInput]="true"
                [representatives]="${organizations}"
                [currentRepresentative]="${currentOrganization}"
              />
              ${accessibilityLink}
            </tedi-header-profile>
          </ng-container>
          <tedi-separator axis="vertical" />
          <tedi-header-logout href="#" />
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithSearch1: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        ${logo}
        <tedi-header-actions>
          <tedi-header-search>
            <tedi-search inputId="search-3" />
          </tedi-header-search>
          <tedi-separator axis="vertical" />
          <ng-container *showAt="'lg'">
            <tedi-header-role
              label="Roll:"
              description="49504080934"
              [showInput]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile>
            <tedi-header-role
              label="Roll:"
              description="49504080934"
              [showInput]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
              *hideAt="'lg'"
            />
            <ng-container *hideAt="'lg'">${accessibilityLink}</ng-container>
            ${profileMenuContent}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithSearch2: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        ${logo}
        <tedi-header-actions>
          <ng-container *showAt="'md'">
            <tedi-header-search mobileVariant="inline">
              <tedi-search inputId="search-4" />
            </tedi-header-search>
          </ng-container>
          <ng-container *showAt="'lg'">
            <tedi-separator axis="vertical" />
            <tedi-header-role
              description="49504080934"
              [showInput]="true"
              [representatives]="${representatives2}"
              [currentRepresentative]="${currentRepresentative}"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile [showLabel]="true" [md]="{ label: 'Mari Maasikas' }">
            <tedi-header-role
              description="49504080934"
              [showInput]="true"
              [representatives]="${representatives2}"
              [currentRepresentative]="${currentRepresentative}"
              *hideAt="'lg'"
            />
            <ng-container *hideAt="'lg'">${accessibilityLink}</ng-container>
            ${profileMenuContent}
          </tedi-header-profile>
          <tedi-separator axis="vertical" />
          <tedi-header-logout href="#" />
        </tedi-header-actions>
        <tedi-header-bottom>
          <tedi-header-search mobileVariant="inline">
            <tedi-search inputId="search-4" />
          </tedi-header-search>
        </tedi-header-bottom>
      </header>
    `,
  }),
};

export const LoggedInWithSidenav: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    styles: [mobileSidenavWrapperStyles],
    template: `
      <div class="story-mobile-sidenav-wrapper">
        <header tedi-header>
          <button tedi-sidenav-toggle></button>
          ${logo}
          <tedi-header-actions>
            <ng-container *showAt="'lg'">
              ${accessibilityLink}
              <tedi-separator axis="vertical" />
              <tedi-header-role
                label="Roll:"
                description="49504080934"
                [showInput]="true"
                [representatives]="${representatives}"
                [currentRepresentative]="${currentRepresentative}"
              />
              <tedi-separator axis="vertical" />
            </ng-container>
            <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
            <tedi-separator axis="vertical" />
            <tedi-header-profile>
              <tedi-header-role
                label="Roll:"
                description="49504080934"
                [showInput]="true"
                [representatives]="${representatives}"
                [currentRepresentative]="${currentRepresentative}"
                *hideAt="'lg'"
              />
              <ng-container *hideAt="'lg'">${accessibilityLink}</ng-container>
              ${profileMenuContent}
            </tedi-header-profile>
          </tedi-header-actions>
        </header>
        <nav tedi-sidenav style="flex: 1;">
          <tedi-sidenav-item icon="account_circle">
            Minu andmed
            <tedi-sidenav-dropdown>
              <tedi-sidenav-dropdown-item href="#">
                Seadistused
              </tedi-sidenav-dropdown-item>
              <tedi-sidenav-dropdown-item href="#">
                Esindusõigused
              </tedi-sidenav-dropdown-item>
              <tedi-sidenav-dropdown-item href="#">
                Minu seotud isikud
              </tedi-sidenav-dropdown-item>
            </tedi-sidenav-dropdown>
          </tedi-sidenav-item>
          <tedi-sidenav-item icon="dashboard" href="#">
            Minu töölaud
          </tedi-sidenav-item>
          <tedi-sidenav-item icon="calendar_today" href="#">
            Vastuvõtud ja saatekirjad
          </tedi-sidenav-item>
          <tedi-sidenav-item icon="medication" href="#">
            Retseptid ja meditsiiniseadmed
          </tedi-sidenav-item>
          <tedi-sidenav-item icon="history" href="#">
            Minu tervise ajalugu
          </tedi-sidenav-item>
          <tedi-sidenav-item icon="dentistry" href="#">
            Hammaste tervis
          </tedi-sidenav-item>
          <tedi-sidenav-item icon="vaccines" href="#">
            Vaktsineerimine
          </tedi-sidenav-item>
          <tedi-sidenav-item icon="business_center" href="#">
            Töövõime
          </tedi-sidenav-item>
          <tedi-sidenav-item icon="credit_card" href="#">
            Raviarved
          </tedi-sidenav-item>
        </nav>
      </div>
    `,
  }),
};
