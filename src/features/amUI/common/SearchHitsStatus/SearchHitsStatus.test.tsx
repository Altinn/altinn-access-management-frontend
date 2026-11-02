import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SearchHitsStatus } from './SearchHitsStatus';

describe('SearchHitsStatus', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

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

  it('waits until the search has settled before updating', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <SearchHitsStatus
        hits={5}
        message='5 hits'
        searchString='a'
      />,
    );
    rerender(
      <SearchHitsStatus
        hits={2}
        message='2 hits'
        searchString='ab'
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('5 hits');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('status')).toHaveTextContent('2 hits');
  });

  it('replaces the text for a new search with the same hit count', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <SearchHitsStatus
        hits={2}
        searchString='a'
      />,
    );
    const before = screen.getByText('common.search_hits');
    rerender(
      <SearchHitsStatus
        hits={2}
        searchString='b'
      />,
    );
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('common.search_hits')).not.toBe(before);
  });
});
