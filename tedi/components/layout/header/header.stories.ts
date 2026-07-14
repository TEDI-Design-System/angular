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
import {
  HeaderRoleComponent,
  HeaderRoleContentDirective,
  HeaderRoleNoResultsDirective,
} from "./header-role/header-role.component";
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
import { SideNavOverlayComponent } from "../sidenav/sidenav-overlay/sidenav-overlay.component";
import { SideNavDropdownComponent } from "../sidenav/sidenav-dropdown/sidenav-dropdown.component";
import { SideNavDropdownItemComponent } from "../sidenav/sidenav-dropdown-item/sidenav-dropdown-item.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { HeaderSearchComponent } from "./header-search/header-search.component";
import { HeaderBottomComponent } from "./header-bottom/header-bottom.component";
import { HeaderTopComponent } from "./header-top/header-top.component";
import { FormFieldComponent } from "../../form/form-field/form-field.component";
import { LabelComponent } from "../../form/label/label.component";
import { TextFieldComponent } from "../../form/text-field/text-field.component";
// TODO: replace with TEDI-Ready Search component once it lands. Community Search is
// used here only to demo HeaderSearch consumption — do NOT mirror this import from
// any non-story file inside `tedi/`.
import { SearchComponent } from "community/components/form";
import { TextComponent } from "../../base/text/text.component";
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
    et: "Teated",
    en: "Notifications",
    ru: "Уведомления",
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
  organization: { et: "Asutus", en: "Organization", ru: "Организация" },
  personalCode: { et: "Isikukood", en: "Personal code", ru: "Личный код" },
  role: { et: "Roll", en: "Role", ru: "Роль" },
  representative: {
    et: "Esindatav",
    en: "Representative",
    ru: "Представитель",
  },
  individual: { et: "Eraisik", en: "Individual", ru: "Частное лицо" },
  business: { et: "Ettevõtja", en: "Business", ru: "Предприниматель" },
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

/**
 * Story-local inline language switcher for the top bar: renders the inactive
 * languages as links and switches via the translation service on click.
 */
