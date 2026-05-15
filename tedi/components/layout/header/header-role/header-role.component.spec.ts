import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, NO_ERRORS_SCHEMA, signal } from "@angular/core";
import { HeaderRoleComponent, Representative } from "./header-role.component";
import { HeaderRoleTitleDirective } from "./header-role-title.directive";
import { BreakpointService } from "../../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../../services/translation/translation.service";

function createMobileBreakpointMock(): Partial<BreakpointService> {
  const isBelowSignal = signal(true);
  const isAboveSignal = signal(false);
  return {
    isBelowBreakpoint: () => isBelowSignal,
    isAboveBreakpoint: () => isAboveSignal,
  };
}

function createDesktopBreakpointMock(): Partial<BreakpointService> {
  const isBelowSignal = signal(false);
  const isAboveSignal = signal(true);
  return {
    isBelowBreakpoint: () => isBelowSignal,
    isAboveBreakpoint: () => isAboveSignal,
  };
}

describe("HeaderRoleComponent", () => {
  let fixture: ComponentFixture<HeaderRoleComponent>;
  let hostElement: HTMLElement;
  const mockTranslationService = {
    track: (key: string) => () => key,
  } as Partial<TediTranslationService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HeaderRoleComponent],
      providers: [
        { provide: TediTranslationService, useValue: mockTranslationService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HeaderRoleComponent);
    hostElement = fixture.nativeElement;

    // Set required inputs
    fixture.componentRef.setInput("label", "Admin");
    fixture.componentRef.setInput("description", "Administrator Role");
    fixture.componentRef.setInput("showInput", true);
    const reps: Representative[] = [
      { id: "1", name: "Alice", description: "Team Lead" },
      { id: "2", name: "Bob", description: "Developer" },
    ];
    fixture.componentRef.setInput("representatives", reps);
    fixture.componentRef.setInput("currentRepresentative", reps[0]);

    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should apply the base class", () => {
    expect(hostElement.classList).toContain("tedi-header-role");
  });

  it("should have default mobileOpen state as false", () => {
    const comp = fixture.componentInstance;
    expect(comp.mobileOpen()).toBe(false);
  });

  it("should toggle mobileOpen on handleMobileOpen()", () => {
    const comp = fixture.componentInstance;
    comp.handleMobileOpen();
    expect(comp.mobileOpen()).toBe(true);
    comp.handleMobileOpen();
    expect(comp.mobileOpen()).toBe(false);
  });

  it("should update collapseText based on mobileOpen", () => {
    const comp = fixture.componentInstance;
    // mobileOpen false => collapseText equals switchRoleText
    expect(comp.collapseText()).toBe(comp.switchRoleText());
    comp.handleMobileOpen();
    // mobileOpen true => collapseText equals closeText
    expect(comp.collapseText()).toBe(comp.closeText());
  });

  it("should filter representatives based on inputValue", () => {
    const comp = fixture.componentInstance;
    const allReps: Representative[] = [
      { id: "1", name: "Alice", description: "Lead" },
      { id: "2", name: "Bob", description: "Developer" },
    ];
    // update representatives
    fixture.componentRef.setInput("representatives", allReps);
    // no filter => all returned
    expect(comp.filteredRepresentatives()).toEqual(allReps);

    // set filter to match first representative
    comp.inputValue.set("alice");
    expect(comp.filteredRepresentatives()).toEqual([allReps[0]]);

    // set filter with no matches
    comp.inputValue.set("xyz");
    expect(comp.filteredRepresentatives()).toEqual([]);
  });

  it("should set currentRepresentative on handleSelectRepresentative()", () => {
    const comp = fixture.componentInstance;
    const newRep: Representative = {
      id: "3",
      name: "Charlie",
      description: "Tester",
    };
    comp.handleSelectRepresentative(newRep);
    expect(comp.currentRepresentative()).toBe(newRep);
  });

  it("should set inputValue from the event target on handleInputChange()", () => {
    const comp = fixture.componentInstance;
    const event = { target: { value: "foo" } } as unknown as Event;
    comp.handleInputChange(event);
    expect(comp.inputValue()).toBe("foo");
  });

  it("should emit roleSelectionToggle with the new state on handleMobileOpen()", () => {
    const comp = fixture.componentInstance;
    const emitted: boolean[] = [];
    comp.roleSelectionToggle.subscribe((v) => emitted.push(v));
    comp.handleMobileOpen();
    expect(emitted).toEqual([true]);
    comp.handleMobileOpen();
    expect(emitted).toEqual([true, false]);
  });

  describe("resolveIcon", () => {
    type ResolveIconFn = (
      icon: string | { name: string; size?: number } | undefined,
    ) => { name: string; size: number } | null;

    let resolveIcon: ResolveIconFn;

    beforeEach(() => {
      resolveIcon = (
        fixture.componentInstance as unknown as {
          resolveIcon: ResolveIconFn;
        }
      ).resolveIcon.bind(fixture.componentInstance);
    });

    it("returns null when no icon is provided", () => {
      expect(resolveIcon(undefined)).toBeNull();
      expect(resolveIcon("")).toBeNull();
    });

    it("wraps a bare string into the default-size object form", () => {
      expect(resolveIcon("person")).toEqual({ name: "person", size: 24 });
    });

    it("passes through an icon object, defaulting size when omitted", () => {
      expect(resolveIcon({ name: "star", size: 16 })).toEqual({
        name: "star",
        size: 16,
      });
      expect(resolveIcon({ name: "star" })).toEqual({
        name: "star",
        size: 24,
      });
    });
  });
});

