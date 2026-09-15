import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import {
  IconColor,
  IconComponent,
  IconSize,
  IconVariant,
} from "../../base/icon/icon.component";
import {
  HeadingModifiers,
  TextColor,
  TextComponent,
  TextModifiers,
} from "../../base/text/text.component";

const isHeadingModifier = (
  modifier: TextModifiers,
): modifier is HeadingModifiers => /^h[1-6]$/.test(modifier);

@Component({
  selector: "tedi-heading-with-icon",
  standalone: true,
  templateUrl: "./heading-with-icon.component.html",
  styleUrl: "./heading-with-icon.component.scss",
  imports: [NgTemplateOutlet, IconComponent, TextComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-heading-with-icon",
    "[style.--_tedi-heading-with-icon-line-height]": "lineHeightVar()",
  },
})
export class HeadingWithIconComponent {
  /**
   * Name of the Material Icon
   * https://fonts.google.com/icons
   *
   * Rendered as decorative and hidden from assistive technology — the
   * projected text is the accessible heading name.
   */
  name = input.required<string>();
  /**
   * Semantic heading tag. Also sets the typography unless a heading modifier
   * overrides it, so pick the tag that fits the surrounding document outline.
   * @default h4
   */
  element = input<HeadingModifiers>("h4");
  /**
   * Single or multiple modifiers to change the heading behavior. A heading
   * modifier here styles the heading as that level while `element` keeps the
   * semantics — e.g. an `h2` that looks like an `h4`.
   */
  modifiers = input<TextModifiers[] | TextModifiers>();
  /**
   * Heading text color.
   * @default primary
   */
  headingColor = input<TextColor>("primary");
  /**
   * Color of the icon.
   * @default primary
   */
  iconColor = input<IconColor>("primary");
  /**
   * Size of the icon in pixels.
   * @default 24
   */
  size = input<IconSize>(24);
  /**
   * Whether the icon should be filled or outlined.
   * @default outlined
   */
  variant = input<IconVariant>("outlined");

  // A heading modifier wins on specificity over the `element` tag in core's CSS,
  // so `element="h2" modifiers="h4"` renders at h4's line height — which is what
  // the icon has to be centered against.
  private readonly visualLevel = computed<HeadingModifiers>(() => {
    const modifiers = this.modifiers();
    const modifierList = Array.isArray(modifiers)
      ? modifiers
      : modifiers
        ? [modifiers]
        : [];

    return modifierList.find(isHeadingModifier) ?? this.element();
  });

  lineHeightVar = computed(
    () => `var(--heading-${this.visualLevel()}-line-height)`,
  );
}
