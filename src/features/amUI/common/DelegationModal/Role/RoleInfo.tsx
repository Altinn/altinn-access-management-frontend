import { Avatar, DsAlert, DsParagraph, DsHeading } from '@altinn/altinn-components';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorCode, getErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';
import type { ActionError } from '@/resources/hooks/useActionError';
import {
  useDelegationCheckQuery,
  useGetRolesForUserQuery,
  type Role,
  type RoleConnection,
} from '@/rtk/features/roleApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { RevokeRoleButton } from '../../RoleList/RevokeRoleButton';
import { DelegateRoleButton } from '../../RoleList/DelegateRoleButton';
import { RequestRoleButton } from '../../RoleList/RequestRoleButton';
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
      skip: !fromParty?.partyUuid || !toParty?.partyUuid,
    },
  );
  const { setActionError, actionError } = useDelegationModalContext();
  const { data: delegationCheckResult } = useDelegationCheckQuery({
    rightownerUuid: fromParty?.partyUuid ?? '',
    roleUuid: role.id,
  });

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
        showMissingRightsMessage={!userHasRole && !delegationCheckResult?.canDelegate}
        inheritedFrom={inheritedFromRoleName}
        delegationCheckText={
          delegationCheckResult?.detailCode !== ErrorCode.Unknown
            ? getErrorCodeTextKey(delegationCheckResult?.detailCode)
            : 'role.cant_delegate_generic'
        }
      />

      <DsParagraph>{role?.description}</DsParagraph>

      <div className={classes.actions}>
        {!userHasRole && availableActions.includes(DelegationAction.REQUEST) && (
          <RequestRoleButton
            variant='solid'
            size='md'
            icon={false}
          />
        )}
        {!userHasRole && availableActions.includes(DelegationAction.DELEGATE) && (
          <DelegateRoleButton
            accessRole={role}
            fullText
            disabled={isFetching || !role.isDelegable || !delegationCheckResult?.canDelegate}
            variant='solid'
            size='md'
            icon={false}
            onDelegateError={(_role: Role, error: ActionError) => {
              setActionError(error);
            }}
          />
        )}
        {userHasRole && role && availableActions.includes(DelegationAction.REVOKE) && (
          <RevokeRoleButton
            accessRole={role}
            from={revocationContext?.from ?? ''}
            to={revocationContext?.to ?? ''}
            fullText
            disabled={
              isFetching ||
              userHasInheritedRole ||
              !revocationContext ||
              !connectionSummary?.hasDirectPermission
            }
            variant='solid'
            size='md'
            icon={false}
            onRevokeError={function (_role: Role, errorInfo: ActionError): void {
              setActionError(errorInfo);
            }}
          />
        )}
      </div>
    </div>
  );
};
