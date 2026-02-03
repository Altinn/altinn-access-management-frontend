import {
  CheckmarkCircleFillIcon,
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
  XMarkOctagonFillIcon,
} from '@navikt/aksel-icons';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { Trans, useTranslation } from 'react-i18next';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { InheritedStatusType, type InheritedStatusMessageType } from '../useInheritedStatus';
import { PartyType } from '@/rtk/features/userInfoApi';

import classes from './StatusSection.module.css';

const STATUS_TRANSLATION_KEYS: Record<InheritedStatusType, string> = {
  [InheritedStatusType.ViaRole]: 'status_section.access_status.via_role',
  [InheritedStatusType.ViaConnection]: 'status_section.access_status.via_connection',
  [InheritedStatusType.ViaKeyRole]: 'status_section.access_status.via_keyrole',
};

export interface StatusSectionProps {
  userHasAccess?: boolean;
  inheritedStatus?: InheritedStatusMessageType;
  cannotDelegateHere?: boolean;
  showDelegationCheckWarning?: boolean;
  delegationCheckTranslationKey?: string;
  delegationCheckValues?: Record<string, unknown>;
  showUndelegatedWarning?: boolean;
  undelegatedPackageName?: string;
}

export const StatusSection = ({
  userHasAccess = false,
  inheritedStatus,
  cannotDelegateHere = false,
  showDelegationCheckWarning = false,
  delegationCheckTranslationKey = 'status_section.delegation_check_not_delegable',
  delegationCheckValues,
  showUndelegatedWarning = false,
  undelegatedPackageName,
}: StatusSectionProps) => {
  const { t } = useTranslation();
  const { fromParty, toParty } = usePartyRepresentation();

  if (
    !userHasAccess &&
    !inheritedStatus &&
    !cannotDelegateHere &&
    !showDelegationCheckWarning &&
    !showUndelegatedWarning
  ) {
    return null;
  }

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

  const formattedUserName = formattedToPartyName;
  const shouldShowDelegationCheck = !cannotDelegateHere && showDelegationCheckWarning;

  const delegationCheckValuesWithDefaults = {
    you: t('common.you_uppercase'),
    reporteeorg: formattedFromPartyName,
    ...delegationCheckValues,
  };

  return (
    <div
      className={classes.statusSection}
      aria-live='polite'
    >
      {showUndelegatedWarning && (
        <div className={classes.infoLine}>
          <ExclamationmarkTriangleFillIcon
            fontSize='1.5rem'
            className={classes.warningIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey='status_section.no_permissions_fulltext'
              values={{ packageName: undelegatedPackageName }}
              components={{ b: <strong /> }}
            />
          </DsParagraph>
        </div>
      )}
      {userHasAccess && (
        <div className={classes.infoLine}>
          <CheckmarkCircleFillIcon
            fontSize='1.5rem'
            className={classes.hasPackageInfoIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey='status_section.has_package_message'
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
            {toParty?.partyUuid === inheritedStatus?.via?.id &&
            toParty?.partyTypeName === PartyType.Person ? (
              t('status_section.access_status.via_priv', {
                user_name: formattedUserName,
              })
            ) : (
              <Trans
                i18nKey={STATUS_TRANSLATION_KEYS[inheritedStatus.type]}
                values={{
                  user_name: formattedUserName,
                  via_name: formattedViaName,
                }}
              />
            )}
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
              i18nKey='status_section.cannot_delegate_here'
              values={{
                user_name: formattedUserName,
              }}
            />
          </DsParagraph>
        </div>
      )}
      {shouldShowDelegationCheck && (
        <div className={classes.infoLine}>
          <ExclamationmarkTriangleFillIcon
            fontSize='1.5rem'
            className={classes.delegationCheckInfoIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey={delegationCheckTranslationKey}
              components={{ b: <strong /> }}
              values={delegationCheckValuesWithDefaults}
            />
          </DsParagraph>
        </div>
      )}
    </div>
  );
};