@Component({
  selector: "story-language-links",
  standalone: true,
  imports: [LinkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div
      style="display: flex; gap: var(--layout-grid-gutters-16); align-items: center;"
    >
      @for (lang of visibleLanguages(); track lang.code) {
        <a
          tedi-link
          href="#"
          [underline]="true"
          (click)="select($event, lang.code)"
          >{{ lang.label }}</a
        >
      }
    </div>
  `,
})
class StoryLanguageLinksComponent {
  private translation = inject(TediTranslationService);

  private readonly labels: Record<Language, string> = {
    et: "Eesti keeles",
    en: "In English",
    ru: "На русском",
  };

  readonly visibleLanguages = computed(() => {
    const current = this.translation.getLanguage();
    return (Object.keys(this.labels) as Language[])
      .filter((code) => code !== current)
      .map((code) => ({ code, label: this.labels[code] }));
  });

  select(event: Event, lang: Language) {
    event.preventDefault();
    this.translation.setLanguage(lang);
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
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.47.70?m=dev&node-id=6380-53060" target="_BLANK">Figma ↗</a><br/>
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
        SideNavOverlayComponent,
        SideNavDropdownComponent,
        SideNavDropdownItemComponent,
        HeaderSearchComponent,
        HeaderBottomComponent,
        HeaderTopComponent,
        FormFieldComponent,
        LabelComponent,
        TextFieldComponent,
        SearchComponent,
        TagComponent,
        HeaderRoleTitleDirective,
        HeaderRoleContentDirective,
        HeaderRoleNoResultsDirective,
        TextComponent,
        ToggleComponent,
        StoryThemeToggleComponent,
        StoryLanguageLinksComponent,
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
      control: { type: "select" },
      options: [
        "flex-start",
        "center",
        "flex-end",
        "space-between",
        "space-around",
        "space-evenly",
      ],
      table: {
        category: "header-content",
        type: {
          summary:
            "'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'",
        },
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
    selectLabel: {
      description:
        "Label for the language selector. Falls back to the `header.select-lang` translation.",
      table: { category: "header-language", type: { summary: "string" } },
    },
    labelPosition: {
      description: "Position of the select label relative to the trigger.",
      control: { type: "inline-radio" },
      options: ["top", "left"],
      table: {
        category: "header-language",
        type: { summary: "'top' | 'left'" },
        defaultValue: { summary: "'top'" },
      },
    },
    loginSize: {
      name: "size",
      description:
        "Visual size of the login button. Auto-selected from the viewport when omitted.",
      control: { type: "select" },
      options: [undefined, "default", "small"],
      table: {
        category: "header-login",
        type: { summary: "'default' | 'small'" },
      },
    },
    loginLabel: {
      name: "label",
      description:
        "Custom label text. Falls back to the `header.login` / `header.login.mobile` translation key.",
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
        "Custom label text. Falls back to the `header.logout` / `header.logout.mobile` translation key.",
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
    showSearch: {
      description:
        "Whether to display the search input above the representative list.",
      table: {
        category: "header-role",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    searchClearable: {
      description: "Whether the search input shows a clear button.",
      table: {
        category: "header-role",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    clearSearchOnSelect: {
      description:
        "Whether to clear the search input when a representative is selected.",
      table: {
        category: "header-role",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    showRoleSwitch: {
      description:
        "Whether to show the role selection toggle and dropdown. Defaults to showing when there are multiple representatives.",
      table: {
        category: "header-role",
        type: { summary: "boolean" },
        defaultValue: { summary: "undefined" },
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
    isOrganization: {
      description:
        "Whether the role represents an organization. Affects the search input label.",
      table: {
        category: "header-role",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    searchLabel: {
      description:
        "Label for the search input when selecting a representative. Falls back to i18n labels when not provided.",
      table: {
        category: "header-role",
        type: { summary: "string" },
      },
    },
    organizationSearchLabel: {
      description:
        "Label for the search input when selecting an organization representative. Overrides both the default and `searchLabel` when `isOrganization` is true.",
      table: {
        category: "header-role",
        type: { summary: "string" },
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

const profileMenuContent = (showLogout = true) => `
  <a tedi-link href="#" [underline]="false">{{ 'myData' | storyTranslate }}</a>
  <a tedi-link href="#" [underline]="false">{{ 'representatives' | storyTranslate }}</a>
  <a tedi-link href="#" [underline]="false">{{ 'contacts' | storyTranslate }}</a>

  <tedi-separator *showAt="'lg'" />
  <a tedi-link href="#" [underline]="false">
    <tedi-icon name="notifications" />
    {{ 'notifications' | storyTranslate }}
  </a>

  <tedi-separator *showAt="'lg'" />
  <story-theme-toggle />

  ${
    showLogout
      ? `
      <tedi-separator *showAt="'lg'" />
      <tedi-header-logout href="#" />
    `
      : ""
  }
`;

const logo = `
  <tedi-header-logo href="/">
    <img src="header-logo.svg" alt="Logo" />
    <img tedi-header-logo-dark src="header-logo-white.svg" alt="Logo (Dark Mode)" />
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
    <img tedi-header-logo-dark src="header-logo-white.svg" alt="Logo (Dark Mode)" />
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
- \`HeaderLogoComponent\`: Wraps the project logo. Project the light/default logo as direct content; optionally project a dark-theme variant marked with \`tedi-header-logo-dark\` for automatic swap when the active theme is \`dark\`.
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
  <img tedi-header-logo-dark src="logo-white.svg" alt="Logo (dark mode)" />
</tedi-header-logo>
\`\`\`

| Selector | Description |
|----------|------------|
| \`[tedi-header-logo-dark]\` | Dark-theme logo variant. The logo component swaps to this image when the active theme is \`dark\`. |
| \`[tedi-header-role-title]\` | Title content projected into the role header (e.g. a \`<tedi-tag>\`). Replaces the bold \`label\` text. |
| \`[tedi-header-role-content]\` | Custom content projected into the role selection popover (desktop) or accordion (mobile). Replaces the default representative list. |
| \`[tedi-header-role-no-results]\` | Custom "no results" content shown when the search filter produces an empty representative list. |
        `,
      },
    },
  },
  args: {
    logoHref: "/",
    showLogo: true,
    alignment: "center",
    languages: { et: "EST", en: "ENG", ru: "RUS" },
    selectLabel: "",
    labelPosition: "top",
    loginHref: undefined,
    loginLabel: "",
    loginSize: undefined,
  } as Record<string, unknown>,
  render: (args) => ({
    props: args,
    styles: [mobileSidenavWrapperStyles],
    template: `
      <div class="story-mobile-sidenav-wrapper">
        <header tedi-header>
          <button tedi-sidenav-toggle></button>
          <tedi-header-logo [href]="logoHref" [showLogo]="showLogo">
            <img src="header-logo.svg" alt="Logo" />
            <img tedi-header-logo-dark src="header-logo-white.svg" alt="Logo (Dark Mode)" />
          </tedi-header-logo>
          <tedi-header-content *showAt="'lg'" [alignment]="alignment">
            <a tedi-link href="#" [underline]="false">Link text</a>
            <a tedi-link href="#" [underline]="false">Link text</a>
            <a tedi-link href="#" [underline]="false">Link text</a>
          </tedi-header-content>
          <tedi-header-actions>
            <tedi-header-language
              [languages]="languages"
              [selectLabel]="selectLabel"
              [labelPosition]="labelPosition"
            />
            <tedi-separator axis="vertical" />
            <tedi-header-login
              [href]="loginHref"
              [label]="loginLabel"
              [size]="loginSize"
            />
          </tedi-header-actions>
        </header>
        <tedi-sidenav-overlay></tedi-sidenav-overlay>
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

export const LoggedOut: StoryObj<HeaderComponent> = {
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
        <tedi-sidenav-overlay></tedi-sidenav-overlay>
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

export const LoggedOutWithSearch: StoryObj<HeaderComponent> = {
  parameters: {
    // TODO(a11y): search input lacks an accessible name; pending the TEDI-Ready Search migration.
    a11y: { test: "todo" },
    docs: {
      description: {
        story: `
On the narrowest viewports the header has to fit a sidenav toggle, a search input and several action buttons in a single row, which leaves no room for the logo. This story binds \`[showLogo]\` to a media-query-driven signal (\`storyResponsive\` custom directive watching \`(min-width: 420px)\`) so the logo is hidden below that width and rendered again as soon as there is space.

\`\`\`html
<tedi-header-logo
  storyResponsive
  #responsive="storyResponsive"
  [showLogo]="responsive.show()"
  href="/"
>
  <img src="header-logo.svg" alt="Logo" />
</tedi-header-logo>
\`\`\`

Use \`[showLogo]\` whenever you need to hide the logo at a custom breakpoint that does not match the standard \`xs\`/\`sm\`/\`md\`/\`lg\`/\`xl\`/\`xxl\` tiers — wrap \`HeaderLogoComponent\` in \`*showAt\` / \`*hideAt\` for the standard ones, and use \`[showLogo]\` for the in-between cases.
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
            <ng-container *showAt="'md'">
              <ng-container *hideAt="'lg'">
                <tedi-header-search>
                  <tedi-search inputId="logged-out-2-search-tablet" />
                </tedi-header-search>
                <tedi-separator axis="vertical" />
              </ng-container>
            </ng-container>
            <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
            <tedi-separator axis="vertical" />
            <ng-container *hideAt="'md'">
              <tedi-header-search>
                <tedi-search inputId="logged-out-2-search-mobile" />
              </tedi-header-search>
              <tedi-separator axis="vertical" />
            </ng-container>
            <tedi-header-login />
          </tedi-header-actions>
        </header>
        <tedi-sidenav-overlay></tedi-sidenav-overlay>
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

export const LoggedIn: StoryObj<HeaderComponent> = {
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
              [label]="('role' | storyTranslate) + ':'"
              description="49504080934"
              [showSearch]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile>
            <tedi-header-role
              [label]="('role' | storyTranslate) + ':'"
              description="49504080934"
              [showSearch]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
              *hideAt="'lg'"
            />
            <ng-container *hideAt="'lg'">${accessibilityLink}</ng-container>
            ${profileMenuContent()}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const LoggedInWithTagLabel: StoryObj<HeaderComponent> = {
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
              [showSearch]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
            >
              <tedi-tag tedi-header-role-title>{{ 'representative' | storyTranslate }}:</tedi-tag>
            </tedi-header-role>
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile>
            <tedi-header-role
              [showSearch]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
              *hideAt="'lg'"
            >
              <tedi-tag tedi-header-role-title>{{ 'representative' | storyTranslate }}:</tedi-tag>
            </tedi-header-role>
            <ng-container *hideAt="'lg'">${accessibilityLink}</ng-container>
            ${profileMenuContent()}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithOrganizationSelection: StoryObj<HeaderComponent> = {
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
              [label]="'organization' | storyTranslate"
              [showSearch]="true"
              [representatives]="${organizations}"
              [currentRepresentative]="${currentOrganization}"
              [isOrganization]="true"
            />
            <tedi-separator axis="vertical" />
            <tedi-header-role
              [label]="('role' | storyTranslate) + ':'"
              description="49504080934"
              [showSearch]="true"
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
                [label]="('organization' | storyTranslate) + ':'"
                [showSearch]="true"
                [representatives]="${organizations}"
                [currentRepresentative]="${currentOrganization}"
                [isOrganization]="true"
              />
              <tedi-header-role
                [label]="('role' | storyTranslate) + ':'"
                description="49504080934"
                [showSearch]="true"
                [representatives]="${representatives}"
                [currentRepresentative]="${currentRepresentative}"
              />
              ${accessibilityLink}
            </ng-container>
            ${profileMenuContent()}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithSingleOrganization: StoryObj<HeaderComponent> = {
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
              [label]="'organization' | storyTranslate"
              [showSearch]="true"
              [representatives]="${organizations2}"
              [currentRepresentative]="${currentOrganization2}"
              [isOrganization]="true"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile>
            <ng-container *hideAt="'lg'">
              <tedi-header-role
                [label]="('organization' | storyTranslate) + ':'"
                [showSearch]="true"
                [representatives]="${organizations2}"
                [currentRepresentative]="${currentOrganization2}"
                [isOrganization]="true"
              />
              ${accessibilityLink}
            </ng-container>
            ${profileMenuContent()}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithProfileLabel: StoryObj<HeaderComponent> = {
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
              [label]="'organization' | storyTranslate"
              [showSearch]="true"
              [representatives]="${organizations}"
              [currentRepresentative]="${currentOrganization}"
              [isOrganization]="true"
            />
            <tedi-separator axis="vertical" />
            <tedi-header-role
              [label]="('personalCode' | storyTranslate) + ':'"
              description="49504080934"
              [showSearch]="true"
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
                [label]="('organization' | storyTranslate) + ':'"
                [showSearch]="true"
                [representatives]="${organizations}"
                [currentRepresentative]="${currentOrganization}"
                [isOrganization]="true"
              />
              <tedi-header-role
                [label]="('personalCode' | storyTranslate) + ':'"
                description="49504080934"
                [showSearch]="true"
                [representatives]="${representatives}"
                [currentRepresentative]="${currentRepresentative}"
              />
              ${accessibilityLink}
            </ng-container>
            ${profileMenuContent()}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithProfileLabelAndNoOrganization: StoryObj<HeaderComponent> = {
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
              [label]="('personalCode' | storyTranslate) + ':'"
              description="49504080934"
              [showSearch]="true"
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
                [label]="('personalCode' | storyTranslate) + ':'"
                description="49504080934"
                [showSearch]="true"
                [representatives]="${representatives}"
                [currentRepresentative]="${currentRepresentative}"
              />
              ${accessibilityLink}
            </ng-container>
            ${profileMenuContent()}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithNameAsProfileLabel: StoryObj<HeaderComponent> = {
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
                [showSearch]="true"
                [representatives]="${representatives2}"
                [currentRepresentative]="${currentRepresentative}"
              />
              ${accessibilityLink}
            ${profileMenuContent()}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithStandaloneLogoutButton: StoryObj<HeaderComponent> = {
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
              [label]="'organization' | storyTranslate"
              [showSearch]="true"
              [representatives]="${organizations}"
              [currentRepresentative]="${currentOrganization}"
              [isOrganization]="true"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <ng-container *hideAt="'lg'">
            <tedi-separator axis="vertical" />
            <tedi-header-profile>
              <tedi-header-role
                [label]="('organization' | storyTranslate) + ':'"
                [showSearch]="true"
                [representatives]="${organizations}"
                [currentRepresentative]="${currentOrganization}"
                [isOrganization]="true"
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

export const WithInlineSearch: StoryObj<HeaderComponent> = {
  // TODO(a11y): search input lacks an accessible name; pending the TEDI-Ready Search migration.
  parameters: { a11y: { test: "todo" } },
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        ${logo}
        <tedi-header-actions>
          <ng-container *showAt="'md'">
            <tedi-header-search>
              <tedi-search inputId="search-3-desktop" />
            </tedi-header-search>
            <tedi-separator axis="vertical" />
          </ng-container>
          <ng-container *showAt="'lg'">
            <tedi-header-role
              [label]="('role' | storyTranslate) + ':'"
              description="49504080934"
              [showSearch]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <ng-container *hideAt="'md'">
            <tedi-header-search>
              <tedi-search inputId="search-3-mobile" />
            </tedi-header-search>
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-profile>
            <tedi-header-role
              [label]="('role' | storyTranslate) + ':'"
              description="49504080934"
              [showSearch]="true"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
              *hideAt="'lg'"
            />
            <ng-container *hideAt="'lg'">${accessibilityLink}</ng-container>
            ${profileMenuContent()}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithMobileBottomSearch: StoryObj<HeaderComponent> = {
  // TODO(a11y): search input lacks an accessible name; pending the TEDI-Ready Search migration.
  parameters: { a11y: { test: "todo" } },
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
              [showSearch]="true"
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
              [showSearch]="true"
              [representatives]="${representatives2}"
              [currentRepresentative]="${currentRepresentative}"
              *hideAt="'lg'"
            />
            <ng-container *hideAt="'lg'">${accessibilityLink}</ng-container>
            ${profileMenuContent(false)}
          </tedi-header-profile>
          <tedi-separator axis="vertical" />
          <tedi-header-logout href="#" />
        </tedi-header-actions>
        <tedi-header-bottom>
          <tedi-header-search mobileVariant="inline">
            <tedi-search inputId="search-5" />
          </tedi-header-search>
        </tedi-header-bottom>
      </header>
    `,
  }),
};

