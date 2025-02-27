import { Heading } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useRef, useState } from 'react';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { AccessPackageInfoModal } from '../userRightsPage/AccessPackageSection/AccessPackageInfoModal';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { useParams } from 'react-router';
import { useActionError } from '@/resources/hooks/useActionError';

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
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const { data: party } = useGetPartyByUUIDQuery(reporteeUuid ?? '');

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
          toPartyUuid={getCookie('AltinnPartyUuid')}
          fromPartyUuid={party.partyUuid}
          accessPackage={modalItem}
          availableActions={[DelegationAction.REVOKE, DelegationAction.REQUEST]}
        />
        <AccessPackageInfoModal
          modalRef={modalRef}
          toParty={party}
          modalItem={modalItem}
          onClose={() => {
            setModalItem(undefined);
            setError(null);
          }}
          openWithError={error ?? undefined}
        />
      </>
    )
  );
};
