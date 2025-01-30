import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { Avatar } from '@altinn/altinn-components';
import { useMemo } from 'react';
import { InformationSquareFillIcon } from '@navikt/aksel-icons';
import { Trans } from 'react-i18next';

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
  const { data: reportee } = useGetReporteeQuery();
  const { data: activeDelegations, isFetching } = useGetRolesForUserQuery({
    rightOwnerUuid: reportee?.partyUuid ?? '',
    rightHolderUuid: toParty.partyUuid ?? '',
  });

  const assignment = useMemo(() => {
    if (activeDelegations && !isFetching) {
      return activeDelegations.find((assignment) => assignment.role.id === role.id);
    }
    return null;
  }, [activeDelegations, isFetching, role.id]);

  const userHasRole = !!assignment;
  const userHasInheritedRole = assignment?.inherited && assignment.inherited.length > 0;
  const inheritedFromRoleName = (userHasInheritedRole && assignment?.inherited[0]) ?? null;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Avatar
          size='md'
          name={role?.name}
          imageUrl={role?.area?.iconUrl}
          imageUrlAlt={role?.area?.name}
          type='company'
        />
        <Heading
          level={3}
          title={role?.name}
          size='sm'
        >
          {role?.name}
        </Heading>
      </div>
      <Paragraph>{role?.description}</Paragraph>
      {userHasInheritedRole && (
        <div className={classes.inherited}>
          <InformationSquareFillIcon
            fontSize='1.5rem'
            className={classes.inheritedInfoIcon}
          />
          <Paragraph size='xs'>
            <Trans
              i18nKey='delegation_modal.inherited_role_message'
              values={{ user_name: toParty.name, role_name: inheritedFromRoleName }}
              components={{ b: <strong /> }}
            />
          </Paragraph>
        </div>
      )}
      <div className={classes.actions}>
        {!userHasRole ? (
          <DelegateRoleButton
            roleId={role.id}
            roleName={role.name}
            toParty={toParty}
            fullText
            disabled={isFetching || !role.isDelegable}
          />
        ) : (
          <RevokeRoleButton
            roleId={role.id}
            roleName={role.name}
            toParty={toParty}
            fullText
            disabled={isFetching || userHasInheritedRole}
          />
        )}
      </div>
    </div>
  );
};
