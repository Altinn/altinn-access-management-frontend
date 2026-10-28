import { DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';

export interface SearchHitsInList {
  count: number;
  list: string;
}

interface SearchHitsStatusProps {
  /** Hits for the active search, or undefined when nothing is searched for. Hits spread over several lists are read as one message. */
  hits?: number | SearchHitsInList[];
  /** Overrides the default hit text. */
  message?: string;
}

// The live region stays mounted while there is no search, so screen readers pick up the first result too.
// With no hits the text is only read, since the lists show their own no-results text.
export const SearchHitsStatus = ({ hits, message }: SearchHitsStatusProps) => {
  const { t } = useTranslation();

  const total = Array.isArray(hits) ? hits.reduce((sum, hit) => sum + hit.count, 0) : hits;
  const text = Array.isArray(hits)
    ? hits
        .map(({ count, list }) =>
          t('common.search_hits_in_list', {
            count,
            list: list.charAt(0).toLocaleLowerCase() + list.slice(1),
          }),
        )
        .join('. ')
    : t('common.search_hits', { count: hits });

  return (
    <StatusMessageForScreenReader visible={!!total}>
      {hits !== undefined && <DsParagraph data-size='sm'>{message ?? text}</DsParagraph>}
    </StatusMessageForScreenReader>
  );
};
