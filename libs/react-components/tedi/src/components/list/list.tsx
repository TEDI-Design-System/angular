import cn from 'classnames';

import { BreakpointSupport, useBreakpointProps } from '../../helpers';
import { VerticalSpacing, VerticalSpacingProps } from '../vertical-spacing';
import styles from './list.module.scss';
import { ListItemProps } from './list-item';

type ListElement = 'ul' | 'ol';

type ListBreakpointProps = {
  /**
   * Props for controlling vertical spacing between list items. If provided,
   * the List will be wrapped inside a VerticalSpacing component.
   */
  verticalSpacing?: Omit<VerticalSpacingProps, 'element' | 'children'>;
  /**
   * Determines whether the list should have default styling (with bullets or numbers).
   * @default 'none'
   */
  style?: 'styled' | 'none';
};

export interface ListProps extends BreakpointSupport<ListBreakpointProps> {
  /**
   * List children should be ListItem components
   */
  children: React.ReactElement<ListItemProps> | React.ReactElement<ListItemProps>[] | React.ReactNode;
  /**
   * The HTML element to use for rendering the list.
   * Can either be 'ul' for an unordered list or 'ol' for an ordered list.
   * @default 'ul'
   */
  element?: ListElement;
}

export const List = (props: ListProps) => {
  const { getCurrentBreakpointProps } = useBreakpointProps();
  const { children, element = 'ul', style = 'none', verticalSpacing } = getCurrentBreakpointProps<ListProps>(props);
  const listBEM = cn(
    styles['list'],
    styles[`list--${element === 'ul' ? 'unordered' : 'ordered'}`],
    styles[`list--style-${style}`],
    verticalSpacing?.className
  );
  const Element = element;

  if (verticalSpacing) {
    return (
      <VerticalSpacing {...verticalSpacing} element={element} className={listBEM}>
        {children}
      </VerticalSpacing>
    );
  }

  return (
    <Element className={listBEM} role="list">
      {children}
    </Element>
  );
};

export default List;
