import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  untracked,
  contentChild,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  model,
  output,
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
import { InlineEditControlDirective } from "./inline-edit-control.directive";

let inlineEditIdCounter = 0;

function nonEmptyLabel(value: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("[tedi-inline-edit] label must be a non-empty string.");
  }

  return value.trim();
}

export type InlineEditSize = "default" | "small";
export type InlineEditIconVisibility = "always" | "hover";
export type InlineEditIconPosition = "end" | "inline";

/** Why edit mode was left — mirrors which output fires. */
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
    "[class.tedi-inline-edit--icon-hover]": "editIconVisibility() === 'hover'",
    "[class.tedi-inline-edit--icon-inline]": "editIconPosition() === 'inline'",
    "[class.tedi-inline-edit--invalid]": "invalid()",
    "[class.tedi-inline-edit--editing]": "editing()",
    "(document:focusout)": "handleFocusOut($event)",
    "(keydown)": "handleKeydown($event)",
  },
})
export class InlineEditComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly translationService = inject(TediTranslationService);
  private readonly parentContext = inject(TEDI_FIELD_CONTEXT, {
    optional: true,
    skipSelf: true,
  });

  /**
   * Text shown while not editing. The inline edit never writes to it — keep it
   * bound to the same source the projected control edits.
   */
  readonly displayValue = input<string>("");
  /**
   * Text shown in place of an empty `displayValue`, in the muted placeholder
   * colour.
   */
  readonly placeholder = input<string>("");
  /**
   * Required label for the read-mode button, e.g. `"Kuupäev"`.
   * Blank or whitespace-only values throw an error. Its accessible name includes
   * the label, displayed value and translated Edit action. Give the projected
   * control its own label or `aria-label`; host attributes are not forwarded.
   */
  readonly label = input.required<string, string>({ transform: nonEmptyLabel });
  /**
   * Row height and type scale. `default` is a 32px row at body size, `small` a
   * 28px row at body-small. Both grow to a 44px touch target on small screens.
   *
   * Provides `small` as the projected control's default size. The control can
   * override this with its own size input.
   * @default "default"
   */
  readonly size = input<InlineEditSize>("default");
  /**
   * Material icon shown beside the value, or `null` to hide the icon.
   * @default null
   */
  readonly editIcon = input<string | null>(null);
  /**
   * Whether the edit icon is always visible or revealed on hover and
   * keyboard focus. Ignored while `editIcon` is `null`.
   * @default "always"
   */
  readonly editIconVisibility = input<InlineEditIconVisibility>("always");
  /**
   * `end` pins the icon to the right edge of the row; `inline` sets it directly
   * after the text.
   * @default "end"
   */
  readonly editIconPosition = input<InlineEditIconPosition>("end");
  /**
   * Whether the control is shown in place of the value. Supports `[(editing)]`.
   * Programmatic entry also emits `editStart`. Opening an editor after initial
   * render focuses the control; initially open editors do not take focus.
   * Programmatic exit does not emit commit/cancel or restore focus.
   * @default false
   */
  readonly editing = model<boolean>(false);
  /**
   * Blocks entering edit mode and mutes the value. Combined with the disabled
   * state of a wrapping field.
   * @default false
   */
  readonly disabledInput = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: "disabled",
    transform: booleanAttribute,
  });
  /**
   * Puts the row in the error state. Combined with the error state of a
   * wrapping field, and passed on to the projected control through the field
   * context so it renders its own error state too.
   * @default false
   */
  readonly invalidInput = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: "invalid",
    transform: booleanAttribute,
  });
  /**
   * Whether Enter leaves edit mode and commits. Turn off for a textarea, where
   * Enter has to insert a newline instead.
   * @default true
   */
  readonly closeOnEnter = input(true, { transform: booleanAttribute });
  /**
   * Whether Escape exits edit mode and emits `editCancel`.
   * @default true
   */
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  /**
   * Whether moving focus out of the component commits. Overlays linked by the
   * control's `aria-controls` or `aria-owns` count as part of the editor.
   * @default true
   */
  readonly closeOnBlur = input(true, { transform: booleanAttribute });

  /** Edit mode was entered. */
  readonly editStart = output<void>();
  /**
   * Emitted after the active control is blurred, before it is removed. Use this
   * to persist the value. Bindings using `updateOn: "blur"` are supported;
   * bindings using `updateOn: "submit"` remain the parent form's responsibility.
   */
  readonly editCommit = output<void>();
  /**
   * Edit mode was left by Escape. The control's binding still holds the edited
   * value — restore the previous one here if the edit should be discarded.
   */
  readonly editCancel = output<void>();

  readonly disabled = computed(
    () => this.disabledInput() || (this.parentContext?.disabled() ?? false),
  );

  readonly invalid = computed(
    () => this.invalidInput() || (this.parentContext?.invalid() ?? false),
  );

  /**
   * Ignore focusout while replacing the trigger with the editor, so removing
   * the focused trigger does not immediately commit.
   */
  private swappingToControl = false;

  private readonly controlTemplate = contentChild(InlineEditControlDirective);
  private readonly feedback = contentChild(FeedbackTextComponent);
  private readonly editorRef = viewChild<ElementRef<HTMLElement>>("editor");
  private readonly triggerRef =
    viewChild<ElementRef<HTMLButtonElement>>("trigger");

  /**
   * Provides the small control size by default and lets the control render its
   * own surface. A control's explicit size input takes precedence.
   */
  readonly childContext: FieldContext = {
    size: computed(() => "small"),
    ownsSurface: computed(() => false),
    invalid: computed(() => this.invalid()),
    valid: computed(() => false),
    disabled: computed(() => this.disabled()),
  };

  /** Links a projected feedback text to the trigger through `aria-describedby`. */
  readonly feedbackId = `tedi-inline-edit-feedback-${inlineEditIdCounter++}`;

  readonly hasFeedback = computed(() => this.feedback() !== undefined);

  readonly template = computed(() => this.controlTemplate()?.template);

  readonly hasValue = computed(() => this.displayValue().trim().length > 0);

  readonly displayText = computed(() =>
    this.hasValue() ? this.displayValue() : this.placeholder(),
  );

  readonly triggerLabel = computed(() => {
    const label = this.label();

    const action = this.translationService.translate("inline-edit.edit");
    const value = this.displayText().trim();

    return value ? `${label}: ${value}, ${action}` : `${label}, ${action}`;
  });

  private entered = false;
  private leaving = false;
  private readonly ownedOverlays = new Set<HTMLElement>();

  constructor() {
    let initialRender = true;

    effect(() => {
      const editing = this.editing();
      const template = this.template();

      untracked(() => {
        if (editing && template && !this.entered) {
          this.enterEditMode(!initialRender);
        } else if (!editing) {
          this.entered = false;
          this.ownedOverlays.clear();
        }
      });

      initialRender = false;
    });
  }

  startEditing() {
    if (this.disabled() || this.editing() || !this.template()) return;

    this.editing.set(true);
    this.enterEditMode();
  }

  private enterEditMode(focusControl = true) {
    this.entered = true;
    this.swappingToControl = true;
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
      event.preventDefault();
      this.stopEditing("commit", true);
    } else if (event.key === "Escape" && this.closeOnEscape()) {
      event.preventDefault();
      this.stopEditing("cancel", true);
    }
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

  // Retain linked overlay elements until exit so focus leaving an overlay is
  // still recognized if the control has already cleared its aria-controls.
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

    return (
      host.contains(target) ||
      [...this.ownedOverlays].some((element) => element.contains(target))
    );
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
    this.ownedOverlays.clear();

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
