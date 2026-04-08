import {ChangeDetectionStrategy, Component, computed, contentChildren, ViewEncapsulation} from '@angular/core';
import {CardComponent, CardContentComponent, TabContentComponent} from "@tedi-design-system/angular/community";
import {TabCardComponent} from "../tab-card/tab-card.component";
import {
  AccordionComponent,
  ButtonComponent,
  IconComponent,
  TediTranslationPipe,
  TextComponent
} from "@tedi-design-system/angular/tedi";
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
