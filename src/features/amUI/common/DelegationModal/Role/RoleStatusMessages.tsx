import { Trans } from 'react-i18next';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { InformationSquareFillIcon } from '@navikt/aksel-icons';
import classes from './RoleInfo.module.css';
import { PartyType } from '@/rtk/features/userInfoApi';
import { Role, useGetRolePermissionsQuery } from '@/rtk/features/roleApi';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { InheritedStatusType, useInheritedStatusInfo } from '../../useInheritedStatus';

const STATUS_TRANSLATION_KEYS: Record<InheritedStatusType, string> = {
  [InheritedStatusType.ViaRole]: 'role.access_status.via_role',
  [InheritedStatusType.ViaConnection]: 'role.access_status.via_connection',
  [InheritedStatusType.ViaKeyRole]: 'role.access_status.via_keyrole',
};

export interface RoleStatusMessageProps {
  role: Role;
}

export const RoleStatusMessage = ({ role }: RoleStatusMessageProps) => {
  const { fromParty, toParty, actingParty } = usePartyRepresentation();
  const { data: rolePermissions } = useGetRolePermissionsQuery(
    {
      party: actingParty?.partyUuid ?? '',
      from: fromParty?.partyUuid,
      to: toParty?.partyUuid,
    },
    { skip: !actingParty?.partyUuid },
  );

  const matchingPermissions = rolePermissions?.find((permission) => permission.role.id === role.id);

  const status = useInheritedStatusInfo({
    permissions: matchingPermissions?.permissions,
    actingParty,
    fromParty,
    toParty,
  });

  // remove duplicates from inheritedStatus. Items are duplicate if type AND via.id are the same
  const uniqueInheritedStatus = Array.from(
    new Map(
      status?.map((item) => [
        `${item.type}|${item.via?.id}`, // composite key
        item,
      ]),
    ).values(),
  );

  const filteredStatuses = uniqueInheritedStatus.filter(
    (s) => !(s.type === InheritedStatusType.ViaKeyRole && role.provider?.code === 'sys-ccr'),
  );

  const formattedUserName = formatDisplayName({
    fullName: toParty?.name || '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
    reverseNameOrder: false,
  });

  return filteredStatuses.map((s) => {
    const safeViaType = s.via?.type ? String(s.via.type).toLowerCase() : '';
    const formattedViaName = formatDisplayName({
      fullName: s.via?.name || '',
      type: safeViaType === 'person' ? 'person' : 'company',
      reverseNameOrder: false,
    });

    const textKey =
      toParty?.partyUuid === s.via?.id && toParty?.partyTypeName === PartyType.Person
        ? 'status_section.access_status.via_priv'
        : STATUS_TRANSLATION_KEYS[s.type];

    return (
      <div className={classes.infoLine}>
        <InformationSquareFillIcon
          fontSize='1.5rem'
          className={classes.inheritedInfoIcon}
        />
        <DsParagraph data-size='xs'>
          <Trans
            i18nKey={textKey}
            values={{
              user_name: formattedUserName,
              via_name: formattedViaName,
            }}
          />
        </DsParagraph>
      </div>
    );
  });
};
