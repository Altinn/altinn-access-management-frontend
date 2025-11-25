import { Trans } from 'react-i18next';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { InformationSquareFillIcon } from '@navikt/aksel-icons';
import statusClasses from '../StatusSection.module.css';
import { RoleStatusType, useInheritedRoleInfo } from './useInheritedRoleInfo';
import { PartyType } from '@/rtk/features/userInfoApi';
import { Role, useGetRolePermissionsQuery } from '@/rtk/features/roleApi';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';

const STATUS_TRANSLATION_KEYS: Record<RoleStatusType, string> = {
  [RoleStatusType.ViaRole]: 'role.access_status.via_role',
  [RoleStatusType.ViaParent]: 'role.access_status.via_parent',
  [RoleStatusType.ViaAgent]: 'role.access_status.via_agent',
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

  const status = useInheritedRoleInfo({
    rolePermissions,
    role,
    actingParty,
    fromParty,
    toParty,
  });

  if (!status) {
    return null;
  }

  const direction = actingParty?.partyUuid === fromParty?.partyUuid ? 'from' : 'to';
  const formattedUserName = formatDisplayName({
    fullName: (direction === 'from' ? toParty?.name : fromParty?.name) || '',
    type:
      (direction === 'from' ? toParty?.partyTypeName : fromParty?.partyTypeName) ===
      PartyType.Person
        ? 'person'
        : 'company',
    reverseNameOrder: false,
  });

  const viaType = status.via?.type ? String(status.via.type).toLowerCase() : '';
  const formattedViaName = formatDisplayName({
    fullName: status.via?.name || '',
    type: viaType === 'person' ? 'person' : 'company',
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
          }}
        />
      </DsParagraph>
    </div>
  );
};
