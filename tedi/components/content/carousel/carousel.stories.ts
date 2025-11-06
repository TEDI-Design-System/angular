import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { CarouselComponent } from "./carousel.component";
import { CarouselHeaderComponent } from "./carousel-header/carousel-header.component";
import { CarouselNavigationComponent } from "./carousel-navigation/carousel-navigation.component";
import { CarouselFooterComponent } from "./carousel-footer/carousel-footer.component";
import { CarouselContentComponent } from "./carousel-content/carousel-content.component";
import {
  CarouselIndicatorsComponent,
  CarouselIndicatorsVariant,
} from "./carousel-indicators/carousel-indicators.component";
import { CarouselSlideDirective } from "./carousel-slide.directive";
import { TextComponent } from "../../base/text/text.component";
import { BreakpointInput } from "../../../services/breakpoint/breakpoint.service";
import { IconComponent } from "../../base/icon/icon.component";
import { ButtonComponent } from "../../buttons/button/button.component";

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.20.28?node-id=26296-151359&m=dev" target="_BLANK">Figma ↗</a><br/>
 * <a href="#" target="_BLANK">Zeroheight ↗</a>
 */

export default {
  title: "TEDI-Ready/Content/Carousel",
  component: CarouselComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CarouselComponent,
        CarouselSlideDirective,
        CarouselHeaderComponent,
        CarouselFooterComponent,
        CarouselNavigationComponent,
        CarouselContentComponent,
        CarouselIndicatorsComponent,
        TextComponent,
        IconComponent,
        ButtonComponent,
      ],
    }),
  ],
  argTypes: {
    slidesPerView: {
      description:
        "Slides per view (minimum 1, can be fractional, e.g. 1.25 for peeking)",
      control: {
        type: "object",
      },
      table: {
        category: "Carousel Content",
        type: {
          summary: "number | BreakpointObject<number>",
          detail:
            "number | { \n xs: number; \n sm?: number; \n md?: number; \n lg?: number; \n xl?: number; \n xxl?: number \n}",
        },
        defaultValue: { summary: "1" },
      },
    },
    gap: {
      description: "Gap between slides in px",
      control: {
        type: "object",
      },
      table: {
        category: "Carousel Content",
        type: {
          summary: "number | BreakpointObject<number>",
          detail:
            "number | { \n xs: number; \n sm?: number; \n md?: number; \n lg?: number; \n xl?: number; \n xxl?: number \n}",
        },
        defaultValue: { summary: "16" },
      },
    },
    fade: {
      description:
        "Should carousel have fade? In mobile both left and right, in desktop only right.",
      control: {
        type: "boolean",
      },
      table: {
        category: "Carousel Content",
        type: {
          summary: "boolean",
        },
        defaultValue: { summary: "false" },
      },
    },
    transitionMs: {
      description: "Transition duration in ms",
      control: {
        type: "number",
      },
      table: {
        category: "Carousel Content",
        type: {
          summary: "number",
        },
        defaultValue: { summary: "400" },
      },
    },
    withArrows: {
      description:
        "Should show indicators with arrows? If yes, don't use carousel-navigation component",
      control: {
        type: "boolean",
      },
      table: {
        category: "Carousel Indicators",
        type: {
          summary: "boolean",
        },
        defaultValue: { summary: "false" },
      },
    },
    variant: {
      description: "Variant of indicators (dots and numbers)",
      control: "radio",
      options: ["dots", "numbers"],
      table: {
        category: "Carousel Indicators",
        type: {
          summary: "CarouselIndicatorsVariant",
          detail: "'dots' | 'numbers'",
        },
        defaultValue: { summary: "dots" },
      },
    },
  },
} as Meta<CarouselComponent>;

type CarouselType = CarouselComponent & {
  slidesPerView: BreakpointInput<number>;
  gap: BreakpointInput<number>;
  fade: boolean;
  transitionMs: number;
  withArrows: boolean;
  variant: CarouselIndicatorsVariant;
};

