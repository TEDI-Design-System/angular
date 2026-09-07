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
export class TableOfContentsNestedWrapperComponent {}
