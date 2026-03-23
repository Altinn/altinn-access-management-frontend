import {
  CheckmarkCircleFillIcon,
  ExclamationmarkTriangleFillIcon,
  HourglassIcon,
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
  inheritedStatus?: InheritedStatusMessageType[];
  cannotDelegateHere?: boolean;
  showDelegationCheckWarning?: boolean;
  delegationCheckTranslationKey?: string;
  delegationCheckValues?: Record<string, unknown>;
  showUndelegatedWarning?: boolean;
  undelegatedPackageName?: string;
  isPendingRequest?: boolean;
  cannotRequestRight?: boolean;
  toPartyName?: string;
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
  isPendingRequest,
  cannotRequestRight,
  toPartyName,
}: StatusSectionProps) => {
  const { t } = useTranslation();
  const { fromParty, toParty } = usePartyRepresentation();

  if (
    !userHasAccess &&
    (!inheritedStatus || !inheritedStatus.length) &&
    !cannotDelegateHere &&
    !showDelegationCheckWarning &&
    !showUndelegatedWarning &&
    !isPendingRequest &&
    !cannotRequestRight
  ) {
    return null;
  }

  const formattedToPartyName =
    toPartyName ??
    formatDisplayName({
      fullName: toParty?.name || '',
      type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
      reverseNameOrder: false,
    });

  const formattedFromPartyName = formatDisplayName({
    fullName: fromParty?.name || '',
    type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
    reverseNameOrder: false,
  });

  const formattedUserName = formattedToPartyName;
  const shouldShowDelegationCheck = !cannotDelegateHere && showDelegationCheckWarning;

  const delegationCheckValuesWithDefaults = {
    you: t('common.you_uppercase'),
    reporteeorg: formattedFromPartyName,
    ...delegationCheckValues,
  };

  // remove duplicates from inheritedStatus. Items are duplicate if type AND via.id are the same
  const uniqueInheritedStatus = Array.from(
    new Map(
      inheritedStatus?.map((item) => [
        `${item.type}|${item.via?.id}`, // composite key
        item,
      ]),
    ).values(),
  );

  return (
    <div
      className={classes.statusSection}
      aria-live='polite'
    >
      {showUndelegatedWarning && (
        <div className={classes.infoLine}>
          <ExclamationmarkTriangleFillIcon
            className={classes.warningIcon}
            aria-hidden='true'
          />
          <DsParagraph data-size='sm'>
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
            className={classes.hasPackageInfoIcon}
            aria-hidden='true'
          />
          <DsParagraph data-size='sm'>
            <Trans
              i18nKey='status_section.has_package_message'
              values={{
                user_name: formattedUserName,
              }}
            />
          </DsParagraph>
        </div>
      )}
      {uniqueInheritedStatus?.map((status) => {
        const formattedViaName = formatDisplayName({
          fullName: status.via?.name || '',
          type: status.via?.type?.toLowerCase() === 'person' ? 'person' : 'company',
          reverseNameOrder: false,
        });

        const textKey =
          toParty?.partyUuid === status.via?.id && toParty?.partyTypeName === PartyType.Person
            ? 'status_section.access_status.via_priv'
            : STATUS_TRANSLATION_KEYS[status.type];

        return (
          <div
            key={`${status.type}-${status.via?.id}`}
            className={classes.infoLine}
          >
            <InformationSquareFillIcon
              className={classes.inheritedInfoIcon}
              aria-hidden='true'
            />
            <DsParagraph data-size='sm'>
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
      })}
      {cannotDelegateHere && (
        <div className={classes.infoLine}>
          <XMarkOctagonFillIcon
            className={classes.dangerIcon}
            aria-hidden='true'
          />
          <DsParagraph data-size='sm'>
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
            className={classes.delegationCheckInfoIcon}
            aria-hidden='true'
          />
          <DsParagraph data-size='sm'>
            <Trans
              i18nKey={delegationCheckTranslationKey}
              components={{ b: <strong /> }}
              values={delegationCheckValuesWithDefaults}
            />
          </DsParagraph>
        </div>
      )}
      {isPendingRequest && (
        <div className={classes.infoLine}>
          <HourglassIcon
            className={classes.inheritedInfoIcon}
            aria-hidden='true'
          />
          <DsParagraph data-size='sm'>
            <Trans
              i18nKey={'delegation_modal.request.pending_request_info'}
              components={{ strong: <strong /> }}
              values={{
                partyName: formattedFromPartyName,
              }}
            />
          </DsParagraph>
        </div>
      )}
      {cannotRequestRight && (
        <div className={classes.infoLine}>
          <XMarkOctagonFillIcon
            className={classes.dangerIcon}
            aria-hidden='true'
          />
          <DsParagraph data-size='sm'>
            {t('delegation_modal.request.cannot_request_right')}
          </DsParagraph>
        </div>
      )}
    </div>
  );
};
