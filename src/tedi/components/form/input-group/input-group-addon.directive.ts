import {
  AfterContentInit,
  computed,
  Directive,
  ElementRef,
  inject,
  signal,
} from "@angular/core";
import { TEDI_INPUT_GROUP } from "./input-group.token";

/**
 * Shared behavior for the prefix/suffix addon directives: reads the group's
 * disabled state and detects whether the addon holds plain text (so the
 * wrapper, rather than a child element, gets the padding).
 */
@Directive()
export abstract class InputGroupAddonDirective implements AfterContentInit {
  protected readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly group = inject(TEDI_INPUT_GROUP, { optional: true });

  readonly disabled = computed(() => this.group?.disabled() ?? false);
  protected readonly isText = signal(false);

  ngAfterContentInit(): void {
    this.isText.set(this.el.nativeElement.childElementCount === 0);
  }
}