export const WithTopHeader: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        <tedi-header-top alignment="center" [lg]="{ alignment: 'space-between' }">
          <story-language-links *showAt="'lg'" />
          <div style="display: flex; gap: var(--layout-grid-gutters-08); align-items: center;">
            <a tedi-link href="#" [underline]="false" aria-current="page" style="color: var(--link-primary-active); font-weight: var(--body-bold-weight);">
              {{ 'individual' | storyTranslate }}
            </a>
            <a tedi-link href="#">{{ 'business' | storyTranslate }}</a>
          </div>
          <story-theme-toggle *showAt="'lg'" />
        </tedi-header-top>
        ${logo}
        <tedi-header-actions>
          <ng-container *showAt="'lg'">
            ${accessibilityLink}
            <tedi-separator axis="vertical" />
            <tedi-header-role
              [label]="('organization' | storyTranslate)"
              [representatives]="${organizations}"
              [currentRepresentative]="${currentOrganization}"
              [isOrganization]="true"
              [showSearch]="true"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <ng-container *hideAt="'lg'">
            <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-profile [showLabel]="true" [md]="{ label: 'Mari Maasikas' }">
            <a tedi-link href="#" [underline]="false">{{ 'myData' | storyTranslate }}</a>
            <a tedi-link href="#" [underline]="false">{{ 'representatives' | storyTranslate }}</a>
            <a tedi-link href="#" [underline]="false">{{ 'contacts' | storyTranslate }}</a>
            <tedi-separator *showAt="'lg'" />
            <a tedi-link href="#" [underline]="false">
              <tedi-icon name="notifications" />
              {{ 'notifications' | storyTranslate }}
            </a>
            <story-theme-toggle *hideAt="'lg'" />
            <tedi-separator *showAt="'lg'" />
            <tedi-header-logout href="#" />
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithTopHeaderAndLanguageDropdown: StoryObj<HeaderComponent> = {
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        <tedi-header-top alignment="center" [lg]="{ alignment: 'space-between' }">
          <tedi-header-language *showAt="'lg'" labelPosition="left" [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <div style="display: flex; gap: var(--layout-grid-gutters-08); align-items: center;">
            <a tedi-link href="#" [underline]="false" aria-current="page" style="color: var(--link-primary-active); font-weight: var(--body-bold-weight);">
              {{ 'individual' | storyTranslate }}
            </a>
            <a tedi-link href="#">{{ 'business' | storyTranslate }}</a>
          </div>
          <story-theme-toggle *showAt="'lg'" />
        </tedi-header-top>
        ${logo}
        <tedi-header-actions>
          <ng-container *showAt="'lg'">
            ${accessibilityLink}
            <tedi-separator axis="vertical" />
            <tedi-header-role
              [label]="('organization' | storyTranslate)"
              [representatives]="${organizations}"
              [currentRepresentative]="${currentOrganization}"
              [isOrganization]="true"
              [showSearch]="true"
            />
            <tedi-separator axis="vertical" />
          </ng-container>
          <ng-container *hideAt="'lg'">
            <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-profile [showLabel]="true" [md]="{ label: 'Mari Maasikas' }">
            <a tedi-link href="#" [underline]="false">{{ 'myData' | storyTranslate }}</a>
            <a tedi-link href="#" [underline]="false">{{ 'representatives' | storyTranslate }}</a>
            <a tedi-link href="#" [underline]="false">{{ 'contacts' | storyTranslate }}</a>
            <tedi-separator *showAt="'lg'" />
            <a tedi-link href="#" [underline]="false">
              <tedi-icon name="notifications" />
              {{ 'notifications' | storyTranslate }}
            </a>
            <story-theme-toggle *hideAt="'lg'" />
            <tedi-separator *showAt="'lg'" />
            <tedi-header-logout href="#" />
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const WithCustomRoleContent: StoryObj<HeaderComponent> = {
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
              [label]="('role' | storyTranslate) + ':'"
              description="49504080934"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
              [showRoleSwitch]="true"
            >
              <ng-template tedi-header-role-content>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                  <tedi-icon name="heart_check" [size]="36" color="brand" />
                  <span tedi-text [color]="'secondary'" modifiers="center">Sul puuduvad esindatavad</span>
                </div>
              </ng-template>
            </tedi-header-role>
            <tedi-separator axis="vertical" />
          </ng-container>
          <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
          <tedi-separator axis="vertical" />
          <tedi-header-profile>
            <tedi-header-role
              [label]="('role' | storyTranslate) + ':'"
              description="49504080934"
              [representatives]="${representatives}"
              [currentRepresentative]="${currentRepresentative}"
              [showRoleSwitch]="true"
              *hideAt="'lg'"
            >
              <ng-template tedi-header-role-content>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem;">
                  <tedi-icon name="heart_check" [size]="36" color="brand" />
                  <span tedi-text [color]="'secondary'" modifiers="center">Sul puuduvad esindatavad</span>
                </div>
              </ng-template>
            </tedi-header-role>
            <ng-container *hideAt="'lg'">${accessibilityLink}</ng-container>
            ${profileMenuContent()}
          </tedi-header-profile>
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const LanguageWithNavigationLinks: StoryObj<HeaderComponent> = {
  parameters: {
    docs: {
      description: {
        story: `By default each language option switches the language client-side. For apps that switch language by navigating to a localized URL, pass \`[languageHrefs]\` — each option then renders as a real \`<a href>\` anchor, keeping native link behavior (open in new tab, middle-click, works without JS).

This demo uses hash fragments (\`#et\`, \`#en\`, \`#ru\`) so selecting a language stays within Storybook; real apps would point these at localized URLs (e.g. \`/et\`, \`/en\`).`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <header tedi-header>
        ${logo}
        <tedi-header-actions>
          <tedi-header-language
            [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }"
            [languageHrefs]="{ et: '#et', en: '#en', ru: '#ru' }"
          />
        </tedi-header-actions>
      </header>
    `,
  }),
};

export const LoggedInWithSidenav: StoryObj<HeaderComponent> = {
  // Renders the sidenav, whose accessibility fixes are tracked in
  // https://github.com/TEDI-Design-System/angular/issues/307
  parameters: { a11y: { test: "todo" } },
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
                [label]="('role' | storyTranslate) + ':'"
                description="49504080934"
                [showSearch]="true"
                [representatives]="${representatives}"
                [currentRepresentative]="${currentRepresentative}"
              />
              <tedi-separator axis="vertical" />
            </ng-container>
            <tedi-header-language [languages]="{ et: 'EST', en: 'ENG', ru: 'RUS' }" />
            <tedi-separator axis="vertical" />
            <tedi-header-profile>
              <tedi-header-role
                [label]="('role' | storyTranslate) + ':'"
                description="49504080934"
                [showSearch]="true"
                [representatives]="${representatives}"
                [currentRepresentative]="${currentRepresentative}"
                *hideAt="'lg'"
              />
              <ng-container *hideAt="'lg'">${accessibilityLink}</ng-container>
              ${profileMenuContent()}
            </tedi-header-profile>
          </tedi-header-actions>
        </header>
        <tedi-sidenav-overlay></tedi-sidenav-overlay>
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
