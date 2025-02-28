import { Heading } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';

import { AccessPackageList, packageActions } from '../common/AccessPackageList/AccessPackageList';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useRef, useState } from 'react';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { AccessPackageInfoModal } from '../userRightsPage/AccessPackageSection/AccessPackageInfoModal';
import { useGetPartyByUUIDQuery, useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { useParams } from 'react-router-dom';

interface ReporteeAccessPackageSectionProps {
  reporteeUuid?: string;
  numberOfAccesses?: number;
}

export const ReporteeAccessPackageSection = ({
  numberOfAccesses,
  reporteeUuid,
}: ReporteeAccessPackageSectionProps) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const [actionError, setActionError] = useState<{ httpStatus: string; timestamp: string }>({
    httpStatus: '',
    timestamp: '',
  });

  const { data: party } = useGetReporteePartyQuery();

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
        availableActions={[packageActions.REVOKE, packageActions.REQUEST]}
        useDeleteConfirm
        showAllPackages
        onSelect={(accessPackage) => {
          setModalItem(accessPackage);
          setActionError({ httpStatus: '', timestamp: '' });
          modalRef.current?.showModal();
        }}
        onDelegateError={(accessPackage, toParty, status, timestamp) => {
          setActionError({ httpStatus: status, timestamp });
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        onRevokeError={(accessPackage, toParty, status, timestamp) => {
          setActionError({ httpStatus: status, timestamp });
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
      />
      <AccessPackageInfoModal
        modalRef={modalRef}
        toParty={party}
        modalItem={modalItem}
        onClose={() => {
          setModalItem(undefined);
        }}
        openWithError={actionError}
      />
    </>
  );
};
