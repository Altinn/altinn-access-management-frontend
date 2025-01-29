import { Paragraph } from '@digdir/designsystemet-react';
// import { useTranslation } from 'react-i18next';
import { PageHeader } from '@altinn/altinn-components';
import { useMemo } from 'react';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetRolesForUserQuery, type Role } from '@/rtk/features/roleApi';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { RevokeRoleButton } from '../../RoleSection/RevokeRoleButton';
import { DelegateRoleButton } from '../../RoleSection/DelegateRoleButton';

import classes from './RoleInfo.module.css';

export interface PackageInfoProps {
  role: Role;
  toParty: Party;
  onDelegate?: () => void;
}

export const RoleInfo = ({ role, toParty }: PackageInfoProps) => {
  // const { t } = useTranslation();

  const { data: reportee } = useGetReporteeQuery();

  const { data: activeDelegations, isFetching } = useGetRolesForUserQuery({
    rightOwnerUuid: reportee?.partyUuid ?? '',
    rightHolderUuid: toParty.partyUuid ?? '',
  });

  const userHasPackage = useMemo(() => {
    if (activeDelegations && !isFetching) {
      return Object.values(activeDelegations)
        .flat()
        .some((assignment) => assignment.roleId === role.id);
    }
    return false;
  }, [activeDelegations, isFetching, role.id]);

  return (
    <div className={classes.container}>
      <PageHeader
        title={role?.name}
        icon='package'
      />
      <Paragraph>{role?.description}</Paragraph>

      <div className={classes.actions}>
        {userHasPackage ? (
          <RevokeRoleButton
            roleId={role.id}
            roleName={role.name}
            toParty={toParty}
            fullText
            disabled={isFetching}
          />
        ) : (
          <DelegateRoleButton
            roleId={role.id}
            roleName={role.name}
            toParty={toParty}
            fullText
            disabled={isFetching}
          />
        )}
      </div>
    </div>
  );
};
