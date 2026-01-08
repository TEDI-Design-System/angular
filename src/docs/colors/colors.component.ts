import { Component, computed, input } from "@angular/core";

interface Color {
  name: string;
  value: string;
  group: string;
  main?: boolean;
}

interface GroupedColors {
  [groupName: string]: Color[];
}

interface ColorStoryData {
  mode: { name: string; id: string };
  color: Color[];
}

@Component({
  selector: "app-color-story",
  styles: `
    code {
      font-size: 13px;
      padding: 3px 5px;
      color: rgba(46, 52, 56, 0.9);
      background-color: rgb(247, 250, 252);
      border: 1px solid rgb(236, 244, 249);
      border-radius: 3px;
    }
  `,
  template: `
    @for (group of groupedColorsArray(); track group.key) {
      <div>
        <div style="margin-bottom: 20px;">
          <h3
            class="text-capitalize"
            style="margin-bottom: 10px; font-weight: 700; font-size: 20px;"
          >
            {{ group.key }}
          </h3>
          <div class="display-flex flex-wrap align-items-start gap-4">
            @for (color of group.colors; track color.name) {
              <div>
                <div
                  class="color-card"
                  [style]="{ 'background-color': color.value }"
                ></div>
                <p>
                  <strong>--{{ color.name }}</strong>
                </p>
                @if (color.main) {
                  <code>Main</code>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class ColorStoryComponent {
  readonly data = input<ColorStoryData[]>([]);

  readonly groupedColors = computed<GroupedColors>(() => {
    return this.data().reduce((acc: GroupedColors, item) => {
      item.color.forEach((color: Color) => {
        if (!acc[color.group]) {
          acc[color.group] = [];
        }
        acc[color.group].push(color);
      });
      return acc;
    }, {});
  });

  readonly groupedColorsArray = computed<{ key: string; colors: Color[] }[]>(
    () => {
      return Object.entries(this.groupedColors()).map(([key, colors]) => ({
        key,
        colors,
      }));
    },
  );
}
