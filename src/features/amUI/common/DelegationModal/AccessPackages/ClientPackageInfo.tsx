import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  formatDisplayName,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { PartyType } from '@/rtk/features/userInfoApi';

import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { StatusSection } from '../../StatusSection/StatusSection';
import { TechnicalErrorParagraphs } from '../../TechnicalErrorParagraphs';
import { ValidationErrorMessage } from '../../ValidationErrorMessage';
import type { PartyInfoProps } from '../Party/PartyInfo';

import classes from './AccessPackageInfo.module.css';
import { PackageHeader } from './PackageHeader';
import { PackageMeta } from './PackageMeta';
import { DelegationAction } from '../EditModal';

export const ClientPackageInfo = ({
  party,
  accessPackage,
  userHasAccess,
  inheritedStatus,
  roleDescription,
  availableActions = [DelegationAction.DELEGATE, DelegationAction.REVOKE],
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

  const canRevoke = userHasAccess && availableActions.includes(DelegationAction.REVOKE);
  const canDelegate =
    !userHasAccess && availableActions.includes(DelegationAction.DELEGATE) && !!onDelegate;
  const cannotChangeAccess = accessPackage.isAssignable === false;

  return (
    <div className={classes.container}>
      <PackageHeader name={accessPackage.name} />

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

          <StatusSection
            userHasAccess={userHasAccess}
            inheritedStatus={inheritedStatus}
            cannotDelegateHere={cannotChangeAccess}
            toPartyName={userName}
          />

          {roleDescription && <DsParagraph data-size='sm'>{roleDescription}</DsParagraph>}

          <PackageMeta accessPackage={accessPackage} />

          <div className={classes.actions}>
            {canRevoke && (
              <DsButton
                data-color='danger'
                disabled={disabled || cannotChangeAccess}
                onClick={onRevoke}
              >
                {t('common.delete_poa')}
              </DsButton>
            )}
            {canDelegate && (
              <DsButton
                disabled={disabled || cannotChangeAccess}
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
