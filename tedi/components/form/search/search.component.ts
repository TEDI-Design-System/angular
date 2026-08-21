import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  model,
  numberAttribute,
  output,
  Renderer2,
  signal,
  untracked,
  viewChild,
  viewChildren,
  ViewEncapsulation,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ActiveDescendantKeyManager } from "@angular/cdk/a11y";
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedOverlayPositionChange,
  ConnectedPosition,
  OverlayModule,
} from "@angular/cdk/overlay";
import { DOCUMENT, NgTemplateOutlet } from "@angular/common";
import { ButtonComponent, ButtonVariant } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TextComponent } from "../../base/text/text.component";
import { SpinnerComponent } from "../../loader/spinner/spinner.component";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { ComponentInputs } from "../../../types/inputs.type";
import { getFocusableElements } from "../../../utils/elements.util";
import {
  FormFieldComponent,
  FormFieldIcon,
  InputSize,
} from "../form-field/form-field.component";
import { TextFieldComponent } from "../text-field/text-field.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { SearchOptionComponent } from "./search-option.component";
import {
  SearchFooterTemplateDirective,
  SearchSuggestionTemplateDirective,
} from "./search-templates.directive";

export type SearchSize = InputSize;

export interface SearchSuggestionView<T = unknown> {
  item: T;
  label: string;
}

export interface SearchButton {
  /**
   * Visible button text. When omitted, the button is rendered icon-only.
   */
  text?: string;
  /**
   * Icon shown inside the button.
   * @default "search"
   */
  icon?: string;
  /**
   * Button color variant.
   * @default "primary"
   */
  variant?: ButtonVariant;
  /**
   * Accessible label for an icon-only button.
   * @default translation "search"
   */
  ariaLabel?: string;
}

/**
 * Flush against the field, flipping above when it would overflow. Figma draws
 * the panel border meeting the field border, so there is no offset.
 */
const SEARCH_OVERLAY_POSITIONS: ConnectedPosition[] = [
  { originX: "start", originY: "bottom", overlayX: "start", overlayY: "top" },
  { originX: "start", originY: "top", overlayX: "start", overlayY: "bottom" },
];

@Component({
  selector: "tedi-search",
  standalone: true,
  templateUrl: "./search.component.html",
  styleUrl: "./search.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormFieldComponent,
    TextFieldComponent,
    LabelComponent,
    FeedbackTextComponent,
    ButtonComponent,
    IconComponent,
    TextComponent,
    SpinnerComponent,
    SearchOptionComponent,
    OverlayModule,
    NgTemplateOutlet,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComponent),
      multi: true,
    },
  ],
  host: {
    role: "search",
    class: "tedi-search",
    "(focusout)": "onFocusOut($event)",
    "[attr.aria-label]": "searchAriaLabel()",
    "[style.--tedi-search-field-height]": "fieldHeight()",
    "[class.tedi-search--button-icon-only]": "!!button() && !button()?.text",
  },
})
export class SearchComponent<T = unknown> implements ControlValueAccessor {
  /**
   * Unique identifier for the input element, used to associate the label.
   */
  inputId = input.required<string>();
  /**
   * Visible label text. When omitted, provide `ariaLabel` for accessibility.
   */
  label = input<string>();
  /**
   * Value of the search input. Supports two-way binding and reactive forms.
   */
  value = model<string>("");
  /**
   * Placeholder text for the search input.
   */
  placeholder = input<string>("");
  /**
   * Size of the search field.
   * @default "default"
   */
  size = input<SearchSize>("default");
  /**
   * Whether the input shows a clear button once it has a value.
   * @default true
   */
  clearable = input<boolean>(true);
  /**
   * Icon shown inside the input. Ignored when `button` is set.
   * @default "search"
   */
  searchIcon = input<string | FormFieldIcon>("search");
  /**
   * Whether the search field is disabled.
   * @default false
   */
  disabled = input<boolean>(false);
  /**
   * When set, renders a trailing search button and hides the inline icon.
   */
  button = input<SearchButton>();
  /**
   * FeedbackText component inputs (hint / validation message).
   */
  feedbackText = input<ComponentInputs<FeedbackTextComponent>>();
  /**
   * Accessible name for the search region. Falls back to `label`, then
   * `placeholder`, then the translated "search" label.
   */
  ariaLabel = input<string>();
  /**
   * Suggestions to show in the panel, already filtered by the consumer. Bind an
   * empty array to keep the combobox behaviour while nothing matches; leave it
   * unbound for a plain search field.
   */
  suggestions = input<T[] | undefined>(undefined);
  /**
   * Property holding the display label when suggestions are objects.
   * @default "label"
   */
  bindLabel = input<string>("label");
  /**
   * Characters required before the panel opens. Below it nothing is shown, not
   * even the no-results row, so short queries stay quiet.
   * @default 0
   */
  minQueryLength = input(0, { transform: numberAttribute });
  /**
   * Shows a loading row instead of results.
   * @default false
   */
  loading = input(false, { transform: booleanAttribute });
  /**
   * Closes the suggestion panel when the page (or a scrollable ancestor)
   * scrolls. Scrolling the option list itself keeps the panel open.
   * @default false
   */
  hideOnScroll = input(false, { transform: booleanAttribute });
  /**
   * Whether the suggestion panel is open.
   * @default false
   */
  panelOpen = model<boolean>(false);

