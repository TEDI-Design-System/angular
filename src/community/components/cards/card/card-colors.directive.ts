import { computed, Directive, input } from "@angular/core";

export type CardColors =
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "brand-primary"
  | "brand-secondary"
  | "brand-tertiary"
  | "brand-quaternary"
  | "danger-primary"
  | "danger-secondary"
  | "success-primary"
  | "success-secondary"
  | "info-primary"
  | "info-secondary"
  | "warning-primary"
  | "warning-secondary"
  | "neutral-primary"
  | "neutral-secondary";

/**
 * @deprecated Use background and border inputs on TEDI-ready Card components instead. This directive will be removed from future versions.
 */
@Directive({
  standalone: true,
  host: {
    "[class]": "modifierClasses()",
  },
})
export class CardColorsDirective {
  /**
   * Modifies background of the block it's attached to.
   */
  background = input<CardColors>();
  border = input<CardColors>();

  modifierClasses = computed(() => {
    const modifiers = [];
    if (this.background()) {
      modifiers.push(`tedi-card--background--${this.background()}`);
    }
    if (this.border()) {
      modifiers.push(`tedi-card--border--${this.border()}`);
    }
    return modifiers.join(" ");
  });
}
