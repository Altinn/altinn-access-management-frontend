import {
  CheckmarkCircleFillIcon,
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
  XMarkOctagonFillIcon,
} from '@navikt/aksel-icons';
import { Trans } from 'react-i18next';
import { t } from 'i18next';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { InheritedStatusType, type InheritedStatusMessageType } from '../useInheritedStatus';
import { PartyType } from '@/rtk/features/userInfoApi';

import classes from './StatusSection.module.css';

const STATUS_TRANSLATION_KEYS: Record<InheritedStatusType, string> = {
  [InheritedStatusType.ViaRole]: 'access_packages.access_status.via_role',
  [InheritedStatusType.ViaConnection]: 'access_packages.access_status.via_connection',
  [InheritedStatusType.ViaActingPartyRole]: 'access_packages.access_status.via_acting_party_role',
};

export const StatusSection = ({
  userHasAccess,
  showMissingRightsMessage,
  inheritedStatus,
  delegationCheckText,
  cannotDelegateHere = false,
}: {
  userHasAccess: boolean;
  showMissingRightsMessage: boolean;
  inheritedStatus?: InheritedStatusMessageType;
  delegationCheckText?: string;
  cannotDelegateHere?: boolean;
}) => {
  const { fromParty, toParty, actingParty } = usePartyRepresentation();

  if (!userHasAccess && !showMissingRightsMessage && !inheritedStatus && !cannotDelegateHere) {
    return null;
  }

  const direction = actingParty?.partyUuid === fromParty?.partyUuid ? 'from' : 'to';

  const formattedActingPartyName = formatDisplayName({
    fullName: actingParty?.name || '',
    type: actingParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
    reverseNameOrder: false,
  });

  const formattedToPartyName = formatDisplayName({
    fullName: toParty?.name || '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
    reverseNameOrder: false,
  });

  const formattedFromPartyName = formatDisplayName({
    fullName: fromParty?.name || '',
    type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
    reverseNameOrder: false,
  });

  const formattedViaName = formatDisplayName({
    fullName: inheritedStatus?.via?.name || '',
    type: inheritedStatus?.via?.type?.toLowerCase() === 'person' ? 'person' : 'company',
    reverseNameOrder: false,
  });

  const formattedUserName = direction === 'from' ? formattedToPartyName : formattedFromPartyName;

  return (
    <div
      className={classes.statusSection}
      aria-live='polite'
    >
      {userHasAccess && (
        <div className={classes.infoLine}>
          <CheckmarkCircleFillIcon
            fontSize='1.5rem'
            className={classes.hasPackageInfoIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey='delegation_modal.has_package_message'
              values={{
                user_name: formattedUserName,
              }}
            />
          </DsParagraph>
        </div>
      )}
      {inheritedStatus && (
        <div className={classes.infoLine}>
          <InformationSquareFillIcon
            fontSize='1.5rem'
            className={classes.inheritedInfoIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey={STATUS_TRANSLATION_KEYS[inheritedStatus.type]}
              values={{
                user_name: formattedUserName,
                via_name: formattedViaName,
                acting_party: formattedActingPartyName,
                from_party: formattedFromPartyName,
              }}
            />
          </DsParagraph>
        </div>
      )}
      {cannotDelegateHere && (
        <div className={classes.infoLine}>
          <XMarkOctagonFillIcon
            fontSize='1.5rem'
            className={classes.dangerIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey='delegation_modal.cannot_delegate_here'
              values={{
                user_name: formattedUserName,
              }}
            />
          </DsParagraph>
        </div>
      )}
      {!cannotDelegateHere && showMissingRightsMessage && (
        <div className={classes.infoLine}>
          <ExclamationmarkTriangleFillIcon
            fontSize='1.5rem'
            className={classes.delegationCheckInfoIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey={delegationCheckText ?? 'delegation_modal.delegation_check_not_delegable'}
              components={{ b: <strong /> }}
              values={{
                you: t('common.you_uppercase'),
                reporteeorg: formattedFromPartyName,
              }}
            />
          </DsParagraph>
        </div>
      )}
    </div>
  );
};
