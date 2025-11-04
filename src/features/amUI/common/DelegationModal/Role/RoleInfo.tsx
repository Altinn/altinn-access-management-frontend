import { Avatar, DsAlert, DsParagraph, DsHeading } from '@altinn/altinn-components';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetRolesForUserQuery, type Role, type RoleConnection } from '@/rtk/features/roleApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { RevokeRoleButton } from '../../RoleList/RevokeRoleButton';
import { DelegationAction } from '../EditModal';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { useDelegationModalContext } from '../DelegationModalContext';
import { TechnicalErrorParagraphs } from '../../TechnicalErrorParagraphs';
import { StatusSection } from '../StatusSection';

import classes from './RoleInfo.module.css';

export interface PackageInfoProps {
  role: Role;
  onDelegate?: () => void;
  availableActions?: DelegationAction[];
}

export const RoleInfo = ({ role, availableActions = [] }: PackageInfoProps) => {
  const { t } = useTranslation();

  const { fromParty, toParty, actingParty } = usePartyRepresentation();
  const { data: roleConnections, isFetching } = useGetRolesForUserQuery(
    {
      from: fromParty?.partyUuid ?? '',
      to: toParty?.partyUuid ?? '',
      party: actingParty?.partyUuid ?? getCookie('AltinnPartyUuid') ?? '',
    },
    {
      skip: (!fromParty?.partyUuid && !toParty?.partyUuid) || !actingParty?.partyUuid,
    },
  );

  const { setActionError, actionError } = useDelegationModalContext();

  const connectionSummary = useMemo(() => {
    if (!roleConnections || isFetching) {
      return null;
    }

    const connection = roleConnections.find((item: RoleConnection) => item.role.id === role.id);
    if (!connection) {
      return null;
    }

    const directPermission = connection.permissions.find(
      (permission) =>
        permission.from?.id === fromParty?.partyUuid && permission.to?.id === toParty?.partyUuid,
    );

    const inheritedPermission = connection.permissions.find(
      (permission) =>
        permission.from?.id !== fromParty?.partyUuid || permission.to?.id !== toParty?.partyUuid,
    );

    return {
      hasRole: true,
      hasDirectPermission: !!directPermission,
      hasInheritedDelegation: !!inheritedPermission,
      inheritedFrom: inheritedPermission?.from?.name,
      revocationContext: directPermission
        ? { from: directPermission.from.id, to: directPermission.to.id }
        : undefined,
    };
  }, [fromParty?.partyUuid, isFetching, roleConnections, role.id, toParty?.partyUuid]);

  const userHasRole = !!connectionSummary?.hasRole;
  const userHasInheritedRole = connectionSummary?.hasInheritedDelegation ?? false;
  const inheritedFromRoleName = connectionSummary?.inheritedFrom;
  const revocationContext = connectionSummary?.revocationContext;

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
        <DsHeading
          level={3}
          data-size='sm'
        >
          {role?.name}
        </DsHeading>
      </div>

      {!!actionError && (
        <DsAlert
          data-color='danger'
          data-size='sm'
        >
          {userHasRole ? (
            <DsHeading
              level={4}
              data-size='2xs'
            >
              {t('delegation_modal.general_error.revoke_heading')}
            </DsHeading>
          ) : (
            <DsHeading
              level={4}
              data-size='2xs'
            >
              {t('delegation_modal.general_error.delegate_heading')}
            </DsHeading>
          )}
          <TechnicalErrorParagraphs
            size='xs'
            status={actionError.httpStatus}
            time={actionError.timestamp}
          />
        </DsAlert>
      )}

      <StatusSection
        userHasAccess={userHasRole}
        showMissingRightsMessage={false}
        inheritedFrom={inheritedFromRoleName}
      />

      <DsParagraph>{role?.description}</DsParagraph>

      <div className={classes.actions}>
        {userHasRole && role && availableActions.includes(DelegationAction.REVOKE) && (
          <RevokeRoleButton
            accessRole={role}
            from=''
            to=''
            fullText
            disabled={true}
            variant='solid'
            size='md'
            onRevokeError={() => {}}
          />
        )}
      </div>
    </div>
  );
};
