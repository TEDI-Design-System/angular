import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { HeaderBottomComponent } from "./header-bottom.component";

describe("HeaderBottomComponent", () => {
  let fixture: ComponentFixture<HeaderBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderBottomComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderBottomComponent);
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should apply the host class", () => {
    expect(fixture.nativeElement.classList).toContain("tedi-header-bottom");
  });

  it("should project children content", () => {
    @Component({
      standalone: true,
      imports: [HeaderBottomComponent],
      template: `
        <tedi-header-bottom>
          <span data-testid="projected">hello</span>
        </tedi-header-bottom>
      `,
    })
    class HostComponent {}

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    const projected = hostFixture.nativeElement.querySelector(
      "[data-testid='projected']",
    );
    expect(projected).toBeTruthy();
    expect(projected.textContent).toBe("hello");
  });
});
