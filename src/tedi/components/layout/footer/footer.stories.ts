import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { FooterComponent } from "./footer.component";
import { FooterBodyComponent } from "./footer-body/footer-body.component";
import { FooterSectionComponent } from "./footer-section/footer-section.component";
import { FooterSideComponent } from "./footer-side/footer-side.component";
import { FooterBottomComponent } from "./footer-bottom/footer-bottom.component";
import { TextComponent } from "../../base/text/text.component";
import { LinkComponent } from "../../navigation/link/link.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";
import { VerticalSpacingDirective } from "../../../directives/vertical-spacing/vertical-spacing.directive";

const BREAKPOINTS = ["xs", "sm", "md", "lg", "xl", "xxl"];

@Component({
  selector: "story-logo-placeholder",
  standalone: true,
  imports: [TextComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span
      class="story-logo-placeholder"
      [class.story-logo-placeholder--horizontal]="horizontal()"
      [class.story-logo-placeholder--compact]="compact()"
    >
      <span tedi-text [modifiers]="['small', 'italic']" color="tertiary"
        >Logo</span
      >
    </span>
  `,
  styles: `
    .story-logo-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 4rem;
      height: 7rem;
      background: var(--general-surface-primary);
    }

    .story-logo-placeholder--horizontal {
      width: 9rem;
      height: 5.1875rem;
    }

    .story-logo-placeholder--compact {
      width: 7rem;
      height: 2.5rem;
    }
  `,
})
class StoryLogoPlaceholderComponent {
  private readonly footer = inject(FooterComponent, { optional: true });

  readonly compact = input<boolean>(false);
  readonly horizontal = computed(() => this.footer?.isMobile() ?? false);
}

@Component({
  selector: "story-device-frame",
  standalone: true,
  imports: [TextComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "story-device-frame",
    "[style.max-width.px]": "width()",
    "[style.flex-basis.px]": "width()",
  },
  template: `
    @if (label()) {
      <h5 tedi-text color="secondary">{{ label() }}</h5>
    }
    <div
      class="story-device-frame__viewport"
      [style.height.px]="height() * scale()"
    >
      <iframe
        #frame
        class="story-device-frame__iframe"
        scrolling="no"
        [title]="label() || 'Footer preview'"
        [src]="src()"
        [style.width.px]="width()"
        [style.height.px]="height()"
        [style.transform]="'scale(' + scale() + ')'"
        (load)="measure()"
      ></iframe>
    </div>
  `,
  styles: `
    .story-device-frame {
      display: block;
      flex: 0 1 auto;
      width: 100%;
      min-width: 0;
    }

    .story-device-frame__viewport {
      margin-top: var(--layout-grid-gutters-16);
      overflow: hidden;
    }

    .story-device-frame__iframe {
      display: block;
      border: 0;
      transform-origin: top left;
    }
  `,
})
class StoryDeviceFrameComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly storyId = input.required<string>();
  readonly width = input.required<number>();
  readonly theme = input<string>("default");
  readonly label = input<string>();

  protected readonly height = signal(320);
  protected readonly scale = signal(1);
  protected readonly src = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `iframe.html?id=${this.storyId()}&viewMode=story&globals=theme:${this.theme()}`,
    ),
  );

  private readonly frame =
    viewChild.required<ElementRef<HTMLIFrameElement>>("frame");
  private observer?: ResizeObserver;
  private hostObserver?: ResizeObserver;

  constructor() {
    afterNextRender(() => {
      const host = this.host.nativeElement;
      this.hostObserver = new ResizeObserver(() =>
        this.scale.set(Math.min(1, host.clientWidth / this.width())),
      );
      this.hostObserver.observe(host);
    });
    inject(DestroyRef).onDestroy(() => {
      this.observer?.disconnect();
      this.hostObserver?.disconnect();
    });
  }

  protected measure(attempt = 0): void {
    const doc = this.frame().nativeElement.contentDocument;
    const footer = doc?.querySelector<HTMLElement>(".tedi-footer");
    if (!doc || !footer) {
      if (attempt < 100) setTimeout(() => this.measure(attempt + 1), 50);
      return;
    }
    doc.body.style.margin = "0";
    this.observer?.disconnect();
    this.observer = new ResizeObserver(() =>
      this.height.set(footer.offsetHeight),
    );
    this.observer.observe(footer);
  }
}

const breakpointArgType = (breakpoint: string) => ({
  control: false,
  description: `\`FooterBodyInputs\` or \`FooterSideInputs\` applied from ${breakpoint} up.`,
  table: {
    category: "breakpoint inputs",
    type: { summary: "FooterBodyInputs | FooterSideInputs" },
  },
});

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY?node-id=6459-181755&m=dev" target="_blank">Figma ↗</a><br>
 * <a href="https://www.tedi.ee/1ee8444b7/p/512563-footer" target="_blank">Zeroheight ↗</a>
 *
 * - `tedi-footer-body`: the row of sections.
 * - `tedi-footer-section`: a heading with links and an optional icon; becomes an accordion on mobile with `collapsible`.
 * - `tedi-footer-side`: logo slot before or after the body.
 * - `tedi-footer-bottom`: strip below the footer for extra links or a logo.
 */
