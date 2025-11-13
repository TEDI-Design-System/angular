import { Preview, StoryContext } from '@storybook/angular';
import { ThemeService, Theme } from '../tedi/services/themes/themes.service';
import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/blocks";

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'default',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'default', title: 'Default' },
        { value: 'dark', title: 'Dark' },
      ],
      showName: true,
    },
  },
};

const themeDecorator = (storyFn: any, context: StoryContext) => {
  const theme = (context.globals['theme'] as Theme) ?? 'default';

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    const prefix = 'tedi-theme--';
    const currentClass = Array.from(html.classList).find(cls => 
      cls.startsWith(prefix)
    );
    
    if (currentClass) {
      html.classList.replace(currentClass, `${prefix}${newTheme}`);
    } else {
      html.classList.add(`${prefix}${newTheme}`);
    }

    const bg = newTheme === 'dark' ? 'var(--color-bg-inverted, #1a1a1a)' : '';
    const selectors = '.sb-show-main, .docs-story > div';

    requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(selectors).forEach(el => {
        el.style.backgroundColor = bg;
      });
    });
  };

  applyTheme(theme);

  const story = storyFn();
  return story;
};

const preview: Preview = {
  decorators: [themeDecorator],
  parameters: {
    viewMode: "docs",
    backgrounds: {
      values: [{ name: "brand", value: "var(--primary-600)" }],
    },
    docs: {
      toc: true,
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
          <Stories includePrimary={false} />
        </>
      ),
    },
    status: {
      statuses: {
        devComponent: { background: '#ff8000', color: '#fff', description: 'Dev only' },
        breakpointSupport: { background: '#308653', color: '#fff', description: 'Breakpoint support' },
        internalComponent: { background: '#fff', color: '#000', description: 'Internal only' },
        existsInTediReady: { background: '#005aa3', color: '#fff', description: 'TEDI-ready' },
      },
    },
    injector: {
      get: (token: any) => (token === ThemeService ? new ThemeService({} as any) : null),
    },
  },
};

export default preview;
