import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SearchHitsStatus } from './SearchHitsStatus';

describe('SearchHitsStatus', () => {
  it('keeps an empty live region mounted while nothing is searched for', () => {
    render(<SearchHitsStatus />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('shows the hit count', () => {
    render(<SearchHitsStatus hits={3} />);
    expect(screen.getByRole('status')).toHaveTextContent('common.search_hits');
    expect(screen.getByRole('status')).not.toHaveClass('visuallyHidden');
  });

  it('is only read, not shown, with no hits', () => {
    render(<SearchHitsStatus hits={0} />);
    expect(screen.getByRole('status')).toHaveTextContent('common.search_hits');
    expect(screen.getByRole('status').className).toMatch(/visuallyHidden/);
  });

  it('reads hits in several lists as one message', () => {
    render(
      <SearchHitsStatus
        hits={[
          { count: 0, listHeading: 'A' },
          { count: 2, listHeading: 'B' },
        ]}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'common.search_hits_in_list. common.search_hits_in_list',
    );
  });

  it('prefers a custom message', () => {
    render(
      <SearchHitsStatus
        hits={5}
        message='5 hits in 2 areas'
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('5 hits in 2 areas');
  });
});
