import { DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { CheckmarkCircleIcon, CircleSlashIcon } from '@navikt/aksel-icons';
import { formatDateToNorwegian } from '@/resources/utils';
import type { ProcessedStatus } from '../types';
import classes from './RequestReviewModal.module.css';

interface ProcessedStatusInfoProps {
  status: ProcessedStatus;
  handledAt?: string;
}

export const ProcessedStatusInfo = ({ status, handledAt }: ProcessedStatusInfoProps) => {
  const { t } = useTranslation();
  const statusLabel =
    status === 'approved' ? t('request_page.review_approved') : t('request_page.review_rejected');

  return (
    <div className={classes.detailStatus}>
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
      <DsParagraph data-size='sm'>
        {handledAt
          ? t('request_page.review_handled_on', {
              status: statusLabel,
              date: formatDateToNorwegian(handledAt),
            })
          : statusLabel}
      </DsParagraph>
    </div>
  );
};