describe("HeaderRoleComponent title projection", () => {
  const mockTranslationService = {
    track: (key: string) => () => key,
  } as Partial<TediTranslationService>;
  const reps: Representative[] = [
    { id: "1", name: "Alice", description: "Lead" },
  ];

  it("should report hasTitle as false when no [tedi-header-role-title] is projected", () => {
    @Component({
      standalone: true,
      imports: [HeaderRoleComponent],
      template: `
        <tedi-header-role
          label="Roll:"
          [representatives]="reps"
          [currentRepresentative]="reps[0]"
        ></tedi-header-role>
      `,
    })
    class HostComponent {
      reps = reps;
    }

    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: TediTranslationService, useValue: mockTranslationService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    const roleEl = hostFixture.debugElement.query(
      (de) => de.componentInstance instanceof HeaderRoleComponent,
    );
    const roleComp = roleEl.componentInstance as HeaderRoleComponent;

    expect(
      (roleComp as unknown as { hasTitle: () => boolean }).hasTitle(),
    ).toBe(false);
  });

  it("should report hasTitle as true when [tedi-header-role-title] is projected", () => {
    @Component({
      standalone: true,
      imports: [HeaderRoleComponent, HeaderRoleTitleDirective],
      template: `
        <tedi-header-role
          [representatives]="reps"
          [currentRepresentative]="reps[0]"
        >
          <span tedi-header-role-title data-testid="projected-title"
            >Esindatav</span
          >
        </tedi-header-role>
      `,
    })
    class HostComponent {
      reps = reps;
    }

    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: TediTranslationService, useValue: mockTranslationService },
        { provide: BreakpointService, useValue: createMobileBreakpointMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    const roleEl = hostFixture.debugElement.query(
      (de) => de.componentInstance instanceof HeaderRoleComponent,
    );
    const roleComp = roleEl.componentInstance as HeaderRoleComponent;

    expect(
      (roleComp as unknown as { hasTitle: () => boolean }).hasTitle(),
    ).toBe(true);

    const projected = hostFixture.nativeElement.querySelector(
      "[data-testid='projected-title']",
    );
    expect(projected).toBeTruthy();
    expect(projected?.textContent?.trim()).toBe("Esindatav");
  });

  it("should render the label fallback when no title is projected", () => {
    @Component({
      standalone: true,
      imports: [HeaderRoleComponent],
      template: `
        <tedi-header-role
          label="Roll:"
          [representatives]="reps"
          [currentRepresentative]="reps[0]"
        ></tedi-header-role>
      `,
    })
    class HostComponent {
      reps = reps;
    }

    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: TediTranslationService, useValue: mockTranslationService },
        { provide: BreakpointService, useValue: createMobileBreakpointMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    expect((hostFixture.nativeElement as HTMLElement).textContent).toContain(
      "Roll:",
    );
  });
});

describe("HeaderRoleComponent desktop popover effects", () => {
  const mockTranslationService = {
    translate: (key: string) => key,
    track: (key: string) => () => key,
  } as Partial<TediTranslationService>;
  const reps: Representative[] = [
    { id: "1", name: "Alice", description: "Lead" },
    { id: "2", name: "Bob", description: "Dev" },
  ];

  function setup(): {
    fixture: ComponentFixture<unknown>;
    headerRole: HeaderRoleComponent;
  } {
    @Component({
      standalone: true,
      imports: [HeaderRoleComponent],
      template: `
        <tedi-header-role
          label="Roll:"
          [showInput]="true"
          [representatives]="reps"
          [currentRepresentative]="reps[0]"
        ></tedi-header-role>
      `,
    })
    class HostComponent {
      reps = reps;
    }

    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: TediTranslationService, useValue: mockTranslationService },
        { provide: BreakpointService, useValue: createDesktopBreakpointMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const roleEl = fixture.debugElement.query(
      (de) => de.componentInstance instanceof HeaderRoleComponent,
    );
    return {
      fixture,
      headerRole: roleEl.componentInstance as HeaderRoleComponent,
    };
  }

  it("emits roleSelectionToggle when the popover opens/closes", () => {
    const { fixture, headerRole } = setup();

    const emitted: boolean[] = [];
    headerRole.roleSelectionToggle.subscribe((v) => emitted.push(v));

    const popover = (
      headerRole as unknown as {
        popover: () => { isOpen: { set: (v: boolean) => void } } | undefined;
      }
    ).popover();
    expect(popover).toBeDefined();

    popover!.isOpen.set(true);
    fixture.detectChanges();
    expect(emitted).toEqual([true]);

    popover!.isOpen.set(false);
    fixture.detectChanges();
    expect(emitted).toEqual([true, false]);
  });

  it("focuses the search input when the popover opens with showInput=true", () => {
    jest.useFakeTimers();
    try {
      const { fixture, headerRole } = setup();

      const popover = (
        headerRole as unknown as {
          popover: () => { isOpen: { set: (v: boolean) => void } } | undefined;
        }
      ).popover();
      const searchInput = (
        headerRole as unknown as {
          searchInput: () => { nativeElement: HTMLInputElement } | undefined;
        }
      ).searchInput();
      expect(searchInput).toBeDefined();
      const focusSpy = jest.spyOn(searchInput!.nativeElement, "focus");

      popover!.isOpen.set(true);
      fixture.detectChanges();

      jest.runOnlyPendingTimers();
      expect(focusSpy).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
