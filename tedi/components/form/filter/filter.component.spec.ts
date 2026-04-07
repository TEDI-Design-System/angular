import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { FilterComponent, FilterOption } from "./filter.component";
import { FilterContentDirective } from "./filter-content.directive";
import { IconComponent } from "../../base/icon/icon.component";

@Component({
  standalone: true,
  imports: [FilterComponent, IconComponent],
  template: `
    <tedi-filter [text]="'With icon'">
      <tedi-icon tediFilterPrepend name="filter_alt" [size]="18" />
    </tedi-filter>
  `,
})
class FilterWithIconHostComponent {}

@Component({
  standalone: true,
  imports: [FilterComponent, ReactiveFormsModule],
  template: `<tedi-filter text="Single" [formControl]="control" />`,
})
class SingleSelectHostComponent {
  control = new FormControl<boolean>(false);
}

@Component({
  standalone: true,
  imports: [FilterComponent, ReactiveFormsModule],
  template: `
    <tedi-filter
      text="Multi"
      [multiselect]="true"
      [options]="options"
      [formControl]="control"
    />
  `,
})
class MultiselectHostComponent {
  options: FilterOption[] = [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
    { label: "Option C", value: "c" },
  ];
  control = new FormControl<string[]>([]);
}

@Component({
  standalone: true,
  imports: [FilterComponent, FilterContentDirective],
  template: `
    <tedi-filter text="Aeg alates" [selected]="selected">
      <div tediFilterContent class="custom-datepicker">
        <p>Custom datepicker content</p>
      </div>
    </tedi-filter>
  `,
})
class FilterWithCustomContentHostComponent {
  selected = false;
}

@Component({
  standalone: true,
  imports: [FilterComponent, ReactiveFormsModule],
  template: `
    <tedi-filter
      text="Teenus"
      [options]="options"
      [formControl]="control"
    />
  `,
})
class SingleSelectHostComponent2 {
  options: FilterOption[] = [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
    { label: "Option C", value: "c" },
  ];
  control = new FormControl<string>("");
}

const TEST_OPTIONS: FilterOption[] = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
  { label: "Option C", value: "c" },
  { label: "Disabled", value: "d", disabled: true },
];

