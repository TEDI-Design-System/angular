import { Component, signal } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { SkeletonComponent } from "./skeleton.component";
import { SkeletonBlockComponent } from "./skeleton-block/skeleton-block.component";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

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
  imports: [SkeletonComponent, SkeletonBlockComponent],
  template: `
    @if (visible()) {
      <tedi-skeleton [labelDelay]="labelDelay()">
        <tedi-skeleton-block height="h1" />
      </tedi-skeleton>
    }
  `,
})
class TestHostComponent {
  visible = signal(true);
  labelDelay = signal(200);
}

describe("SkeletonComponent", () => {
  let announce: jest.Mock;

  beforeEach(() => {
    announce = jest.fn();

    TestBed.configureTestingModule({
      imports: [SkeletonComponent, TestHostComponent],
      providers: [
        { provide: LiveAnnouncer, useValue: { announce } },
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });
  });

  const createSkeleton = (inputs: Record<string, unknown> = {}) => {
    const fixture: ComponentFixture<SkeletonComponent> =
      TestBed.createComponent(SkeletonComponent);

    Object.entries(inputs).forEach(([name, value]) =>
      fixture.componentRef.setInput(name, value),
    );
    fixture.detectChanges();

    return fixture;
  };

  const liveRegion = (fixture: ComponentFixture<unknown>) =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      "[role='status']",
    );

  it("should create", () => {
    expect(createSkeleton().componentInstance).toBeTruthy();
  });

  it("marks the host as busy so assistive technology skips the placeholder", () => {
    const host = createSkeleton().nativeElement as HTMLElement;

    expect(host.classList).toContain("tedi-skeleton");
    expect(host.getAttribute("aria-busy")).toBe("true");
  });

  it("renders an empty polite status region up front, before it has text", () => {
    const region = liveRegion(createSkeleton());

    expect(region).toBeTruthy();
    expect(region?.getAttribute("aria-live")).toBe("polite");
    expect(region?.getAttribute("aria-atomic")).toBe("true");
    expect(region?.classList).toContain("sr-only");
    expect(region?.textContent?.trim()).toBe("");
  });

  it("projects its content", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector("tedi-skeleton-block"),
    ).toBeTruthy();
  });

  describe("announcements", () => {
    it("puts the default label in the status region once the delay has passed", fakeAsync(() => {
      const fixture = createSkeleton();

      tick(200);
      fixture.detectChanges();

      expect(liveRegion(fixture)?.textContent?.trim()).toBe("skeleton.loading");
    }));

    it("uses a custom label instead of the default", fakeAsync(() => {
      const fixture = createSkeleton({ label: "Loading search results" });

      tick(200);
      fixture.detectChanges();

      expect(liveRegion(fixture)?.textContent?.trim()).toBe(
        "Loading search results",
      );
    }));

    it("waits for a custom labelDelay", fakeAsync(() => {
      const fixture = createSkeleton({ labelDelay: 1000 });

      tick(200);
      fixture.detectChanges();
      expect(liveRegion(fixture)?.textContent?.trim()).toBe("");

      tick(800);
      fixture.detectChanges();
      expect(liveRegion(fixture)?.textContent?.trim()).toBe("skeleton.loading");
    }));
  });

  describe("completion", () => {
    it("announces completion when the skeleton is removed after loading was announced", fakeAsync(() => {
      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      tick(200);
      fixture.detectChanges();

      fixture.componentInstance.visible.set(false);
      fixture.detectChanges();

      expect(announce).toHaveBeenCalledWith("skeleton.loading-completed");
    }));

    it("stays silent when the content loads faster than the delay", fakeAsync(() => {
      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      tick(100);

      fixture.componentInstance.visible.set(false);
      fixture.detectChanges();
      tick(200);

      expect(announce).not.toHaveBeenCalled();
    }));

    it("announces a custom completedLabel", fakeAsync(() => {
      const fixture = createSkeleton({ completedLabel: "Results loaded" });
      tick(200);
      fixture.detectChanges();

      fixture.destroy();

      expect(announce).toHaveBeenCalledWith("Results loaded");
    }));
  });
});
