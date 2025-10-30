import { StorybookConfig } from "@storybook/angular";

const config: StorybookConfig = {
  stories: [
    "../src/docs/welcome.mdx",
    "../src/docs/get-started.mdx",
    "../src/docs/changelog.mdx",
    "../src/docs/badges.mdx",
    "../src/docs/colors/colors.mdx",
    "../src/docs/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../tedi/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../community/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
    "@etchteam/storybook-addon-status",
    "storybook-addon-pseudo-states",
    "storybook-addon-angular-router",
  ],
  framework: {
    name: "@storybook/angular",
    options: {
      builder: "angular",
    },
  },
  staticDirs: ["../public"],
  docs: {
    autodocs: true,
  },
  core: {
    disableTelemetry: true,
  },
};
export default config;