export const Default: StoryObj<CarouselType> = {
  args: {
    slidesPerView: { xs: 1, sm: 2, md: 2.5, lg: 3, xl: 3.5, xxl: 4 },
    gap: { xs: 16 },
    fade: false,
    transitionMs: 400,
    withArrows: false,
    variant: "dots",
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-carousel>
        <tedi-carousel-header>
          <div>
            <h2 tedi-text modifiers="h1">Title</h2>
            <p tedi-text color="secondary">Description</p>
          </div>
          <tedi-carousel-navigation />
        </tedi-carousel-header>
        <tedi-carousel-content [slidesPerView]="slidesPerView" [gap]="gap" [fade]="fade">
         @for (i of [0, 1, 2, 3, 4]; track $index) {
            <ng-template tediCarouselSlide>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
              </div>
            </ng-template>
          }
        </tedi-carousel-content>
        <tedi-carousel-footer style="justify-content: center;">
          <tedi-carousel-indicators [withArrows]="withArrows" [variant]="variant" />
        </tedi-carousel-footer>
      </tedi-carousel>
    `,
  }),
};

export const TopPaginationArrowsOnly: StoryObj<CarouselType> = {
  name: "Top pagination - arrows only",
  args: {
    slidesPerView: { xs: 1, sm: 2, md: 2.5, lg: 3, xl: 3.5, xxl: 4 },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-carousel>
        <tedi-carousel-header>
          <h2 tedi-text modifiers="h1">Title</h2>
          <tedi-carousel-navigation />
        </tedi-carousel-header>
        <tedi-carousel-content [slidesPerView]="slidesPerView">
          @for (i of [0, 1, 2, 3, 4]; track $index) {
            <ng-template tediCarouselSlide>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
              </div>
              </ng-template>
          }
        </tedi-carousel-content>
      </tedi-carousel>
    `,
  }),
};

export const SeparatedBottomPaginationHasDots: StoryObj<CarouselType> = {
  name: "Separated bottom pagination - has dots",
  args: {
    slidesPerView: { xs: 1, sm: 2, md: 2.5, lg: 3, xl: 3.5, xxl: 4 },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-carousel>
        <tedi-carousel-header>
          <h2 tedi-text modifiers="h1">Title</h2>
        </tedi-carousel-header>
        <tedi-carousel-content [slidesPerView]="slidesPerView">
          @for (i of [0, 1, 2, 3, 4]; track $index) {
            <ng-template tediCarouselSlide>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
              </div>
            </ng-template>
          }
        </tedi-carousel-content>
        <tedi-carousel-footer>
          <tedi-carousel-indicators />
          <tedi-carousel-navigation />
        </tedi-carousel-footer>
      </tedi-carousel>
    `,
  }),
};

export const SeparatedBottomPaginationHasNumbers: StoryObj<CarouselType> = {
  name: "Separated bottom pagination - has numbers",
  args: {
    slidesPerView: { xs: 1, sm: 2, md: 2.5, lg: 3, xl: 3.5, xxl: 4 },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-carousel>
        <tedi-carousel-header>
          <h2 tedi-text modifiers="h1">Title</h2>
        </tedi-carousel-header>
        <tedi-carousel-content [slidesPerView]="slidesPerView">
          @for (i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; track $index) {
            <ng-template tediCarouselSlide>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
              </div>
            </ng-template>
          }
        </tedi-carousel-content>
        <tedi-carousel-footer>
          <tedi-carousel-indicators variant="numbers" />
          <tedi-carousel-navigation />
        </tedi-carousel-footer>
      </tedi-carousel>
    `,
  }),
};

export const CenteredBottomPaginationHasDots: StoryObj<CarouselType> = {
  name: "Centered bottom pagination - has dots",
  args: {
    slidesPerView: { xs: 1, sm: 2, md: 2.5, lg: 3, xl: 3.5, xxl: 4 },
  },
  render: (args) => ({
    props: args,
    template: `
      <tedi-carousel>
        <tedi-carousel-header>
          <h2 tedi-text modifiers="h1">Title</h2>
        </tedi-carousel-header>
        <tedi-carousel-content [slidesPerView]="slidesPerView">
          @for (i of [0, 1, 2, 3, 4, 5]; track $index) {
            <ng-template tediCarouselSlide>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
              </div>
            </ng-template>
          }
        </tedi-carousel-content>
        <tedi-carousel-footer style="justify-content: center;">
          <tedi-carousel-indicators [withArrows]="true" />
        </tedi-carousel-footer>
      </tedi-carousel>
    `,
  }),
};

