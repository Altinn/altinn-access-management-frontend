import { Heading } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';

import { getCookie } from '@/resources/Cookie/CookieMethods';

import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { DelegationAction } from '../common/DelegationModal/EditModal';

interface ReporteeAccessPackageSectionProps {
  reporteeUuid?: string;
  numberOfAccesses?: number;
}

export const ReporteeAccessPackageSection = ({
  numberOfAccesses,
  reporteeUuid,
}: ReporteeAccessPackageSectionProps) => {
  const { t } = useTranslation();
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
      />
    </>
  );
};