export default {
  title: "TEDI-Ready/Layout/Footer",
  component: FooterComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FooterComponent,
        FooterBodyComponent,
        FooterSectionComponent,
        FooterSideComponent,
        FooterBottomComponent,
        TextComponent,
        LinkComponent,
        ButtonComponent,
        TooltipComponent,
        TooltipTriggerComponent,
        TooltipContentComponent,
        VerticalSpacingDirective,
        StoryLogoPlaceholderComponent,
        StoryDeviceFrameComponent,
      ],
    }),
  ],
  parameters: {
    status: {
      type: ["breakpointSupport", "mobileViewDifference"],
    },
  },
  argTypes: {
    mobileBreakpoint: {
      control: "select",
      options: BREAKPOINTS,
      description:
        "Below this breakpoint the footer stacks and collapsible sections become accordions.",
      table: {
        category: "footer inputs",
        type: { summary: "Breakpoint", detail: BREAKPOINTS.join(" | ") },
        defaultValue: { summary: "sm" },
      },
    },
    maxWidth: {
      control: "text",
      description:
        "Caps the width of the content row and the bottom strip's content.",
      table: {
        category: "footer inputs",
        type: { summary: "number | string" },
      },
    },
    columns: {
      control: "number",
      description:
        "Lays sections out as a grid of this many equal columns instead of a filling row.",
      table: {
        category: "footer-body inputs",
        type: { summary: "number" },
      },
    },
    heading: {
      control: false,
      description:
        "Section heading; on mobile also the accordion toggle's label.",
      table: {
        category: "footer-section inputs",
        type: { summary: "string" },
      },
    },
    icon: {
      control: false,
      description: "Material Symbols icon shown beside the heading.",
      table: {
        category: "footer-section inputs",
        type: { summary: "string" },
      },
    },
    collapsible: {
      control: "boolean",
      description:
        "Turns the section into an accordion below the footer's `mobileBreakpoint`.",
      table: {
        category: "footer-section inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    collapse: {
      control: false,
      description: "Deprecated, use `collapsible`.",
      table: {
        category: "footer-section inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    defaultOpen: {
      control: "boolean",
      description: "Opens the accordion initially.",
      table: {
        category: "footer-section inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    iconBreakpoint: {
      control: "select",
      options: BREAKPOINTS,
      description: "The icon is hidden below this breakpoint.",
      table: {
        category: "footer-section inputs",
        type: { summary: "Breakpoint", detail: BREAKPOINTS.join(" | ") },
        defaultValue: { summary: "lg" },
      },
    },
    placement: {
      control: "radio",
      options: ["start", "end"],
      description: "Side of the body the slot sits on.",
      table: {
        category: "footer-side inputs",
        type: { summary: "FooterSidePlacement", detail: "start | end" },
        defaultValue: { summary: "start" },
      },
    },
    position: {
      control: "radio",
      options: ["start", "center", "end"],
      description: "Vertical alignment of the slot's content.",
      table: {
        category: "footer-side inputs",
        type: {
          summary: "FooterSidePosition",
          detail: "start | center | end",
        },
        defaultValue: { summary: "center" },
      },
    },
    separator: {
      control: false,
      description: "Shows a dot between items.",
      table: {
        category: "footer-bottom inputs",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    ...Object.fromEntries(
      BREAKPOINTS.map((breakpoint) => [
        breakpoint,
        breakpointArgType(breakpoint),
      ]),
    ),
  },
} as Meta;

type Story = StoryObj;

const sectionsTemplate = (
  contactIcon: "call" | "location_on",
  bindings = "",
) => `
  <tedi-footer-section heading="Uuri lähemalt" icon="info" ${bindings}>
    <a tedi-link variant="inverted" href="#">Privaatsuspoliitika</a>
    <a tedi-link variant="inverted" href="#">Küpsised</a>
    <a tedi-link variant="inverted" href="#">Korduma kippuvad küsimused</a>
    <a tedi-link variant="inverted" href="#">Karjäärivõimalused</a>
  </tedi-footer-section>
  <tedi-footer-section heading="Sotsiaalmeedia ja uuendused" icon="share" ${bindings}>
    <a tedi-link variant="inverted" href="#">Uudiskirja tellimine</a>
    <a tedi-link variant="inverted" href="#">Jälgi meid Twitteris</a>
    <a tedi-link variant="inverted" href="#">Jälgi meid Facebookis</a>
    <a tedi-link variant="inverted" href="#">Liitu meie kogukonnaga</a>
  </tedi-footer-section>
  <tedi-footer-section heading="Kontakt" icon="${contactIcon}" ${bindings}>
    <a tedi-link variant="inverted" href="#">+372 555 5555</a>
    <a tedi-link variant="inverted" href="#">tedi@tehik.ee</a>
    <a tedi-link variant="inverted" href="#">Pärnu mnt. 132, 11317 Tallinn</a>
  </tedi-footer-section>
`;

const contactLinks = `
  <a tedi-link variant="inverted" href="#">+372 555 5555</a>
  <a tedi-link variant="inverted" href="#">tedi@tehik.ee</a>
  <a tedi-link variant="inverted" href="#">Pärnu mnt. 132, 11317 Tallinn</a>
`;

const logoSide = (attributes = "") => `
  <tedi-footer-side ${attributes}>
    <story-logo-placeholder />
  </tedi-footer-side>
`;

const sourceParameters = {
  docs: { disable: true },
  layout: "fullscreen",
  controls: { disable: true },
};

export const Default: Story = {
  args: {
    mobileBreakpoint: "sm",
    collapsible: false,
    defaultOpen: false,
    iconBreakpoint: "lg",
    placement: "end",
    position: "center",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-footer [mobileBreakpoint]="mobileBreakpoint" [maxWidth]="maxWidth">
        <tedi-footer-body [columns]="columns">
          ${sectionsTemplate(
            "call",
            `[collapsible]="collapsible" [defaultOpen]="defaultOpen" [iconBreakpoint]="iconBreakpoint"`,
          )}
        </tedi-footer-body>
        <tedi-footer-side [placement]="placement" [position]="position">
          <story-logo-placeholder />
        </tedi-footer-side>
      </tedi-footer>
    `,
  }),
};

const DEVICE_FRAMES = [
  {
    label: "Desktop",
    storyId: "tedi-ready-layout-footer--device-frame-source",
    width: 1138,
  },
  {
    label: "Tablet",
    storyId: "tedi-ready-layout-footer--device-frame-source",
    width: 871,
  },
  {
    label: "Mobile",
    storyId: "tedi-ready-layout-footer--device-frame-source",
    width: 360,
  },
  {
    label: "Mobile, accordions",
    storyId: "tedi-ready-layout-footer--device-frame-source-accordions",
    width: 360,
  },
  {
    label: "Mobile, accordions (open)",
    storyId: "tedi-ready-layout-footer--device-frame-source-accordions-open",
    width: 360,
  },
];

// The dev server gets one frame at a time: each nested preview holds a live-reload connection, and five of them
// exhaust the browser's six connections per host.
export const DeviceSize: Story = {
  parameters: { controls: { disable: true } },
  render: (_args, context) => ({
    props: {
      theme: context.globals["theme"] ?? "default",
      liveReload: "__whmEventSourceWrapper" in window,
      frames: DEVICE_FRAMES,
      selected: signal(DEVICE_FRAMES[0]),
    },
    template: `
      @if (liveReload) {
        <div [tediVerticalSpacing]="1.5">
          <div class="flex flex-wrap gap-3">
            @for (frame of frames; track frame.label) {
              <button
                tedi-button
                size="small"
                [variant]="selected() === frame ? 'primary' : 'secondary'"
                [attr.aria-pressed]="selected() === frame"
                (click)="selected.set(frame)"
              >
                {{ frame.label }}
              </button>
            }
          </div>
          <story-device-frame [storyId]="selected().storyId" [width]="selected().width" [theme]="theme" />
        </div>
      } @else {
      <div [tediVerticalSpacing]="1.5">
        <h4 tedi-text>Desktop</h4>
        <story-device-frame storyId="tedi-ready-layout-footer--device-frame-source" [width]="1138" [theme]="theme" />
        <h4 tedi-text>Tablet</h4>
        <story-device-frame storyId="tedi-ready-layout-footer--device-frame-source" [width]="871" [theme]="theme" />
        <h4 tedi-text>Mobile</h4>
        <div class="flex flex-wrap align-items-start gap-3">
          <story-device-frame storyId="tedi-ready-layout-footer--device-frame-source" label="Default" [width]="360" [theme]="theme" />
          <story-device-frame storyId="tedi-ready-layout-footer--device-frame-source-accordions" label="Compact view, accordions" [width]="360" [theme]="theme" />
          <story-device-frame storyId="tedi-ready-layout-footer--device-frame-source-accordions-open" label="Compact view, accordions (open)" [width]="360" [theme]="theme" />
        </div>
      </div>
      }
    `,
  }),
};

export const DeviceFrameSource: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: sourceParameters,
  render: () => ({
    template: `
      <tedi-footer>
        <tedi-footer-body>${sectionsTemplate("call")}</tedi-footer-body>
        ${logoSide('placement="end"')}
      </tedi-footer>
    `,
  }),
};

export const DeviceFrameSourceAccordions: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: sourceParameters,
  render: () => ({
    template: `
      <tedi-footer>
        <tedi-footer-body>${sectionsTemplate("call", '[collapsible]="true"')}</tedi-footer-body>
        ${logoSide('placement="end"')}
      </tedi-footer>
    `,
  }),
};

export const DeviceFrameSourceAccordionsOpen: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: sourceParameters,
  render: () => ({
    template: `
      <tedi-footer>
        <tedi-footer-body>
          <tedi-footer-section heading="Uuri lähemalt" icon="info" [collapsible]="true" [defaultOpen]="true">
            <a tedi-link variant="inverted" href="#">Privaatsuspoliitika</a>
            <a tedi-link variant="inverted" href="#">Küpsised</a>
            <a tedi-link variant="inverted" href="#">Korduma kippuvad küsimused</a>
            <a tedi-link variant="inverted" href="#">Karjäärivõimalused</a>
          </tedi-footer-section>
          <tedi-footer-section heading="Sotsiaalmeedia ja uuendused" icon="share" [collapsible]="true">
            <a tedi-link variant="inverted" href="#">Uudiskirja tellimine</a>
            <a tedi-link variant="inverted" href="#">Jälgi meid Twitteris</a>
            <a tedi-link variant="inverted" href="#">Jälgi meid Facebookis</a>
            <a tedi-link variant="inverted" href="#">Liitu meie kogukonnaga</a>
          </tedi-footer-section>
          <tedi-footer-section heading="Kontakt" icon="call" [collapsible]="true">
            ${contactLinks}
          </tedi-footer-section>
        </tedi-footer-body>
        ${logoSide('placement="end"')}
      </tedi-footer>
    `,
  }),
};

export const LogoPosition: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <section [tediVerticalSpacing]="1.5" aria-label="Logo position examples">
        <h4 tedi-text>Right</h4>
        <tedi-footer>
          <tedi-footer-body>${sectionsTemplate("location_on")}</tedi-footer-body>
          ${logoSide('placement="end"')}
        </tedi-footer>
        <tedi-footer>
          <tedi-footer-body>${sectionsTemplate("location_on")}</tedi-footer-body>
          ${logoSide('placement="end" position="start"')}
        </tedi-footer>
        <h4 tedi-text>Left</h4>
        <tedi-footer>
          ${logoSide('placement="start"')}
          <tedi-footer-body>${sectionsTemplate("location_on")}</tedi-footer-body>
        </tedi-footer>
        <tedi-footer>
          ${logoSide('placement="start" position="start"')}
          <tedi-footer-body>${sectionsTemplate("location_on")}</tedi-footer-body>
        </tedi-footer>
      </section>
    `,
  }),
};

const bottomSections = `
  <tedi-footer-section heading="Uuri lähemalt" icon="info">
    <a tedi-link variant="inverted" href="#">Privaatsuspoliitika</a>
    <a tedi-link variant="inverted" href="#">Küpsised</a>
    <a tedi-link variant="inverted" href="#">Korduma kippuvad küsimused</a>
    <a tedi-link variant="inverted" href="#">Karjäärivõimalused</a>
  </tedi-footer-section>
  <tedi-footer-section heading="Kontakt" icon="location_on">
    ${contactLinks}
  </tedi-footer-section>
`;

const bottomLinks = `
  <a tedi-link variant="inverted" [underline]="false" href="#">Facebook</a>
  <a tedi-link variant="inverted" [underline]="false" href="#">Instagram</a>
  <a tedi-link variant="inverted" [underline]="false" href="#">LinkedIn</a>
`;

export const WithBottomSection: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <section [tediVerticalSpacing]="1" aria-label="Footer bottom section examples">
        <tedi-footer>
          <tedi-footer-body>${bottomSections}</tedi-footer-body>
          ${logoSide('placement="end"')}
          <tedi-footer-bottom>${bottomLinks}</tedi-footer-bottom>
        </tedi-footer>
        <tedi-footer>
          <tedi-footer-body>${bottomSections}</tedi-footer-body>
          ${logoSide('placement="end"')}
          <tedi-footer-bottom [separator]="true">${bottomLinks}</tedi-footer-bottom>
        </tedi-footer>
      </section>
    `,
  }),
};

const facebookIcon = `
  <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" aria-hidden="true">
    <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z" />
  </svg>
`;

const instagramIcon = `
  <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
`;

const socialLink = (label: string, icon: string) => `
  <tedi-tooltip>
    <tedi-tooltip-trigger>
      <a tedi-link variant="inverted" href="#" aria-label="${label}">${icon}</a>
    </tedi-tooltip-trigger>
    <tedi-tooltip-content>${label}</tedi-tooltip-content>
  </tedi-tooltip>
`;

export const CustomContent: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <section [tediVerticalSpacing]="1.5" aria-label="Footer custom content examples">
        <tedi-footer>
          <tedi-footer-body>
            <tedi-footer-section heading="Kontakt" icon="call">
              ${contactLinks}
            </tedi-footer-section>
            <div class="flex align-self-center gap-3">
              ${socialLink("Facebook", facebookIcon)}
              ${socialLink("Instagram", instagramIcon)}
            </div>
          </tedi-footer-body>
        </tedi-footer>

        <tedi-footer>
          <tedi-footer-body>
            <tedi-footer-section heading="Uuri lähemalt">
              <a tedi-link variant="inverted" href="#">Privaatsuspoliitika</a>
              <a tedi-link variant="inverted" href="#">Küpsised</a>
              <a tedi-link variant="inverted" href="#">Korduma kippuvad küsimused</a>
            </tedi-footer-section>
            <tedi-footer-section heading="Sotsiaalmeedia">
              <a tedi-link variant="inverted" href="#">Jälgi meid Twitteris</a>
              <a tedi-link variant="inverted" href="#">Jälgi meid Facebookis</a>
              <a tedi-link variant="inverted" href="#">Liitu meie kogukonnaga</a>
            </tedi-footer-section>
            <tedi-footer-section heading="Uudised">
              <a tedi-link variant="inverted" href="#">Uudiskirja tellimine</a>
            </tedi-footer-section>
            <tedi-footer-section heading="Kontakt" icon="call" class="story-footer-hug">
              ${contactLinks}
            </tedi-footer-section>
          </tedi-footer-body>
          <tedi-footer-bottom>
            <story-logo-placeholder [compact]="true" />
          </tedi-footer-bottom>
        </tedi-footer>

        <tedi-footer>
          <tedi-footer-body>
            <tedi-footer-section heading="Osale meie terviseuuringus" class="align-self-center">
              <p tedi-text color="white">Liitu meie uuringuga ja avasta uut enda tervise kohta!</p>
            </tedi-footer-section>
            <div class="flex align-items-start">
              <img class="story-footer-avatar" src="https://picsum.photos/seed/tedi-footer/152" alt="" width="76" height="76" />
              <tedi-footer-section heading="Kontakt">
                ${contactLinks}
              </tedi-footer-section>
            </div>
          </tedi-footer-body>
        </tedi-footer>
      </section>
    `,
    styles: [
      ".story-footer-avatar { flex-shrink: 0; border-radius: 50%; object-fit: cover; }",
      ".story-footer-hug { flex: none; }",
    ],
  }),
};

