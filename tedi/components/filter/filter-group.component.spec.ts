import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { FilterGroupComponent } from "./filter-group.component";
import { FilterComponent } from "./filter.component";

@Component({
  standalone: true,
  imports: [FilterGroupComponent, FilterComponent, ReactiveFormsModule],
  template: `
    <tedi-filter-group label="Status" [formControl]="control">
      <tedi-filter text="All" value="all" />
      <tedi-filter text="Active" value="active" />
      <tedi-filter text="Done" value="done" />
    </tedi-filter-group>
  `,
})
class SingleSelectGroupHostComponent {
  control = new FormControl<string | null>(null);
}

@Component({
  standalone: true,
  imports: [FilterGroupComponent, FilterComponent, ReactiveFormsModule],
  template: `
    <tedi-filter-group
      label="Tags"
      [multiselect]="true"
      [formControl]="control"
    >
      <tedi-filter text="Urgent" value="urgent" />
      <tedi-filter text="Review" value="review" />
      <tedi-filter text="Draft" value="draft" />
    </tedi-filter-group>
  `,
})
class MultiSelectGroupHostComponent {
  control = new FormControl<string[]>([]);
}

@Component({
  standalone: true,
  imports: [FilterGroupComponent, FilterComponent],
  template: `
    <tedi-filter-group>
      <tedi-filter text="Foo" [selected]="true" />
      <tedi-filter text="Bar" />
    </tedi-filter-group>
  `,
})
class UnmanagedGroupHostComponent {}

