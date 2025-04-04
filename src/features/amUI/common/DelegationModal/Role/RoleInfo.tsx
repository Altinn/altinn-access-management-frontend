import { Alert, Heading, Paragraph } from '@digdir/designsystemet-react';
import { Avatar } from '@altinn/altinn-components';
import { useMemo } from 'react';
import { ExclamationmarkTriangleFillIcon, InformationSquareFillIcon } from '@navikt/aksel-icons';
import { Trans, useTranslation } from 'react-i18next';

import { ErrorCode, getErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';
import {
  useDelegationCheckQuery,
  useGetRolesForUserQuery,
  type Role,
} from '@/rtk/features/roleApi';

import { RevokeRoleButton } from '../../RoleList/RevokeRoleButton';
import { DelegateRoleButton } from '../../RoleList/DelegateRoleButton';
import { RequestRoleButton } from '../../RoleList/RequestRoleButton';
import { DelegationAction } from '../EditModal';

import classes from './RoleInfo.module.css';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { ActionError } from '@/resources/hooks/useActionError';
import { useDelegationModalContext } from '../DelegationModalContext';
import { TechnicalErrorParagraphs } from '../../TechnicalErrorParagraphs';

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
  const inheritedFromRoleName = (userHasInheritedRole && assignment?.inherited[0]?.name) ?? null;

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
          data-size='sm'
        >
          {role?.name}
        </Heading>
      </div>

      {!!actionError && (
        <Alert
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
        </Alert>
      )}
      <Paragraph>{role?.description}</Paragraph>
      {!userHasRole && !delegationCheckResult?.canDelegate && (
        <div className={classes.inherited}>
          <ExclamationmarkTriangleFillIcon
            fontSize='1.5rem'
            className={classes.nonDelegableIcon}
          />
          <Paragraph data-size='xs'>
            {delegationCheckResult?.detailCode === ErrorCode.Unknown ? (
              <Trans i18nKey='role.cant_delegate_generic' />
            ) : (
              <Trans
                i18nKey={getErrorCodeTextKey(delegationCheckResult?.detailCode)}
                components={{ b: <strong /> }}
                values={{
                  you: t('common.you_uppercase'),
                  serviceowner: role.provider?.name,
                  reporteeorg: fromParty?.name,
                }}
              />
            )}
          </Paragraph>
        </div>
      )}
      {userHasInheritedRole && (
        <div className={classes.inherited}>
          <InformationSquareFillIcon
            fontSize='1.5rem'
            className={classes.inheritedInfoIcon}
          />
          <Paragraph data-size='xs'>
            <Trans
              i18nKey='role.inherited_role_message'
              values={{ user_name: toParty?.name || '', role_name: inheritedFromRoleName }}
              components={{ b: <strong /> }}
            />
          </Paragraph>
        </div>
      )}
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
