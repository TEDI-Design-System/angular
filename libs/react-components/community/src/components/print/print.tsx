import cn from 'classnames';
import React, { forwardRef } from 'react';

export type BreakTypes = 'auto' | 'avoid' | 'avoid-column' | 'avoid-page' | 'avoid-region';

export interface PrintProps {
  /**
   * Content.
   */
  children: JSX.Element | Array<JSX.Element | null | undefined | false | ''>;
  /**
   * Show or hide content during printing
   * Show is useful when the content is hidden by default during printing
   */
  visibility?: 'show' | 'hide';
  /**
   * How page, column, or region breaks should behave before a generated box
   */
  breakBefore?: BreakTypes;
  /**
   * How page, column, or region breaks should behave after a generated box
   */
  breakAfter?: BreakTypes;
  /**
   * How page, column, or region breaks should behave inside a generated box
   */
  breakInside?: BreakTypes;
}

export const Print = forwardRef<HTMLElement, PrintProps>((props, ref): JSX.Element | null => {
  const { children, visibility, breakBefore, breakInside, breakAfter } = props;

  const renderChild = (child?: JSX.Element, key?: number) => {
    const BEM = cn(child?.props?.className, {
      'no-print': visibility === 'hide',
      'show-print': visibility === 'show',
      [`break-before-${breakBefore}`]: breakBefore,
      [`break-after-${breakAfter}`]: breakAfter,
      [`break-inside-${breakInside}`]: breakInside,
    });

    return child ? React.cloneElement(child, { ...child.props, className: BEM, key }) : null;
  };

  if (Array.isArray(children)) {
    return <>{children?.map((child, index) => (child ? renderChild(child, index) : null))}</>;
  } else {
    return renderChild(children);
  }
});

Print.displayName = 'Print';

export default Print;
