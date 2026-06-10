# TEDI Design System for Angular

[![codecov](https://codecov.io/gh/TEHIK-EE/tedi-design-system/graph/badge.svg?token=NKNNJSG19D)](https://codecov.io/gh/TEHIK-EE/tedi-design-system)
[![semantic-release](https://img.shields.io/badge/semantic--release-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

`@tedi-design-system/angular` is a library of Angular components implementing the TEDI Design System.  
It provides reusable, accessible, and consistent UI components to streamline building Angular applications.

Usage instructions and detailed documentation can be found in the [TEDI Design System wiki](https://github.com/TEDI-Design-System/general).

---

## Installation

Install the dependencies for your Angular library:

```
npm run i
```

---

## Development Guide

### Running Storybook

To view and develop components in isolation, start Storybook for Angular:

```
npm run start
```

## Angular Version Support

The library supports the three latest Angular major versions. Angular releases a new major every 6 months and deprecates versions after 18 months. See the [Angular release schedule](https://angular.dev/reference/releases) for upcoming dates.

**Currently supported: Angular 20, 21, 22**

> **Note:** `ngx-float-ui` has not published an Angular 22 release yet. On Angular 22, install `ngx-float-ui@21` with `--legacy-peer-deps` until it ships.

The library is built and tested against the base version pinned in `devDependencies`. In addition, the `compatibility` job in CI installs the built package into a fresh app for every supported Angular major to verify it is consumable.

### Adding a new Angular version

When a new Angular major is released (e.g. v23):

1. **`package.json`** — add `|| ^23.0.0` to every Angular peer dependency (and `ngx-float-ui` once it has a matching release)
2. **`.github/workflows/angular-test-and-lint.yml`** — add `23` to the `angular-version` matrix in the `compatibility` job

### Dropping a deprecated Angular version

When an Angular major reaches end-of-life (e.g. v20):

1. **`package.json`** — remove `^20.0.0 ||` from every Angular peer dependency and `ngx-float-ui`
2. **`.github/workflows/angular-test-and-lint.yml`** — remove `20` from the `angular-version` matrix in the `compatibility` job
3. Bump `devDependencies` to the new minimum supported Angular version so the library is always built and developed against a supported release

## Contributing

Check the [wiki](https://github.com/TEDI-Design-System/general) for component guidelines and coding standards.
Report issues or contribute via [GitHub Issues](https://github.com/TEDI-Design-System/angular/issues).

## AI Skills

This project ships with AI agent skills to help both contributors and consumers work with TEDI components.

### For consumers — `tedi-angular`

Helps you build UIs with `@tedi-design-system/angular`: component usage, forms integration, theming, and translation setup.

### For contributors — `contributing`

Guides development inside this repo: creating new components, running tests/lint, WCAG audits, refactoring, and Storybook stories. Available as `/contributing` when working in this repository.

---

## Visual Testing

<a href="https://www.chromatic.com/"><img src="https://user-images.githubusercontent.com/321738/84662277-e3db4f80-af1b-11ea-88f5-91d67a5e59f6.png" width="153" height="30" alt="Chromatic" /></a>

We use [Chromatic](https://www.chromatic.com/) for visual testing, reviewing UI changes, and preventing visual regressions.