// export const CenteredBottomPaginationHasNumbers: StoryObj<CarouselType> = {
//   name: "Centered bottom pagination - has numbers",
//   args: {
//     slidesPerView: { xs: 1, sm: 2, md: 2.5, lg: 3, xl: 3.5, xxl: 4 },
//   },
//   render: (args) => ({
//     props: args,
//     template: `
//       <tedi-carousel>
//         <tedi-carousel-header>
//           <h2 tedi-text modifiers="h1">Title</h2>
//         </tedi-carousel-header>
//         <tedi-carousel-content [slidesPerView]="slidesPerView">
//           @for (i of [0, 1, 2, 3, 4, 5]; track $index) {
//             <ng-template tediCarouselSlide>
//               <div
//                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
//               >
//                 <tedi-icon name="spa" [size]="36" color="tertiary" />
//                 <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
//               </div>
//             </ng-template>
//           }
//         </tedi-carousel-content>
//         <tedi-carousel-footer style="justify-content: center;">
//           <tedi-carousel-indicators variant="numbers" [withArrows]="true" />
//         </tedi-carousel-footer>
//       </tedi-carousel>
//     `,
//   }),
// };

// export const CombinationsTopNavigationBottomDots: StoryObj<CarouselType> = {
//   name: "Combinations - top navigation, bottom dots",
//   args: {
//     slidesPerView: { xs: 1, sm: 2, md: 2.5, lg: 3, xl: 3.5, xxl: 4 },
//   },
//   render: (args) => ({
//     props: args,
//     template: `
//       <tedi-carousel>
//         <tedi-carousel-header>
//           <h2 tedi-text modifiers="h1">Title</h2>
//           <tedi-carousel-navigation />
//         </tedi-carousel-header>
//         <tedi-carousel-content [slidesPerView]="slidesPerView">
//           @for (i of [0, 1, 2, 3, 4, 5]; track $index) {
//             <ng-template tediCarouselSlide>
//               <div
//                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
//               >
//                 <tedi-icon name="spa" [size]="36" color="tertiary" />
//                 <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
//               </div>
//             </ng-template>
//           }
//         </tedi-carousel-content>
//         <tedi-carousel-footer style="justify-content: center;">
//           <tedi-carousel-indicators />
//         </tedi-carousel-footer>
//       </tedi-carousel>
//     `,
//   }),
// };

// export const CenteredHasDots: StoryObj<CarouselType> = {
//   name: "Centered - has dots",
//   args: {
//     slidesPerView: { xs: 1 },
//   },
//   render: (args) => ({
//     props: args,
//     template: `
//       <tedi-carousel style="max-width: 400px;">
//         <tedi-carousel-header>
//           <h2 tedi-text modifiers="h1">Title</h2>
//         </tedi-carousel-header>
//         <tedi-carousel-content [slidesPerView]="slidesPerView">
//           @for (i of [0, 1, 2]; track $index) {
//             <ng-template tediCarouselSlide>
//               <div
//                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
//               >
//                 <tedi-icon name="spa" [size]="36" color="tertiary" />
//                 <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
//               </div>
//             </ng-template>
//           }
//         </tedi-carousel-content>
//         <tedi-carousel-footer style="justify-content: center;">
//           <tedi-carousel-indicators [withArrows]="true" />
//         </tedi-carousel-footer>
//       </tedi-carousel>
//     `,
//   }),
// };

// export const CenteredHasNumbers: StoryObj<CarouselType> = {
//   name: "Centered - has numbers",
//   args: {
//     slidesPerView: { xs: 1 },
//   },
//   render: (args) => ({
//     props: args,
//     template: `
//       <tedi-carousel style="max-width: 400px;">
//         <tedi-carousel-header>
//           <h2 tedi-text modifiers="h1">Title</h2>
//         </tedi-carousel-header>
//         <tedi-carousel-content [slidesPerView]="slidesPerView">
//           @for (i of [0, 1, 2]; track $index) {
//             <ng-template tediCarouselSlide>
//               <div
//                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
//               >
//                 <tedi-icon name="spa" [size]="36" color="tertiary" />
//                 <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
//               </div>
//             </ng-template>
//           }
//         </tedi-carousel-content>
//         <tedi-carousel-footer style="justify-content: center;">
//           <tedi-carousel-indicators variant="numbers" [withArrows]="true" />
//         </tedi-carousel-footer>
//       </tedi-carousel>
//     `,
//   }),
// };

