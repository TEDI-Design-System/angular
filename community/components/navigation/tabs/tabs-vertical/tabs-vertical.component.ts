import {ChangeDetectionStrategy, Component, computed, contentChildren, ViewEncapsulation} from '@angular/core';
import {outputToObservable, takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {EMPTY, merge, switchMap} from 'rxjs';
import {CardComponent, CardContentComponent, TabContentComponent} from "@tedi-design-system/angular/community";
import {TabCardComponent} from "../tab-card/tab-card.component";
import {AccordionComponent, ButtonComponent, IconComponent, TediTranslationPipe, TextComponent} from "@tedi-design-system/angular/tedi";
import {NgTemplateOutlet} from "@angular/common";

@Component({
  selector: 'tedi-tabs-vertical',
  imports: [
    AccordionComponent,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    IconComponent,
    NgTemplateOutlet,
    TediTranslationPipe,
    TextComponent
  ],
  templateUrl: './tabs-vertical.component.html',
  styleUrl: './tabs-vertical.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-tabs-vertical]": "true",
  },
})
export class TabsVerticalComponent {
  private readonly tabs = contentChildren(TabCardComponent);
  private readonly tabContents = contentChildren(TabContentComponent);

  constructor() {
    toObservable(this.tabs).pipe(
      switchMap(tabs =>
        tabs.length === 0
          ? EMPTY
          : merge(...tabs.map(t => outputToObservable(t.tabSelected)))
      ),
      takeUntilDestroyed()
    ).subscribe(tabId => {
      this.tabs().forEach(t => t.selected.set(t.tabId() === tabId));
    });
  }

  activeTabId = computed(() =>
    this.tabs().find((tab) => tab.selected())?.tabId()
  );

  activeTabTitle = computed(() =>
    this.tabs().find((tab) => tab.selected())?.title()
  );

  activeTabContent = computed(() =>
    this.tabContents().find((content) => content.tabId() === this.activeTabId())?.content()
  );

  unselectAllTabs() {
    this.tabs().forEach(tab => tab.selected.set(false));
  }
}
