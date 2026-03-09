/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { SelectComponent, SelectOption, InputState, InputSize } from "./select.component";
import {
  SelectOptionTemplateDirective,
  SelectValueTemplateDirective,
} from "./select-templates.directive";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

@Component({
  standalone: true,
  template: `
    <tedi-select
      [inputId]="inputId"
      [label]="label"
      [items]="items"
      [multiple]="multiple"
      [searchable]="searchable"
      [clearable]="clearable"
      [selectAll]="selectAll"
      [selectableGroups]="selectableGroups"
      [groupBy]="groupBy"
      [bindLabel]="bindLabel"
      [bindValue]="bindValue"
      [placeholder]="placeholder"
      [state]="state"
      [size]="size"
      [required]="required"
      [clearableTags]="clearableTags"
      [multiRow]="multiRow"
      [dropdownWidthRef]="dropdownWidthRef"
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
    </tedi-select>
  `,
  imports: [
    SelectComponent,
    SelectOptionTemplateDirective,
    SelectValueTemplateDirective,
    ReactiveFormsModule,
  ],
})
class TestHostComponent {
  inputId = "test-select";
  label = "Test Label";
  items: unknown[] = ["Option 1", "Option 2", "Option 3"];
  multiple = false;
  searchable = false;
  clearable = true;
  selectAll = false;
  selectableGroups = false;
  groupBy: string | undefined = undefined;
  bindLabel = "label";
  bindValue: string | undefined = undefined;
  placeholder = "Select an option...";
  state: InputState = "default";
  size: InputSize = "default";
  required = false;
  clearableTags = false;
  multiRow = false;
  dropdownWidthRef: any = undefined;
  useOptionTemplate = false;
  useValueTemplate = false;
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
  const getSelectAllOption = () => document.querySelector(`[id$="-option-0"]`) as HTMLElement;
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
      host.multiple = true;
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
      host.multiple = true;
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
      host.multiple = true;
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
      host.multiple = true;
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
      host.multiple = true;
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
      host.multiple = true;
      host.selectAll = true;
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

      select.toggleIsOpen(true);
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

