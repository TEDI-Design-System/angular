/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { SelectComponent, SelectInputSize, SelectOption, SpecialOptionControls } from "./select.component";
import {
  SelectOptionTemplateDirective,
  SelectValueTemplateDirective,
  SelectTooltipTemplateDirective,
} from "./select-templates.directive";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { InputState } from "../form-field/form-field.component";

@Component({
  standalone: true,
  template: `
    <tedi-select
      [inputId]="inputId"
      [label]="label"
      [tooltip]="tooltip"
      [ariaLabelledby]="ariaLabelledby"
      [ariaLabel]="ariaLabel"
      [options]="items"
      [allowMultiple]="allowMultiple"
      [searchable]="searchable"
      [clearable]="clearable"
      [showSelectAll]="showSelectAll"
      [selectableGroups]="selectableGroups"
      [groupBy]="groupBy"
      [bindLabel]="bindLabel"
      [bindValue]="bindValue"
      [placeholder]="placeholder"
      [state]="state"
      [size]="size"
      [required]="required"
      [isTagRemovable]="clearableTags"
      [multiRow]="multiRow"
      [tagEllipsis]="tagEllipsis"
      [dropdownWidthRef]="dropdownWidthRef"
      [dropdownAlign]="dropdownAlign"
      [maxDropdownHeight]="maxDropdownHeight"
      [hideOnScroll]="hideOnScroll"
      [searchFn]="searchFn"
      [clearSearchOnSelect]="clearSearchOnSelect"
      [formControl]="control"
    >
      @if (useOptionTemplate) {
        <ng-template tediSelectOption let-item let-selected="selected">
          <span class="custom-option">{{ item.name }} - {{ selected ? 'selected' : 'not selected' }}</span>
        </ng-template>
      }
      @if (useValueTemplate) {
        <ng-template tediSelectValue let-item>
          <span class="custom-value">{{ item.name }}</span>
        </ng-template>
      }
      @if (useTooltipTemplate) {
        <ng-template tediSelectTooltip>
          <span class="custom-tooltip">Formatted <b>tooltip</b></span>
        </ng-template>
      }
    </tedi-select>
  `,
  imports: [
    SelectComponent,
    SelectOptionTemplateDirective,
    SelectValueTemplateDirective,
    SelectTooltipTemplateDirective,
    ReactiveFormsModule,
  ],
})
class TestHostComponent {
  inputId = "test-select";
  label = "Test Label";
  tooltip: string | undefined = undefined;
  ariaLabelledby: string | undefined = undefined;
  ariaLabel: string | undefined = undefined;
  items: unknown[] = ["Option 1", "Option 2", "Option 3"];
  allowMultiple = false;
  searchable = false;
  clearable = true;
  showSelectAll = false;
  selectableGroups = false;
  groupBy: string | undefined = undefined;
  bindLabel = "label";
  bindValue: string | undefined = undefined;
  placeholder = "Select an option...";
  state: InputState = "default";
  size: SelectInputSize = "default";
  required = false;
  clearableTags = false;
  multiRow = false;
  tagEllipsis: "start" | "end" | false = false;
  dropdownWidthRef: any = undefined;
  dropdownAlign: "start" | "end" = "start";
  maxDropdownHeight: number | undefined = undefined;
  hideOnScroll = false;
  searchFn: ((term: string, item: unknown) => boolean) | undefined = undefined;
  clearSearchOnSelect = false;
  useOptionTemplate = false;
  useValueTemplate = false;
  useTooltipTemplate = false;
  control = new FormControl<unknown>(null);
}

