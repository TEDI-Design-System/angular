import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import {
  ButtonComponent,
  ColComponent,
  LinkComponent,
  RowComponent,
  StatusBadgeComponent,
  TextComponent,
  VerticalSpacingDirective,
} from "@tedi-design-system/angular/tedi";
import {
  ProcessTimelineComponent,
  ProcessTimelineDescriptionComponent,
  ProcessTimelineItemComponent,
  ProcessTimelineItemState,
  ProcessTimelineTitleComponent,
} from "./index";

/**
 * An informational process timeline: shows the stages of a business process and the status of
 * each stage. It is not a stepper: stages aren't clickable or focusable, only the buttons and
 * links inside them are.
 *
 * Use it on a native ordered list: `<ol tedi-process-timeline>` with
 * `<li tedi-process-timeline-item>` children. The stage number comes from the order; completed and
 * upcoming stages get a visually hidden state text, and the active stage gets
 * `aria-current="step"`. Indicators and connectors are decorative and hidden from screen readers.
 */
export default {
  title: "Community/Helpers/ProcessTimeline",
  component: ProcessTimelineComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ProcessTimelineComponent,
        ProcessTimelineItemComponent,
        ProcessTimelineTitleComponent,
        ProcessTimelineDescriptionComponent,
        StatusBadgeComponent,
        ButtonComponent,
        LinkComponent,
        RowComponent,
        ColComponent,
        TextComponent,
        VerticalSpacingDirective,
      ],
    }),
  ],
  argTypes: {
    orientation: {
      description:
        "Layout direction; accepts a breakpoint object such as `{ xs: 'vertical', md: 'horizontal' }`.",
      control: "object",
      table: {
        category: "inputs",
        type: {
          summary: "BreakpointInput<ProcessTimelineOrientation>",
          detail:
            '"horizontal" | "vertical" | { xs: ProcessTimelineOrientation; sm?: …; md?: …; lg?: …; xl?: …; xxl?: … }',
        },
        defaultValue: { summary: '{ xs: "vertical", md: "horizontal" }' },
      },
    },
    connectorThickness: {
      description: "Thickness of the connectors between stages, in pixels.",
      control: "radio",
      options: [1, 2],
      table: {
        category: "inputs",
        type: { summary: "ProcessTimelineConnectorThickness" },
        defaultValue: { summary: "1" },
      },
    },
  },
  parameters: {
    status: {
      type: ["breakpointSupport", "mobileViewDifference"],
    },
  },
} as Meta<ProcessTimelineComponent>;

type Story = StoryObj<ProcessTimelineComponent>;

type Badge = { color: "success" | "warning" | "danger"; text: string };
type Stage = { state: ProcessTimelineItemState; title: string; badges: Badge[] };

const SUBMITTED: Badge = { color: "success", text: "Esitatud" };
const QUALIFIED: Badge = { color: "success", text: "Kvalifitseeritud" };
const PUBLISHED: Badge = { color: "success", text: "Avalikustatud" };
const DISQUALIFIED: Badge = { color: "danger", text: "Diskvalifitseeritud" };

const stage = (
  state: ProcessTimelineItemState,
  title: string,
  badges: Badge[] = [],
): Stage => ({ state, title, badges });

const EP_STATES: { name: string; stages: Stage[] }[] = [
  {
    name: "Esitatud",
    stages: [
      stage("completed", "Pakkumine esitatud", [SUBMITTED]),
      stage("upcoming", "Kvalifitseerimine"),
      stage("upcoming", "Tulemused"),
    ],
  },
  {
    name: "Kinnituse ootel",
    stages: [
      stage("completed", "Pakkumine esitatud", [
        SUBMITTED,
        { color: "warning", text: "Kinnituse ootel" },
      ]),
      stage("upcoming", "Kvalifitseerimine"),
      stage("upcoming", "Tulemused"),
    ],
  },
  {
    name: "Kinnitatud",
    stages: [
      stage("completed", "Pakkumine esitatud", [
        SUBMITTED,
        { color: "success", text: "Kinnitatud" },
      ]),
      stage("upcoming", "Kvalifitseerimine"),
      stage("upcoming", "Tulemused"),
    ],
  },
  {
    name: "Kvalifitseeritud",
    stages: [
      stage("completed", "Pakkumine esitatud", [SUBMITTED]),
      stage("completed", "Kvalifitseerimine", [QUALIFIED]),
      stage("upcoming", "Tulemused"),
    ],
  },
  {
    name: "Tulemused",
    stages: [
      stage("completed", "Pakkumine esitatud", [SUBMITTED]),
      stage("completed", "Kvalifitseerimine", [QUALIFIED]),
      stage("completed", "Tulemused", [PUBLISHED]),
    ],
  },
  {
    name: "Diskvalifitseeritud",
    stages: [
      stage("completed", "Pakkumine esitatud", [SUBMITTED]),
      stage("completed", "Kvalifitseerimine", [DISQUALIFIED]),
      stage("completed", "Tulemused", [PUBLISHED]),
    ],
  },
  {
    name: "Nurjunud",
    stages: [
      stage("completed", "Pakkumine esitatud", [
        SUBMITTED,
        { color: "danger", text: "Nurjunud" },
      ]),
      stage("completed", "Kvalifitseerimine", [DISQUALIFIED]),
      stage("upcoming", "Tulemused"),
    ],
  },
  {
    name: "Tühistatud",
    stages: [
      stage("completed", "Pakkumine esitatud", [
        SUBMITTED,
        { color: "danger", text: "Tühistatud" },
      ]),
      stage("completed", "Kvalifitseerimine", [DISQUALIFIED]),
      stage("upcoming", "Tulemused"),
    ],
  },
];