// export const SeparatedHasDots: StoryObj<CarouselType> = {
//   name: "Separated - has dots",
//   args: {
//     slidesPerView: { xs: 1 },
//   },
//   render: (args) => ({
//     props: args,
//     template: `
//       <tedi-carousel style="max-width: 400px;">
//         <tedi-carousel-header>
//           <h2 tedi-text modifiers="h1">Title</h2>
//         </tedi-carousel-header>
//         <tedi-carousel-content [slidesPerView]="slidesPerView">
//           @for (i of [0, 1, 2]; track $index) {
//             <ng-template tediCarouselSlide>
//               <div
//                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
//               >
//                 <tedi-icon name="spa" [size]="36" color="tertiary" />
//                 <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
//               </div>
//             </ng-template>
//           }
//         </tedi-carousel-content>
//         <tedi-carousel-footer>
//           <tedi-carousel-indicators />
//           <tedi-carousel-navigation />
//         </tedi-carousel-footer>
//       </tedi-carousel>
//     `,
//   }),
// };

// export const SeparatedHasNumbers: StoryObj<CarouselType> = {
//   name: "Separated - has numbers",
//   args: {
//     slidesPerView: { xs: 1 },
//   },
//   render: (args) => ({
//     props: args,
//     template: `
//       <tedi-carousel style="max-width: 400px;">
//         <tedi-carousel-header>
//           <h2 tedi-text modifiers="h1">Title</h2>
//         </tedi-carousel-header>
//         <tedi-carousel-content [slidesPerView]="slidesPerView">
//           @for (i of [0, 1, 2]; track $index) {
//             <ng-template tediCarouselSlide>
//               <div
//                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
//               >
//                 <tedi-icon name="spa" [size]="36" color="tertiary" />
//                 <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
//               </div>
//             </ng-template>
//           }
//         </tedi-carousel-content>
//         <tedi-carousel-footer>
//           <tedi-carousel-indicators variant="numbers" />
//           <tedi-carousel-navigation />
//         </tedi-carousel-footer>
//       </tedi-carousel>
//     `,
//   }),
// };

// export const Combination: StoryObj<CarouselType> = {
//   name: "Combination",
//   args: {
//     slidesPerView: { xs: 1 },
//   },
//   render: (args) => ({
//     props: args,
//     template: `
//       <tedi-carousel style="max-width: 400px;">
//         <tedi-carousel-header>
//           <h2 tedi-text modifiers="h1">Title</h2>
//           <tedi-carousel-navigation />
//         </tedi-carousel-header>
//         <tedi-carousel-content [slidesPerView]="slidesPerView">
//           @for (i of [0, 1, 2]; track $index) {
//             <ng-template tediCarouselSlide>
//               <div
//                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
//               >
//                 <tedi-icon name="spa" [size]="36" color="tertiary" />
//                 <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
//               </div>
//             </ng-template>
//           }
//         </tedi-carousel-content>
//         <tedi-carousel-footer style="justify-content: center;">
//           <tedi-carousel-indicators />
//         </tedi-carousel-footer>
//       </tedi-carousel>
//     `,
//   }),
// };

// export const Fade: StoryObj<CarouselType> = {
//   name: "Fade",
//   args: {
//     slidesPerView: { xs: 1, sm: 2, md: 2.5, lg: 3, xl: 3.5, xxl: 4 },
//     fade: true,
//   },
//   render: (args) => ({
//     props: args,
//     template: `
//     <div style="display: flex; flex-direction: column; gap: 1.4rem;">
//       <tedi-carousel>
//         <tedi-carousel-header>
//           <h2 tedi-text modifiers="h1">Title</h2>
//         </tedi-carousel-header>
//         <tedi-carousel-content [slidesPerView]="slidesPerView" [fade]="fade">
//           @for (i of [0, 1, 2, 3, 4]; track $index) {
//             <ng-template tediCarouselSlide>
//               <div
//                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
//               >
//                 <tedi-icon name="spa" [size]="36" color="tertiary" />
//                 <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
//               </div>
//             </ng-template>
//           }
//         </tedi-carousel-content>
//         <tedi-carousel-footer>
//           <tedi-carousel-indicators />
//           <tedi-carousel-navigation />
//         </tedi-carousel-footer>
//       </tedi-carousel>
//       <tedi-carousel style="max-width: 400px;">
//         <tedi-carousel-content [slidesPerView]="1" [fade]="fade">
//           @for (i of [0, 1, 2, 3, 4]; track $index) {
//             <ng-template tediCarouselSlide>
//               <div
//                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
//               >
//                 <tedi-icon name="spa" [size]="36" color="tertiary" />
//                 <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
//               </div>
//             </ng-template>
//           }
//         </tedi-carousel-content>
//         <tedi-carousel-footer style="justify-content: center;">
//           <tedi-carousel-indicators [withArrows]="true" />
//         </tedi-carousel-footer>
//       </tedi-carousel>
//     </div>
//     `,
//   }),
// };

