import { DsButton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import type { ProcessedStatus } from '../types';
import classes from './RequestReviewModal.module.css';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { PackageHeader } from '../../common/DelegationModal/AccessPackages/PackageHeader';
import { PackageMeta } from '../../common/DelegationModal/AccessPackages/PackageMeta';
import { StatusSection } from '../../common/StatusSection/StatusSection';

interface RequestPackageDetailProps {
  pkg: AccessPackage;
  processedStatus?: ProcessedStatus;
  actionLoading: 'approve' | 'reject' | null;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  cannotApprove: boolean;
  toPartyName: string;
}

export const RequestPackageDetail = ({
  pkg,
  processedStatus,
  actionLoading,
  onBack,
  onApprove,
  onReject,
  cannotApprove,
  toPartyName,
}: RequestPackageDetailProps) => {
  const { t } = useTranslation();

  return (
    <>
      <DsButton
        variant='tertiary'
        className={classes.backButton}
        onClick={onBack}
      >
        <ArrowLeftIcon />
        {t('common.back')}
      </DsButton>
      <PackageHeader name={pkg.name} />
      <StatusSection
        userHasAccess={processedStatus === 'approved'}
        toPartyName={toPartyName}
        showDelegationCheckWarning={cannotApprove}
      />
      <PackageMeta accessPackage={pkg} />
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
