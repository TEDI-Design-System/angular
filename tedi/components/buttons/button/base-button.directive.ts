import {
  Directive,
  AfterContentChecked,
  signal,
  inject,
  ElementRef,
  computed,
} from "@angular/core";

@Directive({
  host: {
    "[class]": "classes()",
  },
})
export class BaseButtonDirective implements AfterContentChecked {
  /**
   * CSS class name affix the directive should provide
   */
  classNamePrefix = signal("tedi-button");

  private host = inject(ElementRef);
  iconOnly = signal(false);
  iconFirst = signal(false);
  iconLast = signal(false);

  ngAfterContentChecked(): void {
    const hostElement = this.host.nativeElement as HTMLElement;
    const nodes = Array.from(hostElement.childNodes).filter(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE ||
        (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
    );
    const nodeCount = nodes.length;
    const iconIndexes = nodes
      .map((node, index) => ({ node, index }))
      .filter(
        (x) =>
          x.node.nodeType === Node.ELEMENT_NODE &&
          x.node.nodeName === "TEDI-ICON"
      )
      .map((x) => x.index);

    const iconCount = iconIndexes.length;
    this.iconOnly.set(nodeCount === 1 && iconCount === 1);
    this.iconFirst.set(iconIndexes.includes(0));
    this.iconLast.set(iconIndexes.includes(nodes.length - 1));
  }

  classes = computed(() => {
    const classList = [this.classNamePrefix()];

    if (this.iconOnly()) {
      classList.push(`${this.classNamePrefix()}--icon-only`);
    }

    if (!this.iconFirst()) {
      classList.push(`${this.classNamePrefix()}--pl`);
    }

    if (!this.iconLast()) {
      classList.push(`${this.classNamePrefix()}--pr`);
    }

    return classList.join(" ");
  });
}
