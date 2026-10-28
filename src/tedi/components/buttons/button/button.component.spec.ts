import { ComponentFixture, TestBed } from "@angular/core/testing";
import { IconComponent } from "../../base/icon/icon.component";
import { ButtonComponent, ButtonSize, ButtonVariant } from "./button.component";
import { Component, input } from "@angular/core";
import { By } from "@angular/platform-browser";
import { PrintDirective, PrintVisibility } from "../../../directives/print";

@Component({
  standalone: true,
  imports: [ButtonComponent, PrintDirective],
  template: `
    <button tedi-button tediPrint="show">Printed</button>
    <button tedi-button tediPrint breakInside="avoid">Break only</button>
    <button tedi-button [tediPrint]="visibility()">Toggled</button>
  `,
})
class PrintOverrideHost {
  visibility = input<PrintVisibility | "">("hide");
}

describe("ButtonComponent", () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let buttonElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ButtonComponent, IconComponent],
    });

    fixture = TestBed.createComponent(ButtonComponent);
    buttonElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should apply default classes", () => {
    expect(buttonElement.classList).toContain("tedi-button");
    expect(buttonElement.classList).toContain("tedi-button--primary");
    expect(buttonElement.classList).toContain("tedi-button--default");
  });

  it("should apply correct variants", () => {
    const variants: ButtonVariant[] = [
      "primary",
      "secondary",
      "neutral",
      "success",
      "danger",
      "danger-neutral",
      "primary-inverted",
      "secondary-inverted",
      "neutral-inverted",
      "primary-button-group",
      "secondary-button-group",
    ];

    for (const variant of variants) {
      fixture.componentRef.setInput("variant", variant);
      fixture.detectChanges();

      expect(buttonElement.classList).toContain(`tedi-button--${variant}`);
    }
  });

  it("should apply correct sizes", () => {
    const sizes: ButtonSize[] = ["default", "small"];

    for (const size of sizes) {
      fixture.componentRef.setInput("size", size);
      fixture.detectChanges();

      expect(buttonElement.classList).toContain(`tedi-button--${size}`);
    }
  });

  it("should not contain 'undefined' in class list", () => {
    expect(buttonElement.classList).not.toContain("undefined");
  });

  it("should hide the button when printing", () => {
    expect(buttonElement.classList).toContain("no-print");
  });

  it("should keep show-print when the consumer opts back into printing", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PrintOverrideHost],
    });

    const hostFixture = TestBed.createComponent(PrintOverrideHost);
    hostFixture.detectChanges();

    const button = hostFixture.debugElement.queryAll(
      By.directive(ButtonComponent),
    )[0].nativeElement as HTMLElement;

    expect(button.classList).toContain("tedi-button");
    expect(button.classList).toContain("no-print");
    expect(button.classList).toContain("show-print");
  });

  it("should keep the button hidden when only break inputs are set", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PrintOverrideHost],
    });

    const hostFixture = TestBed.createComponent(PrintOverrideHost);
    hostFixture.detectChanges();

    const button = hostFixture.debugElement.queryAll(
      By.directive(ButtonComponent),
    )[1].nativeElement as HTMLElement;

    expect(button.classList).toContain("no-print");
    expect(button.classList).toContain("break-inside-avoid");
    expect(button.classList).not.toContain("show-print");
  });

  it("should keep the button's own no-print when tediPrint is cleared", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PrintOverrideHost],
    });

    const hostFixture = TestBed.createComponent(PrintOverrideHost);
    hostFixture.detectChanges();

    const button = hostFixture.debugElement.queryAll(
      By.directive(ButtonComponent),
    )[2].nativeElement as HTMLElement;

    expect(button.classList).toContain("no-print");

    hostFixture.componentRef.setInput("visibility", "");
    hostFixture.detectChanges();

    expect(button.classList).toContain("no-print");
  });
});
