import { Avatar, DsAlert, DsButton, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  formatOrgNr,
  getFormattedDateOfBirthLabel,
  isSubUnitByType,
  formatEntityDisplayName,
  getAvatarType,
} from '@/resources/utils/reporteeUtils';
import { PartyType, type PartyEntity } from '@/dataObjects/dtos/Party';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { StatusSection } from '../../StatusSection/StatusSection';
import { TechnicalErrorParagraphs } from '../../TechnicalErrorParagraphs';
import { ValidationErrorMessage } from '../../ValidationErrorMessage';
import type { InheritedStatusMessageType } from '../../useInheritedStatus';
import { DelegationAction } from '../EditModal';
import { focusFirstEnabledButton, useRestoreFocusAfterSettled } from '../../RestoreFocus';

import classes from './PartyInfo.module.css';

export interface PartyInfoProps {
  party: PartyEntity;
  accessPackage: AccessPackage;
  userHasAccess: boolean;
  inheritedStatus?: InheritedStatusMessageType[];
  availableActions?: DelegationAction[];
  onDelegate?: () => void;
  onRevoke: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  // A post-action refetch that outlasts the success animation would otherwise let focus land on the
  // outgoing button before it swaps. Keep the swap unsettled until the data has landed too.
  isFetching?: boolean;
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
  isFetching = false,
  disabled = false,
  error,
}: PartyInfoProps) => {
  const { t } = useTranslation();

  // Delegate/revoke swap the action button in place via a loading then success animation, dropping
  // focus to the dialog body. Once it settles, return focus to whichever button is now shown.
  const actionsRef = useRef<HTMLDivElement>(null);
  useRestoreFocusAfterSettled({
    isSettled: !isLoading && !isSuccess && !isFetching,
    requestWhen: isLoading,
    onRestore: () => focusFirstEnabledButton(actionsRef.current),
  });

  const userName = formatEntityDisplayName(party);
  const partyAvatarType = getAvatarType(party);

  const canRevoke = userHasAccess && availableActions.includes(DelegationAction.REVOKE);
  const canDelegate =
    !userHasAccess && availableActions.includes(DelegationAction.DELEGATE) && !!onDelegate;

  const partySubtitle =
    party.type === PartyType.Person
      ? getFormattedDateOfBirthLabel(party.dateOfBirth)
      : party.organizationIdentifier
        ? `${t('common.org_nr')} ${formatOrgNr(party.organizationIdentifier)}`
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
          isParent={!isSubUnitByType(party.unitType?.toString())}
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
                      party.type === PartyType.Person
                        ? t('common.persons_lowercase')
                        : t('common.organizations_lowercase'),
                  }}
                />
              ) : (
                <TechnicalErrorParagraphs
                  size='xs'
                  status={error.httpStatus}
                  time={error.timestamp}
                  traceId={error.details?.traceId}
                />
              )}
            </DsAlert>
          )}

          <div
            ref={actionsRef}
            className={classes.actions}
          >
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
