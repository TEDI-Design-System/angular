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
export type InlineEditIconAlign = "following" | "aligned";

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
    "[class.tedi-inline-edit--full-width]": "fullWidth()",
    "[class.tedi-inline-edit--icon-aligned]": "editIconAlign() === 'aligned'",
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
   * Read-mode text. Bind it to the editor's value, formatted for display.
   */
  readonly displayValue = input<string>("");
  /** Text shown when `displayValue` is empty or whitespace-only. */
  readonly placeholder = input<string>("");
  /**
   * Non-blank label for the read trigger; blank values throw an error.
   * Announced with the displayed value and translated Edit action.
   * Give the editor its own label; host attributes are not forwarded.
   */
  readonly label = input.required<string, string>({ transform: nonEmptyLabel });
  /**
   * Text size and row spacing. The editor defaults to `small` for either
   * variant unless it sets its own size.
   *
   * Both sizes use increased vertical padding on mobile. Use `fullWidth`
   * to make the entire row tappable.
   * @default "default"
   */
  readonly size = input<InlineEditSize>("default");
  /**
   * Hides the edit icon. Use only when another visible cue identifies the
   * value as editable. The read trigger remains a button.
   * @default false
   */
  readonly hideEditIcon = input(false, { transform: booleanAttribute });
  /**
   * Places the edit icon after the value (`following`) or at the end of the
   * row (`aligned`). Use `aligned` with `fullWidth` to align icons across rows.
   * @default "following"
   */
  readonly editIconAlign = input<InlineEditIconAlign>("following");
  /**
   * Makes the read trigger and editor fill their container rather than sizing
   * to their content.
   * @default false
   */
  readonly fullWidth = input(false, { transform: booleanAttribute });
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
   * Commits when focus leaves the editor. Linked overlays and CDK overlay
   * panes created during the edit count as part of the editor.
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
  private readonly feedback = contentChild(FeedbackTextComponent);
  private readonly editorRef = viewChild<ElementRef<HTMLElement>>("editor");
  private readonly triggerRef =
    viewChild<ElementRef<HTMLButtonElement>>("trigger");

  /**
   * Defaults the editor to small with its own surface; explicit size wins.
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
  // Snapshot used to support unlinked picker overlays. New panes are assumed
  // to belong to the editor, which also includes unrelated panes opened later.
  private readonly foreignOverlays = new Set<HTMLElement>();

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
          this.foreignOverlays.clear();
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
    this.snapshotForeignOverlays();
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
