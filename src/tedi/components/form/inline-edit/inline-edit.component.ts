import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  untracked,
  contentChild,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  isDevMode,
  model,
  output,
  Renderer2,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { IconComponent } from "../../base/icon/icon.component";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { getFocusableElements } from "../../../utils/elements.util";
import {
  FieldContext,
  TEDI_FIELD_CONTEXT,
} from "../form-field/field-context.token";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { TEDI_DESCRIBABLE_CONTROL } from "../form-field/control-described-by";
import {
  InlineEditControlDirective,
  InlineEditValueDirective,
} from "./inline-edit.directives";

let inlineEditIdCounter = 0;

function trimmedLabel(value: string): string {
  const label = typeof value === "string" ? value.trim() : "";

  if (!label && isDevMode()) {
    console.warn(
      "[tedi-inline-edit] `label` is empty, so the trigger has no accessible name.",
    );
  }

  return label;
}

export type InlineEditSize = "default" | "small";
export type InlineEditIconPosition = "inline" | "end";

export type InlineEditExitReason = "commit" | "cancel";

@Component({
  selector: "tedi-inline-edit",
  standalone: true,
  imports: [NgTemplateOutlet, IconComponent],
  templateUrl: "./inline-edit.component.html",
  styleUrl: "./inline-edit.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TEDI_FIELD_CONTEXT,
      useFactory: (field: InlineEditComponent) => field.childContext,
      deps: [forwardRef(() => InlineEditComponent)],
    },
  ],
  host: {
    class: "tedi-inline-edit",
    "[class.tedi-inline-edit--small]": "size() === 'small'",
    "[class.tedi-inline-edit--fit-content]": "fitContent()",
    "[class.tedi-inline-edit--icon-end]": "editIconPosition() === 'end'",
    "[class.tedi-inline-edit--invalid]": "invalid()",
    "[class.tedi-inline-edit--editing]": "editing()",
    "(keydown)": "handleKeydown($event)",
  },
})
export class InlineEditComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly renderer = inject(Renderer2);
  private readonly translationService = inject(TediTranslationService);
  private readonly parentContext = inject(TEDI_FIELD_CONTEXT, {
    optional: true,
    skipSelf: true,
  });

  /**
   * Read-mode text. Bind it to the editor's value, formatted for display.
   */
  readonly displayValue = input<string>("");
  /** Text shown when `displayValue` is empty or whitespace-only. */
  readonly placeholder = input<string>("");
  /**
   * Accessible name of the read trigger, announced with the value and the Edit action.
   */
  readonly label = input.required<string, string>({ transform: trimmedLabel });
  /**
   * Text size and row spacing; the editor defaults to `small` unless it sets its own.
   * @default "default"
   */
  readonly size = input<InlineEditSize>("default");
  /**
   * Renders the value as plain text with no edit affordance, lined up with editable rows.
   * @default false
   */
  readonly readOnly = input(false, { transform: booleanAttribute });
  /**
   * Places the edit icon at the end of the row (`end`), lining icons up down a
   * column, or straight after the value (`inline`). Hidden while the row is
   * invalid.
   * @default "end"
   */
  readonly editIconPosition = input<InlineEditIconPosition>("end");
  /**
   * Sizes the row to its value instead of filling its container, so the row
   * changes width when the editor opens.
   * @default false
   */
  readonly fitContent = input(false, { transform: booleanAttribute });
  /**
   * Toggles the editor. Supports `[(editing)]`.
   * Entry emits `editStart`. The control receives focus unless initially open.
   * Programmatic exit emits neither commit nor cancel and does not restore focus.
   * @default false
   */
  readonly editing = model<boolean>(false);
  /**
   * Prevents user entry into edit mode and mutes the value.
   * Also applies when the wrapping field is disabled.
   * @default false
   */
  readonly disabledInput = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: "disabled",
    transform: booleanAttribute,
  });
  /**
   * Marks the row invalid. Inherits a wrapping field's invalid state and
   * passes the result to the editor through the field context.
   * @default false
   */
  readonly invalidInput = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: "invalid",
    transform: booleanAttribute,
  });
  /**
   * Commits on Enter. Turn off when the editor uses Enter for a newline
   * or to open a select dropdown.
   * @default true
   */
  readonly closeOnEnter = input(true, { transform: booleanAttribute });
  /**
   * Exits on Escape and emits `editCancel`.
   * @default true
   */
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  /**
   * Commits when focus leaves the editor or the overlays it opens.
   * @default true
   */
  readonly closeOnBlur = input(true, { transform: booleanAttribute });

  /** Edit mode was entered. */
  readonly editStart = output<void>();
  /**
   * Emitted after blurring the control and before removing it. Use to persist
   * the value. Flushes `updateOn: "blur"`; the parent form handles `"submit"`.
   */
  readonly editCommit = output<void>();
  /**
   * Emitted on Escape. Restore the previous value here to discard changes;
   * the editor's binding is not reverted automatically.
   */
  readonly editCancel = output<void>();

  readonly disabled = computed(
    () => this.disabledInput() || (this.parentContext?.disabled() ?? false),
  );

  readonly invalid = computed(
    () => this.invalidInput() || (this.parentContext?.invalid() ?? false),
  );

  // Removing the focused trigger must not commit the edit immediately.
  private swappingToControl = false;

  private readonly controlTemplate = contentChild(InlineEditControlDirective);
  private readonly valueDirective = contentChild(InlineEditValueDirective);
  private readonly feedback = contentChild(FeedbackTextComponent);
  private readonly editorControl = contentChild(TEDI_DESCRIBABLE_CONTROL, {
    descendants: true,
  });
  private readonly editorRef = viewChild<ElementRef<HTMLElement>>("editor");
  private readonly triggerRef =
    viewChild<ElementRef<HTMLButtonElement>>("trigger");

  /**
   * Defaults the editor to small with its own surface; explicit size wins.
   * Opts out of the clear button — it has no place in the design, and the row
   * is too tight to hold one next to the edit affordance.
   */
  readonly childContext: FieldContext = {
    size: computed(() => "small"),
    ownsSurface: computed(() => false),
    invalid: computed(() => this.invalid()),
    valid: computed(() => false),
    disabled: computed(() => this.disabled()),
    clearable: computed(() => false),
  };

  /** Id of the projected feedback text, linked to the trigger and to the editor. */
  readonly feedbackId = `tedi-inline-edit-feedback-${inlineEditIdCounter++}`;

  readonly hasFeedback = computed(() => this.feedback() !== undefined);

  readonly template = computed(() => this.controlTemplate()?.template);

  /** Optional custom read view; falls back to `displayValue` as text. */
  readonly valueTemplate = computed(() => this.valueDirective()?.template);

  readonly hasValue = computed(() => this.displayValue().trim().length > 0);

  readonly displayText = computed(() =>
    this.hasValue() ? this.displayValue() : this.placeholder(),
  );

  readonly triggerLabel = computed(() => {
    const label = this.label();

    const action = this.translationService.translate("inline-edit.edit");
    const value = this.displayText().trim();

    return [label && value ? `${label}: ${value}` : label || value, action]
      .filter(Boolean)
      .join(", ");
  });

  private entered = false;
  private leaving = false;
  private removeFocusOutListener: (() => void) | null = null;
  private readonly ownedOverlays = new Set<HTMLElement>();
  // Snapshot used to support unlinked picker overlays. New panes are assumed
  // to belong to the editor, which also includes unrelated panes opened later.
  private readonly foreignOverlays = new Set<HTMLElement>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.unlistenFocusOut());

    effect(() => {
      this.editorControl()?.setDescribedBy(
        this.hasFeedback() ? [this.feedbackId] : [],
      );
    });

    let initialRender = true;

    effect(() => {
      const editing = this.editing();
      const template = this.template();
      const readOnly = this.readOnly();

      untracked(() => {
        if (readOnly && editing) {
          this.editing.set(false);
        }
        if (editing && !readOnly && template && !this.entered) {
          this.enterEditMode(!initialRender);
        } else if (!editing || readOnly) {
          this.entered = false;
          this.unlistenFocusOut();
          this.ownedOverlays.clear();
          this.foreignOverlays.clear();
        }
      });

      initialRender = false;
    });
  }

  startEditing() {
    if (
      this.readOnly() ||
      this.disabled() ||
      this.editing() ||
      !this.template()
    )
      return;

    this.editing.set(true);
    this.enterEditMode();
  }

  private enterEditMode(focusControl = true) {
    this.entered = true;
    this.swappingToControl = true;
    this.snapshotForeignOverlays();
    this.listenFocusOut();
    this.editStart.emit();

    afterNextRender(
      () => {
        if (focusControl && this.editing()) {
          const editor = this.editorRef()?.nativeElement;
          if (editor) {
            getFocusableElements(editor)[0]?.focus();
          }
        }

        this.swappingToControl = false;
      },
      { injector: this.injector },
    );
  }

  handleKeydown(event: KeyboardEvent) {
    if (!this.editing() || event.defaultPrevented || event.isComposing) return;

    if (event.key === "Enter" && this.closeOnEnter()) {
      if (event.shiftKey || this.enterBelongsToTarget(event.target)) return;
      event.preventDefault();
      this.stopEditing("commit", true);
    } else if (event.key === "Escape" && this.closeOnEscape()) {
      event.preventDefault();
      this.stopEditing("cancel", true);
    }
  }

  /** Enter already means something to a textarea, a select or a button. */
  private enterBelongsToTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return (
      target.tagName === "TEXTAREA" ||
      !!target.closest(
        '[role="combobox"], [role="listbox"], button, a[href], [role="button"]',
      )
    );
  }

  handleFocusOut(event: FocusEvent) {
    if (
      !this.editing() ||
      !this.closeOnBlur() ||
      this.swappingToControl ||
      this.leaving
    ) {
      return;
    }

    const from = event.target as HTMLElement | null;
    if (!from || !this.keepsFocusInside(from)) return;

    const next = event.relatedTarget as HTMLElement | null;
    if (next && this.keepsFocusInside(next)) return;

    this.stopEditing("commit", false);
  }

  // Listens for focus leaving only while the editor is open.
  private listenFocusOut() {
    this.unlistenFocusOut();
    this.removeFocusOutListener = this.renderer.listen(
      "document",
      "focusout",
      (event: FocusEvent) => this.handleFocusOut(event),
    );
  }

  private unlistenFocusOut() {
    this.removeFocusOutListener?.();
    this.removeFocusOutListener = null;
  }

  private snapshotForeignOverlays() {
    this.foreignOverlays.clear();
    this.host.nativeElement.ownerDocument
      .querySelectorAll<HTMLElement>(".cdk-overlay-pane")
      .forEach((pane) => this.foreignOverlays.add(pane));
  }

  // Linked overlays are retained until exit so focus leaving one is still
  // recognized after the control has cleared its aria-controls.
  private keepsFocusInside(target: HTMLElement) {
    const host = this.host.nativeElement;
    const document = host.ownerDocument;
    const roots = [host, ...this.ownedOverlays];

    for (const root of roots) {
      const controls = [
        root,
        ...Array.from(
          root.querySelectorAll<HTMLElement>("[aria-controls], [aria-owns]"),
        ),
      ];
      for (const control of controls) {
        for (const attribute of ["aria-controls", "aria-owns"]) {
          for (const id of (control.getAttribute(attribute) ?? "")
            .split(/\s+/)
            .filter(Boolean)) {
            const element = document.getElementById(id);
            if (element) {
              this.ownedOverlays.add(element);
            }
          }
        }
      }
    }

    if (
      host.contains(target) ||
      [...this.ownedOverlays].some((element) => element.contains(target))
    ) {
      return true;
    }

    const pane = target.closest<HTMLElement>(".cdk-overlay-pane");
    return pane !== null && !this.foreignOverlays.has(pane);
  }

  private stopEditing(reason: InlineEditExitReason, restoreFocus: boolean) {
    if (!this.editing() || this.leaving) return;

    this.leaving = true;

    const active = this.host.nativeElement.ownerDocument
      .activeElement as HTMLElement | null;
    if (active && this.keepsFocusInside(active)) {
      active.blur();
    }

    this.editing.set(false);
    this.entered = false;
    this.unlistenFocusOut();
    this.ownedOverlays.clear();
    this.foreignOverlays.clear();

    if (reason === "commit") {
      this.editCommit.emit();
    } else {
      this.editCancel.emit();
    }

    this.leaving = false;

    if (restoreFocus) {
      this.focusAfterRender(() => this.triggerRef()?.nativeElement);
    }
  }

  private focusAfterRender(target: () => HTMLElement | null | undefined) {
    afterNextRender(() => target()?.focus(), { injector: this.injector });
  }
}
