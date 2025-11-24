import { Trans } from 'react-i18next';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { InformationSquareFillIcon } from '@navikt/aksel-icons';
import statusClasses from '../StatusSection.module.css';
import { PartyType } from '@/rtk/features/userInfoApi';
import { Role, useGetRolePermissionsQuery } from '@/rtk/features/roleApi';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { InheritedStatusType, useInheritedStatusInfo } from '../../useInheritedStatus';

const STATUS_TRANSLATION_KEYS: Record<InheritedStatusType, string> = {
  [InheritedStatusType.ViaRole]: 'role.access_status.via_role',
  [InheritedStatusType.ViaParent]: 'role.access_status.via_parent',
  [InheritedStatusType.ViaAgent]: 'role.access_status.via_agent',
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

  if (!status) {
    return null;
  }

  const direction = actingParty?.partyUuid === fromParty?.partyUuid ? 'from' : 'to';
  const formattedActingPartyName = formatDisplayName({
    fullName: actingParty?.name || '',
    type: actingParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
    reverseNameOrder: false,
  });
  const formattedUserName = formatDisplayName({
    fullName: (direction === 'from' ? toParty?.name : fromParty?.name) || '',
    type:
      (direction === 'from' ? toParty?.partyTypeName : fromParty?.partyTypeName) ===
      PartyType.Person
        ? 'person'
        : 'company',
    reverseNameOrder: false,
  });
  const formattedFromPartyName = formatDisplayName({
    fullName: fromParty?.name || '',
    type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
    reverseNameOrder: false,
  });

  const formattedViaName = formatDisplayName({
    fullName: status.via?.name || '',
    type: status.via?.type.toLowerCase() === 'person' ? 'person' : 'company',
    reverseNameOrder: false,
  });

  return (
    <div className={statusClasses.infoLine}>
      <InformationSquareFillIcon
        fontSize='1.5rem'
        className={statusClasses.inheritedInfoIcon}
      />
      <DsParagraph data-size='xs'>
        <Trans
          i18nKey={STATUS_TRANSLATION_KEYS[status.type]}
          values={{
            user_name: formattedUserName,
            via_name: formattedViaName,
            acting_party: formattedActingPartyName,
            from_party: formattedFromPartyName,
          }}
        />
      </DsParagraph>
    </div>
  );
};
