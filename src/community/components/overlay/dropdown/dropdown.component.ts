import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  ViewEncapsulation,
  Injector,
  OnInit,
} from "@angular/core";
import { DropdownTriggerDirective } from "./dropdown-trigger/dropdown-trigger.directive";
import { OverlayModule } from "@angular/cdk/overlay";
import { DropdownItemComponent } from "../dropdown-item/dropdown-item.component";
import {
  BreakpointService,
  ClosingButtonComponent,
  CardComponent,
  CardContentComponent,
  warnDeprecated,
} from "@tedi-design-system/angular/tedi";
import { FocusKeyManager } from "@angular/cdk/a11y";

/**
 * @deprecated Use the TEDI-Ready `tedi-dropdown` from `@tedi-design-system/angular/tedi` instead. Its items go in a
 * `tedi-dropdown-content` as `li[tedi-dropdown-item]`s. This component will be removed from future versions.
 */
@Component({
  selector: "tedi-dropdown",
  imports: [
    OverlayModule,
    CardComponent,
    CardContentComponent,
    ClosingButtonComponent,
  ],
  templateUrl: "./dropdown.component.html",
  styleUrl: "./dropdown.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent implements OnInit {
  private injector = inject(Injector);
  dropdownId = input.required<string>();
  dropdownRole = input<"menu" | "listbox">();
  opened = model<boolean>(false);

  private triggerDirective = contentChild.required(DropdownTriggerDirective);
  private dropdownItems = contentChildren<DropdownItemComponent>(
    forwardRef(() => DropdownItemComponent),
    { descendants: true },
  );

  isMobile = inject(BreakpointService).isBelowBreakpoint("sm");

  private keyManager?: FocusKeyManager<DropdownItemComponent>;

  constructor() {
    warnDeprecated(
      "Community tedi-dropdown",
      "Use the TEDI-Ready `tedi-dropdown` from `@tedi-design-system/angular/tedi` instead.",
    );
  }

  overlayOrigin = computed(() => {
    return this.triggerDirective().overlayOrigin;
  });

  toggle() {
    this.opened.update((wasOpened) => !wasOpened);
  }

  close() {
    this.opened.set(false);
  }

  onKeyDown(event: KeyboardEvent) {
    this.keyManager?.onKeydown(event);
  }

  ngOnInit() {
    this.keyManager = new FocusKeyManager(
      this.dropdownItems,
      this.injector,
    ).withWrap();
  }
}
