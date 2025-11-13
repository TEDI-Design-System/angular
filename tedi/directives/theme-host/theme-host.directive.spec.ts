import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ThemeHostDirective } from './theme-host.directive';
import { Theme, THEME_CLASS_PREFIX, ThemeService } from '../../services/themes/themes.service';

class MockThemeService {
  private current = 'default';
  private listeners: ((theme: Theme) => void)[] = [];

  themeChanges$ = {
    subscribe: (fn: (theme: Theme) => void) => {
      this.listeners.push(fn);
      fn(this.current as Theme);
      return { unsubscribe: () => this.listeners.splice(this.listeners.indexOf(fn), 1) };
    },
  };

  getTheme = () => this.current;
  setTheme = (theme: Theme) => {
    this.current = theme;
    this.listeners.forEach(fn => fn(theme));
  };
}

@Component({
  template: `<div tediThemeHost [tediThemeHost]="inputTheme"></div>`,
  standalone: true,
  imports: [ThemeHostDirective],
})
class HostComponent {
  inputTheme?: Theme = 'default';
}

describe('ThemeHostDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostEl: HTMLElement;
  let mockService: MockThemeService;

  beforeEach(async () => {
    mockService = new MockThemeService();

    await TestBed.configureTestingModule({
      imports: [HostComponent, ThemeHostDirective],
      providers: [
        { provide: ThemeService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostEl = fixture.debugElement.query(By.css('div')).nativeElement;
    fixture.detectChanges();
  });

  it('should create host component with directive', () => {
    expect(hostEl).toBeTruthy();
    expect(hostEl.classList.contains(`${THEME_CLASS_PREFIX}default`)).toBe(true);
  });

  it('should apply initial theme from service on ngOnInit', () => {
    mockService.setTheme('dark');
    fixture.detectChanges();

    expect(hostEl.classList.contains(`${THEME_CLASS_PREFIX}dark`)).toBe(true);
    expect(hostEl.classList.contains(`${THEME_CLASS_PREFIX}default`)).toBe(false);
  });

  it('should update class when service emits new theme', () => {
    mockService.setTheme('rit');
    fixture.detectChanges();

    expect(hostEl.classList.contains(`${THEME_CLASS_PREFIX}rit`)).toBe(true);
    expect(hostEl.classList.contains(`${THEME_CLASS_PREFIX}dark`)).toBe(false);
  });

  it('should apply input theme and sync to service on ngOnChanges', () => {
    const component = fixture.componentInstance;
    component.inputTheme = 'dark';
    fixture.detectChanges();

    expect(hostEl.classList.contains(`${THEME_CLASS_PREFIX}dark`)).toBe(true);
    expect(mockService.getTheme()).toBe('dark');
  });

  it('should remove old theme classes and add new one', () => {
    hostEl.classList.add(`${THEME_CLASS_PREFIX}rit`);
    hostEl.classList.add(`${THEME_CLASS_PREFIX}dark`);

    mockService.setTheme('default');
    fixture.detectChanges();

    expect(hostEl.classList.contains(`${THEME_CLASS_PREFIX}default`)).toBe(true);
    expect(hostEl.classList.contains(`${THEME_CLASS_PREFIX}rit`)).toBe(false);
    expect(hostEl.classList.contains(`${THEME_CLASS_PREFIX}dark`)).toBe(false);
  });

  it('should not fail if input theme is undefined', () => {
    const component = fixture.componentInstance;
    component.inputTheme = undefined;
    fixture.detectChanges();

    expect(hostEl.classList.contains(`${THEME_CLASS_PREFIX}default`)).toBe(true);
  });
});