import { Component, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TimelineComponent } from "./timeline.component";
import { TimelineItemComponent } from "./timeline-item/timeline-item.component";
import { TimelineTitleComponent } from "./timeline-title/timeline-title.component";
import { TimelineDescriptionComponent } from "./timeline-description/timeline-description.component";
import { TimelineTimingsBottomDirective } from "./timeline-timings-bottom.directive";

@Component({
  standalone: true,
  imports: [TimelineComponent, TimelineItemComponent],
  template: `
    <tedi-timeline [activeIndex]="activeIndex">
      <tedi-timeline-item />
    </tedi-timeline>
  `,
})
class SingleTimelineItemHostComponent {
  @ViewChild(TimelineItemComponent, { static: true })
  item!: TimelineItemComponent;

  activeIndex = 0;
}

@Component({
  standalone: true,
  imports: [TimelineComponent, TimelineItemComponent],
  template: `
    <tedi-timeline>
      <tedi-timeline-item />
      <tedi-timeline-item />
    </tedi-timeline>
  `,
})
class MultipleTimelineItemsHostComponent {
  @ViewChildren(TimelineItemComponent)
  items!: QueryList<TimelineItemComponent>;
}

@Component({
  standalone: true,
  imports: [
    TimelineComponent,
    TimelineItemComponent,
    TimelineTimingsBottomDirective,
  ],
  template: `
    <tedi-timeline>
      <tedi-timeline-item [timings]="['2024']">
        <span *tediTimelineTimingsBottom class="bottom">Muudetud</span>
        Content
      </tedi-timeline-item>
    </tedi-timeline>
  `,
})
class TimingsBottomHostComponent {}

describe("Timeline Components", () => {
  let fixture: ComponentFixture<TimelineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TimelineComponent,
        TimelineItemComponent,
        TimelineTitleComponent,
        TimelineDescriptionComponent,
      ],
    });

    fixture = TestBed.createComponent(TimelineComponent);
    fixture.detectChanges();
  });

  it("should create TimelineComponent", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should project timings-bottom content into the timings column", () => {
    const hostFixture = TestBed.createComponent(TimingsBottomHostComponent);
    hostFixture.detectChanges();
    const bottom = hostFixture.nativeElement.querySelector(
      ".tedi-timeline__timings .bottom",
    );
    expect(bottom?.textContent).toContain("Muudetud");
  });

  it("should set card padding variable", () => {
    fixture.componentRef.setInput("variant", "card");
    fixture.componentRef.setInput("cardPadding", 0.75);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.style.getPropertyValue("--_timeline-card-padding"),
    ).toBe("0.75rem");
  });

  it("should apply card variant class", () => {
    expect(fixture.nativeElement.classList).not.toContain(
      "tedi-timeline--card",
    );
    fixture.componentRef.setInput("variant", "card");
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain("tedi-timeline--card");
  });

  it("should allow registering and unregistering items", () => {
    const timeline = fixture.componentInstance;
    const item = TestBed.createComponent(
      TimelineItemComponent,
    ).componentInstance;

    expect(timeline.items().length).toBe(0);
    timeline.registerItem(item);
    expect(timeline.items().length).toBe(1);

    timeline.unregisterItem(item);
    expect(timeline.items().length).toBe(0);
  });

  it("should set activeIndex input", () => {
    fixture.componentRef.setInput("activeIndex", 1);
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
  });
});

describe("TimelineItemComponent", () => {
  let fixture: ComponentFixture<TimelineItemComponent>;
  let component: TimelineItemComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TimelineItemComponent,
        TimelineComponent,
        SingleTimelineItemHostComponent,
        MultipleTimelineItemsHostComponent,
      ],
    });

    fixture = TestBed.createComponent(TimelineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should default to future state if no timeline is injected", () => {
    expect(component.state()).toBe("future");
  });

  it("should compute state as current when activeIndex matches", () => {
    const hostFixture = TestBed.createComponent(
      SingleTimelineItemHostComponent,
    );
    hostFixture.detectChanges();
    expect(hostFixture.componentInstance.item.state()).toBe("current");
  });

  it("should compute state as past when activeIndex is greater", () => {
    const hostFixture = TestBed.createComponent(
      SingleTimelineItemHostComponent,
    );
    hostFixture.componentInstance.activeIndex = 1;
    hostFixture.detectChanges();
    expect(hostFixture.componentInstance.item.state()).toBe("past");
  });

  it("should mark as last item correctly", () => {
    const hostFixture = TestBed.createComponent(
      MultipleTimelineItemsHostComponent,
    );
    hostFixture.detectChanges();
    const items = hostFixture.componentInstance.items.toArray();
    expect(items[1].isLast()).toBe(true);
    expect(items[0].isLast()).toBe(false);
  });
});

describe("TimelineTitleComponent", () => {
  let fixture: ComponentFixture<TimelineTitleComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TimelineTitleComponent],
    });

    fixture = TestBed.createComponent(TimelineTitleComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render content", () => {
    element.innerHTML = "My Title";
    fixture.detectChanges();
    expect(element.textContent).toContain("My Title");
  });
});

describe("TimelineDescriptionComponent", () => {
  let fixture: ComponentFixture<TimelineDescriptionComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TimelineDescriptionComponent],
    });

    fixture = TestBed.createComponent(TimelineDescriptionComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render content", () => {
    element.innerHTML = "My Description";
    fixture.detectChanges();
    expect(element.textContent).toContain("My Description");
  });
});