describe("SelectComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let select: SelectComponent;
  let hostEl: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    hostEl = fixture.nativeElement;
    fixture.detectChanges();

    const selectDebug = fixture.debugElement.query(By.directive(SelectComponent));
    select = selectDebug.componentInstance;
  });

  const getTrigger = () => hostEl.querySelector(".tedi-select__trigger") as HTMLElement;
  const getSearchInput = () => hostEl.querySelector(".tedi-select__search-input") as HTMLInputElement;
  const getLabel = () => hostEl.querySelector("[tedi-label]") as HTMLElement;
  const getClearButton = () => hostEl.querySelector(".tedi-select__clear") as HTMLButtonElement;
  const getDropdown = () => document.querySelector(".tedi-select__dropdown") as HTMLElement;
  const getOptions = () => Array.from(document.querySelectorAll(".tedi-dropdown-item:not(.tedi-select__group-name):not(.tedi-select__no-options)")) as HTMLElement[];
  const getSelectAllOption = () => {
    const items = document.querySelectorAll(".tedi-dropdown-item");
    return items[0] as HTMLElement;
  };
  const getTags = () => Array.from(hostEl.querySelectorAll("tedi-tag")) as HTMLElement[];

  describe("Initialization", () => {
    it("should create the component", () => {
      expect(select).toBeTruthy();
    });

    it("should apply tedi-select host class", () => {
      const selectEl = fixture.debugElement.query(By.directive(SelectComponent)).nativeElement;
      expect(selectEl.classList).toContain("tedi-select");
    });

    it("should render label when provided", () => {
      const label = getLabel();
      expect(label).toBeTruthy();
      expect(label.textContent?.trim()).toBe("Test Label");
    });

    it("should not render label when not provided", () => {
      host.label = "";
      fixture.detectChanges();
      const label = getLabel();
      expect(label).toBeFalsy();
    });

    it("should show placeholder when no value selected", () => {
      const trigger = getTrigger();
      expect(trigger.textContent).toContain("Select an option...");
    });

    it("should show required indicator on label", () => {
      host.required = true;
      fixture.detectChanges();
      const requiredIndicator = hostEl.querySelector(".tedi-label--required");
      expect(requiredIndicator).toBeTruthy();
      expect(requiredIndicator?.textContent).toBe("*");
    });

    it("should apply small size class", () => {
      host.size = "small";
      fixture.detectChanges();
      const trigger = getTrigger();
      expect(trigger.classList).toContain("tedi-input--small");
    });

    it("should apply error state class", () => {
      host.state = "error";
      fixture.detectChanges();
      const trigger = getTrigger();
      expect(trigger.classList).toContain("tedi-input--error");
    });

    it("should apply valid state class", () => {
      host.state = "valid";
      fixture.detectChanges();
      const trigger = getTrigger();
      expect(trigger.classList).toContain("tedi-input--valid");
    });

    it("should apply multiselect class when multiple=true", () => {
      host.allowMultiple =true;
      fixture.detectChanges();
      const selectEl = fixture.debugElement.query(By.directive(SelectComponent)).nativeElement;
      expect(selectEl.classList).toContain("tedi-select--multiselect");
    });
  });

  describe("ControlValueAccessor", () => {
    it("writeValue should set single value", () => {
      select.writeValue("Option 1");
      expect(select.selectedValues()).toEqual(["Option 1"]);
    });

    it("writeValue should set array of values for multiple", () => {
      host.allowMultiple =true;
      fixture.detectChanges();
      select.writeValue(["Option 1", "Option 2"]);
      expect(select.selectedValues()).toEqual(["Option 1", "Option 2"]);
    });

    it("writeValue should clear selection on null", () => {
      select.writeValue("Option 1");
      select.writeValue(null);
      expect(select.selectedValues()).toEqual([]);
    });

    it("writeValue should clear selection on empty array for multiple", () => {
      host.allowMultiple =true;
      fixture.detectChanges();
      select.writeValue(["Option 1"]);
      select.writeValue([]);
      expect(select.selectedValues()).toEqual([]);
    });

    it("registerOnChange should call onChange when value changes", () => {
      const spy = jest.fn();
      select.registerOnChange(spy);

      select.handleValueChange({ value: ["Option 1"] });

      expect(spy).toHaveBeenCalledWith("Option 1");
    });

    it("registerOnTouched should call onTouched on blur", () => {
      const spy = jest.fn();
      select.registerOnTouched(spy);

      const trigger = getTrigger();
      trigger.dispatchEvent(new Event("blur"));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it("setDisabledState should disable component", () => {
      select.setDisabledState(true);
      fixture.detectChanges();

      expect(select.disabled()).toBe(true);
      const trigger = getTrigger();
      expect(trigger.classList).toContain("tedi-input--disabled");
    });

    it("should not open dropdown when disabled", () => {
      select.setDisabledState(true);
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();

      expect(select.isOpen()).toBe(false);
    });

    it("should close dropdown when disabled via setDisabledState", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();
      expect(select.isOpen()).toBe(true);

      select.setDisabledState(true);
      fixture.detectChanges();
      tick();

      expect(select.isOpen()).toBe(false);
    }));

    it("should allow closing dropdown when disabled via toggleIsOpen", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();
      expect(select.isOpen()).toBe(true);

      select.setDisabledState(true);
      fixture.detectChanges();
      tick();

      select.toggleIsOpen(true);
      fixture.detectChanges();
      tick();

      expect(select.isOpen()).toBe(false);
    }));
  });

  describe("Single select", () => {
    it("should open dropdown on trigger click", () => {
      getTrigger().click();
      fixture.detectChanges();

      expect(select.isOpen()).toBe(true);
      expect(getDropdown()).toBeTruthy();
    });

    it("should select option on click", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[0].click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual(["Option 1"]);
    }));

    it("should close dropdown after selection", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[0].click();
      fixture.detectChanges();
      tick();

      expect(select.isOpen()).toBe(false);
    }));

    it("should display selected label in trigger", fakeAsync(() => {
      host.control.setValue("Option 1");
      fixture.detectChanges();
      tick();

      const trigger = getTrigger();
      expect(trigger.textContent).toContain("Option 1");
    }));

    it("should replace previous selection", fakeAsync(() => {
      host.control.setValue("Option 1");
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[1].click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual(["Option 2"]);
    }));

    it("should show clear button when value selected and clearable=true", fakeAsync(() => {
      host.control.setValue("Option 1");
      fixture.detectChanges();
      tick();

      expect(getClearButton()).toBeTruthy();
    }));

    it("should not show clear button when clearable=false", fakeAsync(() => {
      host.clearable = false;
      host.control.setValue("Option 1");
      fixture.detectChanges();
      tick();

      expect(getClearButton()).toBeFalsy();
    }));

    it("should clear selection on clear button click", fakeAsync(() => {
      host.control.setValue("Option 1");
      fixture.detectChanges();
      tick();

      const clearBtn = getClearButton();
      clearBtn.click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual([]);
      expect(host.control.value).toBeNull();
    }));
  });

  describe("Multiple select", () => {
    beforeEach(() => {
      host.allowMultiple =true;
      fixture.detectChanges();
    });

    it("should select multiple options", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[0].click();
      fixture.detectChanges();
      tick();

      options[1].click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual(["Option 1", "Option 2"]);
    }));

    it("should keep dropdown open after selection", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[0].click();
      fixture.detectChanges();
      tick();

      expect(select.isOpen()).toBe(true);
    }));

    it("should display selected values as tags", fakeAsync(() => {
      host.control.setValue(["Option 1", "Option 2"]);
      fixture.detectChanges();
      tick();

      const tags = getTags();
      expect(tags.length).toBe(2);
    }));

    it("forwards tagEllipsis to the rendered tags", fakeAsync(() => {
      host.control.setValue(["Option 1", "Option 2"]);
      fixture.detectChanges();
      tick();
      expect(
        getTags().every((t) => !t.classList.contains("tedi-tag--ellipsis")),
      ).toBe(true);

      host.tagEllipsis = "end";
      fixture.detectChanges();
      tick();
      const tags = getTags();
      expect(tags.length).toBeGreaterThan(0);
      expect(tags.every((t) => t.classList.contains("tedi-tag--ellipsis"))).toBe(
        true,
      );
    }));

    it("should deselect via tag close button when clearableTags=true", fakeAsync(() => {
      host.clearableTags = true;
      host.control.setValue(["Option 1", "Option 2"]);
      fixture.detectChanges();
      tick();

      const tags = getTags();
      const closeBtn = tags[0].querySelector("[tedi-closing-button]") as HTMLElement;
      closeBtn?.click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual(["Option 2"]);
    }));

    it("should clear all selections on clear button click", fakeAsync(() => {
      host.control.setValue(["Option 1", "Option 2"]);
      fixture.detectChanges();
      tick();

      getClearButton().click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual([]);
      expect(host.control.value).toEqual([]);
    }));

    it("should deselect option when clicking selected option", fakeAsync(() => {
      host.control.setValue(["Option 1", "Option 2"]);
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[0].click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual(["Option 2"]);
    }));
  });

  describe("Searchable select", () => {
    beforeEach(() => {
      host.searchable = true;
      fixture.detectChanges();
    });

    it("should render search input when searchable=true", () => {
      expect(getSearchInput()).toBeTruthy();
    });

    it("should filter options when typing", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.value = "Option 1";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      const options = getOptions();
      expect(options.length).toBe(1);
      expect(options[0].textContent).toContain("Option 1");
    }));

    it("should use custom searchFn when provided", fakeAsync(() => {
      host.items = [
        { label: "Apple", code: "APL" },
        { label: "Banana", code: "BNA" },
        { label: "Cherry", code: "CHR" },
      ];
      host.bindValue = "code";
      host.searchFn = (term: string, item: unknown) => {
        const record = item as Record<string, string>;
        return record["code"].toLowerCase().includes(term);
      };
      fixture.detectChanges();
      tick();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.value = "bna";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      const options = getOptions();
      expect(options.length).toBe(1);
      expect(options[0].textContent).toContain("Banana");
    }));

    it("should show no options message when filter matches nothing", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.value = "xyz";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      const noOptions = document.querySelector(".tedi-select__no-options");
      expect(noOptions).toBeTruthy();
    }));

    it("should clear search term after selection", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.value = "Option 1";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[0].click();
      fixture.detectChanges();
      tick();

      expect(select.searchTerm()).toBe("");
    }));

    it("should not show placeholder on search input after a value is selected", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[0].click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      expect(input.getAttribute("placeholder")).toBe("");
    }));

    it("should open dropdown when typing", fakeAsync(() => {
      const input = getSearchInput();
      input.value = "O";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      expect(select.isOpen()).toBe(true);
    }));

    it("should have combobox role on search input", () => {
      const input = getSearchInput();
      expect(input.getAttribute("role")).toBe("combobox");
    });
  });

  describe("Grouped options", () => {
    beforeEach(() => {
      host.items = [
        { id: 1, name: "Apple", category: "Fruits" },
        { id: 2, name: "Banana", category: "Fruits" },
        { id: 3, name: "Carrot", category: "Vegetables" },
        { id: 4, name: "Broccoli", category: "Vegetables" },
      ];
      host.bindLabel = "name";
      host.bindValue = "id";
      host.groupBy = "category";
      fixture.detectChanges();
    });

    it("should render group headers", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const groupHeaders = document.querySelectorAll(".tedi-select__group-name");
      expect(groupHeaders.length).toBe(2);
      expect(groupHeaders[0].textContent).toContain("Fruits");
      expect(groupHeaders[1].textContent).toContain("Vegetables");
    }));

    it("should render options under their groups", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const options = getOptions();
      expect(options.length).toBe(4);
    }));

    it("should select group options when selectableGroups=true", fakeAsync(() => {
      host.allowMultiple =true;
      host.selectableGroups = true;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const groupHeaders = document.querySelectorAll(".tedi-select__group-name--selectable");
      expect(groupHeaders.length).toBe(2);

      (groupHeaders[0] as HTMLElement).click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual([1, 2]);
    }));
  });

  describe("Select all", () => {
    beforeEach(() => {
      host.allowMultiple =true;
      host.showSelectAll = true;
      fixture.detectChanges();
    });

    it("should show select all option", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const dropdown = getDropdown();
      expect(dropdown.textContent).toContain("Vali kõik");
    }));

    it("should select all options when clicking select all", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const selectAllOption = getSelectAllOption();
      selectAllOption.click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual(["Option 1", "Option 2", "Option 3"]);
    }));

    it("should deselect all when all are selected", fakeAsync(() => {
      host.control.setValue(["Option 1", "Option 2", "Option 3"]);
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const selectAllOption = getSelectAllOption();
      selectAllOption.click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual([]);
    }));

    it("allOptionsSelected should return true when all selected", () => {
      host.control.setValue(["Option 1", "Option 2", "Option 3"]);
      fixture.detectChanges();

      expect(select.allOptionsSelected()).toBe(true);
    });

    it("allOptionsSelected should return false when not all selected", () => {
      host.control.setValue(["Option 1"]);
      fixture.detectChanges();

      expect(select.allOptionsSelected()).toBe(false);
    });

    it("someOptionsSelected should return true when some but not all selected", () => {
      host.control.setValue(["Option 1"]);
      fixture.detectChanges();

      expect(select.someOptionsSelected()).toBe(true);
    });

    it("someOptionsSelected should return false when all selected", () => {
      host.control.setValue(["Option 1", "Option 2", "Option 3"]);
      fixture.detectChanges();

      expect(select.someOptionsSelected()).toBe(false);
    });

    it("someOptionsSelected should return false when none selected", () => {
      host.control.setValue([]);
      fixture.detectChanges();

      expect(select.someOptionsSelected()).toBe(false);
    });

    it("should select only filtered options when search is active", fakeAsync(() => {
      host.searchable = true;
      fixture.detectChanges();
      tick();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.value = "Option 1";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      const selectAllOption = getSelectAllOption();
      selectAllOption.click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual(["Option 1"]);
    }));

    it("should deselect only filtered options when search is active", fakeAsync(() => {
      host.searchable = true;
      host.control.setValue(["Option 1", "Option 2", "Option 3"]);
      fixture.detectChanges();
      tick();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.value = "Option 1";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      const selectAllOption = getSelectAllOption();
      selectAllOption.click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual(["Option 2", "Option 3"]);
    }));

    it("allOptionsSelected should reflect only filtered options when searching", fakeAsync(() => {
      host.searchable = true;
      host.control.setValue(["Option 1"]);
      fixture.detectChanges();
      tick();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.value = "Option 1";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      expect(select.allOptionsSelected()).toBe(true);
    }));
  });

  describe("Keyboard navigation", () => {
    it("Enter on trigger should open dropdown", () => {
      const trigger = getTrigger();
      trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      fixture.detectChanges();

      expect(select.isOpen()).toBe(true);
    });

    it("Space on trigger should open dropdown", () => {
      const trigger = getTrigger();
      trigger.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      fixture.detectChanges();

      expect(select.isOpen()).toBe(true);
    });

    it("ArrowDown on trigger should open dropdown", () => {
      const trigger = getTrigger();
      trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      fixture.detectChanges();

      expect(select.isOpen()).toBe(true);
    });

    it("Escape should close dropdown", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      expect(select.isOpen()).toBe(true);

      const listbox = document.querySelector("[cdkListbox]") as HTMLElement;
      listbox.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      fixture.detectChanges();
      tick();

      expect(select.isOpen()).toBe(false);
    }));

    describe("Searchable keyboard navigation", () => {
      beforeEach(() => {
        host.searchable = true;
        fixture.detectChanges();
      });

      it("ArrowDown should navigate to next option", fakeAsync(() => {
        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        const activeOption = document.querySelector(".cdk-option-active");
        expect(activeOption).toBeTruthy();
      }));

      it("Enter should select focused option", fakeAsync(() => {
        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        fixture.detectChanges();
        tick();

        expect(select.selectedValues().length).toBeGreaterThan(0);
      }));

      it("Escape should close dropdown", fakeAsync(() => {
        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        fixture.detectChanges();
        tick();

        expect(select.isOpen()).toBe(false);
      }));

      it("Tab should close dropdown", fakeAsync(() => {
        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
        fixture.detectChanges();
        tick();

        expect(select.isOpen()).toBe(false);
      }));
    });
  });

  describe("Accessibility", () => {
    it("trigger should have combobox role when not searchable", () => {
      const trigger = getTrigger();
      expect(trigger.getAttribute("role")).toBe("combobox");
    });

    it("trigger should not have combobox role when searchable", () => {
      host.searchable = true;
      fixture.detectChanges();

      const trigger = getTrigger();
      expect(trigger.getAttribute("role")).toBeNull();
    });

    it("trigger should have aria-expanded", () => {
      const trigger = getTrigger();
      expect(trigger.getAttribute("aria-expanded")).toBe("false");

      trigger.click();
      fixture.detectChanges();

      expect(trigger.getAttribute("aria-expanded")).toBe("true");
    });

    it("trigger should have aria-haspopup", () => {
      const trigger = getTrigger();
      expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    });

    it("trigger should have aria-controls referencing listbox", fakeAsync(() => {
      const trigger = getTrigger();
      trigger.click();
      fixture.detectChanges();
      tick();

      const ariaControls = trigger.getAttribute("aria-controls");
      expect(ariaControls).toBe("test-select-listbox");

      const listbox = document.getElementById(ariaControls!);
      expect(listbox).toBeTruthy();
    }));

    it("listbox should have aria-activedescendant", fakeAsync(() => {
      const trigger = getTrigger();
      trigger.click();
      fixture.detectChanges();
      tick();

      const listbox = document.querySelector("[cdkListbox]") as HTMLElement;
      expect(listbox).toBeTruthy();
      expect(listbox.getAttribute("role")).toBe("listbox");

      // Trigger keyboard navigation via CDK's internal handler to set aria-activedescendant
      (select as any).cdkListboxRef()._handleKeydown(
        new KeyboardEvent("keydown", { key: "ArrowDown", keyCode: 40, bubbles: true })
      );
      fixture.detectChanges();
      tick();

      const activeDescendantId = listbox.getAttribute("aria-activedescendant");
      expect(activeDescendantId).toBeTruthy();

      const activeElement = document.querySelector(`[id="${activeDescendantId}"]`);
      expect(activeElement).toBeTruthy();
      expect(activeElement!.getAttribute("role")).toBe("option");
    }));

    it("should mark active option on navigation", fakeAsync(() => {
      host.searchable = true;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      fixture.detectChanges();
      tick();

      const activeOption = document.querySelector(".cdk-option-active");
      expect(activeOption).toBeTruthy();
    }));
  });

  describe("Custom templates", () => {
    beforeEach(() => {
      host.items = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ];
      host.bindLabel = "name";
      host.bindValue = "id";
      fixture.detectChanges();
    });

    it("should render custom option template", fakeAsync(() => {
      host.useOptionTemplate = true;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const customOption = document.querySelector(".custom-option");
      expect(customOption).toBeTruthy();
      expect(customOption?.textContent).toContain("Item 1 - not selected");
    }));

    it("should provide selected state in option template", fakeAsync(() => {
      host.useOptionTemplate = true;
      host.control.setValue(1);
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const customOptions = document.querySelectorAll(".custom-option");
      expect(customOptions[0].textContent).toContain("Item 1 - selected");
      expect(customOptions[1].textContent).toContain("Item 2 - not selected");
    }));

    it("should render custom value template", fakeAsync(() => {
      host.useValueTemplate = true;
      host.control.setValue(1);
      fixture.detectChanges();
      tick();

      const customValue = hostEl.querySelector(".custom-value");
      expect(customValue).toBeTruthy();
      expect(customValue?.textContent).toContain("Item 1");
    }));

    it("getOptionContext should return correct context", () => {
      const option: SelectOption = { value: 1, label: "Test", disabled: false };
      const context = select.getOptionContext(option as SelectOption<unknown>, 0);

      expect(context.index).toBe(0);
      expect(context.selected).toBe(false);
      expect(context.disabled).toBe(false);
    });

    it("getValueContext should return correct context", () => {
      const option: SelectOption = { value: 1, label: "Test" };
      const context = select.getValueContext(option as SelectOption<unknown>);

      expect(context.label).toBe("Test");
    });

    it("should render string tooltip when no tooltip template is projected", () => {
      host.tooltip = "Plain tooltip";
      fixture.detectChanges();

      expect(hostEl.querySelector("tedi-info-tooltip")).toBeTruthy();
      expect(select.tooltipTemplate()).toBeFalsy();
      expect(
        hostEl.querySelector("tedi-info-tooltip .sr-only")?.textContent,
      ).toContain("Plain tooltip");
    });

    it("should render projected tooltip template content", () => {
      host.useTooltipTemplate = true;
      fixture.detectChanges();

      expect(select.tooltipTemplate()).toBeTruthy();
      expect(hostEl.querySelector("tedi-info-tooltip")).toBeTruthy();
      expect(
        hostEl.querySelector("tedi-info-tooltip .sr-only")?.textContent,
      ).toContain("Formatted tooltip");
    });

    it("should prefer the tooltip template over the tooltip string input", () => {
      host.tooltip = "Plain tooltip";
      host.useTooltipTemplate = true;
      fixture.detectChanges();

      const srText = hostEl.querySelector(
        "tedi-info-tooltip .sr-only",
      )?.textContent;
      expect(srText).toContain("Formatted tooltip");
      expect(srText).not.toContain("Plain tooltip");
    });
  });

  describe("Data binding", () => {
    it("should work with primitive string array", () => {
      host.items = ["A", "B", "C"];
      fixture.detectChanges();

      expect(select.normalizedOptions().length).toBe(3);
      expect(select.normalizedOptions()[0].label).toBe("A");
      expect(select.normalizedOptions()[0].value).toBe("A");
    });

    it("should work with primitive number array", () => {
      host.items = [1, 2, 3];
      fixture.detectChanges();

      expect(select.normalizedOptions().length).toBe(3);
      expect(select.normalizedOptions()[0].label).toBe("1");
      expect(select.normalizedOptions()[0].value).toBe(1);
    });

    it("should stringify non-string bindLabel values", () => {
      host.items = [
        { name: 100, id: 1 },
        { name: true, id: 2 },
        { name: null, id: 3 },
      ];
      host.bindLabel = "name";
      host.bindValue = "id";
      fixture.detectChanges();

      expect(select.normalizedOptions()[0].label).toBe("100");
      expect(select.normalizedOptions()[1].label).toBe("true");
      expect(typeof select.normalizedOptions()[2].label).toBe("string");
    });

    it("should use bindLabel for object items", () => {
      host.items = [{ name: "Apple" }, { name: "Banana" }];
      host.bindLabel = "name";
      fixture.detectChanges();

      expect(select.normalizedOptions()[0].label).toBe("Apple");
    });

    it("should use bindValue for object items", () => {
      host.items = [
        { id: 1, name: "Apple" },
        { id: 2, name: "Banana" },
      ];
      host.bindLabel = "name";
      host.bindValue = "id";
      fixture.detectChanges();

      expect(select.normalizedOptions()[0].value).toBe(1);
      expect(select.normalizedOptions()[0].label).toBe("Apple");
    });

    it("should use whole object as value when bindValue not set", () => {
      const items = [
        { id: 1, name: "Apple" },
        { id: 2, name: "Banana" },
      ];
      host.items = items;
      host.bindLabel = "name";
      host.bindValue = undefined;
      fixture.detectChanges();

      expect(select.normalizedOptions()[0].value).toBe(items[0]);
    });

    it("should handle empty items array", () => {
      host.items = [];
      fixture.detectChanges();

      expect(select.normalizedOptions().length).toBe(0);
    });
  });

  describe("Dropdown behavior", () => {
    it("should open dropdown on trigger click", () => {
      getTrigger().click();
      fixture.detectChanges();

      expect(select.isOpen()).toBe(true);
    });

    it("should close dropdown on outside click", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      expect(select.isOpen()).toBe(true);

      document.body.click();
      fixture.detectChanges();
      tick();

      expect(select.isOpen()).toBe(false);
    }));

    it("should close when clicking outside host element", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      expect(select.isOpen()).toBe(true);

      const outsideElement = document.createElement("div");
      document.body.appendChild(outsideElement);

      outsideElement.click();
      fixture.detectChanges();
      tick();

      expect(select.isOpen()).toBe(false);

      document.body.removeChild(outsideElement);
    }));
  });

  describe("hideOnScroll", () => {
    it("closes the dropdown on scroll when enabled", () => {
      host.hideOnScroll = true;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      expect(select.isOpen()).toBe(true);

      document.dispatchEvent(new Event("scroll"));
      fixture.detectChanges();
      expect(select.isOpen()).toBe(false);
    });

    it("keeps the dropdown open when the option list itself is scrolled", () => {
      host.hideOnScroll = true;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      expect(select.isOpen()).toBe(true);

      const listbox = select.listboxRef()!.nativeElement as HTMLElement;
      listbox.dispatchEvent(new Event("scroll", { bubbles: false }));
      fixture.detectChanges();
      expect(select.isOpen()).toBe(true);
    });

    it("keeps the dropdown open on scroll when disabled", () => {
      getTrigger().click();
      fixture.detectChanges();
      expect(select.isOpen()).toBe(true);

      document.dispatchEvent(new Event("scroll"));
      fixture.detectChanges();
      expect(select.isOpen()).toBe(true);
    });
  });

  describe("Computed properties", () => {
    it("dropdownPositions anchor to the start edge by default", () => {
      expect(select.dropdownPositions().every((p) => p.originX === "start")).toBe(
        true,
      );
      expect(select.dropdownPositions().every((p) => p.overlayX === "start")).toBe(
        true,
      );
    });

    it("dropdownPositions anchor to the end edge when dropdownAlign is 'end'", () => {
      host.dropdownAlign = "end";
      fixture.detectChanges();

      expect(select.dropdownPositions().every((p) => p.originX === "end")).toBe(
        true,
      );
      expect(select.dropdownPositions().every((p) => p.overlayX === "end")).toBe(
        true,
      );
    });

    it("selectedLabels should return labels of selected options", () => {
      host.control.setValue("Option 1");
      fixture.detectChanges();

      expect(select.selectedLabels()).toEqual(["Option 1"]);
    });

    it("selectedOptions should return selected option objects", () => {
      host.control.setValue("Option 1");
      fixture.detectChanges();

      const selected = select.selectedOptions();
      expect(selected.length).toBe(1);
      expect(selected[0].label).toBe("Option 1");
    });

    it("filteredOptions should filter by search term", () => {
      host.searchable = true;
      fixture.detectChanges();

      select.searchTerm.set("Option 1");

      expect(select.filteredOptions().length).toBe(1);
      expect(select.filteredOptions()[0].label).toBe("Option 1");
    });

    it("visibleSelectedValues should only include filtered options", fakeAsync(() => {
      host.allowMultiple =true;
      host.searchable = true;
      fixture.detectChanges();
      tick();

      select.selectedValues.set(["Option 1", "Option 2"]);
      fixture.detectChanges();
      tick();

      select.searchTerm.set("Option 1");
      fixture.detectChanges();
      tick();

      expect(select.visibleSelectedValues()).toEqual(["Option 1"]);
    }));

    it("should preserve hidden selections when selecting during search", fakeAsync(() => {
      host.allowMultiple = true;
      host.searchable = true;
      fixture.detectChanges();
      tick();

      // Pre-select Option 1 and Option 2
      select.selectedValues.set(["Option 1", "Option 2"]);
      fixture.detectChanges();
      tick();

      // Open and search for "Option 3" (hides Option 1 and Option 2)
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.value = "Option 3";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      // Select Option 3 from filtered results
      const options = getOptions();
      expect(options.length).toBe(1);
      options[0].click();
      fixture.detectChanges();
      tick();

      // All three should be selected (hidden Option 1/2 preserved)
      expect(select.selectedValues()).toEqual(expect.arrayContaining(["Option 1", "Option 2", "Option 3"]));
      expect(select.selectedValues().length).toBe(3);
    }));

    it("should not clear search term after multiselect selection", fakeAsync(() => {
      host.allowMultiple = true;
      host.searchable = true;
      fixture.detectChanges();
      tick();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.value = "Option 1";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[0].click();
      fixture.detectChanges();
      tick();

      expect(select.searchTerm()).toBe("Option 1");
    }));

    it("should clear search term when closing multiselect dropdown", fakeAsync(() => {
      host.allowMultiple = true;
      host.searchable = true;
      fixture.detectChanges();
      tick();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.value = "Option 1";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      // Close dropdown via arrow button
      const arrow = hostEl.querySelector(".tedi-select__arrow") as HTMLElement;
      arrow.click();
      fixture.detectChanges();
      tick();

      expect(select.searchTerm()).toBe("");
    }));

    it("optionGroups should group options correctly", () => {
      host.items = [
        { id: 1, name: "A1", group: "A" },
        { id: 2, name: "A2", group: "A" },
        { id: 3, name: "B1", group: "B" },
      ];
      host.bindLabel = "name";
      host.groupBy = "group";
      fixture.detectChanges();

      const groups = select.optionGroups();
      expect(groups.length).toBe(2);
      expect(groups[0].label).toBe("A");
      expect(groups[0].options.length).toBe(2);
      expect(groups[1].label).toBe("B");
      expect(groups[1].options.length).toBe(1);
    });

    it("hiddenTagsCount should return correct count", fakeAsync(() => {
      host.allowMultiple =true;
      fixture.detectChanges();
      tick();

      select.selectedValues.set(["Option 1", "Option 2", "Option 3"]);
      fixture.detectChanges();
      tick();

      select.visibleTagsCount.set(1);
      fixture.detectChanges();
      tick();

      expect(select.hiddenTagsCount()).toBe(2);
    }));
  });

  describe("Disabled options", () => {
    beforeEach(() => {
      host.items = [
        { id: 1, name: "Enabled", disabled: false },
        { id: 2, name: "Disabled", disabled: true },
        { id: 3, name: "Also Enabled", disabled: false },
      ];
      host.bindLabel = "name";
      host.bindValue = "id";
      fixture.detectChanges();
    });

    it("should mark disabled options", () => {
      const options = select.normalizedOptions();
      expect(options[0].disabled).toBe(false);
      expect(options[1].disabled).toBe(true);
      expect(options[2].disabled).toBe(false);
    });

    it("should skip disabled options in keyboard navigation", fakeAsync(() => {
      host.searchable = true;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      fixture.detectChanges();
      tick();

      const activeOption = document.querySelector(".cdk-option-active");
      expect(activeOption).toBeTruthy();
      expect(activeOption?.textContent).not.toContain("Disabled");
    }));

    it("select all should skip disabled options", fakeAsync(() => {
      host.allowMultiple =true;
      host.showSelectAll = true;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const selectAllOption = getSelectAllOption();
      selectAllOption.click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual([1, 3]);
      expect(select.selectedValues()).not.toContain(2);
    }));

    it("select all should preserve pre-selected disabled option values", fakeAsync(() => {
      host.allowMultiple =true;
      host.showSelectAll = true;
      fixture.detectChanges();

      host.control.setValue([2]);
      fixture.detectChanges();
      tick();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const selectAllOption = getSelectAllOption();
      selectAllOption.click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toContain(2);
      expect(select.selectedValues()).toContain(1);
      expect(select.selectedValues()).toContain(3);
    }));

    it("deselect all should preserve pre-selected disabled option values", fakeAsync(() => {
      host.allowMultiple =true;
      host.showSelectAll = true;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      // First select all to ensure all enabled options are selected
      const selectAllOption = getSelectAllOption();
      selectAllOption.click();
      fixture.detectChanges();
      tick();

      // Manually add the disabled value to simulate a pre-selected disabled option
      select.selectedValues.set([2, 1, 3]);
      fixture.detectChanges();
      tick();

      expect(select.allOptionsSelected()).toBe(true);

      // Now deselect all — disabled value (2) should remain
      selectAllOption.click();
      fixture.detectChanges();
      tick();

      expect(select.selectedValues()).toEqual([2]);
    }));
  });

  describe("Helper methods", () => {
    it("getLabel should return label for value", () => {
      expect(select.getLabel("Option 1")).toBe("Option 1");
    });

    it("getLabel should return stringified value if not found", () => {
      expect(select.getLabel("NonExistent")).toBe("NonExistent");
    });

    it("isOptionSelected should return true for selected value", () => {
      host.control.setValue("Option 1");
      fixture.detectChanges();

      expect(select.isOptionSelected("Option 1")).toBe(true);
      expect(select.isOptionSelected("Option 2")).toBe(false);
    });

    it("isGroupSelected should return true when all group options selected", fakeAsync(() => {
      host.items = [
        { id: 1, name: "A1", group: "A" },
        { id: 2, name: "A2", group: "A" },
      ];
      host.bindLabel = "name";
      host.bindValue = "id";
      host.groupBy = "group";
      host.allowMultiple =true;
      fixture.detectChanges();
      tick();

      host.control.setValue([1, 2]);
      fixture.detectChanges();
      tick();

      expect(select.isGroupSelected("A")).toBe(true);
    }));

    it("isGroupSelected should return false when not all group options selected", fakeAsync(() => {
      host.items = [
        { id: 1, name: "A1", group: "A" },
        { id: 2, name: "A2", group: "A" },
      ];
      host.bindLabel = "name";
      host.bindValue = "id";
      host.groupBy = "group";
      host.allowMultiple =true;
      fixture.detectChanges();
      tick();

      host.control.setValue([1]);
      fixture.detectChanges();
      tick();

      expect(select.isGroupSelected("A")).toBe(false);
    }));

    it("isGroupIndeterminate should return true when some group options selected", fakeAsync(() => {
      host.items = [
        { id: 1, name: "A1", group: "A" },
        { id: 2, name: "A2", group: "A" },
        { id: 3, name: "A3", group: "A" },
      ];
      host.bindLabel = "name";
      host.bindValue = "id";
      host.groupBy = "group";
      host.allowMultiple =true;
      fixture.detectChanges();
      tick();

      host.control.setValue([1]);
      fixture.detectChanges();
      tick();

      expect(select.isGroupIndeterminate("A")).toBe(true);
    }));

    it("isGroupIndeterminate should return false when all group options selected", fakeAsync(() => {
      host.items = [
        { id: 1, name: "A1", group: "A" },
        { id: 2, name: "A2", group: "A" },
      ];
      host.bindLabel = "name";
      host.bindValue = "id";
      host.groupBy = "group";
      host.allowMultiple =true;
      fixture.detectChanges();
      tick();

      host.control.setValue([1, 2]);
      fixture.detectChanges();
      tick();

      expect(select.isGroupIndeterminate("A")).toBe(false);
    }));

    it("isGroupIndeterminate should return false when no group options selected", fakeAsync(() => {
      host.items = [
        { id: 1, name: "A1", group: "A" },
        { id: 2, name: "A2", group: "A" },
      ];
      host.bindLabel = "name";
      host.bindValue = "id";
      host.groupBy = "group";
      host.allowMultiple =true;
      fixture.detectChanges();
      tick();

      host.control.setValue([]);
      fixture.detectChanges();
      tick();

      expect(select.isGroupIndeterminate("A")).toBe(false);
    }));

    it("isGroupIndeterminate should return false for non-existent group", fakeAsync(() => {
      host.items = [
        { id: 1, name: "A1", group: "A" },
      ];
      host.bindLabel = "name";
      host.bindValue = "id";
      host.groupBy = "group";
      host.allowMultiple =true;
      fixture.detectChanges();
      tick();

      expect(select.isGroupIndeterminate("B")).toBe(false);
    }));
  });

  describe("Additional coverage", () => {
    describe("groupBy as function", () => {
      it("should use groupBy function when provided", () => {
        host.items = [
          { id: 1, name: "Apple", type: "fruit" },
          { id: 2, name: "Carrot", type: "vegetable" },
        ];
        host.bindLabel = "name";
        host.bindValue = "id";
        // Use a function for groupBy
        (host as any).groupBy = (item: any) => item.type.toUpperCase();
        fixture.detectChanges();

        const options = select.normalizedOptions();
        expect(options[0].group).toBe("FRUIT");
        expect(options[1].group).toBe("VEGETABLE");
      });
    });

    describe("Window resize", () => {
      it("should reset visibleTagsCount on resize for single-row multiselect", () => {
        host.allowMultiple =true;
        host.multiRow = false;
        fixture.detectChanges();

        select.selectedValues.set(["Option 1", "Option 2"]);
        select.visibleTagsCount.set(1);

        expect(select.visibleTagsCount()).toBe(1);

        select.onWindowResize();

        expect(select.visibleTagsCount()).toBeNull();
      });

      it("should not reset visibleTagsCount when multiRow is true", () => {
        host.allowMultiple =true;
        host.multiRow = true;
        fixture.detectChanges();

        select.selectedValues.set(["Option 1", "Option 2"]);
        select.visibleTagsCount.set(1);

        select.onWindowResize();

        expect(select.visibleTagsCount()).toBe(1);
      });
    });

    describe("Navigation with all disabled options", () => {
      it("should not activate any option when all options are disabled", fakeAsync(() => {
        host.items = [
          { id: 1, name: "Disabled 1", disabled: true },
          { id: 2, name: "Disabled 2", disabled: true },
        ];
        host.bindLabel = "name";
        host.bindValue = "id";
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        const activeOption = document.querySelector(".cdk-option-active");
        expect(activeOption).toBeFalsy();
      }));
    });

    describe("Searchable keyboard - closed dropdown", () => {
      beforeEach(() => {
        host.searchable = true;
        fixture.detectChanges();
      });

      it("ArrowDown should open dropdown when closed", fakeAsync(() => {
        expect(select.isOpen()).toBe(false);

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        expect(select.isOpen()).toBe(true);
      }));

      it("ArrowUp should open dropdown when closed", fakeAsync(() => {
        expect(select.isOpen()).toBe(false);

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
        fixture.detectChanges();
        tick();

        expect(select.isOpen()).toBe(true);
      }));

      it("Space should open dropdown when closed", fakeAsync(() => {
        expect(select.isOpen()).toBe(false);

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
        fixture.detectChanges();
        tick();

        expect(select.isOpen()).toBe(true);
      }));

      it("Enter should open dropdown when closed", fakeAsync(() => {
        expect(select.isOpen()).toBe(false);

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        fixture.detectChanges();
        tick();

        expect(select.isOpen()).toBe(true);
      }));
    });

    describe("Keyboard selection via Enter", () => {
      it("should select option via keyboard navigation in multiselect", fakeAsync(() => {
        host.allowMultiple =true;
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        fixture.detectChanges();
        tick();

        expect(select.selectedValues().length).toBeGreaterThan(0);
        expect(select.isOpen()).toBe(true);
      }));
    });

    describe("Multiselect searchable focus", () => {
      it("should focus search input after selection in searchable multiselect", fakeAsync(() => {
        host.allowMultiple =true;
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        const focusSpy = jest.spyOn(input, "focus");

        const options = getOptions();
        options[0].click();
        fixture.detectChanges();
        tick();

        expect(focusSpy).toHaveBeenCalled();
      }));
    });

    describe("getOriginalItem edge cases", () => {
      it("should return option.value when bindValue is not set", () => {
        const item = { name: "Test" };
        host.items = [item];
        host.bindLabel = "name";
        host.bindValue = undefined;
        fixture.detectChanges();

        const option = select.normalizedOptions()[0];
        const result = select.getOriginalItem(option);

        expect(result).toBe(item);
      });

      it("should return option as fallback when item not found", () => {
        host.items = [{ id: 1, name: "Test" }];
        host.bindLabel = "name";
        host.bindValue = "id";
        fixture.detectChanges();

        const fakeOption = { value: 999, label: "Fake" };
        const result = select.getOriginalItem(fakeOption);

        expect(result).toEqual(fakeOption);
      });
    });

    describe("setDropdownWidth edge cases", () => {
      it("should set dropdownWidth to null when dropdownWidthRef is explicitly null", () => {
        host.dropdownWidthRef = null;
        fixture.detectChanges();

        select.ngAfterContentChecked();

        expect(select.dropdownWidth()).toBeNull();
      });

      it("should set dropdownWidth based on host element width when dropdownWidthRef is undefined", () => {
        host.dropdownWidthRef = undefined;
        fixture.detectChanges();

        select.ngAfterContentChecked();

        expect(select.dropdownWidth()).toBeDefined();
      });
    });

    describe("toggleGroupSelection deselect", () => {
      it("should deselect group when all group options are selected", fakeAsync(() => {
        host.items = [
          { id: 1, name: "A1", category: "A" },
          { id: 2, name: "A2", category: "A" },
          { id: 3, name: "B1", category: "B" },
        ];
        host.bindLabel = "name";
        host.bindValue = "id";
        host.groupBy = "category";
        host.allowMultiple =true;
        host.selectableGroups = true;
        fixture.detectChanges();
        tick();

        select.selectedValues.set([1, 2, 3]);
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        const groupHeaders = document.querySelectorAll(".tedi-select__group-name--selectable");
        (groupHeaders[0] as HTMLElement).click();
        fixture.detectChanges();
        tick();

        expect(select.selectedValues()).toEqual([3]);
      }));
    });

    describe("Active option tracking", () => {
      it("should show active state on navigated option", fakeAsync(() => {
        host.allowMultiple =true;
        host.showSelectAll = true;
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        const activeOption = document.querySelector(".cdk-option-active");
        expect(activeOption).toBeTruthy();
      }));
    });

    describe("deselect when disabled", () => {
      it("should not deselect when component is disabled", fakeAsync(() => {
        host.allowMultiple =true;
        host.clearableTags = true;
        fixture.detectChanges();
        tick();

        select.selectedValues.set(["Option 1", "Option 2"]);
        fixture.detectChanges();
        tick();

        select.setDisabledState(true);
        fixture.detectChanges();
        tick();

        const event = new Event("click");
        select.deselect(event, "Option 1");
        fixture.detectChanges();
        tick();

        expect(select.selectedValues()).toEqual(["Option 1", "Option 2"]);
      }));
    });

    describe("handleValueChange", () => {
      it("should handle group selection via listbox value change", fakeAsync(() => {
        host.items = [
          { id: 1, name: "A1", category: "A" },
          { id: 2, name: "A2", category: "A" },
        ];
        host.bindLabel = "name";
        host.bindValue = "id";
        host.groupBy = "category";
        host.allowMultiple =true;
        host.selectableGroups = true;
        fixture.detectChanges();
        tick();

        select.handleValueChange({ value: [SpecialOptionControls.SELECT_GROUP + "A"] });
        fixture.detectChanges();
        tick();

        expect(select.selectedValues()).toEqual([1, 2]);
      }));
    });

    describe("ArrowUp navigation", () => {
      it("ArrowUp should navigate when open", fakeAsync(() => {
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
        fixture.detectChanges();
        tick();

        const activeOption = document.querySelector(".cdk-option-active");
        expect(activeOption).toBeTruthy();
      }));
    });

    describe("Space key when dropdown is open", () => {
      it("should allow typing space in search input when dropdown is open", fakeAsync(() => {
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        expect(select.isOpen()).toBe(true);

        const input = getSearchInput();
        const event = new KeyboardEvent("keydown", { key: " " });
        const preventDefaultSpy = jest.spyOn(event, "preventDefault");

        input.dispatchEvent(event);
        fixture.detectChanges();
        tick();

        expect(preventDefaultSpy).not.toHaveBeenCalled();
      }));
    });

    describe("Wrapping navigation", () => {
      it("should wrap navigation in listbox", fakeAsync(() => {
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        const activeOption = document.querySelector(".cdk-option-active");
        expect(activeOption).toBeTruthy();
      }));
    });

    describe("Empty filtered options", () => {
      it("should handle empty filtered options gracefully", fakeAsync(() => {
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        select.searchTerm.set("xyz");
        fixture.detectChanges();
        tick();

        expect(select.filteredOptions()).toEqual([]);

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        const activeOption = document.querySelector(".cdk-option-active");
        expect(activeOption).toBeFalsy();
      }));
    });

    describe("Recursive skip disabled", () => {
      it("should skip multiple consecutive disabled options", fakeAsync(() => {
        host.items = [
          { id: 1, name: "Enabled", disabled: false },
          { id: 2, name: "Disabled 1", disabled: true },
          { id: 3, name: "Disabled 2", disabled: true },
          { id: 4, name: "Also Enabled", disabled: false },
        ];
        host.bindLabel = "name";
        host.bindValue = "id";
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        const activeOption = document.querySelector(".cdk-option-active");
        expect(activeOption).toBeTruthy();
        expect(activeOption?.textContent).not.toContain("Disabled");
      }));
    });
  });

  describe("maxDropdownHeight", () => {
    it("should use provided maxDropdownHeight value when set", fakeAsync(() => {
      host.maxDropdownHeight = 200;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const dropdown = getDropdown();
      expect(dropdown.style.maxHeight).toBe("200px");
    }));

    it("should calculate maxHeight from viewport when maxDropdownHeight is not set", fakeAsync(() => {
      host.maxDropdownHeight = undefined;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const dropdown = getDropdown();
      expect(dropdown.style.maxHeight).toBeTruthy();
    }));
  });

  describe("toggleIsOpen closing", () => {
    it("should close dropdown when toggling an open non-searchable select", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();
      expect(select.isOpen()).toBe(true);

      getTrigger().click();
      fixture.detectChanges();
      tick();
      expect(select.isOpen()).toBe(false);
    }));
  });

  describe("arrow click", () => {
    it("should close an open searchable select when clicking the arrow", fakeAsync(() => {
      host.searchable = true;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();
      expect(select.isOpen()).toBe(true);

      const arrow = hostEl.querySelector(".tedi-select__arrow") as HTMLElement;
      arrow.click();
      fixture.detectChanges();
      tick();
      expect(select.isOpen()).toBe(false);
    }));

    it("should open a closed searchable select when clicking the arrow", fakeAsync(() => {
      host.searchable = true;
      fixture.detectChanges();
      expect(select.isOpen()).toBe(false);

      const arrow = hostEl.querySelector(".tedi-select__arrow") as HTMLElement;
      arrow.click();
      fixture.detectChanges();
      tick();
      expect(select.isOpen()).toBe(true);
    }));

    it("should render the arrow as a decorative span, not a button", () => {
      const arrow = hostEl.querySelector(".tedi-select__arrow") as HTMLElement;
      expect(arrow.tagName).toBe("SPAN");
      expect(arrow.getAttribute("aria-hidden")).toBe("true");
    });
  });

  describe("label tooltip", () => {
    it("should not render the tooltip info button by default", () => {
      expect(hostEl.querySelector("[tedi-info-button]")).toBeNull();
    });

    it("should render the tooltip info button as a sibling of the label when tooltip is set", () => {
      host.tooltip = "More info about this field";
      fixture.detectChanges();

      const labelRow = hostEl.querySelector("tedi-label-row");
      expect(labelRow).toBeTruthy();
      const infoButton = labelRow?.querySelector("[tedi-info-button]");
      expect(infoButton).toBeTruthy();
      expect(getLabel().contains(infoButton as Node)).toBe(false);
    });

    it("should not open the dropdown when clicking the tooltip info button", fakeAsync(() => {
      host.tooltip = "More info about this field";
      fixture.detectChanges();

      const infoButton = hostEl.querySelector("[tedi-info-button]") as HTMLElement;
      infoButton.click();
      fixture.detectChanges();
      tick();

      expect(select.isOpen()).toBe(false);
    }));

    it("should restore focus to the trigger, not the tooltip, when closing with a tooltip present", fakeAsync(() => {
      host.tooltip = "More info about this field";
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();
      expect(select.isOpen()).toBe(true);

      select.toggleIsOpen(true);
      fixture.detectChanges();
      tick();

      expect(select.triggerRef()?.nativeElement).toBe(getTrigger());
      expect(document.activeElement).toBe(getTrigger());
    }));
  });

  describe("external label association", () => {
    it("should reference the built-in label via aria-labelledby on the trigger", () => {
      expect(getTrigger().getAttribute("aria-labelledby")).toBe(
        getLabel().getAttribute("id"),
      );
    });

    it("should fall back to a consumer aria-labelledby when there is no built-in label", () => {
      host.label = "";
      host.ariaLabelledby = "external-label-id";
      fixture.detectChanges();

      expect(getTrigger().getAttribute("aria-labelledby")).toBe("external-label-id");
      expect(getTrigger().getAttribute("aria-label")).toBeNull();
    });

    it("should prefer the built-in label over a consumer aria-labelledby", () => {
      host.ariaLabelledby = "external-label-id";
      fixture.detectChanges();

      expect(getTrigger().getAttribute("aria-labelledby")).toBe(
        getLabel().getAttribute("id"),
      );
    });

    it("should expose aria-label when no labelledby reference is available", () => {
      host.label = "";
      host.ariaLabel = "Page size";
      fixture.detectChanges();

      expect(getTrigger().getAttribute("aria-label")).toBe("Page size");
      expect(getTrigger().getAttribute("aria-labelledby")).toBeNull();
    });

    it("should open the dropdown when clicking an external label referenced via ariaLabelledby", fakeAsync(() => {
      const externalLabel = document.createElement("span");
      externalLabel.id = "external-label-id";
      document.body.appendChild(externalLabel);

      try {
        host.label = "";
        host.ariaLabelledby = "external-label-id";
        fixture.detectChanges();
        tick();

        externalLabel.click();
        fixture.detectChanges();
        tick();

        expect(select.isOpen()).toBe(true);

        select.toggleIsOpen(true);
        tick();
      } finally {
        document.body.removeChild(externalLabel);
      }
    }));

    it("should not wire external label clicks when the built-in label is set", fakeAsync(() => {
      const externalLabel = document.createElement("span");
      externalLabel.id = "external-label-id";
      document.body.appendChild(externalLabel);

      try {
        host.ariaLabelledby = "external-label-id";
        fixture.detectChanges();
        tick();

        externalLabel.click();
        fixture.detectChanges();
        tick();

        expect(select.isOpen()).toBe(false);
      } finally {
        document.body.removeChild(externalLabel);
      }
    }));

    it("should wire clicks for every id in a space-separated ariaLabelledby", fakeAsync(() => {
      const labelA = document.createElement("span");
      labelA.id = "ext-label-a";
      const labelB = document.createElement("span");
      labelB.id = "ext-label-b";
      document.body.appendChild(labelA);
      document.body.appendChild(labelB);

      try {
        host.label = "";
        host.ariaLabelledby = "ext-label-a ext-label-b";
        fixture.detectChanges();
        tick();

        labelB.click();
        fixture.detectChanges();
        tick();

        expect(select.isOpen()).toBe(true);

        select.toggleIsOpen(true);
        tick();
      } finally {
        document.body.removeChild(labelA);
        document.body.removeChild(labelB);
      }
    }));
  });

  describe("search focus and blur", () => {
    it("should set searchFocused to false and mark as touched on blur", fakeAsync(() => {
      host.searchable = true;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const searchInput = getSearchInput();
      searchInput.dispatchEvent(new Event("focus"));
      fixture.detectChanges();
      expect(select.searchFocused()).toBe(true);

      searchInput.dispatchEvent(new Event("blur"));
      fixture.detectChanges();
      expect(select.searchFocused()).toBe(false);
    }));
  });

  describe("template context guards", () => {
    it("SelectOptionTemplateDirective ngTemplateContextGuard should return true", () => {
      expect(
        SelectOptionTemplateDirective.ngTemplateContextGuard({} as SelectOptionTemplateDirective, {})
      ).toBe(true);
    });

    it("SelectValueTemplateDirective ngTemplateContextGuard should return true", () => {
      expect(
        SelectValueTemplateDirective.ngTemplateContextGuard({} as SelectValueTemplateDirective, {})
      ).toBe(true);
    });
  });

  describe("calculateVisibleTags", () => {
    let clientWidthSpy: jest.SpyInstance;
    let offsetWidthSpy: jest.SpyInstance;

    afterEach(() => {
      clientWidthSpy?.mockRestore();
      offsetWidthSpy?.mockRestore();
    });

    it("should calculate visible tags for single-row multiselect", fakeAsync(() => {
      host.allowMultiple =true;
      host.multiRow = false;
      host.clearableTags = true;
      host.items = ["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5"];
      host.control.setValue(["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5"]);

      // Mock trigger clientWidth=300, arrow offsetWidth=24, each tag=60
      clientWidthSpy = jest.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("tedi-select__trigger")) return 300;
        return 0;
      });
      offsetWidthSpy = jest.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("tedi-select__arrow")) return 24;
        if (this.tagName === "TEDI-TAG") return 60;
        return 0;
      });

      fixture.detectChanges();
      tick();

      expect(select.visibleTagsCount()).toBeGreaterThanOrEqual(1);
    }));

    it("should show at least one tag even if none fit", fakeAsync(() => {
      host.allowMultiple =true;
      host.multiRow = false;
      host.clearableTags = true;
      host.items = ["Tag 1", "Tag 2"];
      host.control.setValue(["Tag 1", "Tag 2"]);

      // Trigger very small, tags too wide
      clientWidthSpy = jest.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("tedi-select__trigger")) return 50;
        return 0;
      });
      offsetWidthSpy = jest.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("tedi-select__arrow")) return 24;
        if (this.tagName === "TEDI-TAG") return 100;
        return 0;
      });

      fixture.detectChanges();
      tick();

      expect(select.visibleTagsCount()).toBe(1);
    }));
  });

  describe("clearSearchOnSelect", () => {
    it("should clear search term after picking an option in searchable multiselect when true", fakeAsync(() => {
      host.allowMultiple = true;
      host.searchable = true;
      host.clearSearchOnSelect = true;
      fixture.detectChanges();
      tick();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.value = "Option 1";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[0].click();
      fixture.detectChanges();
      tick();

      expect(select.searchTerm()).toBe("");
    }));

    it("should keep search term after picking an option in searchable multiselect when false (default)", fakeAsync(() => {
      host.allowMultiple = true;
      host.searchable = true;
      fixture.detectChanges();
      tick();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      input.value = "Option 1";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[0].click();
      fixture.detectChanges();
      tick();

      expect(select.searchTerm()).toBe("Option 1");
    }));
  });

  describe("Outputs", () => {
    it("selectionChange should emit the new value on single-select pick", fakeAsync(() => {
      const spy = jest.fn();
      select.selectionChange.subscribe(spy);

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[0].click();
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledWith("Option 1");
    }));

    it("selectionChange should emit the array on multi-select pick", fakeAsync(() => {
      host.allowMultiple = true;
      fixture.detectChanges();

      const spy = jest.fn();
      select.selectionChange.subscribe(spy);

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const options = getOptions();
      options[0].click();
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledWith(["Option 1"]);
    }));

    it("selectionChange should emit on tag deselect", fakeAsync(() => {
      host.allowMultiple = true;
      host.clearableTags = true;
      fixture.detectChanges();
      host.control.setValue(["Option 1", "Option 2"]);
      fixture.detectChanges();
      tick();

      const spy = jest.fn();
      select.selectionChange.subscribe(spy);

      const tags = getTags();
      const closeBtn = tags[0].querySelector("[tedi-closing-button]") as HTMLElement;
      closeBtn.click();
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledWith(["Option 2"]);
    }));

    it("selectionChange should emit on select-all", fakeAsync(() => {
      host.allowMultiple = true;
      host.showSelectAll = true;
      fixture.detectChanges();

      const spy = jest.fn();
      select.selectionChange.subscribe(spy);

      getTrigger().click();
      fixture.detectChanges();
      tick();

      getSelectAllOption().click();
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledWith(["Option 1", "Option 2", "Option 3"]);
    }));

    it("selectionChange should emit on group toggle", fakeAsync(() => {
      host.items = [
        { id: 1, name: "A1", category: "A" },
        { id: 2, name: "A2", category: "A" },
      ];
      host.bindLabel = "name";
      host.bindValue = "id";
      host.groupBy = "category";
      host.allowMultiple = true;
      host.selectableGroups = true;
      fixture.detectChanges();
      tick();

      const spy = jest.fn();
      select.selectionChange.subscribe(spy);

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const groupHeaders = document.querySelectorAll(".tedi-select__group-name--selectable");
      (groupHeaders[0] as HTMLElement).click();
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledWith([1, 2]);
    }));

    it("selectionChange should emit null on clear in single-select", fakeAsync(() => {
      host.control.setValue("Option 1");
      fixture.detectChanges();
      tick();

      const spy = jest.fn();
      select.selectionChange.subscribe(spy);

      getClearButton().click();
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledWith(null);
    }));

    it("selectionChange should emit empty array on clear in multi-select", fakeAsync(() => {
      host.allowMultiple = true;
      fixture.detectChanges();
      host.control.setValue(["Option 1", "Option 2"]);
      fixture.detectChanges();
      tick();

      const spy = jest.fn();
      select.selectionChange.subscribe(spy);

      getClearButton().click();
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledWith([]);
    }));

    it("cleared should emit on clear button click", fakeAsync(() => {
      host.control.setValue("Option 1");
      fixture.detectChanges();
      tick();

      const spy = jest.fn();
      select.cleared.subscribe(spy);

      getClearButton().click();
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledTimes(1);
    }));

    it("searchChange should emit the current search term", fakeAsync(() => {
      host.searchable = true;
      fixture.detectChanges();

      const spy = jest.fn();
      select.searchChange.subscribe(spy);

      const input = getSearchInput();
      input.value = "Opt";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledWith("Opt");
    }));

    it("opened should emit when dropdown opens", fakeAsync(() => {
      const spy = jest.fn();
      select.opened.subscribe(spy);

      getTrigger().click();
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledTimes(1);
    }));

    it("closed should emit when dropdown closes via outside click", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const spy = jest.fn();
      select.closed.subscribe(spy);

      document.body.click();
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledTimes(1);
    }));

    it("closed should emit when dropdown closes via toggle", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const spy = jest.fn();
      select.closed.subscribe(spy);

      getTrigger().click();
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledTimes(1);
    }));

    it("opened should not emit when already open", fakeAsync(() => {
      getTrigger().click();
      fixture.detectChanges();
      tick();

      const spy = jest.fn();
      select.opened.subscribe(spy);

      // Trigger another open while already open
      (select as any).openDropdown();
      fixture.detectChanges();
      tick();

      expect(spy).not.toHaveBeenCalled();
    }));
  });
});
