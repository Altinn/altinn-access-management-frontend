import {
  Avatar,
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  formatDisplayName,
} from '@altinn/altinn-components';
import { Trans, useTranslation } from 'react-i18next';

import type { ActionError } from '@/resources/hooks/useActionError';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import {
  formatOrgNr,
  getFormattedDateOfBirthLabel,
  isSubUnitByType,
} from '@/resources/utils/reporteeUtils';

import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { StatusSection } from '../../StatusSection/StatusSection';
import { TechnicalErrorParagraphs } from '../../TechnicalErrorParagraphs';
import { ValidationErrorMessage } from '../../ValidationErrorMessage';
import type { InheritedStatusMessageType } from '../../useInheritedStatus';

import classes from './PartyInfo.module.css';
import { DelegationAction } from '../EditModal';

export interface PartyInfoProps {
  party: Party;
  accessPackage: AccessPackage;
  userHasAccess: boolean;
  inheritedStatus?: InheritedStatusMessageType[];
  availableActions?: DelegationAction[];
  onDelegate?: () => void;
  onRevoke: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  error?: ActionError | null;
}

const defaultActions: DelegationAction[] = [];

export const PartyInfo = ({
  party,
  accessPackage,
  userHasAccess,
  inheritedStatus,
  availableActions = defaultActions,
  onDelegate,
  onRevoke,
  isLoading = false,
  isSuccess = false,
  disabled = false,
  error,
}: PartyInfoProps) => {
  const { t } = useTranslation();

  const userName = formatDisplayName({
    fullName: party.name,
    type: party.partyTypeName === PartyType.Person ? 'person' : 'company',
    reverseNameOrder: false,
  });
  const partyAvatarType = party.partyTypeName === PartyType.Person ? 'person' : 'company';

  const canRevoke = userHasAccess && availableActions.includes(DelegationAction.REVOKE);
  const canDelegate =
    !userHasAccess && availableActions.includes(DelegationAction.DELEGATE) && !!onDelegate;

  const partySubtitle =
    party.partyTypeName === PartyType.Person
      ? getFormattedDateOfBirthLabel(party.dateOfBirth)
      : party.orgNumber
        ? `${t('common.org_nr')} ${formatOrgNr(party.orgNumber)}`
        : undefined;

  const actionDescriptionKey = userHasAccess
    ? 'party_info.revoke_confirmation'
    : 'party_info.delegate_confirmation';

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Avatar
          name={userName}
          type={partyAvatarType}
          size='md'
          isDeleted={party.isDeleted}
          isParent={!isSubUnitByType(party.variant?.toString())}
          className={classes.avatar}
        />
        <DsHeading
          level={1}
          data-size='md'
          className={classes.headerText}
        >
          {userName}
        </DsHeading>
        {partySubtitle && (
          <DsParagraph
            data-size='sm'
            className={classes.subheading}
          >
            {partySubtitle}
          </DsParagraph>
        )}
      </div>
      <StatusSection
        userHasAccess={userHasAccess}
        inheritedStatus={inheritedStatus}
        cannotDelegateHere={accessPackage.isAssignable === false}
        toPartyName={userName}
      />
      <DsParagraph data-size='md'>
        <Trans
          i18nKey={actionDescriptionKey}
          values={{ partyName: userName, packageName: accessPackage.name }}
          components={{ b: <b /> }}
        />
      </DsParagraph>

      {isLoading || isSuccess ? (
        <LoadingAnimation
          isLoading={isLoading}
          displaySuccess={isSuccess}
        />
      ) : (
        <>
          {!!error && (
            <DsAlert
              data-color='danger'
              data-size='sm'
            >
              <DsHeading
                level={2}
                data-size='2xs'
              >
                {userHasAccess
                  ? t('delegation_modal.general_error.revoke_heading')
                  : t('delegation_modal.general_error.delegate_heading')}
              </DsHeading>
              {error.details?.detail || error.details?.errorCode ? (
                <ValidationErrorMessage
                  errorCode={error.details?.errorCode ?? error.details?.detail ?? ''}
                  translationValues={{
                    entity_type:
                      party.partyTypeName === PartyType.Person
                        ? t('common.persons_lowercase')
                        : t('common.organizations_lowercase'),
                  }}
                />
              ) : (
                <TechnicalErrorParagraphs
                  size='xs'
                  status={error.httpStatus}
                  time={error.timestamp}
                />
              )}
            </DsAlert>
          )}

          <div className={classes.actions}>
            {canRevoke && (
              <DsButton
                data-color='danger'
                disabled={disabled}
                onClick={onRevoke}
              >
                {t('common.delete_poa')}
              </DsButton>
            )}
            {canDelegate && (
              <DsButton
                disabled={disabled}
                onClick={onDelegate}
              >
                {t('common.give_poa')}
              </DsButton>
            )}
          </div>
        </>
      )}
    </div>
  );
};
