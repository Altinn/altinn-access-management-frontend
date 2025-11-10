import { DsAlert, DsParagraph, DsHeading } from '@altinn/altinn-components';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useGetRoleByIdQuery,
  useGetRolesForUserQuery,
  type Role,
  type RoleConnection,
} from '@/rtk/features/roleApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { RevokeRoleButton } from '../../RoleList/RevokeRoleButton';
import { DelegationAction } from '../EditModal';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { useDelegationModalContext } from '../DelegationModalContext';
import { TechnicalErrorParagraphs } from '../../TechnicalErrorParagraphs';
import { showRolesTab } from '@/resources/utils/featureFlagUtils';
import { LegacyRoleAlert } from '../../LegacyRoleAlert/LegacyRoleAlert';

import classes from './RoleInfo.module.css';

export interface PackageInfoProps {
  role: Role;
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

  const shouldFetchRoleDetails = Boolean(role?.id);
  const {
    data: roleDetails,
    error: roleDetailsError,
    isLoading: isLoadingRoleDetails,
  } = useGetRoleByIdQuery(role?.id ?? '', {
    skip: !shouldFetchRoleDetails,
  });

  const connection: RoleConnection | undefined =
    !roleConnections || isLoadingRoleDetails
      ? undefined
      : roleConnections.find((item: RoleConnection) => item.role.id === role.id);

  const directPermission = connection?.permissions.find(
    (permission) =>
      permission.from?.id === fromParty?.partyUuid && permission.to?.id === toParty?.partyUuid,
  );

  const revocationContext = directPermission
    ? { from: directPermission.from.id, to: directPermission.to.id }
    : undefined;

  const userHasRole = !!connection;
  const rolesTabEnabled = showRolesTab();
  const canRevoke =
    userHasRole &&
    availableActions.includes(DelegationAction.REVOKE) &&
    rolesTabEnabled &&
    role?.provider?.code === 'sys-altinn2' &&
    !!revocationContext;

  const isLegacyRoleProvider = role?.provider?.code === 'sys-altinn2';
  const isErRole = role?.provider?.code === 'sys-ccr';

  return (
    <div className={classes.container}>
      <div className={classes.header}>
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

      {isLegacyRoleProvider && <LegacyRoleAlert />}
      {isErRole && (
        <DsParagraph
          data-size='xs'
          className={classes.subtleNote}
        >
          {t('common.enhetsregisteret')}
        </DsParagraph>
      )}
      <DsParagraph>{role?.description}</DsParagraph>

      <div className={classes.actions}>
        {canRevoke && revocationContext && (
          <RevokeRoleButton
            accessRole={role}
            from={revocationContext.from}
            to={revocationContext.to}
            fullText
            variant='solid'
            color='danger'
            size='md'
            icon={false}
            onRevokeError={(_, error) => setActionError(error)}
            onRevokeSuccess={() => setActionError(null)}
          />
        )}
      </div>
    </div>
  );
};
