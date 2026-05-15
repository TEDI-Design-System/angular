import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HeaderLogoComponent } from "./header-logo.component";
import { HeaderLogoDarkDirective } from "./header-logo-dark.directive";
import {
  THEME_CLASS_PREFIX,
  THEME_COOKIE_NAME,
  ThemeService,
} from "../../../../services/theme/theme.service";
import { TEDI_THEME_DEFAULT_TOKEN } from "../../../../tokens/theme.token";

describe("HeaderLogoComponent", () => {
  beforeEach(async () => {
    document.cookie = `${THEME_COOKIE_NAME}=; path=/; max-age=0`;
    for (let i = document.documentElement.classList.length - 1; i >= 0; i--) {
      const cls = document.documentElement.classList.item(i);
      if (cls?.startsWith(THEME_CLASS_PREFIX)) {
        document.documentElement.classList.remove(cls);
      }
    }

    await TestBed.configureTestingModule({
      imports: [HeaderLogoComponent, HeaderLogoDarkDirective],
      providers: [{ provide: TEDI_THEME_DEFAULT_TOKEN, useValue: "default" }],
    }).compileComponents();
  });

  it("should create the component", () => {
    const fixture = TestBed.createComponent(HeaderLogoComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should apply the base host class", () => {
    const fixture = TestBed.createComponent(HeaderLogoComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain("tedi-header-logo");
  });

  it("should add the hidden modifier when showLogo is false", () => {
    const fixture = TestBed.createComponent(HeaderLogoComponent);
    fixture.componentRef.setInput("showLogo", false);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain(
      "tedi-header-logo--hidden",
    );
  });

  it("should not add the hidden modifier by default", () => {
    const fixture = TestBed.createComponent(HeaderLogoComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).not.toContain(
      "tedi-header-logo--hidden",
    );
  });

  it("should wrap projected content in an anchor when href is set", () => {
    @Component({
      standalone: true,
      imports: [HeaderLogoComponent],
      template: `
        <tedi-header-logo href="/home">
          <img src="logo.svg" alt="Logo" />
        </tedi-header-logo>
      `,
    })
    class TestHostComponent {}

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector(
      "a.tedi-header-logo__link",
    );
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute("href")).toBe("/home");
    expect(anchor.querySelector("img")).toBeTruthy();
  });

  it("should not render an anchor when href is not set", () => {
    @Component({
      standalone: true,
      imports: [HeaderLogoComponent],
      template: `
        <tedi-header-logo>
          <img src="logo.svg" alt="Logo" />
        </tedi-header-logo>
      `,
    })
    class TestHostComponent {}

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector("a.tedi-header-logo__link"),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector("img")).toBeTruthy();
  });

  it("should add the dark modifier when theme is dark and a dark variant is projected", () => {
    @Component({
      standalone: true,
      imports: [HeaderLogoComponent, HeaderLogoDarkDirective],
      template: `
        <tedi-header-logo>
          <img src="logo.svg" alt="Logo" />
          <img tediHeaderLogoDark src="logo-dark.svg" alt="Dark" />
        </tedi-header-logo>
      `,
    })
    class TestHostComponent {}

    const fixture = TestBed.createComponent(TestHostComponent);
    const themeService = TestBed.inject(ThemeService);
    themeService.theme.set("dark");
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("tedi-header-logo");
    expect(host.classList).toContain("tedi-header-logo--dark");
  });

  it("should not add the dark modifier when no dark variant is projected", () => {
    @Component({
      standalone: true,
      imports: [HeaderLogoComponent],
      template: `
        <tedi-header-logo>
          <img src="logo.svg" alt="Logo" />
        </tedi-header-logo>
      `,
    })
    class TestHostComponent {}

    const fixture = TestBed.createComponent(TestHostComponent);
    const themeService = TestBed.inject(ThemeService);
    themeService.theme.set("dark");
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("tedi-header-logo");
    expect(host.classList).not.toContain("tedi-header-logo--dark");
  });

  it("should not add the dark modifier when theme is default even if a dark variant is projected", () => {
    @Component({
      standalone: true,
      imports: [HeaderLogoComponent, HeaderLogoDarkDirective],
      template: `
        <tedi-header-logo>
          <img src="logo.svg" alt="Logo" />
          <img tediHeaderLogoDark src="logo-dark.svg" alt="Dark" />
        </tedi-header-logo>
      `,
    })
    class TestHostComponent {}

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("tedi-header-logo");
    expect(host.classList).not.toContain("tedi-header-logo--dark");
  });

  it("should swap the dark modifier reactively when theme changes", () => {
    @Component({
      standalone: true,
      imports: [HeaderLogoComponent, HeaderLogoDarkDirective],
      template: `
        <tedi-header-logo>
          <img src="logo.svg" alt="Logo" />
          <img tediHeaderLogoDark src="logo-dark.svg" alt="Dark" />
        </tedi-header-logo>
      `,
    })
    class TestHostComponent {}

    const fixture = TestBed.createComponent(TestHostComponent);
    const themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("tedi-header-logo");
    expect(host.classList).not.toContain("tedi-header-logo--dark");

    themeService.theme.set("dark");
    fixture.detectChanges();
    expect(host.classList).toContain("tedi-header-logo--dark");

    themeService.theme.set("default");
    fixture.detectChanges();
    expect(host.classList).not.toContain("tedi-header-logo--dark");
  });
});
