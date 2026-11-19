# TEDI Design System for Angular

[![codecov](https://codecov.io/gh/TEDI-Design-System/angular/graph/badge.svg)](https://codecov.io/gh/TEDI-Design-System/angular)
[![semantic-release](https://img.shields.io/badge/semantic--release-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

`@tedi-design-system/angular` is a library of Angular components implementing the TEDI Design System.
It provides reusable, accessible, and consistent UI components to streamline building Angular applications.

Component documentation, examples and APIs are in [Storybook](https://storybook.tedi.ee/angular/main/?path=/docs/documentation-get-started--get-started).

---

## Getting Started

### Installation

```
npm install @tedi-design-system/angular
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser` and `@angular/cdk` 20, 21 or 22. The text editor also needs `quill` and the `ngx-quill` major that matches your Angular version: 28 for Angular 20, 30 for 21 and 31 for 22. Design tokens, fonts and icons come from `@tedi-design-system/core`, which is installed with the package.

### Setup

Add the stylesheet (fonts, tokens and component styles) to `angular.json`, next to your app's own global styles:

```jsonc
// projects.<app>.architect.build.options
"styles": ["node_modules/@tedi-design-system/angular/index.css", "src/styles.scss"]
```

To load only one Material Symbols style, use `index-without-icons.css` together with one of `icons/outlined.css`, `icons/rounded.css` or `icons/sharp.css`.

The text editor also needs Quill's stylesheets in your global styles:

```scss
// src/styles.scss
@forward "quill/dist/quill.core.css";
@forward "quill/dist/quill.snow.css";
```

Provide the theme and language in your application config, and start `ThemeService` with the app:

```ts
// app.config.ts
import { ApplicationConfig, inject, provideAppInitializer } from "@angular/core";
import { provideTedi, ThemeService } from "@tedi-design-system/angular/tedi";

export const appConfig: ApplicationConfig = {
  providers: [
    provideTedi({ language: "et", theme: "default" }),
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ],
};
```

`ThemeService` sets the theme class on `<html>`. It is created only when something injects it, so without the initializer a theme other than `default`, or one saved in the `tedi-theme` cookie, is not applied on load.

### Usage

Components are standalone. Import them into the component that uses them:

```ts
import { Component } from "@angular/core";
import { ButtonComponent } from "@tedi-design-system/angular/tedi";

@Component({
  selector: "app-root",
  imports: [ButtonComponent],
  template: `<button tedi-button variant="primary">Save</button>`,
})
export class AppComponent {}
```

TEDI-Ready components are exported from `@tedi-design-system/angular/tedi`, community components from `@tedi-design-system/angular/community`. The text editor has its own entry point, `@tedi-design-system/angular/community/text-editor`, so apps that don't use it don't need Quill. Prefer a TEDI-Ready component where one exists. Browse all components in [Storybook](https://storybook.tedi.ee/angular/main/?path=/docs/documentation-get-started--get-started).

### Supported versions

The library supports the three latest Angular majors, currently **Angular 20, 21 and 22**. See [Supported versions](https://github.com/TEDI-Design-System/general/wiki/Supported-versions) in the wiki for the policy and the [Angular release schedule](https://angular.dev/reference/releases) for upcoming dates.

---

## Accessibility

TEDI follows EN 301 549 and, for web content, WCAG 2.2 level AA. Components released before TEDI moved to WCAG 2.2 were built and tested against WCAG 2.1 AA and are being reviewed for the new criteria.

The [accessibility page on tedi.ee](https://www.tedi.ee/1ee8444b7/p/33df89-sissejuhatus/b/05a2e8) (in Estonian) describes how components are tested, what TEDI covers and what stays with your project, and how to report an accessibility issue.

---

## AI Tooling

### For consumers: the `tedi-angular` skill

Helps AI coding agents build UIs with `@tedi-design-system/angular`: component usage, forms integration, theming and translation setup.

Install it into your agent (Claude Code, Cursor, Codex and others) with the [`skills`](https://www.skills.sh) CLI, from your project root:

```bash
npx skills add https://github.com/TEDI-Design-System/angular --skill tedi-angular
```

### For contributors: the `contributing` skill

Guides development inside this repository: creating new components, running tests and lint, WCAG audits, refactoring and Storybook stories. Available as `/contributing` when working in this repository. Skills for contributing across the design system live in [TEDI-Design-System/ai-skills](https://github.com/TEDI-Design-System/ai-skills).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to report issues, set up the repository and open a pull request, and for adding or dropping an Angular major. Component guidelines and coding standards are in the [wiki](https://github.com/TEDI-Design-System/general/wiki).

To work on the library locally:

```
npm install
npm run start
```

`npm run start` launches Storybook for developing components in isolation.

---

## Visual Testing

[![Chromatic](https://img.shields.io/badge/Chromatic-fc521f?logo=chromatic&logoColor=white)](https://www.chromatic.com/)

We use [Chromatic](https://www.chromatic.com/) for visual testing, reviewing UI changes, and preventing visual regressions.

## License

[MIT](LICENSE). The bundled fonts and the logos in `public/` are not covered, see [NOTICE.md](NOTICE.md).
