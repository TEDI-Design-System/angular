---
name: tedi-angular
description: >
  Build UIs with @tedi-design-system/angular — 38+ accessible Angular components with design token
  theming. Use when creating interfaces, integrating form controls, customizing themes, or working
  with TEDI components in an Angular application.
---

# TEDI Design System — Angular

Angular component library with 38+ accessible, standalone components. Built on Angular 19+ with signal-based APIs and design tokens from `@tedi-design-system/core`.

## Installation

```bash
npm install @tedi-design-system/angular @tedi-design-system/core
```

### Peer Dependencies

```
@angular/core: ^19.0.0 || ^20.0.0 || ^21.0.0
@angular/common: ^19.0.0 || ^20.0.0 || ^21.0.0
@angular/forms: ^19.0.0 || ^20.0.0 || ^21.0.0
@angular/cdk: ^19.0.0 || ^20.0.0 || ^21.0.0
@angular/animations: ^19.0.0 || ^20.0.0 || ^21.0.0
@angular/platform-browser: ^19.0.0 || ^20.0.0 || ^21.0.0
ngx-float-ui: ^19.0.1 || ^20.0.0 || ^21.0.0
```

## Setup

### 1. Provide TEDI configuration

```typescript
// app.config.ts
import { provideTedi } from '@tedi-design-system/angular/tedi';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTedi({
      language: 'et',   // 'et' | 'en' | 'ru'
      theme: 'default', // 'default' | 'dark' | custom string
    }),
  ],
};
```

### 2. Import core styles

```scss
// styles.scss
@use '@tedi-design-system/core/scss' as tedi;
```

### 3. Use components

All components are standalone — import them directly where needed:

```typescript
import { ButtonComponent } from '@tedi-design-system/angular/tedi';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `<button tedi-button variant="primary">Click me</button>`,
})
export class MyComponent {}
```

## Component Patterns

### Standalone imports
Every TEDI component is standalone. Import only what you use:

```typescript
import {
  TextFieldComponent,
  FormFieldComponent,
  LabelComponent,
} from '@tedi-design-system/angular/tedi';
```

### Attribute vs element selectors
Some components use attribute selectors to enhance native elements:

```html
<!-- Attribute selector — enhances native <button> -->
<button tedi-button variant="primary">Save</button>

<!-- Attribute selector — enhances native <input> -->
<input tedi-text-field />

<!-- Element selector — wrapper component -->
<tedi-modal [open]="isOpen">...</tedi-modal>
<tedi-date-picker [formControl]="dateControl" />
```

### Signal-based inputs
All component APIs use Angular signals (`input()`, `model()`, `output()`):

```html
<!-- One-way binding -->
<button tedi-button [variant]="variant()" [size]="size()">Action</button>

<!-- Two-way binding (model inputs) -->
<tedi-date-picker [(selected)]="selectedDate" />
<tedi-modal [(open)]="isModalOpen">...</tedi-modal>
```

## Forms

TEDI form controls implement `ControlValueAccessor` for seamless reactive forms integration:

```typescript
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextFieldComponent, FormFieldComponent, LabelComponent } from '@tedi-design-system/angular/tedi';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, TextFieldComponent, FormFieldComponent, LabelComponent],
  template: `
    <tedi-form-field>
      <tedi-label>Email</tedi-label>
      <input tedi-text-field [formControl]="email" type="email" />
    </tedi-form-field>
  `,
})
export class MyFormComponent {
  email = new FormControl('');
}
```

Form controls: `TextFieldComponent`, `NumberFieldComponent`, `CheckboxComponent`, `ToggleComponent`, `DatePickerComponent`, `DropdownComponent`.

## Theming

TEDI uses CSS custom properties (design tokens) from `@tedi-design-system/core`. Switch themes at runtime:

```typescript
import { ThemeService } from '@tedi-design-system/angular/tedi';

export class MyComponent {
  private themeService = inject(ThemeService);

  toggleDark() {
    this.themeService.theme.set('dark');
  }
}
```

Themes apply via CSS class on `<html>`: `tedi-theme--default`, `tedi-theme--dark`.

## Translation

Built-in support for Estonian, English, and Russian:

```typescript
import { TediTranslationService } from '@tedi-design-system/angular/tedi';

export class MyComponent {
  private translation = inject(TediTranslationService);

  switchLanguage() {
    this.translation.setLanguage('en');
  }
}
```

## Additional References

Load based on your task — **do not load all at once**:

- [references/components.md](references/components.md) — All components by category with selectors, inputs, and usage
- [references/theming.md](references/theming.md) — Design tokens, SCSS customization, theme service
- [references/forms.md](references/forms.md) — Form controls, validation, reactive forms patterns
