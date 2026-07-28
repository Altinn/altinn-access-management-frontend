import { useRef } from 'react';
import { DsAlert, DsButton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import type { ProcessedStatus } from '../types';
import classes from './RequestReviewModal.module.css';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { PackageHeader } from '../../common/DelegationModal/AccessPackages/PackageHeader';
import { PackageMeta } from '../../common/DelegationModal/AccessPackages/PackageMeta';
import { StatusSection } from '../../common/StatusSection/StatusSection';
import { ProcessedStatusInfo } from './ProcessedStatusInfo';

interface RequestPackageDetailProps {
  pkg: AccessPackage;
  processedStatus?: ProcessedStatus;
  handledAt?: string;
  handledByName?: string;
  actionLoading?: 'approve' | 'reject' | null;
  onApprove?: () => void;
  onReject?: () => void;
  cannotApprove?: boolean;
  toPartyName: string;
}

export const RequestPackageDetail = ({
  pkg,
  processedStatus,
  handledAt,
  handledByName,
  actionLoading,
  onApprove,
  onReject,
  cannotApprove,
  toPartyName,
}: RequestPackageDetailProps) => {
  const { t } = useTranslation();
  const openedUnprocessed = useRef(!processedStatus);

  return (
    <>
      <PackageHeader name={pkg.name} />
      <StatusSection
        userHasAccess={processedStatus === 'approved'}
        toPartyName={toPartyName}
      />
      {cannotApprove && (
        <DsAlert
          data-color='warning'
          data-size={'xs'}
        >
          {t('request_page.cannot_approve_package')}
        </DsAlert>
      )}
      <PackageMeta accessPackage={pkg} />
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
