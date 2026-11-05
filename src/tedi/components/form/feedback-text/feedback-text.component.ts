import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from "@angular/core";

let feedbackTextIdCounter = 0;

export type FeedbackTextType = "hint" | "valid" | "error";
export type FeedbackTextPosition = "left" | "right";

@Component({
  selector: "tedi-feedback-text",
  standalone: true,
  templateUrl: "./feedback-text.component.html",
  styleUrl: "./feedback-text.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "classes()",
    "[attr.id]": "elementId()",
    "[attr.role]": "role()",
    "[attr.aria-live]": "ariaLive()",
  },
})
export class FeedbackTextComponent {
  /**
   * Id of the element. Generated when not set, so a container can reference this
   * text from a control's `aria-describedby`.
   */
  readonly id = input<string | null | undefined>();

  private readonly fallbackId = `tedi-feedback-text-${feedbackTextIdCounter++}`;

  readonly elementId = computed(() => this.id() ?? this.fallbackId);

  /**
   * Helper text
   */
  text = input.required<string>();
  /**
   * Type of form-helper.
   * @default hint
   */
  type = input<FeedbackTextType | undefined>("hint");
  /**
   * Position of the helper.
   * @default left
   */
  position = input<FeedbackTextPosition | undefined>("left");

  // Callers forwarding optional values can pass undefined; keep the defaults
  private readonly resolvedType = computed(() => this.type() ?? "hint");
  private readonly resolvedPosition = computed(() => this.position() ?? "left");

  role = computed(() => {
    if (this.resolvedType() === "valid" || this.resolvedType() === "error") {
      return "alert";
    }

    return undefined;
  });

  ariaLive = computed(() => {
    if (this.resolvedType() === "error" || this.resolvedType() === "valid") {
      return "assertive";
    }

    return "polite";
  });

  classes = computed(() => {
    return `tedi-feedback-text tedi-feedback-text--${this.resolvedType()} tedi-feedback-text--${this.resolvedPosition()}`;
  });
}
