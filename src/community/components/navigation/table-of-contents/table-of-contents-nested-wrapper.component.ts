import { Component } from "@angular/core";

/**
 * Wrapper component for nested table of contents items.
 * Workaround for https://github.com/angular/angular/issues/57345,
 * which is a issue when you use `@if() {}` syntax inside a component that uses ng-content.
 */
@Component({
  selector: "tedi-table-of-contents-nested-wrapper",
  template: `<ng-content></ng-content>`,
})
/**
 * @deprecated Use the TEDI-Ready TableOfContents from `@tedi-design-system/angular` instead:
 * nest `tedi-table-of-contents-item` elements directly, no wrapper needed.
 */
export class TableOfContentsNestedWrapperComponent {}