const stagesTemplate = (bindings = "") => `
  <ol tedi-process-timeline ${bindings}>
    @for (stage of stages; track $index) {
      <li tedi-process-timeline-item [state]="stage.state">
        <tedi-process-timeline-title>{{ stage.title }}</tedi-process-timeline-title>
        @for (badge of stage.badges; track badge.text) {
          <tedi-status-badge
            [color]="badge.color"
            [text]="badge.text"
            [icon]="badge.color === 'success' ? 'check' : ''"
          />
        }
      </li>
    }
  </ol>
`;

const richTemplate = (bindings = "") => `
  <ol tedi-process-timeline ${bindings}>
    <li tedi-process-timeline-item state="completed">
      <tedi-process-timeline-title>Pakkumine esitatud</tedi-process-timeline-title>
      <tedi-status-badge color="success" text="Esitatud" icon="check" />
      <tedi-status-badge color="warning" text="Kinnituse ootel" />
    </li>
    <li tedi-process-timeline-item state="active">
      <tedi-process-timeline-title>Kvalifitseerimine ja vastavuse kontroll</tedi-process-timeline-title>
      <tedi-process-timeline-description>
        Hankija kontrollib kvalifikatsiooni dokumente. Vastus hiljemalt 15.12.2026.
      </tedi-process-timeline-description>
      <tedi-status-badge color="warning" text="Lisainfo vajalik" />
      <button tedi-button variant="secondary" size="small">Lisa dokumendid</button>
      <a tedi-link href="#" size="small">Vaata nõudeid</a>
    </li>
    <li tedi-process-timeline-item state="upcoming">
      <tedi-process-timeline-title>Tulemused</tedi-process-timeline-title>
    </li>
  </ol>
`;

export const Default: Story = {
  args: {
    orientation: { xs: "vertical", md: "horizontal" },
    connectorThickness: 1,
  },
  render: (args) => ({
    props: { ...args },
    template: richTemplate(argsToTemplate(args)),
  }),
};

const STATES: { state: ProcessTimelineItemState; label: string }[] = [
  { state: "completed", label: "Completed" },
  { state: "active", label: "Active" },
  { state: "upcoming", label: "Upcoming" },
];

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { STATES },
    template: `
      <tedi-row [cols]="1" [gapY]="3">
        @for (item of STATES; track item.state) {
          <tedi-row cols="1" [sm]="{ cols: 6 }" alignItems="center">
            <tedi-col width="1">
              <p tedi-text modifiers="bold">{{ item.label }}</p>
            </tedi-col>
            <tedi-col width="5">
              <ol tedi-process-timeline orientation="horizontal">
                <li tedi-process-timeline-item [state]="item.state">
                  <tedi-process-timeline-title>Etapi pealkiri</tedi-process-timeline-title>
                </li>
              </ol>
            </tedi-col>
          </tedi-row>
        }
      </tedi-row>
    `,
  }),
};

export const EpStates: Story = {
  name: "EP states",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "All eight business states of a procurement offer. The state of each stage follows the business status, not the order.",
      },
    },
  },
  render: () => ({
    props: { EP_STATES },
    template: `
      <div [tediVerticalSpacing]="2">
        @for (ep of EP_STATES; track ep.name) {
          <div [tediVerticalSpacing]="0.5">
            <p tedi-text modifiers="bold">{{ ep.name }}</p>
            ${stagesTemplate().replace("of stages;", "of ep.stages;")}
          </div>
        }
      </div>
    `,
  }),
};

export const ConnectorThickness: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { stages: EP_STATES[3].stages },
    template: `
      <div [tediVerticalSpacing]="2">
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">1px</p>
          ${stagesTemplate('[connectorThickness]="1"')}
        </div>
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">2px</p>
          ${stagesTemplate('[connectorThickness]="2"')}
        </div>
      </div>
    `,
  }),
};

export const StageCount: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      two: [
        stage("completed", "Taotlus esitatud", [SUBMITTED]),
        stage("active", "Menetlus"),
      ],
      five: [
        stage("completed", "Pakkumine esitatud", [SUBMITTED]),
        stage("completed", "Kvalifitseerimine", [QUALIFIED]),
        stage("active", "Hindamine"),
        stage("upcoming", "Läbirääkimised"),
        stage("upcoming", "Tulemused"),
      ],
    },
    template: `
      <div [tediVerticalSpacing]="2">
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">2 stages</p>
          ${stagesTemplate().replace("of stages;", "of two;")}
        </div>
        <div [tediVerticalSpacing]="0.5">
          <p tedi-text modifiers="bold">5 stages</p>
          ${stagesTemplate().replace("of stages;", "of five;")}
        </div>
      </div>
    `,
  }),
};

export const Vertical: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Vertical on every screen size, for example in a narrow sidebar: `orientation="vertical"`.',
      },
    },
  },
  render: () => ({
    template: richTemplate('orientation="vertical"'),
  }),
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1" } },
  parameters: { controls: { disable: true } },
  render: () => ({
    template: richTemplate(),
  }),
};
