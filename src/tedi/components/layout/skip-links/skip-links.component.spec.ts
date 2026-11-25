import { Component, input, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { LinkComponent } from "../../navigation/link/link.component";
import { SideNavService } from "../../../services/sidenav/sidenav.service";
import { SkipLinksComponent } from "./skip-links.component";
import { SkipLinkDirective } from "./skip-link.directive";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

@Component({
  standalone: true,
  imports: [SkipLinksComponent, SkipLinkDirective, LinkComponent],
  template: `
    <tedi-skip-links>
      @if (withLinks()) {
        <a tedi-link *tediSkipLink href="#main-content">Skip to main content</a>
        <a tedi-link *tediSkipLink href="#footer">Skip to footer</a>
        <a tedi-link *tediSkipLink href="#missing">Skip to nowhere</a>
        <a tedi-link *tediSkipLink href="#section">Skip to section</a>
        <a tedi-link *tediSkipLink href="#p%C3%B5hisisu">Skip to encoded id</a>
        <a
          tedi-link
          *tediSkipLink
          href="#main-content"
          (click)="$event.preventDefault()"
        >
          Already handled
        </a>
        <a tedi-link *tediSkipLink href="#100%">Skip to malformed id</a>
        <a tedi-link *tediSkipLink href="#menu-item">Skip to the menu</a>
        <a tedi-link *tediSkipLink href="#main-content" target="_blank">
          Opens in a new tab
        </a>
        <a tedi-link *tediSkipLink href="#main-content" target="_SELF">
          Current tab
        </a>
        <a tedi-link *tediSkipLink href="#a%41">Skip to literal id</a>
        <a tedi-link *tediSkipLink href="#50%">Skip to nothing</a>
      }
    </tedi-skip-links>
    <main id="main-content">Main</main>
    <footer id="footer" tabindex="0">Footer</footer>
    <section id="section" tabindex="-1">Section</section>
    <div id="põhisisu">Encoded</div>
    <div id="100%" tabindex="0">Malformed</div>
    <nav class="tedi-sidenav"><a id="menu-item" href="#">Menu item</a></nav>
    <section id="a%41" tabindex="-1">As written</section>
    <section id="aA" tabindex="-1">Decoded</section>
  `,
})
class HostComponent {
  readonly withLinks = input(false);
}

describe("SkipLinksComponent", () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HTMLElement;
  let sidenav: {
    isMobileDrawerOpen: ReturnType<typeof signal<boolean>>;
    isMobileOpen: ReturnType<typeof signal<boolean>>;
  };

  beforeEach(() => {
    sidenav = {
      isMobileDrawerOpen: signal(false),
      isMobileOpen: signal(false),
    };
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        { provide: SideNavService, useValue: sidenav },
      ],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    host = fixture.nativeElement.querySelector("tedi-skip-links");
  });

  const links = () =>
    Array.from(host.querySelectorAll<HTMLAnchorElement>("li > a"));

  it("renders a default link to the main content", () => {
    expect(links()).toHaveLength(1);
    expect(links()[0].getAttribute("href")).toBe("#main-content");
    expect(links()[0].textContent?.trim()).toBe("skip-links.main-content");
  });

  it("renders projected links as list items instead of the default", () => {
    fixture.componentRef.setInput("withLinks", true);
    fixture.detectChanges();

    expect(host.querySelectorAll("ul > li")).toHaveLength(12);
    expect(links().map((a) => a.getAttribute("href"))).toEqual([
      "#main-content",
      "#footer",
      "#missing",
      "#section",
      "#p%C3%B5hisisu",
      "#main-content",
      "#100%",
      "#menu-item",
      "#main-content",
      "#main-content",
      "#a%41",
      "#50%",
    ]);
  });

  const click = (link: HTMLAnchorElement, init: MouseEventInit = {}) => {
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      ...init,
    });
    link.dispatchEvent(event);
    return event;
  };

  it("focuses the target instead of navigating", () => {
    const main: HTMLElement = fixture.nativeElement.querySelector("main");

    expect(click(links()[0]).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(main);
    expect(main.getAttribute("tabindex")).toBe("-1");
    expect(main.classList).toContain("tedi-skip-links__target");

    main.blur();
    expect(main.hasAttribute("tabindex")).toBe(false);
    expect(main.classList).not.toContain("tedi-skip-links__target");
  });

  it("keeps the tabindex of a focusable target", () => {
    fixture.componentRef.setInput("withLinks", true);
    fixture.detectChanges();
    const footer: HTMLElement = fixture.nativeElement.querySelector("footer");

    click(links()[1]);
    expect(footer.classList).not.toContain("tedi-skip-links__target");

    footer.blur();
    expect(footer.getAttribute("tabindex")).toBe("0");
  });

  it("leaves a link to a missing target alone", () => {
    fixture.componentRef.setInput("withLinks", true);
    fixture.detectChanges();

    expect(click(links()[2]).defaultPrevented).toBe(false);
  });

  it("keeps a target's own tabindex but removes the focus ring class on blur", () => {
    fixture.componentRef.setInput("withLinks", true);
    fixture.detectChanges();
    const section: HTMLElement = fixture.nativeElement.querySelector("section");

    click(links()[3]);
    expect(document.activeElement).toBe(section);
    expect(section.classList).toContain("tedi-skip-links__target");

    section.blur();
    expect(section.getAttribute("tabindex")).toBe("-1");
    expect(section.classList).not.toContain("tedi-skip-links__target");
  });

  it("finds a target whose id is percent-encoded in the href", () => {
    fixture.componentRef.setInput("withLinks", true);
    fixture.detectChanges();

    click(links()[4]);
    expect(document.activeElement?.id).toBe("põhisisu");
  });

  it("does nothing when the click was already handled", () => {
    fixture.componentRef.setInput("withLinks", true);
    fixture.detectChanges();

    click(links()[5]);
    expect(document.activeElement).not.toBe(
      fixture.nativeElement.querySelector("main"),
    );
  });

  it("uses an id that isn't valid percent-encoding as written", () => {
    fixture.componentRef.setInput("withLinks", true);
    fixture.detectChanges();

    click(links()[6]);
    expect(document.activeElement?.id).toBe("100%");
  });

  it("closes an open mobile menu so focus doesn't land behind it", () => {
    sidenav.isMobileDrawerOpen.set(true);
    sidenav.isMobileOpen.set(true);

    click(links()[0]);

    expect(sidenav.isMobileOpen()).toBe(false);
  });

  it("keeps the mobile menu open when the target is in it", () => {
    fixture.componentRef.setInput("withLinks", true);
    fixture.detectChanges();
    sidenav.isMobileDrawerOpen.set(true);
    sidenav.isMobileOpen.set(true);

    click(links()[7]);

    expect(sidenav.isMobileOpen()).toBe(true);
    expect(document.activeElement?.id).toBe("menu-item");
  });

  it("leaves a link that opens in another tab to the browser", () => {
    fixture.componentRef.setInput("withLinks", true);
    fixture.detectChanges();

    expect(click(links()[8]).defaultPrevented).toBe(false);
    expect(document.activeElement).not.toBe(
      fixture.nativeElement.querySelector("main"),
    );
  });

  it("handles a link whose target is the current tab, in any letter case", () => {
    fixture.componentRef.setInput("withLinks", true);
    fixture.detectChanges();

    expect(click(links()[9]).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector("main"),
    );
  });

  it.each(["metaKey", "ctrlKey", "shiftKey", "altKey"])(
    "leaves a click with %s to the browser",
    (modifier) => {
      expect(click(links()[0], { [modifier]: true }).defaultPrevented).toBe(
        false,
      );
      expect(document.activeElement).not.toBe(
        fixture.nativeElement.querySelector("main"),
      );
    },
  );

  it("prefers an id that matches the href as written over the decoded one", () => {
    fixture.componentRef.setInput("withLinks", true);
    fixture.detectChanges();

    click(links()[10]);
    expect(document.activeElement?.textContent).toBe("As written");
  });

  it("leaves a link alone when its id is not valid percent-encoding and nothing matches it", () => {
    fixture.componentRef.setInput("withLinks", true);
    fixture.detectChanges();

    expect(click(links()[11]).defaultPrevented).toBe(false);
  });
});
