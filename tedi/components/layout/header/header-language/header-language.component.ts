import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import { TextComponent } from "../../../base/text/text.component";
import { PopoverComponent } from "../../../overlay/popover/popover.component";
import { PopoverContentComponent } from "../../../overlay/popover/popover-content/popover-content.component";
import {
  TediTranslationService,
  Language,
} from "../../../../services/translation/translation.service";
import { TediTranslationPipe } from "../../../../services/translation/translation.pipe";
import { PopoverTriggerDirective } from "../../../overlay/popover/popover-trigger/popover-trigger.directive";

export type HeaderLanguage = {
  [L in Language]?: string;
};

export type HeaderLanguageLabelPosition = "top" | "left";

@Component({
  selector: "tedi-header-language",
  standalone: true,
  imports: [
    IconComponent,
    TextComponent,
    PopoverComponent,
    PopoverTriggerDirective,
    PopoverContentComponent,
    TediTranslationPipe,
  ],
  templateUrl: "./header-language.component.html",
  styleUrl: "./header-language.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-header-language",
    "[class.tedi-header-language--label-left]": "labelPosition() === 'left'",
  },
})
export class HeaderLanguageComponent {
  /**
   * Languages object.
   * Key is value in 'Language' type.
   * Value should be text shown in the UI.
   */
  languages = input.required<HeaderLanguage>();
  /**
   * Label for the language selector. Falls back to the `header.select-lang`
   * translation when not provided.
   */
  selectLabel = input<string>();
  /**
   * Position of the select label relative to the popover trigger.
   * - `top` — label sits above the trigger (default)
   * - `left` — label sits inline, to the left of the trigger
   * @default "top"
   */
  labelPosition = input<HeaderLanguageLabelPosition>("top");
  /**
   * Optional per-language URLs. When a language has a URL, its option renders as
   * a navigation anchor (`<a href>`) and switching is handled by the browser
   * instead of the client-side translation service.
   */
  languageHrefs = input<Partial<Record<Language, string>>>();
  /**
   * This is event emitter for changing language
   */
  languageChange = output<Language>();

  readonly popover = viewChild(PopoverComponent);

  translationService = inject(TediTranslationService);

  languageKeys = computed(() => Object.keys(this.languages()) as Language[]);

  /** Label currently shown on the trigger (the active language's display text). */
  readonly displayedLanguage = computed(
    () => this.languages()[this.translationService.getLanguage()],
  );

  /** Self-describing accessible name for the trigger, e.g. "Language EST". */
  readonly triggerAriaLabel = computed(() => {
    const label =
      this.selectLabel() ??
      this.translationService.translate("header.select-lang");
    return `${label} ${this.displayedLanguage() ?? ""}`.trim();
  });

  handleChangeLang(lang: Language) {
    this.languageChange.emit(lang);
    this.translationService.setLanguage(lang);
    this.popover()?.hidePopover();
  }
}
