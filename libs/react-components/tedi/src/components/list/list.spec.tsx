import { render } from '@testing-library/react';

import { useBreakpointProps } from '../../helpers';
import List, { ListProps } from './list';
import ListItem from './list-item';

import '@testing-library/jest-dom';

jest.mock('../../helpers', () => ({
  useBreakpointProps: jest.fn(),
}));

describe('List Component', () => {
  beforeEach(() => {
    (useBreakpointProps as jest.Mock).mockReturnValue({
      getCurrentBreakpointProps: jest.fn((props) => props),
    });
  });

  const renderList = (props: Partial<ListProps> = {}) => {
    return render(
      <List {...props}>
        <ListItem>Item 1</ListItem>
        <ListItem>Item 2</ListItem>
        <ListItem>Item 3</ListItem>
      </List>
    );
  };

  test('renders unordered list by default', () => {
    const { container } = renderList();
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  test('renders ordered list when element is "ol"', () => {
    const { container } = renderList({ element: 'ol' });
    expect(container.querySelector('ol')).toBeInTheDocument();
  });

  test('does not apply special styling class when style is "styled"', () => {
    const { container } = renderList({ style: 'styled' });
    expect(container.firstChild).not.toHaveClass('list--style-none');
  });

  test('applies "list--style-none" class when style is "none"', () => {
    const { container } = renderList({ style: 'none' });
    expect(container.firstChild).toHaveClass('list--style-none');
  });
});
