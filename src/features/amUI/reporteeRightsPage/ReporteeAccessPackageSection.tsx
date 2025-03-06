import { Heading } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import { useActionError } from '@/resources/hooks/useActionError';

import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { DelegationAction, EditModal } from '../common/DelegationModal/EditModal';
import { AccessPackageInfoModal } from '../userRightsPage/AccessPackageSection/AccessPackageInfoModal';

interface ReporteeAccessPackageSectionProps {
  reporteeUuid?: string;
  numberOfAccesses?: number;
}

export const ReporteeAccessPackageSection = ({
  numberOfAccesses,
  reporteeUuid,
}: ReporteeAccessPackageSectionProps) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const { data: party } = useGetPartyByUUIDQuery(reporteeUuid ?? '');
  const { error, setError } = useActionError();

  useEffect(() => {
    const handleClose = () => setModalItem(undefined);
    modalRef.current?.addEventListener('close', handleClose);
    return () => modalRef.current?.removeEventListener('close', handleClose);
  }, []);

  return (
    <>
      <Heading
        level={2}
        size='xs'
        id='access_packages_title'
      >
        {t('access_packages.current_access_packages_title', { count: numberOfAccesses })}
      </Heading>
      <AccessPackageList
        fromPartyUuid={reporteeUuid ?? ''}
        toPartyUuid={getCookie('AltinnPartyUuid')}
        availableActions={[DelegationAction.REVOKE, DelegationAction.REQUEST]}
        useDeleteConfirm
        showAllPackages
        onSelect={(accessPackage) => {
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        onDelegateError={(accessPackage, errorInfo) => {
          setError(errorInfo);
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        onRevokeError={(accessPackage, errorInfo) => {
          setError(errorInfo);
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
      />
      {party && (
        <AccessPackageInfoModal
          modalRef={modalRef}
          toPartyUuid={getCookie('AltinnPartyUuid')}
          fromPartyUuid={reporteeUuid ?? ''}
          modalItem={modalItem}
          modalActions={[DelegationAction.REVOKE, DelegationAction.REQUEST]}
          onClose={() => {
            setModalItem(undefined);
            setError(null);
          }}
          openWithError={error ?? undefined}
        />
      )}
    </>
  );
};
