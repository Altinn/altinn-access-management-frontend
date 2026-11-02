import { useMemo } from 'react';
import { DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';

import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import { useDebouncedValue } from '@/resources/hooks';

import classes from './SearchHitsStatus.module.css';

export interface SearchHitsInList {
  count: number;
  listHeading: string;
}

interface SearchHitsStatusProps {
  /** Hits for the active search, or undefined when nothing is searched for. Hits spread over several lists are read as one message. */
  hits?: number | SearchHitsInList[];
  /** The search the hits belong to. A new search is read out even when the text stays the same. */
  searchString?: string;
  /** Overrides the default hit text. */
  message?: string;
  className?: string;
}

// The live region stays mounted while there is no search, so screen readers pick up the first result too.
// With no hits the text is only read, since the lists show their own no-results text.
// The status waits until the search has settled, so it is read once per search instead of per keystroke.
export const SearchHitsStatus = ({
  hits,
  searchString,
  message,
  className,
}: SearchHitsStatusProps) => {
  const { t } = useTranslation();

  const total = Array.isArray(hits) ? hits.reduce((sum, hit) => sum + hit.count, 0) : hits;
  const text =
    hits === undefined
      ? undefined
      : (message ??
        (Array.isArray(hits)
          ? hits
              .map(({ count, listHeading }) =>
                t('common.search_hits_in_list', {
                  count,
                  list: listHeading.charAt(0).toLocaleLowerCase() + listHeading.slice(1),
                }),
              )
              .join('. ')
          : t('common.search_hits', { count: hits })));

  const status = useMemo(() => ({ text, total, searchString }), [text, total, searchString]);
  const settled = useDebouncedValue(status, text === undefined ? 0 : 300);

  return (
    <StatusMessageForScreenReader visible={!!settled.total}>
      {settled.text !== undefined && (
        <DsParagraph
          // A new element for each search makes screen readers read it even when the text is unchanged.
          key={settled.searchString}
          data-size='sm'
          className={cn(classes.text, className)}
        >
          {settled.text}
        </DsParagraph>
      )}
    </StatusMessageForScreenReader>
  );
};
