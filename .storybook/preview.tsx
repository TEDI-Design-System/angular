import { applicationConfig, Preview, StoryContext } from "@storybook/angular";
import { provideRouter, withDisabledInitialNavigation } from "@angular/router";
import { Theme } from "../tedi/services/theme/theme.service";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../tedi/tokens/translation.token";

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: "default",
    toolbar: {
      icon: "paintbrush",
      items: [
        { value: "default", title: "Default" },
        { value: "dark", title: "Dark" },
      ],
      showName: true,
    },
  },
};

const themeDecorator = (storyFn: any, context: StoryContext) => {
  const theme = (context.globals["theme"] as Theme) ?? "default";

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    const prefix = "tedi-theme--";
    const currentClass = Array.from(html.classList).find((cls) =>
      cls.startsWith(prefix),
    );

    if (currentClass) {
      html.classList.replace(currentClass, `${prefix}${newTheme}`);
    } else {
      html.classList.add(`${prefix}${newTheme}`);
    }

    const bg = newTheme === "dark" ? "var(--color-bg-inverted, #1a1a1a)" : "";
    const selectors = ".sb-show-main, .docs-story > div";

    requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(selectors).forEach((el) => {
        el.style.backgroundColor = bg;
      });
    });
  };

  applyTheme(theme);

  const story = storyFn();
  return story;
};

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [
    themeDecorator,
    applicationConfig({
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        // Replaces storybook-addon-angular-router (Storybook 8 only):
        // provides Router/ActivatedRoute for stories using routerLink.
        // Initial navigation must stay disabled — the router cannot match
        // Storybook's iframe.html URL and the failed render breaks stories.
        provideRouter([], withDisabledInitialNavigation()),
      ],
    }),
  ],
  parameters: {
    viewMode: "docs",
    backgrounds: {
      options: {
        brand: { name: "brand", value: "var(--tedi-primary-600)" }
      },
    },
    docs: {
      codePanel: true,
      toc: true,
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Description of="story" />
          <Controls />
          <Stories includePrimary={false} />
        </>
      ),
    },
    status: {
      statuses: {
        devComponent: {
          background: "#ff8000",
          color: "#fff",
          description: "Dev only",
        },
        breakpointSupport: {
          background: "#308653",
          color: "#fff",
          description: "Breakpoint support",
        },
        internalComponent: {
          background: "#fff",
          color: "#000",
          description: "Internal only",
        },
        existsInTediReady: {
          background: "#005aa3",
          color: "#fff",
          description: "TEDI-ready",
        },
        partiallyTediReady: {
          background: "#9bbb5f",
          color: "#fff",
          description:
            "This component lacks some TEDI-Ready functionality, e.g it may rely on another component that has not yet been developed",
        },
        mobileViewDifference: {
          background: "#99BDDA",
          color: "#000",
          description:
            "This component has a different layout on mobile. Use the mobile breakpoint or resize the browser window to review the mobile design.",
        },
      },
    },
  },
};

export default preview;
