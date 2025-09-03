import { Badge } from '@altinn/altinn-components';
import cn from 'classnames';

import { useGetRolesForUserQuery } from '@/rtk/features/roleApi';

import classes from './userRoles.module.css';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { useGetRightHoldersQuery } from '@/rtk/features/userInfoApi';
import { useMemo } from 'react';
import { t } from 'i18next';

interface UserRulesProps extends React.HTMLAttributes<HTMLDivElement> {
  rightOwnerUuid: string;
  rightHolderUuid: string;
}

export const UserRoles = ({
  rightOwnerUuid,
  rightHolderUuid,
  className,
  ...props
}: UserRulesProps) => {
  const {
    toParty,
    fromParty,
    actingParty,
    isLoading: loadingPartyRepresentation,
  } = usePartyRepresentation();
  const { data: connectionData, isLoading: isConnectionLoading } = useGetRightHoldersQuery(
    {
      partyUuid: actingParty?.partyUuid ?? '',
      toUuid: toParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
    },
    { skip: !actingParty || (!toParty && !fromParty) },
  );
  const roles = useMemo(() => {
    if (isConnectionLoading || loadingPartyRepresentation || connectionData === undefined) {
      return [];
    }
    return connectionData[0].roles.map((role) => role.code) ?? [];
  }, [connectionData, isConnectionLoading, loadingPartyRepresentation]);

  return (
    <div
      className={cn(classes.userRoles, className)}
      {...props}
    >
      {roles?.map((role) => {
        return (
          <Badge
            color={'company'}
            label={t(`user_role.${role}`)}
            key={role}
          />
        );
      })}
    </div>
  );
};
