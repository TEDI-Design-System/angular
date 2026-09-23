import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  ViewEncapsulation,
  model,
  output,
  computed,
  ElementRef,
  effect,
} from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { startWith } from "rxjs";
import { FocusableOption } from "@angular/cdk/a11y";

@Component({
  selector: "[tedi-tab]",
  imports: [],
  templateUrl: "./tab.component.html",
  styleUrl: "./tab.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-tab]": "true",
    "[class.tedi-tab--selected]": "isTabActive()",
    "[class.tedi-tab--disabled]": "disabledInput()",
    "[attr.role]": "'tab'",
    "(click)": "selectTab()",
  },
  hostDirectives: [
    {
      directive: RouterLinkActive,
      inputs: ["routerLinkActiveOptions", "ariaCurrentWhenActive"],
      outputs: ["isActiveChange"],
    },
  ],
})
/**
 * @deprecated Use the TEDI-Ready `button[tedi-tabs-trigger]` from
 * `@tedi-design-system/angular` instead.
 */
export class TabComponent implements FocusableOption {
  private element = inject(ElementRef);

  tabId = input.required<string>();
  selected = model(false);
  disabledInput = input(false, {
    transform: booleanAttribute,
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: "disabled",
  });
  disabled?: boolean; // for cdk/a11y keymanager
  tabSelected = output<void>();

  private readonly routerLinkActive = inject(RouterLinkActive, { self: true });
  private readonly routerLink = inject(RouterLink, {
    optional: true,
    self: true,
  });
  private linkActive = toSignal(
    this.routerLinkActive.isActiveChange.pipe(
      startWith(this.routerLinkActive.isActive),
    ),
  );

  isTabActive = computed(() =>
    this.routerLink ? !!this.linkActive() : this.selected(),
  );

  selectTab() {
    if (!this.routerLink) {
      this.selected.set(true);
    }
    this.tabSelected.emit();
  }

  focus() {
    this.element.nativeElement.focus();
  }

  constructor() {
    effect(() => {
      this.disabled = this.disabledInput();
    });
    this.routerLinkActive.routerLinkActive = ["tedi-tab--active"]; // should be changed once hostDirectives allow default values
  }
}
