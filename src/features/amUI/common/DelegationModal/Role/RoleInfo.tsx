import { Avatar, DsAlert, DsParagraph, DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useGetRolesForUserQuery, type Role, type RoleConnection } from '@/rtk/features/roleApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { RevokeRoleButton } from '../../RoleList/RevokeRoleButton';
import { DelegationAction } from '../EditModal';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { useDelegationModalContext } from '../DelegationModalContext';
import { TechnicalErrorParagraphs } from '../../TechnicalErrorParagraphs';
import { StatusSection } from '../StatusSection';
import { revokeRolesEnabled } from '@/resources/utils/featureFlagUtils';

import classes from './RoleInfo.module.css';
import { FilesIcon } from '@navikt/aksel-icons';

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

  const connection: RoleConnection | undefined =
    !roleConnections || isFetching
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
  const revokeFeatureEnabled = revokeRolesEnabled();
  const canRevoke =
    userHasRole &&
    availableActions.includes(DelegationAction.REVOKE) &&
    revokeFeatureEnabled &&
    role?.provider?.code === 'sys-altinn2' &&
    !!revocationContext;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <FilesIcon className={classes.icon} />
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
      />

      {role?.provider?.name && (
        <DsParagraph data-size='sm'>
          {t('role.provider_status', { provider: role.provider.name })}
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
