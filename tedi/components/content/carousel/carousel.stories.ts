import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { CarouselComponent } from "./carousel.component";
import { CarouselHeaderComponent } from "./carousel-header/carousel-header.component";
import { CarouselNavigationComponent } from "./carousel-navigation/carousel-navigation.component";
import { CarouselFooterComponent } from "./carousel-footer/carousel-footer.component";
import { CarouselContentComponent } from "./carousel-content/carousel-content.component";
import { CarouselIndicatorsComponent } from "./carousel-indicators/carousel-indicators.component";
import { CarouselSlideDirective } from "./carousel-slide.directive";
import { TextComponent } from "../../base/text/text.component";
import { BreakpointInput } from "../../../services/breakpoint/breakpoint.service";
import { IconComponent } from "../../base/icon/icon.component";

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
  },
} as Meta<CarouselComponent>;

type CarouselType = CarouselComponent & {
  slidesPerView: BreakpointInput<number>;
};

export const Default: StoryObj<CarouselType> = {
  args: {
    slidesPerView: { xs: 1 },
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
        </tedi-carousel-header>

        <tedi-carousel-content [slidesPerView]="slidesPerView">
          <ng-template tediCarouselSlide>
            <div style="display: flex; gap: 1rem;">
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
            </div>
          </ng-template>

          <ng-template tediCarouselSlide>
            <div style="display: flex; gap: 1rem;">
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
            </div>
          </ng-template>

          <ng-template tediCarouselSlide>
            <div style="display: flex; gap: 1rem;">
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
            </div>
          </ng-template>

          <ng-template tediCarouselSlide>
            <div style="display: flex; gap: 1rem;">
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
            </div>
          </ng-template>

          <ng-template tediCarouselSlide>
            <div style="display: flex; gap: 1rem;">
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--general-border-primary); border-radius: 4px; height: 10rem; padding: 1rem; flex: 1;"
              >
                <tedi-icon name="spa" [size]="36" color="tertiary" />
                <div tedi-text color="secondary">Replace with your own content</div>
              </div>
            </div>
          </ng-template>
        </tedi-carousel-content>

        <tedi-carousel-footer>
          <tedi-carousel-indicators variant="dots" />
          <tedi-carousel-navigation />
        </tedi-carousel-footer>
      </tedi-carousel>
    `,
  }),
};
