import { Directive, inject, TemplateRef } from "@angular/core";

/**
 * Content rendered at the bottom of the card while its enclosing step is active.
 */
@Directive({
  selector: "ng-template[tediCardStepperStepContent]",
  standalone: true,
})
export class CardStepperStepContentDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