// export const WithTopNavigation: StoryObj<CarouselType> = {
//   name: "With top navigation",
//   args: {
//     slidesPerView: { xs: 1, sm: 2, md: 2.5, lg: 3, xl: 3.5, xxl: 4 },
//   },
//   render: (args) => ({
//     props: args,
//     template: `
//       <tedi-carousel>
//         <tedi-carousel-header>
//           <h2 tedi-text modifiers="h1">Title</h2>
//           <tedi-carousel-navigation />
//         </tedi-carousel-header>
//         <tedi-carousel-content [slidesPerView]="slidesPerView">
//           @for (i of [0, 1, 2]; track $index) {
//             <ng-template tediCarouselSlide>
//               <div
//                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
//               >
//                 <tedi-icon name="spa" [size]="36" color="tertiary" />
//                 <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
//               </div>
//             </ng-template>
//           }
//         </tedi-carousel-content>
//       </tedi-carousel>
//     `,
//   }),
// };

// export const WithTopAction: StoryObj<CarouselType> = {
//   name: "With top action",
//   args: {
//     slidesPerView: { xs: 1, sm: 2, md: 2.5, lg: 3, xl: 3.5, xxl: 4 },
//   },
//   render: (args) => ({
//     props: args,
//     template: `
//       <tedi-carousel>
//         <tedi-carousel-header>
//           <h2 tedi-text modifiers="h1">Title</h2>
//           <button tedi-button variant="neutral">
//             Show all
//             <tedi-icon name="arrow_forward" [size]="18" />
//           </button>
//         </tedi-carousel-header>
//         <tedi-carousel-content [slidesPerView]="slidesPerView">
//           @for (i of [0, 1, 2]; track $index) {
//             <ng-template tediCarouselSlide>
//               <div
//                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
//               >
//                 <tedi-icon name="spa" [size]="36" color="tertiary" />
//                 <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
//               </div>
//             </ng-template>
//           }
//         </tedi-carousel-content>
//         <tedi-carousel-footer>
//           <tedi-carousel-indicators />
//           <tedi-carousel-navigation />
//         </tedi-carousel-footer>
//       </tedi-carousel>
//     `,
//   }),
// };

// export const WithDescription: StoryObj<CarouselType> = {
//   name: "With description",
//   args: {
//     slidesPerView: { xs: 1, sm: 2, md: 2.5, lg: 3, xl: 3.5, xxl: 4 },
//   },
//   render: (args) => ({
//     props: args,
//     template: `
//       <tedi-carousel>
//         <tedi-carousel-header>
//           <div>
//             <h2 tedi-text modifiers="h1">Title</h2>
//             <p tedi-text color="secondary">Description</p>
//           </div>
//           <button tedi-button variant="neutral">
//             Show all
//             <tedi-icon name="arrow_forward" [size]="18" />
//           </button>
//         </tedi-carousel-header>
//         <tedi-carousel-content [slidesPerView]="slidesPerView">
//           @for (i of [0, 1, 2]; track $index) {
//             <ng-template tediCarouselSlide>
//               <div
//                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
//               >
//                 <tedi-icon name="spa" [size]="36" color="tertiary" />
//                 <div tedi-text color="secondary" style="text-align: center;">Replace with your own content</div>
//               </div>
//             </ng-template>
//           }
//         </tedi-carousel-content>
//       </tedi-carousel>
//     `,
//   }),
// };
