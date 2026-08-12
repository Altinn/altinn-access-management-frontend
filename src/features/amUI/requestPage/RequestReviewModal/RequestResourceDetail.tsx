import { useRef } from 'react';
import { DsButton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import type { ProcessedStatus } from '../types';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { ResourceInfo } from '../../common/DelegationModal/SingleRights/ResourceInfo';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { ProcessedStatusInfo } from './ProcessedStatusInfo';
import classes from './RequestReviewModal.module.css';

interface RequestResourceDetailProps {
  resource: ServiceResource;
  processedStatus?: ProcessedStatus;
  handledAt?: string;
  handledByName?: string;
  actionLoading?: 'approve' | 'reject' | null;
  onApprove?: () => void;
  onReject?: () => void;
  cannotApprove?: boolean;
  toPartyName: string;
}

export const RequestResourceDetail = ({
  resource,
  processedStatus,
  handledAt,
  handledByName,
  actionLoading,
  onApprove,
  onReject,
  cannotApprove,
  toPartyName,
}: RequestResourceDetailProps) => {
  const { t } = useTranslation();
  const openedUnprocessed = useRef(!processedStatus);

  return (
    <>
      <ResourceInfo
        resource={resource}
        toPartyName={toPartyName}
        availableActions={[DelegationAction.APPROVE]}
      />
      {processedStatus ? (
        <ProcessedStatusInfo
          status={processedStatus}
          handledAt={handledAt}
          handledByName={handledByName}
          autoFocus={openedUnprocessed.current}
        />
      ) : (
        <div className={classes.actionButtons}>
          <DsButton
            data-size='sm'
            onClick={onApprove}
            disabled={!!actionLoading || cannotApprove}
            loading={actionLoading === 'approve'}
          >
            {t('request_page.approve_request')}
          </DsButton>
          <DsButton
            data-size='sm'
            data-color='danger'
            variant='secondary'
            onClick={onReject}
            disabled={!!actionLoading}
            loading={actionLoading === 'reject'}
          >
            {t('request_page.reject_request')}
          </DsButton>
        </div>
      )}
    </>
  );
};
