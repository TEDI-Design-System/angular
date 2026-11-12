import { Component, computed, signal } from "@angular/core";
import {
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";
import {
  AlertComponent,
  ButtonComponent,
  IconComponent,
  RadioCardComponent,
  RadioCardGroupComponent,
  RadioComponent,
  SeparatorComponent,
  TextComponent,
} from "@tedi-design-system/angular/tedi";
import {
  QuestionnaireComponent,
  QuestionnaireStep,
} from "./questionnaire.component";

const INTERACTIVE_STEPS: (QuestionnaireStep & { questions: string[] })[] = [
  {
    label: "Töökoha ja tööasendi ergonoomilisus",
    questions: [
      "Kas kasutad töölauana kirjutuslauda?",
      "Kas kasutad eraldiseisvat hiirt, klaviatuuri ja ergonoomilist randmetuge?",
      "Kas on harjumus muuta tööasendeid, nt telefoniga rääkida seistes vms?",
    ],
  },
  {
    label: "Töökoha valgustus",
    questions: [
      "Kas töökohal on piisavalt päevavalgust?",
      "Kas kasutad laualampi?",
    ],
  },
  {
    label: "Töökoha õhu kvaliteet",
    questions: [
      "Kas tuulutad ruumi regulaarselt?",
      "Kas ruumi temperatuur on mugav?",
    ],
  },
  {
    label: "Töö organiseerimine",
    questions: [
      "Kas teed tööpäeva jooksul regulaarselt pause?",
      "Kas tööaeg ja vaba aeg on selgelt eraldatud?",
    ],
  },
  {
    label: "Viiruse kaitse",
    questions: ["Kas arvutis on ajakohane viirusetõrje?"],
  },
];

@Component({
  selector: "story-questionnaire-interactive",
  imports: [
    QuestionnaireComponent,
    AlertComponent,
    ButtonComponent,
    IconComponent,
    RadioCardComponent,
    RadioCardGroupComponent,
    RadioComponent,
    SeparatorComponent,
    TextComponent,
  ],
  template: `
    <tedi-questionnaire
      heading="Kodukontori küsimustik"
      [steps]="steps"
      [(activeStep)]="activeStep"
      [progress]="progress()"
      [progressLabel]="step().label"
      [progressValueLabel]="activeStep() + 1 + '/' + steps.length"
      (back)="activeStep.set(Math.max(activeStep() - 1, 0))"
    >
      @if (submitted()) {
        <tedi-alert type="success" title="Küsimustik on esitatud">
          Vastasid {{ answeredCount() }} küsimusele {{ totalCount }}-st.
        </tedi-alert>
      } @else {
        @for (question of step().questions; track question; let i = $index) {
          @if (i > 0) {
            <tedi-separator />
          }
          <div
            class="flex flex-column gap-2"
            role="radiogroup"
            [attr.aria-labelledby]="questionId(i)"
          >
            <p tedi-text modifiers="bold" [id]="questionId(i)">{{ question }}</p>
            <tedi-radio-card-group>
              @for (option of options; track option) {
                <label tedi-radio-card variant="secondary">
                  <input
                    tedi-radio
                    type="radio"
                    [name]="questionId(i)"
                    [value]="option"
                    [checked]="answers()[questionId(i)] === option"
                    (change)="answer(questionId(i), option)"
                  />
                  {{ option }}
                </label>
              }
            </tedi-radio-card-group>
          </div>
        }
      }
      @if (!submitted()) {
        <button tedi-button type="button" questionnaire-actions (click)="next()">
          {{ isLast() ? "Esita" : "Salvesta ja jätka" }}
          <tedi-icon name="arrow_forward" />
        </button>
      }
    </tedi-questionnaire>
  `,
})
class QuestionnaireInteractiveDemoComponent {
  readonly Math = Math;
  readonly steps = INTERACTIVE_STEPS;
  readonly options = ["Jah", "Ei"];
  readonly totalCount = INTERACTIVE_STEPS.reduce(
    (sum, s) => sum + s.questions.length,
    0,
  );

  activeStep = signal(0);
  answers = signal<Record<string, string>>({});
  submitted = signal(false);

  step = computed(() => this.steps[this.activeStep()]);
  isLast = computed(() => this.activeStep() === this.steps.length - 1);
  answeredCount = computed(() => Object.keys(this.answers()).length);
  progress = computed(() =>
    this.steps.map(
      (s, si) =>
        s.questions.filter((_, qi) => this.answers()[`q-${si}-${qi}`]).length /
        s.questions.length,
    ),
  );

  questionId(index: number) {
    return `q-${this.activeStep()}-${index}`;
  }

  answer(id: string, value: string) {
    this.answers.update((a) => ({ ...a, [id]: value }));
  }

  next() {
    if (this.isLast()) {
      this.submitted.set(true);
    } else {
      this.activeStep.update((i) => i + 1);
    }
  }
}

/**
 * Page layout for a multi-step questionnaire: heading with a back button, a segmented progress bar
 * (one segment per step), a step navigation and the questions of the active step.
 *
 * Questions are projected as content and footer actions with the `questionnaire-actions` attribute.
 * Below the `md` breakpoint the step navigation stacks above the questions.
 */
export default {
  title: "Community/Layout/Questionnaire",
  component: QuestionnaireComponent,
  decorators: [
    moduleMetadata({
      imports: [
        QuestionnaireComponent,
        ButtonComponent,
        IconComponent,
        RadioCardComponent,
        RadioCardGroupComponent,
        RadioComponent,
        SeparatorComponent,
        TextComponent,
      ],
    }),
  ],
  parameters: {
    status: { type: ["breakpointSupport"] },
  },
  args: {
    heading: "Kodukontori küsimustik",
    steps: [
      { label: "Töökoha ja tööasendi ergonoomilisus" },
      { label: "Töökoha valgustus" },
      { label: "Töökoha õhu kvaliteet" },
      { label: "Töö organiseerimine" },
      { label: "Viiruse kaitse" },
    ],
    activeStep: 0,
    progress: 0.4,
    progressLabel: "Töökoha ja tööasendi ergonoomilisuse küsimused",
    progressValueLabel: "1/6",
    showBack: true,
  },
} as Meta<QuestionnaireComponent>;

type Story = StoryObj<QuestionnaireComponent>;

const QUESTIONS = [
  "Kas kasutad töölauana kirjutuslauda?",
  "Kas kasutad eraldiseisvat hiirt, klaviatuuri ja ergonoomilist randmetuge?",
  "Kas on harjumus muuta tööasendeid, nt telefoniga rääkida seistes vms?",
];

export const Default: Story = {
  render: (args) => ({
    props: { ...args, questions: QUESTIONS },
    template: `
      <tedi-questionnaire ${argsToTemplate(args)}>
        @for (question of questions; track $index; let i = $index) {
          @if (i > 0) {
            <tedi-separator />
          }
          <div class="flex flex-column gap-2" role="radiogroup" [attr.aria-labelledby]="'question-' + i">
            <p tedi-text modifiers="bold" [id]="'question-' + i">{{ question }}</p>
            <tedi-radio-card-group>
              <label tedi-radio-card variant="secondary">
                <input tedi-radio type="radio" [name]="'question-' + i" value="yes" />
                Jah
              </label>
              <label tedi-radio-card variant="secondary">
                <input tedi-radio type="radio" [name]="'question-' + i" value="no" />
                Ei
              </label>
            </tedi-radio-card-group>
          </div>
        }
        <button tedi-button type="submit" questionnaire-actions>
          Salvesta ja jätka
          <tedi-icon name="arrow_forward" />
        </button>
      </tedi-questionnaire>
    `,
  }),
};

export const WithoutBackButton: Story = {
  args: { showBack: false },
  render: Default.render,
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1" } },
  render: Default.render,
};

/**
 * Answering fills the active step's progress segment, "Salvesta ja jätka" moves to the next step
 * and the step navigation switches between steps. Answers are kept when switching steps.
 */
export const Interactive: Story = {
  render: () => ({
    moduleMetadata: { imports: [QuestionnaireInteractiveDemoComponent] },
    template: `<story-questionnaire-interactive />`,
  }),
};
