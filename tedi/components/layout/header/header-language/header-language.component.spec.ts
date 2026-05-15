import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { HeaderLanguageComponent, HeaderLanguage } from './header-language.component';
import {
  Language,
  TediTranslationService,
} from '../../../../services/translation/translation.service';
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from '../../../../tokens/translation.token';

describe('HeaderLanguageComponent', () => {
  let fixture: ComponentFixture<HeaderLanguageComponent>;
  let component: HeaderLanguageComponent;
  let mockTranslationService: {
    translate: jest.Mock;
    setLanguage: jest.Mock;
    getLanguage: ReturnType<typeof signal<Language>>;
  };

  beforeEach(async () => {
    mockTranslationService = {
      translate: jest.fn(),
      setLanguage: jest.fn(),
      getLanguage: signal<Language>('et'),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderLanguageComponent],
      providers: [
        { provide: TediTranslationService, useValue: mockTranslationService },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: 'et' },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderLanguageComponent);
    component = fixture.componentInstance;

    // Set required inputs
    const languages: HeaderLanguage = {
      en: 'ENG',
      et: 'EST',
      ru: 'RUS'
    };
    fixture.componentRef.setInput('languages', languages);
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have the host class applied', () => {
    expect(fixture.nativeElement.classList).toContain('tedi-header-language');
  });

  it('should compute languageKeys based on input', () => {
    const keys = component.languageKeys();
    expect(keys).toEqual(['en', 'et', "ru"]);
  });

  describe('handleChangeLang', () => {
    it('emits languageChange with the selected language', () => {
      const emitted: Language[] = [];
      component.languageChange.subscribe((lang) => emitted.push(lang));
      component.handleChangeLang('en');
      expect(emitted).toEqual(['en']);
    });

    it('updates the translation service language', () => {
      component.handleChangeLang('ru');
      expect(mockTranslationService.setLanguage).toHaveBeenCalledWith('ru');
    });

    it('hides the popover when one is rendered', () => {
      const hide = jest.fn();
      component.popover = {
        floatUiComponent: () => ({ hide }),
      } as unknown as typeof component.popover;
      component.handleChangeLang('et');
      expect(hide).toHaveBeenCalledTimes(1);
    });

    it('no-ops when no popover is present', () => {
      component.popover = undefined;
      expect(() => component.handleChangeLang('en')).not.toThrow();
    });
  });
});
