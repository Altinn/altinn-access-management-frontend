import { Heading } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { DelegationAction, EditModal } from '../common/DelegationModal/EditModal';

interface ReporteeAccessPackageSectionProps {
  reporteeUuid?: string;
  numberOfAccesses?: number;
}

export const ReporteeAccessPackageSection = ({
  numberOfAccesses,
  reporteeUuid,
}: ReporteeAccessPackageSectionProps) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const { data: party } = useGetPartyByUUIDQuery(id ?? '');

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
      />
      {party && (
        <EditModal
          ref={modalRef}
          toParty={party}
          accessPackage={modalItem}
          availableActions={[DelegationAction.REVOKE, DelegationAction.REQUEST]}
        />
      )}
    </>
  );
};
