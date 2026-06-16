import { StorybookConfig } from "@storybook/angular";

const config: StorybookConfig = {
  stories: [
    "../src/docs/welcome.mdx",
    "../src/docs/get-started.mdx",
    "../src/docs/changelog.mdx",
    "../src/docs/badges.mdx",
    "../src/docs/custom-theming.mdx",
    "../src/docs/css-utilities.mdx",
    "../src/docs/colors/colors.mdx",
    "../src/docs/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../tedi/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../tedi/**/*.mdx",
    "../community/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@etchteam/storybook-addon-status",
    "storybook-addon-pseudo-states",
  ],
  framework: {
    name: "@storybook/angular",
    options: {
      builder: "angular",
    },
  },
  staticDirs: ["../public"],
  core: {
    disableTelemetry: true,
  },
};
export default config;
