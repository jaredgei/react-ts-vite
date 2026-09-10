import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import Spinner from 'components/Spinner';

describe('Spinner', () => {
  it('renders a single element', () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });
});
