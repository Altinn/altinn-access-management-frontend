import { Avatar, DsAlert, DsParagraph, Heading } from '@altinn/altinn-components';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { RevokeRoleButton } from '../../RoleList/RevokeRoleButton';
import { DelegateRoleButton } from '../../RoleList/DelegateRoleButton';
import { RequestRoleButton } from '../../RoleList/RequestRoleButton';
import { DelegationAction } from '../EditModal';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { useDelegationModalContext } from '../DelegationModalContext';
import { TechnicalErrorParagraphs } from '../../TechnicalErrorParagraphs';
import { StatusSection } from '../StatusSection';

import classes from './RoleInfo.module.css';

import { ErrorCode, getErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';
import type { ActionError } from '@/resources/hooks/useActionError';
import {
  useDelegationCheckQuery,
  useGetRolesForUserQuery,
  type Role,
} from '@/rtk/features/roleApi';

export interface PackageInfoProps {
  role: Role;
  onDelegate?: () => void;
  availableActions?: DelegationAction[];
}

export const RoleInfo = ({ role, availableActions = [] }: PackageInfoProps) => {
  const { t } = useTranslation();

  const { fromParty, toParty } = usePartyRepresentation();
  const { data: activeDelegations, isFetching } = useGetRolesForUserQuery({
    from: fromParty?.partyUuid ?? '',
    to: toParty?.partyUuid ?? '',
  });
  const { setActionError, actionError } = useDelegationModalContext();
  const { data: delegationCheckResult } = useDelegationCheckQuery({
    rightownerUuid: fromParty?.partyUuid ?? '',
    roleUuid: role.id,
  });

  const assignment = useMemo(() => {
    if (activeDelegations && !isFetching) {
      return activeDelegations.find((assignment) => assignment.role.id === role.id);
    }
    return null;
  }, [activeDelegations, isFetching, role.id]);

  const userHasRole = !!assignment;
  const userHasInheritedRole = assignment?.inherited && assignment.inherited.length > 0;
  const inheritedFromRoleName = userHasInheritedRole ? assignment?.inherited[0]?.name : undefined;

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
          as='h3'
          data-size='sm'
        >
          {role?.name}
        </Heading>
      </div>

      {!!actionError && (
        <DsAlert
          data-color='danger'
          data-size='sm'
        >
          {userHasRole ? (
            <Heading data-size='2xs'>{t('delegation_modal.general_error.revoke_heading')}</Heading>
          ) : (
            <Heading data-size='2xs'>
              {t('delegation_modal.general_error.delegate_heading')}
            </Heading>
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
            assignmentId={assignment.id}
            accessRole={role}
            fullText
            disabled={isFetching || userHasInheritedRole}
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
