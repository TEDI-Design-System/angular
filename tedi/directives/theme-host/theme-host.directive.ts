import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Theme, THEME_CLASS_PREFIX, ThemeService } from '../../services/themes/themes.service';

@Directive({
  selector: '[tediThemeHost]',
  standalone: true,
})
export class ThemeHostDirective implements OnInit, OnChanges, OnDestroy {
  private subscription = new Subscription();

  @Input('tediThemeHost') theme?: Theme;

  constructor(
    private el: ElementRef<HTMLElement>,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.themeService.themeChanges$.subscribe((theme) => {
        this.applyTheme(theme);
      })
    );

    this.applyTheme(this.themeService.getTheme());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['theme'] && this.theme) {
      this.applyTheme(this.theme);
      this.themeService.setTheme(this.theme);
    }
  }

  private applyTheme(theme: Theme): void {
    const prefix = THEME_CLASS_PREFIX;
    const classList = this.el.nativeElement.classList;

    Array.from(classList)
      .filter((c) => c.startsWith(prefix))
      .forEach((c) => classList.remove(c));

    classList.add(`${prefix}${theme}`);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}