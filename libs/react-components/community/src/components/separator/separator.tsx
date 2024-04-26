import cn from 'classnames';

import styles from './separator.module.scss';

export type SeparatorSpacing = 0 | 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2 | 2.5 | 5;

export interface SeparatorProps {
  /**
   * Additional class.
   */
  className?: string;
  /**
   * Rendered HTML element.
   * @default div
   */
  element?: 'hr' | 'div' | 'span';
  /**
   * Full-width separator.
   */
  fullWidth?: boolean;
  /**
   * Spacing on top and bottom of separator
   */
  spacing?: SeparatorSpacing;
  /**
   * Spacing on top of separator. Ignored when spacing is also used
   */
  topSpacing?: SeparatorSpacing;
  /**
   * Spacing on bottom of separator. Ignored when spacing is also used
   */
  bottomSpacing?: SeparatorSpacing;
  /*
   * X/Y axis
   */
  axis?: 'vertical'; // and 'horizontal', which is default
  /*
   * Color of separator
   * @default default
   */
  color?: 'default' | 'contrast' | 'accent';
  /*
   * Variant of separator
   */
  variant?: 'dotted' | 'dotted-small';
  /*
   * Thickness of separator in pixels, only when variant is not used
   * @default 1
   */
  thickness?: 1 | 2;
}

export const Separator = (props: SeparatorProps): JSX.Element => {
  const {
    className,
    element: Element = 'div',
    fullWidth,
    spacing,
    topSpacing,
    bottomSpacing,
    axis,
    color = 'default',
    variant,
    thickness = 1,
    ...rest
  } = props;

  const SeparatorBEM = cn(
    styles['separator'],
    className,
    { [styles[`separator--${color}`]]: color },
    { [styles['separator--vertical']]: axis === 'vertical' },
    { [styles[`separator--${variant}`]]: variant },
    { [styles[`separator--thickness-${thickness}`]]: thickness && !variant },
    { [styles['separator--full-width']]: fullWidth },
    { [styles[`separator--spacing-${spacing}`.replace('.', '-')]]: spacing },
    { [styles[`separator--top-${topSpacing}`.replace('.', '-')]]: !spacing && topSpacing },
    { [styles[`separator--bottom-${bottomSpacing}`.replace('.', '-')]]: !spacing && bottomSpacing }
  );

  return <Element data-name="separator" {...rest} className={SeparatorBEM} />;
};

export default Separator;