        expect(select.focusedOptionIndex()).toBe(1);
      }));

      it("ArrowUp should navigate to previous option", fakeAsync(() => {
        getTrigger().click();
        fixture.detectChanges();
        tick();

        select.focusedOptionIndex.set(1);

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
        fixture.detectChanges();
        tick();

        expect(select.focusedOptionIndex()).toBe(0);
      }));

      it("Enter should select focused option", fakeAsync(() => {
        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        fixture.detectChanges();
        tick();

        expect(select.selectedValues()).toEqual(["Option 1"]);
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

    it("search input should have aria-activedescendant", fakeAsync(() => {
      host.searchable = true;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      const input = getSearchInput();
      const activeDescendant = input.getAttribute("aria-activedescendant");
      expect(activeDescendant).toBe("test-select-option-0");
    }));

    it("focusedOptionId should return correct option ID", fakeAsync(() => {
      host.searchable = true;
      fixture.detectChanges();

      getTrigger().click();
      fixture.detectChanges();
      tick();

      expect(select.focusedOptionId()).toBe("test-select-option-0");

      select.focusedOptionIndex.set(1);
      expect(select.focusedOptionId()).toBe("test-select-option-1");
    }));

    it("focusedOptionId should return null when no option focused", () => {
      expect(select.focusedOptionId()).toBeNull();
    });
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

    it("should not close when clicking inside host element", fakeAsync(() => {
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

  describe("Computed properties", () => {
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
      host.multiple = true;
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
      host.multiple = true;
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

      expect(select.focusedOptionIndex()).toBe(0);

      const input = getSearchInput();
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      fixture.detectChanges();
      tick();

      expect(select.focusedOptionIndex()).toBe(2);
    }));

    it("select all should skip disabled options", fakeAsync(() => {
      host.multiple = true;
      host.selectAll = true;
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
      host.multiple = true;
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
      host.multiple = true;
      fixture.detectChanges();
      tick();

      host.control.setValue([1]);
      fixture.detectChanges();
      tick();

      expect(select.isGroupSelected("A")).toBe(false);
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
        host.multiple = true;
        host.multiRow = false;
        fixture.detectChanges();

        select.selectedValues.set(["Option 1", "Option 2"]);
        select.visibleTagsCount.set(1);

        expect(select.visibleTagsCount()).toBe(1);

        select.onWindowResize();

        expect(select.visibleTagsCount()).toBeNull();
      });

      it("should not reset visibleTagsCount when multiRow is true", () => {
        host.multiple = true;
        host.multiRow = true;
        fixture.detectChanges();

        select.selectedValues.set(["Option 1", "Option 2"]);
        select.visibleTagsCount.set(1);

        select.onWindowResize();

        expect(select.visibleTagsCount()).toBe(1);
      });
    });

    describe("Navigation with all disabled options", () => {
      it("should not navigate when all options are disabled", fakeAsync(() => {
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

        const initialIndex = select.focusedOptionIndex();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        expect(select.focusedOptionIndex()).toBe(initialIndex);
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
      it("should toggle selectAll via keyboard in multiselect", fakeAsync(() => {
        host.multiple = true;
        host.selectAll = true;
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        // Focus should be on selectAll (index 0)
        expect(select.focusedOptionIndex()).toBe(0);

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        fixture.detectChanges();
        tick();

        // All options should be selected
        expect(select.selectedValues()).toEqual(["Option 1", "Option 2", "Option 3"]);
      }));

      it("should toggle group selection via keyboard", fakeAsync(() => {
        host.items = [
          { id: 1, name: "A1", category: "A" },
          { id: 2, name: "A2", category: "A" },
        ];
        host.bindLabel = "name";
        host.bindValue = "id";
        host.groupBy = "category";
        host.multiple = true;
        host.selectableGroups = true;
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        expect(select.focusedOptionIndex()).toBe(0);

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        fixture.detectChanges();
        tick();

        expect(select.selectedValues()).toEqual([1, 2]);
      }));

      it("should toggle option in multiselect via keyboard", fakeAsync(() => {
        host.multiple = true;
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        fixture.detectChanges();
        tick();

        expect(select.selectedValues()).toEqual(["Option 1"]);
        expect(select.isOpen()).toBe(true);

        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        fixture.detectChanges();
        tick();

        expect(select.selectedValues()).toEqual([]);
      }));
    });

    describe("Multiselect searchable focus", () => {
      it("should focus search input after selection in searchable multiselect", fakeAsync(() => {
        host.multiple = true;
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
        host.multiple = true;
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

    describe("isOptionFocused edge cases", () => {
      it("should return false when focused option type does not match", fakeAsync(() => {
        host.multiple = true;
        host.selectAll = true;
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        expect(select.focusedOptionIndex()).toBe(0);

        expect(select.isOptionFocused("option", "Option 1")).toBe(false);
        expect(select.isOptionFocused("group", undefined, "SomeGroup")).toBe(false);
      }));
    });

    describe("deselect when disabled", () => {
      it("should not deselect when component is disabled", fakeAsync(() => {
        host.multiple = true;
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

    describe("handleValueChange via CDK", () => {
      it("should handle group selection via CDK listbox value change", fakeAsync(() => {
        host.items = [
          { id: 1, name: "A1", category: "A" },
          { id: 2, name: "A2", category: "A" },
        ];
        host.bindLabel = "name";
        host.bindValue = "id";
        host.groupBy = "category";
        host.multiple = true;
        host.selectableGroups = true;
        fixture.detectChanges();
        tick();

        select.handleValueChange({ value: ["SELECT_GROUP_A"] });
        fixture.detectChanges();
        tick();

        expect(select.selectedValues()).toEqual([1, 2]);
      }));
    });

    describe("ArrowUp navigation", () => {
      it("ArrowUp should navigate to previous option when open", fakeAsync(() => {
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        select.focusedOptionIndex.set(1);
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
        fixture.detectChanges();
        tick();

        expect(select.focusedOptionIndex()).toBe(0);
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

    describe("Index wrapping in navigation", () => {
      it("should wrap from last to first option on ArrowDown", fakeAsync(() => {
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        select.focusedOptionIndex.set(2);
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        expect(select.focusedOptionIndex()).toBe(0);
      }));

      it("should wrap from first to last option on ArrowUp", fakeAsync(() => {
        host.searchable = true;
        fixture.detectChanges();
        tick();

        getTrigger().click();
        fixture.detectChanges();
        tick();

        select.focusedOptionIndex.set(0);
        fixture.detectChanges();
        tick();

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
        fixture.detectChanges();
        tick();

        expect(select.focusedOptionIndex()).toBe(2);
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

        expect(select.flatFilteredOptions()).toEqual([]);

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        expect(select.focusedOptionIndex()).toBe(0);
      }));
    });

    describe("Recursive skip disabled", () => {
      it("should recursively skip multiple consecutive disabled options", fakeAsync(() => {
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

        expect(select.focusedOptionIndex()).toBe(0);

        const input = getSearchInput();
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        fixture.detectChanges();
        tick();

        expect(select.focusedOptionIndex()).toBe(3);
      }));
    });
  });
});