describe("FilterComponent", () => {
  let fixture: ComponentFixture<FilterComponent>;
  let component: FilterComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FilterComponent],
    });
    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render text label", () => {
    fixture.componentRef.setInput("text", "Teenused");
    fixture.detectChanges();

    const textEl = fixture.debugElement.query(By.css(".tedi-filter__text"));
    expect(textEl.nativeElement.textContent).toBe("Teenused");
  });

  it("should have tedi-filter host class", () => {
    expect(
      fixture.debugElement.nativeElement.classList.contains("tedi-filter"),
    ).toBe(true);
  });

  it("should apply primary variant class by default", () => {
    expect(
      fixture.debugElement.nativeElement.classList.contains(
        "tedi-filter--primary",
      ),
    ).toBe(true);
  });

  it("should apply secondary variant class", () => {
    fixture.componentRef.setInput("variant", "secondary");
    fixture.detectChanges();

    expect(
      fixture.debugElement.nativeElement.classList.contains(
        "tedi-filter--secondary",
      ),
    ).toBe(true);
  });

  it("should apply large size class", () => {
    fixture.componentRef.setInput("size", "large");
    fixture.detectChanges();

    expect(
      fixture.debugElement.nativeElement.classList.contains(
        "tedi-filter--large",
      ),
    ).toBe(true);
  });

  it("should not have large class by default", () => {
    expect(
      fixture.debugElement.nativeElement.classList.contains(
        "tedi-filter--large",
      ),
    ).toBe(false);
  });

  describe("single-select mode", () => {
    it("should toggle selected state on click", () => {
      const button = fixture.debugElement.query(
        By.css(".tedi-filter__button"),
      );

      expect(component.selected()).toBe(false);

      button.nativeElement.click();
      fixture.detectChanges();

      expect(component.selected()).toBe(true);

      button.nativeElement.click();
      fixture.detectChanges();

      expect(component.selected()).toBe(false);
    });

    it("should apply selected class when selected", () => {
      fixture.componentRef.setInput("selected", true);
      fixture.detectChanges();

      expect(
        fixture.debugElement.nativeElement.classList.contains(
          "tedi-filter--selected",
        ),
      ).toBe(true);
    });

    it("should set aria-pressed attribute", () => {
      const button = fixture.debugElement.query(
        By.css(".tedi-filter__button"),
      );

      expect(button.nativeElement.getAttribute("aria-pressed")).toBe("false");

      fixture.componentRef.setInput("selected", true);
      fixture.detectChanges();

      expect(button.nativeElement.getAttribute("aria-pressed")).toBe("true");
    });

    it("should show check icon when selected", () => {
      fixture.componentRef.setInput("selected", true);
      fixture.detectChanges();

      const icon = fixture.debugElement.query(
        By.css("tedi-icon[name='check']"),
      );
      expect(icon).toBeTruthy();
    });

    it("should not show check icon when not selected", () => {
      const icon = fixture.debugElement.query(
        By.css("tedi-icon[name='check']"),
      );
      expect(icon).toBeNull();
    });

    it("should not have aria-expanded in single-select mode", () => {
      const button = fixture.debugElement.query(
        By.css(".tedi-filter__button"),
      );
      expect(button.nativeElement.getAttribute("aria-expanded")).toBeNull();
    });
  });

  describe("multiselect mode", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("multiselect", true);
      fixture.componentRef.setInput("options", TEST_OPTIONS);
      fixture.detectChanges();
    });

    it("should show dropdown arrow", () => {
      const icon = fixture.debugElement.query(
        By.css("tedi-icon[name='arrow_drop_down']"),
      );
      expect(icon).toBeTruthy();
    });

    it("should not show dropdown arrow in boolean mode", () => {
      fixture.componentRef.setInput("multiselect", false);
      fixture.componentRef.setInput("options", []);
      fixture.detectChanges();

      const icon = fixture.debugElement.query(
        By.css("tedi-icon[name='arrow_drop_down']"),
      );
      expect(icon).toBeNull();
    });

    it("should not show check icon in multiselect mode", () => {
      fixture.componentRef.setInput("values", ["a"]);
      fixture.detectChanges();

      const icon = fixture.debugElement.query(
        By.css("tedi-icon[name='check']"),
      );
      expect(icon).toBeNull();
    });

    it("should set aria-expanded on button", () => {
      const button = fixture.debugElement.query(
        By.css(".tedi-filter__button"),
      );
      expect(button.nativeElement.getAttribute("aria-expanded")).toBe("false");
    });

    it("should set aria-haspopup on button", () => {
      const button = fixture.debugElement.query(
        By.css(".tedi-filter__button"),
      );
      expect(button.nativeElement.getAttribute("aria-haspopup")).toBe(
        "dialog",
      );
    });

    it("should show selected class when values are present", () => {
      fixture.componentRef.setInput("values", ["a", "b"]);
      fixture.detectChanges();

      expect(
        fixture.debugElement.nativeElement.classList.contains(
          "tedi-filter--selected",
        ),
      ).toBe(true);
    });

    it("should show count badge when values are selected", () => {
      fixture.componentRef.setInput("values", ["a", "b"]);
      fixture.detectChanges();

      const badge = fixture.debugElement.query(By.css("tedi-status-badge"));
      expect(badge).toBeTruthy();
    });

    it("should not show count badge when no values are selected", () => {
      const badge = fixture.debugElement.query(By.css("tedi-status-badge"));
      expect(badge).toBeNull();
    });

    it("should toggle option selection", () => {
      component.toggleOption("a");
      expect(component.values()).toEqual(["a"]);

      component.toggleOption("b");
      expect(component.values()).toEqual(["a", "b"]);

      component.toggleOption("a");
      expect(component.values()).toEqual(["b"]);
    });

    it("should clear all selections", () => {
      fixture.componentRef.setInput("values", ["a", "b"]);
      fixture.detectChanges();

      component.clearSelection();
      expect(component.values()).toEqual([]);
    });

    it("should filter options by search term", () => {
      component.searchTerm.set("option a");
      expect(component.filteredOptions().length).toBe(1);
      expect(component.filteredOptions()[0].value).toBe("a");
    });

    it("should toggle select all", () => {
      component.toggleSelectAll();
      expect(component.values()).toEqual(["a", "b", "c"]);
    });

    it("should deselect all when all are selected", () => {
      fixture.componentRef.setInput("values", ["a", "b", "c"]);
      fixture.detectChanges();

      component.toggleSelectAll();
      expect(component.values()).toEqual([]);
    });

    it("should compute allFilteredSelected correctly", () => {
      expect(component.allFilteredSelected()).toBe(false);

      fixture.componentRef.setInput("values", ["a", "b", "c"]);
      fixture.detectChanges();

      expect(component.allFilteredSelected()).toBe(true);
    });

    it("should compute someFilteredSelected correctly", () => {
      expect(component.someFilteredSelected()).toBe(false);

      fixture.componentRef.setInput("values", ["a"]);
      fixture.detectChanges();

      expect(component.someFilteredSelected()).toBe(true);
    });

    it("should not include disabled options in select all", () => {
      component.toggleSelectAll();
      expect(component.values()).not.toContain("d");
    });

    it("should select all only for filtered options when search is active", () => {
      component.searchTerm.set("Option A");
      component.toggleSelectAll();
      expect(component.values()).toEqual(["a"]);
    });

    it("should preserve non-filtered selections when toggling select all with search", () => {
      fixture.componentRef.setInput("values", ["b"]);
      fixture.detectChanges();

      component.searchTerm.set("Option A");
      component.toggleSelectAll();
      expect(component.values()).toContain("a");
      expect(component.values()).toContain("b");
    });
  });

  describe("multiselect dropdown content", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("multiselect", true);
      fixture.componentRef.setInput("options", TEST_OPTIONS);
      fixture.componentRef.setInput("showSelectAll", true);
      fixture.componentRef.setInput("showClear", true);
      fixture.componentRef.setInput("searchable", true);
      fixture.detectChanges();
    });

    it("should render dropdown-item-value for each option", () => {
      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options tedi-dropdown-item-value"),
      );
      expect(items.length).toBe(TEST_OPTIONS.length);
    });

    it("should render dropdown-item-value with checkbox type", () => {
      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options tedi-dropdown-item-value"),
      );
      items.forEach((item) => {
        expect(item.componentInstance.type()).toBe("checkbox");
      });
    });

    it("should render dropdown-item-value-label for each option", () => {
      const labels = fixture.debugElement.queryAll(
        By.css(
          ".tedi-filter-dropdown__options tedi-dropdown-item-value-label",
        ),
      );
      expect(labels.length).toBe(TEST_OPTIONS.length);
      expect(labels[0].nativeElement.textContent.trim()).toBe("Option A");
    });

    it("should pass selected state to dropdown-item-value", () => {
      fixture.componentRef.setInput("values", ["a"]);
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options tedi-dropdown-item-value"),
      );
      expect(items[0].componentInstance.selected()).toBe(true);
      expect(items[1].componentInstance.selected()).toBe(false);
    });

    it("should pass disabled state to dropdown-item-value", () => {
      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options tedi-dropdown-item-value"),
      );
      expect(items[3].componentInstance.disabled()).toBe(true);
      expect(items[0].componentInstance.disabled()).toBe(false);
    });

    it("should render select-all with dropdown-item-value checkbox type", () => {
      const selectAll = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__item--select-all tedi-dropdown-item-value"),
      );
      expect(selectAll).toBeTruthy();
      expect(selectAll.componentInstance.type()).toBe("checkbox");
    });

    it("should pass indeterminate state to select-all dropdown-item-value", () => {
      fixture.componentRef.setInput("values", ["a"]);
      fixture.detectChanges();

      const selectAll = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__item--select-all tedi-dropdown-item-value"),
      );
      expect(selectAll.componentInstance.indeterminate()).toBe(true);
      expect(selectAll.componentInstance.selected()).toBe(false);
    });

    it("should pass selected state to select-all when all selected", () => {
      fixture.componentRef.setInput("values", ["a", "b", "c"]);
      fixture.detectChanges();

      const selectAll = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__item--select-all tedi-dropdown-item-value"),
      );
      expect(selectAll.componentInstance.selected()).toBe(true);
      expect(selectAll.componentInstance.indeterminate()).toBe(false);
    });

    it("should render search input when searchable", () => {
      const search = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__search input"),
      );
      expect(search).toBeTruthy();
    });

    it("should render clear button when showClear", () => {
      const clear = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__clear"),
      );
      expect(clear).toBeTruthy();
    });

    it("should not render search input when not searchable", () => {
      fixture.componentRef.setInput("searchable", false);
      fixture.detectChanges();

      const search = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__search"),
      );
      expect(search).toBeNull();
    });

    it("should not render clear button when showClear is false", () => {
      fixture.componentRef.setInput("showClear", false);
      fixture.detectChanges();

      const clear = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__clear"),
      );
      expect(clear).toBeNull();
    });

    it("should not render select-all when showSelectAll is false", () => {
      fixture.componentRef.setInput("showSelectAll", false);
      fixture.detectChanges();

      const selectAll = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__item--select-all"),
      );
      expect(selectAll).toBeNull();
    });

    it("should toggle option on item click", () => {
      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options .tedi-filter-dropdown__item"),
      );
      items[0].nativeElement.click();
      fixture.detectChanges();

      expect(component.values()).toEqual(["a"]);
    });

    it("should not toggle disabled option on click", () => {
      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options .tedi-filter-dropdown__item"),
      );
      items[3].nativeElement.click();
      fixture.detectChanges();

      expect(component.values()).toEqual([]);
    });

    it("should toggle select all on select-all click", () => {
      const selectAll = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__item--select-all"),
      );
      selectAll.nativeElement.click();
      fixture.detectChanges();

      expect(component.values()).toEqual(["a", "b", "c"]);
    });

    it("should clear selection on clear button click", () => {
      fixture.componentRef.setInput("values", ["a", "b"]);
      fixture.detectChanges();

      const clear = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__clear"),
      );
      clear.nativeElement.click();
      fixture.detectChanges();

      expect(component.values()).toEqual([]);
    });
  });

  describe("accessibility", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("multiselect", true);
      fixture.componentRef.setInput("options", TEST_OPTIONS);
      fixture.componentRef.setInput("showSelectAll", true);
      fixture.componentRef.setInput("showClear", true);
      fixture.componentRef.setInput("searchable", true);
      fixture.componentRef.setInput("text", "Raviasutus");
      fixture.detectChanges();
    });

    it("should have role=dialog on dropdown panel", () => {
      const panel = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown"),
      );
      expect(panel.nativeElement.getAttribute("role")).toBe("dialog");
    });

    it("should have aria-label on dropdown panel matching text", () => {
      const panel = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown"),
      );
      expect(panel.nativeElement.getAttribute("aria-label")).toBe(
        "Raviasutus",
      );
    });

    it("should have role=listbox on options container", () => {
      const options = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__options"),
      );
      expect(options.nativeElement.getAttribute("role")).toBe("listbox");
    });

    it("should have aria-multiselectable on options container", () => {
      const options = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__options"),
      );
      expect(options.nativeElement.getAttribute("aria-multiselectable")).toBe(
        "true",
      );
    });

    it("should have aria-label on options container matching text", () => {
      const options = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__options"),
      );
      expect(options.nativeElement.getAttribute("aria-label")).toBe(
        "Raviasutus",
      );
    });

    it("should have role=option on each option item", () => {
      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options .tedi-filter-dropdown__item"),
      );
      items.forEach((item) => {
        expect(item.nativeElement.getAttribute("role")).toBe("option");
      });
    });

    it("should set aria-selected on options", () => {
      fixture.componentRef.setInput("values", ["a"]);
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options [role='option']"),
      );
      expect(items[0].nativeElement.getAttribute("aria-selected")).toBe(
        "true",
      );
      expect(items[1].nativeElement.getAttribute("aria-selected")).toBe(
        "false",
      );
    });

    it("should set aria-disabled on disabled options", () => {
      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options [role='option']"),
      );
      expect(items[3].nativeElement.getAttribute("aria-disabled")).toBe(
        "true",
      );
      expect(items[0].nativeElement.getAttribute("aria-disabled")).toBeNull();
    });

    it("should have unique IDs on option items", () => {
      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options [role='option']"),
      );
      const ids = items.map((item) => item.nativeElement.id);

      expect(ids.every((id: string) => id.length > 0)).toBe(true);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have role=checkbox on select-all", () => {
      const selectAll = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__item--select-all"),
      );
      expect(selectAll.nativeElement.getAttribute("role")).toBe("checkbox");
    });

    it("should set aria-checked=false on select-all when none selected", () => {
      const selectAll = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__item--select-all"),
      );
      expect(selectAll.nativeElement.getAttribute("aria-checked")).toBe(
        "false",
      );
    });

    it("should set aria-checked=mixed on select-all when some selected", () => {
      fixture.componentRef.setInput("values", ["a"]);
      fixture.detectChanges();

      const selectAll = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__item--select-all"),
      );
      expect(selectAll.nativeElement.getAttribute("aria-checked")).toBe(
        "mixed",
      );
    });

    it("should set aria-checked=true on select-all when all selected", () => {
      fixture.componentRef.setInput("values", ["a", "b", "c"]);
      fixture.detectChanges();

      const selectAll = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__item--select-all"),
      );
      expect(selectAll.nativeElement.getAttribute("aria-checked")).toBe(
        "true",
      );
    });

    it("should have role=searchbox on search input", () => {
      const search = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__search input"),
      );
      expect(search.nativeElement.getAttribute("role")).toBe("searchbox");
    });

    it("should have aria-label on search input", () => {
      const search = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__search input"),
      );
      expect(search.nativeElement.getAttribute("aria-label")).toBe(
        "Raviasutus",
      );
    });

    it("should not have aria-activedescendant when no option is focused", () => {
      const options = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__options"),
      );
      expect(
        options.nativeElement.getAttribute("aria-activedescendant"),
      ).toBeNull();
    });

    it("should set aria-activedescendant when option is focused", () => {
      component.onOptionsFocus();
      fixture.detectChanges();

      const options = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__options"),
      );
      const firstOptionId = component.getOptionId(0);
      expect(
        options.nativeElement.getAttribute("aria-activedescendant"),
      ).toBe(firstOptionId);
    });

    it("should clear aria-activedescendant on options blur", () => {
      component.onOptionsFocus();
      fixture.detectChanges();
      component.onOptionsBlur();
      fixture.detectChanges();

      const options = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__options"),
      );
      expect(
        options.nativeElement.getAttribute("aria-activedescendant"),
      ).toBeNull();
    });

    it("should have tabindex=0 on select-all", () => {
      const selectAll = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__item--select-all"),
      );
      expect(selectAll.nativeElement.getAttribute("tabindex")).toBe("0");
    });

    it("should have tabindex=0 on options listbox", () => {
      const options = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__options"),
      );
      expect(options.nativeElement.getAttribute("tabindex")).toBe("0");
    });

    it("should not have tabbable checkbox inputs inside dropdown-item-value", () => {
      const checkboxes = fixture.debugElement.queryAll(
        By.css(
          ".tedi-filter-dropdown__options input[type='checkbox']",
        ),
      );
      checkboxes.forEach((cb) => {
        expect(cb.nativeElement.getAttribute("tabindex")).toBe("-1");
      });
    });
  });

  describe("keyboard navigation", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("multiselect", true);
      fixture.componentRef.setInput("options", TEST_OPTIONS);
      fixture.detectChanges();
    });

    it("should set active option index to first enabled option on focus", () => {
      expect(component.activeOptionIndex()).toBe(-1);
      component.onOptionsFocus();
      expect(component.activeOptionIndex()).toBe(0);
    });

    it("should reset active option index on blur", () => {
      component.onOptionsFocus();
      expect(component.activeOptionIndex()).toBe(0);

      component.onOptionsBlur();
      expect(component.activeOptionIndex()).toBe(-1);
    });

    it("should move to next option on ArrowDown", () => {
      component.onOptionsFocus();

      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      expect(component.activeOptionIndex()).toBe(1);
    });

    it("should move to previous option on ArrowUp", () => {
      component.onOptionsFocus();
      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      expect(component.activeOptionIndex()).toBe(1);

      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "ArrowUp" }),
      );
      expect(component.activeOptionIndex()).toBe(0);
    });

    it("should skip disabled options on ArrowDown", () => {
      component.onOptionsFocus();

      // Move to index 2 (Option C)
      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      expect(component.activeOptionIndex()).toBe(2);

      // Next would be index 3 (disabled), should stay at 2
      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      expect(component.activeOptionIndex()).toBe(2);
    });

    it("should not move above first option on ArrowUp", () => {
      component.onOptionsFocus();
      expect(component.activeOptionIndex()).toBe(0);

      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "ArrowUp" }),
      );
      expect(component.activeOptionIndex()).toBe(0);
    });

    it("should move to first enabled option on Home", () => {
      component.onOptionsFocus();
      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      expect(component.activeOptionIndex()).toBe(2);

      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "Home" }),
      );
      expect(component.activeOptionIndex()).toBe(0);
    });

    it("should move to last enabled option on End", () => {
      component.onOptionsFocus();

      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "End" }),
      );
      expect(component.activeOptionIndex()).toBe(2);
    });

    it("should toggle focused option on Enter", () => {
      component.onOptionsFocus();
      expect(component.values()).toEqual([]);

      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "Enter" }),
      );
      expect(component.values()).toEqual(["a"]);
    });

    it("should toggle focused option on Space", () => {
      component.onOptionsFocus();

      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: " " }),
      );
      expect(component.values()).toEqual(["a"]);

      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: " " }),
      );
      expect(component.values()).toEqual([]);
    });

    it("should not toggle disabled option on Enter", () => {
      // Manually set active index to disabled option
      component["activeOptionIndex"].set(3);

      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "Enter" }),
      );
      expect(component.values()).toEqual([]);
    });

    it("should apply focused class to active option", () => {
      component.onOptionsFocus();
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options .tedi-filter-dropdown__item"),
      );
      expect(
        items[0].nativeElement.classList.contains(
          "tedi-filter-dropdown__item--focused",
        ),
      ).toBe(true);
      expect(
        items[1].nativeElement.classList.contains(
          "tedi-filter-dropdown__item--focused",
        ),
      ).toBe(false);
    });

    it("should move focused class on arrow navigation", () => {
      component.onOptionsFocus();
      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options .tedi-filter-dropdown__item"),
      );
      expect(
        items[0].nativeElement.classList.contains(
          "tedi-filter-dropdown__item--focused",
        ),
      ).toBe(false);
      expect(
        items[1].nativeElement.classList.contains(
          "tedi-filter-dropdown__item--focused",
        ),
      ).toBe(true);
    });

    it("should remove focused class on blur", () => {
      component.onOptionsFocus();
      fixture.detectChanges();

      component.onOptionsBlur();
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options .tedi-filter-dropdown__item"),
      );
      items.forEach((item) => {
        expect(
          item.nativeElement.classList.contains(
            "tedi-filter-dropdown__item--focused",
          ),
        ).toBe(false);
      });
    });

    it("should update aria-activedescendant on navigation", () => {
      component.onOptionsFocus();
      fixture.detectChanges();

      const optionsEl = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__options"),
      );
      expect(
        optionsEl.nativeElement.getAttribute("aria-activedescendant"),
      ).toBe(component.getOptionId(0));

      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      fixture.detectChanges();

      expect(
        optionsEl.nativeElement.getAttribute("aria-activedescendant"),
      ).toBe(component.getOptionId(1));
    });

    it("should handle select-all Enter keydown", () => {
      fixture.componentRef.setInput("showSelectAll", true);
      fixture.detectChanges();

      const selectAll = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__item--select-all"),
      );
      selectAll.triggerEventHandler("keydown.enter", {});
      fixture.detectChanges();

      expect(component.values()).toEqual(["a", "b", "c"]);
    });

    it("should handle select-all Space keydown", () => {
      fixture.componentRef.setInput("showSelectAll", true);
      fixture.detectChanges();

      const selectAll = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__item--select-all"),
      );
      selectAll.triggerEventHandler("keydown.space", {
        preventDefault: () => {},
      });
      fixture.detectChanges();

      expect(component.values()).toEqual(["a", "b", "c"]);
    });
  });


  it("should project content via tediFilterPrepend slot", () => {
    const hostFixture = TestBed.createComponent(FilterWithIconHostComponent);
    hostFixture.detectChanges();

    const projectedIcon = hostFixture.debugElement.query(
      By.css("[tediFilterPrepend]"),
    );
    expect(projectedIcon).toBeTruthy();
  });

  it("should have button with type=button", () => {
    const button = fixture.debugElement.query(By.css(".tedi-filter__button"));
    expect(button.nativeElement.getAttribute("type")).toBe("button");
  });

  it("should use icon size 18 for default size", () => {
    expect(component.iconSize()).toBe(18);
  });

  it("should use icon size 24 for large size", () => {
    fixture.componentRef.setInput("size", "large");
    fixture.detectChanges();

    expect(component.iconSize()).toBe(24);
  });

  describe("reactive forms - single select", () => {
    let hostFixture: ComponentFixture<SingleSelectHostComponent>;
    let host: SingleSelectHostComponent;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(SingleSelectHostComponent);
      host = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it("should write value from form control", () => {
      host.control.setValue(true);
      hostFixture.detectChanges();

      const hostEl = hostFixture.debugElement.query(
        By.directive(FilterComponent),
      );
      expect(
        hostEl.nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(true);
    });

    it("should update form control on toggle", () => {
      const button = hostFixture.debugElement.query(
        By.css(".tedi-filter__button"),
      );
      button.nativeElement.click();
      hostFixture.detectChanges();

      expect(host.control.value).toBe(true);
    });

    it("should mark form control as touched on toggle", () => {
      expect(host.control.touched).toBe(false);

      const button = hostFixture.debugElement.query(
        By.css(".tedi-filter__button"),
      );
      button.nativeElement.click();
      hostFixture.detectChanges();

      expect(host.control.touched).toBe(true);
    });
  });

  describe("reactive forms - multiselect", () => {
    let hostFixture: ComponentFixture<MultiselectHostComponent>;
    let host: MultiselectHostComponent;
    let filterComponent: FilterComponent;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(MultiselectHostComponent);
      host = hostFixture.componentInstance;
      hostFixture.detectChanges();
      filterComponent = hostFixture.debugElement.query(
        By.directive(FilterComponent),
      ).componentInstance;
    });

    it("should write value from form control", () => {
      host.control.setValue(["a", "b"]);
      hostFixture.detectChanges();

      expect(filterComponent.values()).toEqual(["a", "b"]);
    });

    it("should update form control on option toggle", () => {
      filterComponent.toggleOption("a");
      hostFixture.detectChanges();

      expect(host.control.value).toEqual(["a"]);
    });

    it("should update form control on clear", () => {
      host.control.setValue(["a", "b"]);
      hostFixture.detectChanges();

      filterComponent.clearSelection();
      hostFixture.detectChanges();

      expect(host.control.value).toEqual([]);
    });

    it("should update form control on select all", () => {
      filterComponent.toggleSelectAll();
      hostFixture.detectChanges();

      expect(host.control.value).toEqual(["a", "b", "c"]);
    });

    it("should mark form control as touched on interaction", () => {
      expect(host.control.touched).toBe(false);

      filterComponent.toggleOption("a");
      hostFixture.detectChanges();

      expect(host.control.touched).toBe(true);
    });
  });

  describe("single-select mode", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("options", TEST_OPTIONS);
      fixture.detectChanges();
    });

    it("should show dropdown arrow", () => {
      const icon = fixture.debugElement.query(
        By.css("tedi-icon[name='arrow_drop_down']"),
      );
      expect(icon).toBeTruthy();
    });

    it("should not show check icon", () => {
      fixture.componentRef.setInput("value", "a");
      fixture.detectChanges();

      const icon = fixture.debugElement.query(
        By.css("tedi-icon[name='check']"),
      );
      expect(icon).toBeNull();
    });

    it("should not show count badge", () => {
      fixture.componentRef.setInput("value", "a");
      fixture.detectChanges();

      const badge = fixture.debugElement.query(By.css("tedi-status-badge"));
      expect(badge).toBeNull();
    });

    it("should render default type dropdown-item-value", () => {
      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options tedi-dropdown-item-value"),
      );
      expect(items.length).toBe(TEST_OPTIONS.length);
      items.forEach((item) => {
        expect(item.componentInstance.type()).toBe("default");
      });
    });

    it("should not have aria-multiselectable on listbox", () => {
      const options = fixture.debugElement.query(
        By.css(".tedi-filter-dropdown__options"),
      );
      expect(
        options.nativeElement.getAttribute("aria-multiselectable"),
      ).toBeNull();
    });

    it("should select option via selectOption", () => {
      component.selectOption("a");
      expect(component.value()).toBe("a");
    });

    it("should deselect option when selecting same value", () => {
      component.selectOption("a");
      expect(component.value()).toBe("a");

      component.selectOption("a");
      expect(component.value()).toBe("");
    });

    it("should replace selection when selecting different value", () => {
      component.selectOption("a");
      component.selectOption("b");
      expect(component.value()).toBe("b");
    });

    it("should show selected class when value is set", () => {
      fixture.componentRef.setInput("value", "a");
      fixture.detectChanges();

      expect(
        fixture.debugElement.nativeElement.classList.contains(
          "tedi-filter--selected",
        ),
      ).toBe(true);
    });

    it("should not show selected class when value is empty", () => {
      expect(
        fixture.debugElement.nativeElement.classList.contains(
          "tedi-filter--selected",
        ),
      ).toBe(false);
    });

    it("should mark option as selected via aria-selected", () => {
      fixture.componentRef.setInput("value", "a");
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(
        By.css("[role='option']"),
      );
      expect(items[0].nativeElement.getAttribute("aria-selected")).toBe(
        "true",
      );
      expect(items[1].nativeElement.getAttribute("aria-selected")).toBe(
        "false",
      );
    });

    it("should clear single selection", () => {
      fixture.componentRef.setInput("value", "a");
      fixture.detectChanges();

      component.clearSingleSelection();
      expect(component.value()).toBe("");
    });

    it("should select option on item click", () => {
      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options .tedi-filter-dropdown__item"),
      );
      items[0].nativeElement.click();
      fixture.detectChanges();

      expect(component.value()).toBe("a");
    });

    it("should not select disabled option on click", () => {
      const items = fixture.debugElement.queryAll(
        By.css(".tedi-filter-dropdown__options .tedi-filter-dropdown__item"),
      );
      items[3].nativeElement.click();
      fixture.detectChanges();

      expect(component.value()).toBe("");
    });

    it("should select option on Enter keydown", () => {
      component.onOptionsFocus();
      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: "Enter" }),
      );
      expect(component.value()).toBe("a");
    });

    it("should select option on Space keydown", () => {
      component.onOptionsFocus();
      component.onOptionsKeydown(
        new KeyboardEvent("keydown", { key: " " }),
      );
      expect(component.value()).toBe("a");
    });

    it("should filter options by search term", () => {
      component.searchTerm.set("option a");
      expect(component.filteredOptions().length).toBe(1);
    });
  });

  describe("reactive forms - single-select with options", () => {
    let hostFixture: ComponentFixture<SingleSelectHostComponent2>;
    let host: SingleSelectHostComponent2;
    let filterComponent: FilterComponent;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(SingleSelectHostComponent2);
      host = hostFixture.componentInstance;
      hostFixture.detectChanges();
      filterComponent = hostFixture.debugElement.query(
        By.directive(FilterComponent),
      ).componentInstance;
    });

    it("should write value from form control", () => {
      host.control.setValue("a");
      hostFixture.detectChanges();

      expect(filterComponent.value()).toBe("a");
    });

    it("should update form control on option select", () => {
      filterComponent.selectOption("b");
      hostFixture.detectChanges();

      expect(host.control.value).toBe("b");
    });

    it("should update form control on clear", () => {
      host.control.setValue("a");
      hostFixture.detectChanges();

      filterComponent.clearSingleSelection();
      hostFixture.detectChanges();

      expect(host.control.value).toBe("");
    });

    it("should mark form control as touched on interaction", () => {
      expect(host.control.touched).toBe(false);

      filterComponent.selectOption("a");
      hostFixture.detectChanges();

      expect(host.control.touched).toBe(true);
    });
  });

  describe("custom dropdown content", () => {
    let hostFixture: ComponentFixture<FilterWithCustomContentHostComponent>;
    let host: FilterWithCustomContentHostComponent;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(
        FilterWithCustomContentHostComponent,
      );
      host = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it("should render custom content in dropdown", () => {
      const customContent = hostFixture.debugElement.query(
        By.css(".custom-datepicker"),
      );
      expect(customContent).toBeTruthy();
      expect(customContent.nativeElement.textContent).toContain(
        "Custom datepicker content",
      );
    });

    it("should show dropdown arrow icon", () => {
      const icon = hostFixture.debugElement.query(
        By.css("tedi-icon[name='arrow_drop_down']"),
      );
      expect(icon).toBeTruthy();
    });

    it("should not show check icon when not selected", () => {
      const icon = hostFixture.debugElement.query(
        By.css("tedi-icon[name='check']"),
      );
      expect(icon).toBeNull();
    });

    it("should not render multiselect checkboxes", () => {
      const checkboxes = hostFixture.debugElement.queryAll(
        By.css("tedi-dropdown-item-value"),
      );
      expect(checkboxes.length).toBe(0);
    });

    it("should not show count badge", () => {
      const badge = hostFixture.debugElement.query(
        By.css("tedi-status-badge"),
      );
      expect(badge).toBeNull();
    });

    it("should apply selected class when selected input is true", () => {
      host.selected = true;
      hostFixture.detectChanges();

      const filterEl = hostFixture.debugElement.query(
        By.directive(FilterComponent),
      );
      expect(
        filterEl.nativeElement.classList.contains("tedi-filter--selected"),
      ).toBe(true);
    });

    it("should apply custom modifier class on dropdown panel", () => {
      const panel = hostFixture.debugElement.query(
        By.css(".tedi-filter-dropdown--custom"),
      );
      expect(panel).toBeTruthy();
    });

    it("should have aria-haspopup on button", () => {
      const button = hostFixture.debugElement.query(
        By.css(".tedi-filter__button"),
      );
      expect(
        button.nativeElement.hasAttribute("aria-haspopup"),
      ).toBe(true);
    });
  });
});
