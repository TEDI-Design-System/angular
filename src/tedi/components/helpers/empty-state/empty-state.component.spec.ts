import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import {
  EmptyStateComponent,
  EmptyStateSize,
  EmptyStateType,
} from "./empty-state.component";

function setup<T>(host: new () => T) {
  TestBed.configureTestingModule({ imports: [host as never] });
  const fixture = TestBed.createComponent(host as never);
  fixture.detectChanges();
  return fixture;
}

describe("EmptyStateComponent", () => {
  @Component({
    standalone: true,
    imports: [EmptyStateComponent],
    template: `<tedi-empty-state>Nothing to see here</tedi-empty-state>`,
  })
  class DefaultHostComponent {}

  it("renders the description passed as projected content", () => {
    const fixture = setup(DefaultHostComponent);
    expect(fixture.nativeElement.textContent).toContain("Nothing to see here");
  });

  it("renders the default spa icon when no icon input is provided", () => {
    const fixture = setup(DefaultHostComponent);
    const icon = fixture.nativeElement.querySelector("tedi-icon");
    expect(icon?.classList.toString()).toContain("material-symbols");
    // Default name "spa" rendered as the icon's text content
    expect(icon?.textContent?.trim()).toBe("spa");
  });

  @Component({
    standalone: true,
    imports: [EmptyStateComponent],
    template: `<tedi-empty-state icon="event_busy">Empty</tedi-empty-state>`,
  })
  class CustomIconHostComponent {}

  it("renders the icon named by the icon input", () => {
    const fixture = setup(CustomIconHostComponent);
    const icon = fixture.nativeElement.querySelector("tedi-icon");
    expect(icon?.textContent?.trim()).toBe("event_busy");
  });

  @Component({
    standalone: true,
    imports: [EmptyStateComponent],
    template: `<tedi-empty-state [icon]="null">Empty</tedi-empty-state>`,
  })
  class NoIconHostComponent {}

  it("hides the icon when icon is null", () => {
    const fixture = setup(NoIconHostComponent);
    expect(fixture.nativeElement.querySelector("tedi-icon")).toBeNull();
  });

  @Component({
    standalone: true,
    imports: [EmptyStateComponent],
    template: `<tedi-empty-state heading="Choose new time"
      >Empty</tedi-empty-state
    >`,
  })
  class HeadingHostComponent {}

  it("renders the heading as an h3", () => {
    const fixture = setup(HeadingHostComponent);
    const heading = fixture.nativeElement.querySelector("h3");
    expect(heading?.textContent?.trim()).toBe("Choose new time");
    expect(heading?.className).toContain("tedi-text--brand");
  });

  @Component({
    standalone: true,
    imports: [EmptyStateComponent],
    template: `
      <tedi-empty-state>
        Empty
        <button type="button" tedi-empty-state-actions>Create new</button>
      </tedi-empty-state>
    `,
  })
  class ActionsHostComponent {}

  it("projects the actions slot", () => {
    const fixture = setup(ActionsHostComponent);
    const actions = fixture.nativeElement.querySelector(
      ".tedi-empty-state__actions",
    );
    expect(actions?.textContent).toContain("Create new");
  });

  it("applies the separate type class by default", () => {
    const fixture = setup(DefaultHostComponent);
    const root = fixture.debugElement.query(By.css("tedi-empty-state"));
    expect(root.nativeElement.className).toContain(
      "tedi-empty-state--separate",
    );
  });

  (
    [
      ["separate", "tedi-empty-state--separate"],
      ["attached", "tedi-empty-state--attached"],
      ["inside", "tedi-empty-state--inside"],
    ] as const
  ).forEach(([type, fragment]) => {
    @Component({
      standalone: true,
      imports: [EmptyStateComponent],
      template: `<tedi-empty-state [type]="type">Empty</tedi-empty-state>`,
    })
    class TypeHostComponent {
      type: EmptyStateType = type;
    }
    it(`applies the ${type} type class`, () => {
      const fixture = setup(TypeHostComponent);
      const root = fixture.debugElement.query(By.css("tedi-empty-state"));
      expect(root.nativeElement.className).toContain(fragment);
    });
  });

  (
    [
      ["default", "tedi-empty-state--default"],
      ["small", "tedi-empty-state--small"],
    ] as const
  ).forEach(([size, fragment]) => {
    @Component({
      standalone: true,
      imports: [EmptyStateComponent],
      template: `<tedi-empty-state [size]="size">Empty</tedi-empty-state>`,
    })
    class SizeHostComponent {
      size: EmptyStateSize = size;
    }
    it(`applies the ${size} size class`, () => {
      const fixture = setup(SizeHostComponent);
      const root = fixture.debugElement.query(By.css("tedi-empty-state"));
      expect(root.nativeElement.className).toContain(fragment);
    });
  });
});