  /**
   * Emitted when the search is executed (Enter key or button click).
   */
  readonly searchEvent = output<string>();
  /**
   * Emitted when the clear button is clicked.
   */
  readonly clear = output<void>();
  /**
   * Emitted when a suggestion is accepted. The field is filled with its label.
   */
  readonly suggestionSelect = output<T>();

  readonly suggestionTemplate = contentChild(SearchSuggestionTemplateDirective);
  readonly footerTemplate = contentChild(SearchFooterTemplateDirective);

  private readonly inputRef = viewChild("searchInput", { read: ElementRef });
  private readonly overlayOrigin = viewChild.required(CdkOverlayOrigin);
  private readonly connectedOverlay = viewChild(CdkConnectedOverlay);
  private readonly options = viewChildren(SearchOptionComponent);

  private readonly formDisabled = signal(false);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly translationService = inject(TediTranslationService);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private scrollListener?: () => void;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  /** Suppresses the focus-driven reopen after a selection, until the next edit. */
  private justSelected = false;
  /**
   * Navigation is driven from `event.key` via the explicit `set*ItemActive`
   * methods rather than `keyManager.onKeydown`, which switches on the deprecated
   * `event.keyCode` and so ignores synthesised events.
   */
  private readonly keyManager = new ActiveDescendantKeyManager(
    this.options,
    this.injector,
  ).withWrap();

  private readonly activeIndex = signal(-1);

  readonly overlayPositions = SEARCH_OVERLAY_POSITIONS;
  readonly panelWidth = signal(0);
  /**
   * True while the panel sits above the field on the fallback position, so the
   * rounded edge can move to the side that is not joined to the field.
   */
  readonly panelAbove = signal(false);

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  readonly fieldIcon = computed(() =>
    this.button() ? undefined : this.searchIcon()
  );

  readonly fieldHeight = computed(() => {
    switch (this.size()) {
      case "small":
        return "var(--form-field-height-sm)";
      case "large":
        return "var(--form-field-height-lg)";
      default:
        return "var(--form-field-height)";
    }
  });

  readonly buttonSize = computed(() =>
    this.size() === "small" ? "small" : "default"
  );

  readonly buttonIconSize = computed(() => (this.size() === "large" ? 24 : 18));

  readonly buttonAriaLabel = computed(() => {
    const button = this.button();
    if (button?.text) return null;
    return button?.ariaLabel ?? this.translationService.translate("search");
  });

  readonly feedbackId = computed(() =>
    this.feedbackText() ? `${this.inputId()}-feedback` : null
  );

  readonly searchAriaLabel = computed(
    () =>
      this.ariaLabel() ||
      this.label() ||
      this.placeholder() ||
      this.translationService.translate("search")
  );

  /**
   * Accessible name for the input itself. A visible `label` already names it
   * via `for`/`id`, so the attribute is only emitted when there is none —
   * otherwise `aria-label` would silently override the visible text.
   */
  readonly inputAriaLabel = computed(() =>
    this.label() ? null : this.searchAriaLabel()
  );

  /**
   * Derived from capability, never from current content — an empty
   * `suggestions` array still means the consumer opted into the combobox.
   */
  readonly autocomplete = computed(() => this.suggestions() !== undefined);

  readonly resolvedSuggestions = computed<SearchSuggestionView<T>[]>(() => {
    const items = this.suggestions() ?? [];
    const bindLabel = this.bindLabel();

    return items.map((item) => ({
      item,
      label:
        item !== null && typeof item === "object"
          ? String((item as Record<string, unknown>)[bindLabel] ?? item)
          : String(item),
    }));
  });

