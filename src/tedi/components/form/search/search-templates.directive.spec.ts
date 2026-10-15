import { Component, TemplateRef, viewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  SearchFooterTemplateDirective,
  SearchSuggestionTemplateDirective,
} from "./search-templates.directive";

@Component({
  standalone: true,
  imports: [SearchSuggestionTemplateDirective, SearchFooterTemplateDirective],
  template: `
    <ng-template tediSearchSuggestion let-item>{{ item }}</ng-template>
    <ng-template tediSearchFooter>panel</ng-template>
  `,
})
class HostComponent {
  readonly suggestion = viewChild(SearchSuggestionTemplateDirective);
  readonly footer = viewChild(SearchFooterTemplateDirective);
}

describe("search template directives", () => {
  it("exposes the suggestion TemplateRef", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.suggestion()?.template).toBeInstanceOf(
      TemplateRef,
    );
  });

  it("exposes the footer TemplateRef", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.footer()?.template).toBeInstanceOf(
      TemplateRef,
    );
  });
});
