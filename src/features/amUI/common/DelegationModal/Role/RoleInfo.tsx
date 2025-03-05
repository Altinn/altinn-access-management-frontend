import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { Avatar } from '@altinn/altinn-components';
import { useMemo } from 'react';
import { ExclamationmarkTriangleFillIcon, InformationSquareFillIcon } from '@navikt/aksel-icons';
import { Trans, useTranslation } from 'react-i18next';

import { RevokeRoleButton } from '../../RoleList/RevokeRoleButton';
import { DelegateRoleButton } from '../../RoleList/DelegateRoleButton';
import { RequestRoleButton } from '../../RoleList/RequestRoleButton';
import { DelegationAction } from '../EditModal';

import classes from './RoleInfo.module.css';

import { ErrorCode, getErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';
import {
  useDelegationCheckQuery,
  useGetRolesForUserQuery,
  type Role,
} from '@/rtk/features/roleApi';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

export interface PackageInfoProps {
  role: Role;
  toPartyUuid: string;
  fromPartyUuid: string;
  onDelegate?: () => void;
  availableActions?: DelegationAction[];
}

export const RoleInfo = ({
  role,
  toPartyUuid,
  fromPartyUuid,
  availableActions = [],
}: PackageInfoProps) => {
  const { t } = useTranslation();

  const { data: toParty } = useGetPartyByUUIDQuery(toPartyUuid);
  const { data: fromParty } = useGetPartyByUUIDQuery(fromPartyUuid);

  const { data: activeDelegations, isFetching } = useGetRolesForUserQuery({
    from: fromPartyUuid ?? '',
    to: toPartyUuid ?? '',
  });

  const { data: delegationCheckResult } = useDelegationCheckQuery({
    rightownerUuid: fromPartyUuid ?? '',
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
          size='sm'
        >
          {role?.name}
        </Heading>
      </div>
      <Paragraph>{role?.description}</Paragraph>
      {!userHasRole && !delegationCheckResult?.canDelegate && (
        <div className={classes.inherited}>
          <ExclamationmarkTriangleFillIcon
            fontSize='1.5rem'
            className={classes.nonDelegableIcon}
          />
          <Paragraph size='xs'>
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
          <Paragraph size='xs'>
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
            roleId={role.id}
            roleName={role.name}
            toParty={toParty}
            fullText
            disabled={isFetching || !role.isDelegable || !delegationCheckResult?.canDelegate}
            variant='solid'
            size='md'
            icon={false}
          />
        )}
        {userHasRole && availableActions.includes(DelegationAction.REVOKE) && (
          <RevokeRoleButton
            assignmentId={assignment.id}
            roleName={role.name}
            toParty={toParty}
            fullText
            disabled={isFetching || userHasInheritedRole}
            variant='solid'
            size='md'
            icon={false}
          />
        )}
      </div>
    </div>
  );
};
