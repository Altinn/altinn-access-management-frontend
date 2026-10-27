import { DsAlert, DsButton, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { PartyType } from '@/dataObjects/dtos/Party';
import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';

import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { focusFirstEnabledButton, useRestoreFocusAfterSettled } from '../../RestoreFocus';
import { StatusSection } from '../../StatusSection/StatusSection';
import { TechnicalErrorParagraphs } from '../../TechnicalErrorParagraphs';
import { ValidationErrorMessage } from '../../ValidationErrorMessage';
import type { PartyInfoProps } from '../Party/PartyInfo';

import classes from './AccessPackageInfo.module.css';
import { PackageHeader } from './PackageHeader';
import { PackageMeta } from './PackageMeta';

export const ClientPackageInfo = ({
  party,
  accessPackage,
  userHasAccess,
  roleDescription,
  onDelegate,
  onRevoke,
  isLoading = false,
  isSuccess = false,
  error,
}: PartyInfoProps & { roleDescription?: string }) => {
  const { t } = useTranslation();
  const actionsRef = useRef<HTMLDivElement>(null);
  useRestoreFocusAfterSettled({
    isSettled: !isLoading && !isSuccess,
    requestWhen: isLoading,
    onRestore: () => {
      focusFirstEnabledButton(actionsRef.current);
      // Revoke-only lists leave no action button, so fall back to the dialog's close button.
      focusFirstEnabledButton(actionsRef.current?.closest('dialog') ?? null);
    },
  });

  const userName = formatEntityDisplayName(party);

  const canRevoke = userHasAccess && !!onRevoke;
  const canDelegate = !userHasAccess && !!onDelegate;
  const cannotChangeAccess = accessPackage.isDelegable === false;

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
                />
              )}
            </DsAlert>
          )}

          {roleDescription && (
            <DsParagraph
              data-size='xs'
              className={classes.roleDescription}
            >
              {roleDescription}
            </DsParagraph>
          )}
          <StatusSection
            userHasAccess={userHasAccess}
            cannotDelegateHere={cannotChangeAccess}
            toPartyName={userName}
          />

          <PackageMeta accessPackage={accessPackage} />

          <div
            ref={actionsRef}
            className={classes.actions}
          >
            {canRevoke && (
              <DsButton
                data-color='danger'
                disabled={cannotChangeAccess}
                onClick={onRevoke}
              >
                {t('common.delete_poa')}
              </DsButton>
            )}
            {canDelegate && (
              <DsButton
                disabled={cannotChangeAccess}
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
