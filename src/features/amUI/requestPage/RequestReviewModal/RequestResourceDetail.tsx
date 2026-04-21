import { DsButton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import type { ProcessedStatus } from '../types';
import { useAutoFocusRef } from '@/resources/hooks/useAutoFocusRef';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { ResourceInfo } from '../../common/DelegationModal/SingleRights/ResourceInfo';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import classes from './RequestReviewModal.module.css';

interface RequestResourceDetailProps {
  resource: ServiceResource;
  processedStatus?: ProcessedStatus;
  actionLoading: 'approve' | 'reject' | null;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  cannotApprove: boolean;
  toPartyName: string;
}

export const RequestResourceDetail = ({
  resource,
  processedStatus,
  actionLoading,
  onBack,
  onApprove,
  onReject,
  cannotApprove,
  toPartyName,
}: RequestResourceDetailProps) => {
  const { t } = useTranslation();
  const backButtonRef = useAutoFocusRef<HTMLButtonElement>();

  return (
    <>
      <DsButton
        ref={backButtonRef}
        variant='tertiary'
        className={classes.backButton}
        onClick={onBack}
      >
        <ArrowLeftIcon />
        {t('common.back')}
      </DsButton>
      <ResourceInfo
        resource={resource}
        toPartyName={toPartyName}
        availableActions={[DelegationAction.APPROVE]}
      />
      {!processedStatus && (
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