  readonly query = computed(() => this.value().trim());

  readonly hasSuggestions = computed(
    () => !this.loading() && this.resolvedSuggestions().length > 0
  );

  readonly listboxId = computed(() => `${this.inputId()}-listbox`);

  readonly meetsMinQueryLength = computed(
    () => this.query().length >= this.minQueryLength(),
  );

  readonly panelVisible = computed(() => {
    if (!this.autocomplete() || !this.panelOpen()) return false;
    if (!this.meetsMinQueryLength()) return false;

    return this.loading() || this.hasSuggestions() || this.query().length > 0;
  });

  readonly inputRole = computed(() =>
    this.autocomplete() ? "combobox" : "searchbox"
  );

  readonly ariaAutocomplete = computed(() =>
    this.autocomplete() ? "list" : null
  );

  readonly ariaExpanded = computed(() =>
    this.autocomplete() ? this.panelVisible() : null
  );

  readonly ariaControls = computed(() =>
    this.panelVisible() && this.hasSuggestions() ? this.listboxId() : null
  );

  readonly activeOptionId = computed(() => {
    const index = this.activeIndex();
    return index >= 0 ? this.optionId(index) : null;
  });

  readonly noResultsText = computed(() =>
    this.translationService.translate("search.no-results")
  );

  readonly searchingText = computed(() =>
    this.translationService.translate("search.searching")
  );

  readonly announcement = computed(() => {
    if (!this.panelVisible()) return "";
    if (this.loading()) return this.searchingText();

    const count = this.resolvedSuggestions().length;
    return count
      ? this.translationService.translate("search.results-count", count)
      : this.noResultsText();
  });

  constructor() {
    this.keyManager.change.pipe(takeUntilDestroyed()).subscribe((index) => {
      this.activeIndex.set(index);
      this.keyManager.activeItem?.scrollIntoView();
    });

    // A stale active index would point at a different item once results change.
    // The reset runs untracked because `setActiveItem` reads the option query,
    // which would otherwise make this effect re-run on every render and clear
    // the option the user just highlighted.
    effect(() => {
      this.resolvedSuggestions();
      untracked(() => this.resetActiveOption());
    });
  }

  optionId(index: number): string {
    return `${this.inputId()}-opt-${index}`;
  }

  onInputValue(value: string): void {
    this.justSelected = false;
    this.value.set(value);
    this.onChange(value);

    if (this.autocomplete()) {
      this.openPanel();
    }
  }

  onClear(): void {
    this.clear.emit();
    this.onTouched();
  }

  onBlur(): void {
    this.onTouched();
  }

  onInputFocus(): void {
    if (this.justSelected) {
      this.justSelected = false;
      return;
    }

    this.openPanel();
  }

  openPanel(): void {
    if (!this.autocomplete()) return;

    this.panelWidth.set(this.hostElement.nativeElement.offsetWidth);
    this.panelOpen.set(true);
  }

  closePanel(): void {
    this.cleanupScrollListener();
    this.panelOpen.set(false);
    // The options leave the DOM with the panel, so a lingering active index
    // would leave `aria-activedescendant` pointing at a removed element.
    this.resetActiveOption();
  }

  onPositionChange(change: ConnectedOverlayPositionChange): void {
    this.panelAbove.set(change.connectionPair.overlayY === "bottom");
  }

  onOverlayAttach(): void {
    if (this.hideOnScroll()) {
      this.setupScrollListener();
    }
  }

  onOverlayDetach(): void {
    this.cleanupScrollListener();
  }

  /**
   * Listens on the document in the capture phase so scrolls in any ancestor are
   * seen — a scroll event does not bubble past the element that scrolled.
   */
  private setupScrollListener(): void {
    this.cleanupScrollListener();

    this.scrollListener = this.renderer.listen(
      this.document,
      "scroll",
      (event: Event) => {
        if (!this.panelVisible()) return;

        // Scrolling inside the component is not the page moving away from it:
        // the option list scrolls its own rows.
        const target = event.target as Node | null;
        const insideSearch =
          !!target &&
          (this.hostElement.nativeElement.contains(target) ||
            !!this.panelElement()?.contains(target));
        if (insideSearch) return;

        this.closePanel();
      },
      { capture: true, passive: true },
    );
  }

