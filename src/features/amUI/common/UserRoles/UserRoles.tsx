import { Badge, DsChip } from '@altinn/altinn-components';

import cn from 'classnames';

import classes from './userRoles.module.css';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { useGetRightHoldersQuery } from '@/rtk/features/userInfoApi';
import { useMemo } from 'react';
import { t } from 'i18next';
import { getRoleCodesForKeyRoles } from './roleUtils';

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
  const roleTextKeys = useMemo(() => {
    if (isConnectionLoading || loadingPartyRepresentation || connectionData === undefined) {
      return [];
    }
    return getRoleCodesForKeyRoles(connectionData[0].roles) ?? [];
  }, [connectionData, isConnectionLoading, loadingPartyRepresentation]);

  return (
    <div
      className={cn(classes.userRoles, className)}
      {...props}
    >
      {roleTextKeys?.map((roleTextKey) => {
        return <DsChip.Button key={roleTextKey}>{t(roleTextKey)}</DsChip.Button>;
      })}
    </div>
  );
};
