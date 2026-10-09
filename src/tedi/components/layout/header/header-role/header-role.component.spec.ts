import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component, NO_ERRORS_SCHEMA, signal } from "@angular/core";
import {
  HeaderRoleComponent,
  HeaderRoleContentDirective,
  HeaderRoleNoResultsDirective,
  Representative,
} from "./header-role.component";
import { HeaderRoleTitleDirective } from "./header-role-title.directive";
import { HeaderProfileComponent } from "../header-profile/header-profile.component";
import { BreakpointService } from "../../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

function createMobileBreakpointMock(): Partial<BreakpointService> {
  const isBelowSignal = signal(true);
  const isAboveSignal = signal(false);
  return {
    isBelowBreakpoint: () => isBelowSignal,
    isAboveBreakpoint: () => isAboveSignal,
    getBreakpointInputs: <T>(inputs: T) => inputs,
  };
}

function createDesktopBreakpointMock(): Partial<BreakpointService> {
  const isBelowSignal = signal(false);
  const isAboveSignal = signal(true);
  return {
    isBelowBreakpoint: () => isBelowSignal,
    isAboveBreakpoint: () => isAboveSignal,
    getBreakpointInputs: <T>(inputs: T) => inputs,
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
    fixture.componentRef.setInput("showSearch", true);
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

  it("should set inputValue on handleInputChange()", () => {
    const comp = fixture.componentInstance;
    comp.handleInputChange("foo");
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
          [showSearch]="true"
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

  it("focuses the search input when the popover opens with showSearch=true", () => {
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
          searchInput: () => { focus: () => void } | undefined;
        }
      ).searchInput();
      expect(searchInput).toBeDefined();
      const focusSpy = jest.spyOn(searchInput!, "focus");

      popover!.isOpen.set(true);
      fixture.detectChanges();

      jest.runOnlyPendingTimers();
      expect(focusSpy).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe("HeaderRoleComponent reset on parent profile close", () => {
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
    profile: HeaderProfileComponent;
    role: HeaderRoleComponent;
  } {
    @Component({
      standalone: true,
      imports: [HeaderProfileComponent, HeaderRoleComponent],
      template: `
        <tedi-header-profile>
          <tedi-header-role
            label="Roll:"
            [showSearch]="true"
            [representatives]="reps"
            [currentRepresentative]="reps[0]"
          />
        </tedi-header-profile>
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
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const profileEl = fixture.debugElement.query(
      (de) => de.componentInstance instanceof HeaderProfileComponent,
    );
    const profile = profileEl.componentInstance as HeaderProfileComponent;

    profile.modalOpen.set(true);
    fixture.detectChanges();

    const roleEl = fixture.debugElement.query(
      (de) => de.componentInstance instanceof HeaderRoleComponent,
    );
    return {
      fixture,
      profile,
      role: roleEl.componentInstance as HeaderRoleComponent,
    };
  }

  it("collapses mobileOpen and clears inputValue when the parent profile modal closes", () => {
    const { fixture, profile, role } = setup();

    role.mobileOpen.set(true);
    role.inputValue.set("alice");
    fixture.detectChanges();

    expect(role.mobileOpen()).toBe(true);
    expect(role.inputValue()).toBe("alice");

    // Close profile → role state should reset.
    profile.modalOpen.set(false);
    fixture.detectChanges();

    expect(role.mobileOpen()).toBe(false);
    expect(role.inputValue()).toBe("");
  });

  it("does nothing when HeaderRole is rendered outside any HeaderProfile", () => {
    TestBed.configureTestingModule({
      imports: [HeaderRoleComponent],
      providers: [
        { provide: TediTranslationService, useValue: mockTranslationService },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(HeaderRoleComponent);
    fixture.componentRef.setInput("label", "Roll:");
    fixture.componentRef.setInput("representatives", reps);
    fixture.componentRef.setInput("currentRepresentative", reps[0]);
    fixture.detectChanges();

    fixture.componentInstance.mobileOpen.set(true);
    fixture.componentInstance.inputValue.set("alice");
    fixture.detectChanges();

    expect(fixture.componentInstance.mobileOpen()).toBe(true);
    expect(fixture.componentInstance.inputValue()).toBe("alice");
  });
});

describe("HeaderRoleComponent custom content directives", () => {
  const mockTranslationService = {
    translate: (key: string) => key,
    track: (key: string) => () => key,
  } as Partial<TediTranslationService>;
  const reps: Representative[] = [
    { id: "1", name: "Alice", description: "Lead" },
    { id: "2", name: "Bob", description: "Dev" },
  ];

  it("should expose templateRef via HeaderRoleContentDirective", () => {
    @Component({
      standalone: true,
      imports: [HeaderRoleComponent, HeaderRoleContentDirective],
      template: `
        <tedi-header-role
          label="Roll:"
          [representatives]="reps"
          [currentRepresentative]="reps[0]"
        >
          <ng-template tedi-header-role-content>
            <div data-testid="custom-content">Custom role content</div>
          </ng-template>
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

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const roleEl = fixture.debugElement.query(
      (de) => de.componentInstance instanceof HeaderRoleComponent,
    );
    const roleComp = roleEl.componentInstance as HeaderRoleComponent;

    expect(
      (
        roleComp as unknown as { hasCustomContent: () => boolean }
      ).hasCustomContent(),
    ).toBe(true);
    expect(
      (
        roleComp as unknown as { customContentTemplate: () => unknown }
      ).customContentTemplate(),
    ).toBeTruthy();
  });

  it("should expose templateRef via HeaderRoleNoResultsDirective", () => {
    @Component({
      standalone: true,
      imports: [HeaderRoleComponent, HeaderRoleNoResultsDirective],
      template: `
        <tedi-header-role
          label="Roll:"
          [representatives]="reps"
          [currentRepresentative]="reps[0]"
        >
          <ng-template tedi-header-role-no-results>
            <div data-testid="no-results">No matches found</div>
          </ng-template>
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

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const roleEl = fixture.debugElement.query(
      (de) => de.componentInstance instanceof HeaderRoleComponent,
    );
    const roleComp = roleEl.componentInstance as HeaderRoleComponent;

    expect(
      (
        roleComp as unknown as { hasNoResultsContent: () => boolean }
      ).hasNoResultsContent(),
    ).toBe(true);
    expect(
      (
        roleComp as unknown as { noResultsTemplate: () => unknown }
      ).noResultsTemplate(),
    ).toBeTruthy();
  });
});

describe("HeaderRoleComponent mutual exclusion and activeRole", () => {
  const mockTranslationService = {
    translate: (key: string) => key,
    track: (key: string) => () => key,
  } as Partial<TediTranslationService>;
  const repsA: Representative[] = [
    { id: "1", name: "Alice", description: "Lead" },
    { id: "2", name: "Bob", description: "Dev" },
  ];
  const repsB: Representative[] = [
    { id: "3", name: "Charlie", description: "QA" },
    { id: "4", name: "Dana", description: "PM" },
  ];

  function setup(): {
    fixture: ComponentFixture<unknown>;
    profile: HeaderProfileComponent;
    roleA: HeaderRoleComponent;
    roleB: HeaderRoleComponent;
  } {
    @Component({
      standalone: true,
      imports: [HeaderProfileComponent, HeaderRoleComponent],
      template: `
        <tedi-header-profile>
          <tedi-header-role
            label="Role A"
            [showSearch]="true"
            [representatives]="repsA"
            [currentRepresentative]="repsA[0]"
          />
          <tedi-header-role
            label="Role B"
            [showSearch]="true"
            [representatives]="repsB"
            [currentRepresentative]="repsB[0]"
          />
        </tedi-header-profile>
      `,
    })
    class HostComponent {
      repsA = repsA;
      repsB = repsB;
    }

    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: TediTranslationService, useValue: mockTranslationService },
        { provide: BreakpointService, useValue: createMobileBreakpointMock() },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const profileEl = fixture.debugElement.query(
      (de) => de.componentInstance instanceof HeaderProfileComponent,
    );
    const profile = profileEl.componentInstance as HeaderProfileComponent;

    profile.modalOpen.set(true);
    fixture.detectChanges();

    const roleEls = fixture.debugElement.queryAll(
      By.directive(HeaderRoleComponent),
    );

    return {
      fixture,
      profile,
      roleA: roleEls[0].componentInstance as HeaderRoleComponent,
      roleB: roleEls[1].componentInstance as HeaderRoleComponent,
    };
  }

  it("sets parentProfile.activeRole to self when handleMobileOpen opens", () => {
    const { fixture, profile, roleA } = setup();

    roleA.handleMobileOpen();
    fixture.detectChanges();

    expect(roleA.mobileOpen()).toBe(true);
    expect(profile.activeRole()).toBe(roleA);
  });

  it("closes the first role and clears its input when the second role opens", () => {
    const { fixture, profile, roleA, roleB } = setup();

    roleA.mobileOpen.set(true);
    profile.activeRole.set(roleA);
    roleA.inputValue.set("alice");
    fixture.detectChanges();

    expect(roleA.mobileOpen()).toBe(true);
    expect(roleA.inputValue()).toBe("alice");

    roleA.closeIfOtherRoleActive(roleB, true);

    expect(roleA.mobileOpen()).toBe(false);
    expect(roleA.inputValue()).toBe("");
  });

  it("does not close the role when the active role is self", () => {
    const { fixture, profile, roleA } = setup();

    roleA.mobileOpen.set(true);
    profile.activeRole.set(roleA);
    roleA.inputValue.set("alice");
    fixture.detectChanges();

    roleA.closeIfOtherRoleActive(roleA, true);

    expect(roleA.mobileOpen()).toBe(true);
    expect(roleA.inputValue()).toBe("alice");
  });

  it("does not close the role when active role is null", () => {
    const { fixture, roleA } = setup();

    roleA.mobileOpen.set(true);
    roleA.inputValue.set("alice");
    fixture.detectChanges();

    roleA.closeIfOtherRoleActive(null, true);

    expect(roleA.mobileOpen()).toBe(true);
    expect(roleA.inputValue()).toBe("alice");
  });
});
