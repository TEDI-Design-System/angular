import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  selector: "tedi-segmented-progress",
  templateUrl: "./segmented-progress.component.html",
  styleUrl: "./segmented-progress.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-segmented-progress",
  },
})
export class SegmentedProgressComponent {
  /**
   * Number of segments in the bar.
   */
  segments = input.required({ transform: numberAttribute });
  /**
   * Progress in segments, from 0 to `segments`. A fraction partly fills the next segment:
   * `1.5` fills the first segment and half of the second. Pass an array to fill each segment
   * on its own, with values from 0 to 1, e.g. `[1, 0, 0.5]`.
   * @default 0
   */
  value = input<number | number[]>(0);
  /**
   * Text above the bar, on the left. Also used as the progressbar's accessible name.
   */
  label = input<string>();
  /**
   * Text above the bar, on the right, e.g. `1/6`. Also read by screen readers as the current value.
   */
  valueLabel = input<string>();
  /**
   * Accessible name for the progressbar when there is no visible `label`.
   */
  ariaLabel = input<string>();

  fills = computed(() => {
    const value = this.value();
    return Array.from({ length: this.segments() }, (_, i) => {
      const fill = Array.isArray(value) ? (value[i] ?? 0) : value - i;
      return clamp(fill, 0, 1) * 100;
    });
  });

  valueNow = computed(
    () => this.fills().reduce((sum, fill) => sum + fill, 0) / 100,
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