describe("FilterGroupComponent", () => {
  describe("single-select (radio-like)", () => {
    let fixture: ComponentFixture<SingleSelectGroupHostComponent>;
    let host: SingleSelectGroupHostComponent;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [SingleSelectGroupHostComponent],
      });
      fixture = TestBed.createComponent(SingleSelectGroupHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it("should create", () => {
      expect(host).toBeTruthy();
    });

    it("should have role=radiogroup", () => {
      const group = fixture.debugElement.query(
        By.directive(FilterGroupComponent),
      );
      expect(group.nativeElement.getAttribute("role")).toBe("radiogroup");
    });

    it("should have aria-label", () => {
      const group = fixture.debugElement.query(
        By.directive(FilterGroupComponent),
      );
      expect(group.nativeElement.getAttribute("aria-label")).toBe("Status");
    });

    it("should set role=radio on child buttons", () => {
      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons.forEach((btn) => {
        expect(btn.nativeElement.getAttribute("role")).toBe("radio");
      });
    });

    it("should set aria-checked on child buttons", () => {
      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons.forEach((btn) => {
        expect(btn.nativeElement.getAttribute("aria-checked")).toBe("false");
      });
    });

    it("should update aria-checked on selection", () => {
      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons[1].nativeElement.click();
      fixture.detectChanges();

      expect(buttons[0].nativeElement.getAttribute("aria-checked")).toBe(
        "false",
      );
      expect(buttons[1].nativeElement.getAttribute("aria-checked")).toBe(
        "true",
      );
      expect(buttons[2].nativeElement.getAttribute("aria-checked")).toBe(
        "false",
      );
    });

    it("should not have aria-pressed on child buttons in radiogroup", () => {
      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons.forEach((btn) => {
        expect(btn.nativeElement.getAttribute("aria-pressed")).toBeNull();
      });
    });

    it("should select filter on click", () => {
      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons[1].nativeElement.click();
      fixture.detectChanges();

      expect(host.control.value).toBe("active");
    });

    it("should deselect others when selecting one", () => {
      host.control.setValue("all");
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons[1].nativeElement.click();
      fixture.detectChanges();

      expect(host.control.value).toBe("active");

      const filters = fixture.debugElement.queryAll(
        By.directive(FilterComponent),
      );
      expect(
        filters[0].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(false);
      expect(
        filters[1].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(true);
      expect(
        filters[2].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(false);
    });

    it("should deselect on re-click (toggle to null)", () => {
      host.control.setValue("active");
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons[1].nativeElement.click();
      fixture.detectChanges();

      expect(host.control.value).toBeNull();
    });

    it("should reflect initial FormControl value", () => {
      host.control.setValue("done");
      fixture.detectChanges();

      const filters = fixture.debugElement.queryAll(
        By.directive(FilterComponent),
      );
      expect(
        filters[2].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(true);
    });

    it("should mark form control as touched on click", () => {
      expect(host.control.touched).toBe(false);

      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons[0].nativeElement.click();
      fixture.detectChanges();

      expect(host.control.touched).toBe(true);
    });

    it("should mark form control as dirty on click", () => {
      expect(host.control.dirty).toBe(false);

      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons[0].nativeElement.click();
      fixture.detectChanges();

      expect(host.control.dirty).toBe(true);
    });

    it("should disable all filters when form control is disabled", () => {
      host.control.disable();
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons.forEach((btn) => {
        expect(btn.nativeElement.disabled).toBe(true);
      });
    });

    it("should update selection when form control value is set programmatically", () => {
      host.control.setValue("done");
      fixture.detectChanges();

      const filters = fixture.debugElement.queryAll(
        By.directive(FilterComponent),
      );
      expect(
        filters[0].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(false);
      expect(
        filters[1].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(false);
      expect(
        filters[2].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(true);

      host.control.setValue(null);
      fixture.detectChanges();

      filters.forEach((f) => {
        expect(
          f.nativeElement.classList.contains("tedi-filter--selected"),
        ).toBe(false);
      });
    });
  });

  describe("multi-select (checkbox-like)", () => {
    let fixture: ComponentFixture<MultiSelectGroupHostComponent>;
    let host: MultiSelectGroupHostComponent;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [MultiSelectGroupHostComponent],
      });
      fixture = TestBed.createComponent(MultiSelectGroupHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it("should have role=group", () => {
      const group = fixture.debugElement.query(
        By.directive(FilterGroupComponent),
      );
      expect(group.nativeElement.getAttribute("role")).toBe("group");
    });

    it("should have aria-label", () => {
      const group = fixture.debugElement.query(
        By.directive(FilterGroupComponent),
      );
      expect(group.nativeElement.getAttribute("aria-label")).toBe("Tags");
    });

    it("should have aria-pressed on child buttons (not aria-checked)", () => {
      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons.forEach((btn) => {
        expect(btn.nativeElement.getAttribute("aria-pressed")).toBe("false");
        expect(btn.nativeElement.getAttribute("aria-checked")).toBeNull();
        expect(btn.nativeElement.getAttribute("role")).toBeNull();
      });
    });

    it("should toggle individual filters independently", () => {
      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );

      buttons[0].nativeElement.click();
      fixture.detectChanges();
      expect(host.control.value).toEqual(["urgent"]);

      buttons[1].nativeElement.click();
      fixture.detectChanges();
      expect(host.control.value).toEqual(["urgent", "review"]);
    });

    it("should deselect on re-click", () => {
      host.control.setValue(["urgent", "review"]);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons[0].nativeElement.click();
      fixture.detectChanges();

      expect(host.control.value).toEqual(["review"]);
    });

    it("should reflect initial FormControl value", () => {
      host.control.setValue(["urgent", "draft"]);
      fixture.detectChanges();

      const filters = fixture.debugElement.queryAll(
        By.directive(FilterComponent),
      );
      expect(
        filters[0].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(true);
      expect(
        filters[1].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(false);
      expect(
        filters[2].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(true);
    });

    it("should disable all filters when form control is disabled", () => {
      host.control.disable();
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons.forEach((btn) => {
        expect(btn.nativeElement.disabled).toBe(true);
      });
    });

    it("should mark form control as touched on click", () => {
      expect(host.control.touched).toBe(false);

      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons[0].nativeElement.click();
      fixture.detectChanges();

      expect(host.control.touched).toBe(true);
    });

    it("should mark form control as dirty on click", () => {
      expect(host.control.dirty).toBe(false);

      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      buttons[0].nativeElement.click();
      fixture.detectChanges();

      expect(host.control.dirty).toBe(true);
    });

    it("should update selection when form control value is set programmatically", () => {
      host.control.setValue(["review", "draft"]);
      fixture.detectChanges();

      const filters = fixture.debugElement.queryAll(
        By.directive(FilterComponent),
      );
      expect(
        filters[0].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(false);
      expect(
        filters[1].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(true);
      expect(
        filters[2].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(true);
    });
  });

  describe("unmanaged (visual-only, backward compatible)", () => {
    let fixture: ComponentFixture<UnmanagedGroupHostComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [UnmanagedGroupHostComponent],
      });
      fixture = TestBed.createComponent(UnmanagedGroupHostComponent);
      fixture.detectChanges();
    });

    it("should not have role attribute", () => {
      const group = fixture.debugElement.query(
        By.directive(FilterGroupComponent),
      );
      expect(group.nativeElement.getAttribute("role")).toBeNull();
    });

    it("should have aria-pressed on child buttons (standalone behavior)", () => {
      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );
      expect(buttons[0].nativeElement.getAttribute("aria-pressed")).toBe(
        "true",
      );
      expect(buttons[1].nativeElement.getAttribute("aria-pressed")).toBe(
        "false",
      );
    });

    it("should toggle independently without group coordination", () => {
      const buttons = fixture.debugElement.queryAll(
        By.css(".tedi-filter__button"),
      );

      buttons[1].nativeElement.click();
      fixture.detectChanges();

      const filters = fixture.debugElement.queryAll(
        By.directive(FilterComponent),
      );
      expect(
        filters[0].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(true);
      expect(
        filters[1].nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(true);
    });
  });
});