  private cleanupScrollListener(): void {
    if (this.scrollListener) {
      this.scrollListener();
      this.scrollListener = undefined;
    }
  }

  /** Closes the panel and hands focus back to the input. */
  closeAndRestoreFocus(): void {
    this.closePanel();
    this.justSelected = true;
    this.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.autocomplete()) {
      if (event.key === "Enter") this.emitSearch();
      return;
    }

    switch (event.key) {
      case "Escape":
        this.closePanel();
        return;

      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        this.onArrowKey(event);
        return;

      case "Home":
      case "End":
        if (!this.panelVisible() || !this.hasSuggestions()) return;
        event.preventDefault();
        if (event.key === "Home") {
          this.keyManager.setFirstItemActive();
        } else {
          this.keyManager.setLastItemActive();
        }
        return;

      case "Tab":
        this.onTabFromInput(event);
        return;

      case "Enter":
        this.onEnter(event);
        return;
    }
  }

  /**
   * Footer controls live in the overlay, which sits at the end of the document,
   * so they are not next in tab order. Tab reaches them explicitly; without this
   * they would be mouse-only.
   */
  private onTabFromInput(event: KeyboardEvent): void {
    if (event.shiftKey || !this.panelVisible()) return;

    const first = this.footerFocusables()[0];
    if (!first) return;

    event.preventDefault();
    first.focus();
  }

  /**
   * Tabbing past the footer leaves the component: close the panel and continue to
   * whatever follows the field in document order, so the footer is not a trap.
   */
  onFooterKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      this.closeAndRestoreFocus();
      return;
    }

    if (event.key !== "Tab") return;

    const focusables = this.footerFocusables();
    const index = focusables.indexOf(event.target as HTMLElement);

    if (event.shiftKey && index === 0) {
      event.preventDefault();
      this.justSelected = true;
      this.focus();
      return;
    }

    if (!event.shiftKey && index === focusables.length - 1) {
      event.preventDefault();
      this.closePanel();
      this.focusAfterField();
    }
  }

  private footerFocusables(): HTMLElement[] {
    const footer = this.panelElement()?.querySelector<HTMLElement>(
      ".tedi-search__footer",
    );

    return footer ? getFocusableElements(footer) : [];
  }

  private focusAfterField(): void {
    const input = this.inputRef()?.nativeElement as HTMLElement | undefined;
    if (!input) return;

    const panel = this.panelElement();
    const focusables = getFocusableElements(
      this.hostElement.nativeElement.ownerDocument.body,
    ).filter((el) => !panel?.contains(el));

    const next = focusables[focusables.indexOf(input) + 1];
    next?.focus();
  }

  selectSuggestion(suggestion: SearchSuggestionView<T>): void {
    this.justSelected = true;
    this.value.set(suggestion.label);
    this.onChange(suggestion.label);
    this.suggestionSelect.emit(suggestion.item);
    this.closePanel();
  }

  /**
   * The panel is portalled into the overlay container, so it is not a descendant
   * of the host — both roots have to be consulted before deciding focus left.
   */
  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;

    if (!next) {
      this.closePanel();
      return;
    }

    const stillInside =
      this.hostElement.nativeElement.contains(next) ||
      !!this.panelElement()?.contains(next);

    if (!stillInside) {
      this.closePanel();
    }
  }

  emitSearch(): void {
    this.searchEvent.emit(this.value());
  }

  focus(): void {
    const input = this.inputRef()?.nativeElement as HTMLInputElement | undefined;
    input?.focus();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? "");
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  private onArrowKey(event: KeyboardEvent): void {
    if (!this.panelVisible()) {
      this.openPanel();
      return;
    }

    if (!this.hasSuggestions()) return;

    if (event.key === "ArrowDown") {
      this.keyManager.setNextItemActive();
    } else {
      this.keyManager.setPreviousItemActive();
    }
  }

  private onEnter(event: KeyboardEvent): void {
    const active = this.keyManager.activeItem;
    const index = this.activeIndex();

    if (this.panelVisible() && active && index >= 0) {
      event.preventDefault();
      const suggestion = this.resolvedSuggestions()[index];
      if (suggestion) this.selectSuggestion(suggestion);
      return;
    }

    this.emitSearch();
  }

  private panelElement(): HTMLElement | undefined {
    return this.connectedOverlay()?.overlayRef?.overlayElement;
  }

  private resetActiveOption(): void {
    this.keyManager.setActiveItem(-1);
    this.activeIndex.set(-1);
  }
}
