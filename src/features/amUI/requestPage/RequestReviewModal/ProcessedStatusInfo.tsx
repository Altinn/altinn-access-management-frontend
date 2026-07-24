import { useCallback } from 'react';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { CheckmarkCircleIcon, CircleSlashIcon } from '@navikt/aksel-icons';
import { formatDateToNorwegian } from '@/resources/utils';
import { focusElement, focusHasBeenLost } from '../../common/RestoreFocus';
import type { ProcessedStatus } from '../types';
import classes from './RequestReviewModal.module.css';

interface ProcessedStatusInfoProps {
  status: ProcessedStatus;
  handledAt?: string;
  handledByName?: string;
  autoFocus?: boolean;
}

export const ProcessedStatusInfo = ({
  status,
  handledAt,
  handledByName,
  autoFocus,
}: ProcessedStatusInfoProps) => {
  const { t } = useTranslation();
  const focusRef = useCallback((node: HTMLDivElement | null) => {
    if (node && focusHasBeenLost()) {
      focusElement(node);
    }
  }, []);
  const statusLabel =
    status === 'approved' ? t('request_page.review_approved') : t('request_page.review_rejected');

  return (
    <div
      className={classes.detailStatus}
      ref={autoFocus ? focusRef : undefined}
    >
      {status === 'approved' ? (
        <CheckmarkCircleIcon
          className={classes.approvedIcon}
          aria-hidden='true'
        />
      ) : (
        <CircleSlashIcon
          className={classes.rejectedIcon}
          aria-hidden='true'
        />
      )}
      {handledByName ? (
        <DsParagraph data-size='sm'>
          {t('request_page.review_handled_by', {
            status: statusLabel,
            date: formatDateToNorwegian(handledAt),
            name: formatDisplayName({
              fullName: handledByName,
              type: 'person',
              reverseNameOrder: true,
            }),
          })}
        </DsParagraph>
      ) : (
        <DsParagraph data-size='sm'>
          {handledAt
            ? t('request_page.review_handled_on', {
                status: statusLabel,
                date: formatDateToNorwegian(handledAt),
              })
            : statusLabel}
        </DsParagraph>
      )}
    </div>
  );
};