/**
 * The logo sits on the left from `lg` up and drops below the sections when the footer stacks; resize the window to see it move.
 */
export const WithResponsivePlacement: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <tedi-footer mobileBreakpoint="lg">
        ${logoSide(`placement="end" [lg]="{ placement: 'start' }"`)}
        <tedi-footer-body>${sectionsTemplate("call")}</tedi-footer-body>
      </tedi-footer>
    `,
  }),
};

export const MaxWidthAndColumns: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <tedi-footer [maxWidth]="1280">
        <tedi-footer-body [columns]="2" [lg]="{ columns: 4 }">
          ${sectionsTemplate("call")}
          <tedi-footer-section heading="Uudised" icon="local_library">
            <a tedi-link variant="inverted" href="#">Pressiteated</a>
            <a tedi-link variant="inverted" href="#">Blogi</a>
          </tedi-footer-section>
        </tedi-footer-body>
        <tedi-footer-bottom [separator]="true">
          <a tedi-link variant="inverted" [underline]="false" href="#">Privaatsuspoliitika</a>
          <a tedi-link variant="inverted" [underline]="false" href="#">Küpsised</a>
          <a tedi-link variant="inverted" [underline]="false" href="#">Ligipääsetavus</a>
        </tedi-footer-bottom>
      </tedi-footer>
    `,
  }),
};
