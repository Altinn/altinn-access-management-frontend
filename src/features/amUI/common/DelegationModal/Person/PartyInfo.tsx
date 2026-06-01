import {
  Avatar,
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  formatDisplayName,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

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
import { DelegationAction } from '../delegationAction';

import classes from './PartyInfo.module.css';

export interface PartyInfoProps {
  /** The party (person/organization) that receives or holds the access */
  party: Party;
  /** The access package the action concerns */
  accessPackage: AccessPackage;
  /** Whether the party already has the access package */
  userHasAccess: boolean;
  /** Inherited-access status messages, same shape as in the package modal */
  inheritedStatus?: InheritedStatusMessageType[];
  /** Optional role description, e.g. "Via role X" */
  roleDescription?: string;
  availableActions?: DelegationAction[];
  onDelegate: () => void;
  onRevoke: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  error?: ActionError | null;
  delegateDescription?: string;
  revokeDescription?: string;
}

const defaultActions = [DelegationAction.DELEGATE, DelegationAction.REVOKE];

export const PartyInfo = ({
  party,
  accessPackage,
  userHasAccess,
  inheritedStatus,
  roleDescription,
  availableActions = defaultActions,
  onDelegate,
  onRevoke,
  isLoading = false,
  isSuccess = false,
  disabled = false,
  error,
  delegateDescription,
  revokeDescription,
}: PartyInfoProps) => {
  const { t } = useTranslation();

  const userName = formatDisplayName({
    fullName: party.name,
    type: party.partyTypeName === PartyType.Person ? 'person' : 'company',
    reverseNameOrder: false,
  });
  const partyAvatarType = party.partyTypeName === PartyType.Person ? 'person' : 'company';

  const canRevoke = userHasAccess && availableActions.includes(DelegationAction.REVOKE);
  const canDelegate = !userHasAccess && availableActions.includes(DelegationAction.DELEGATE);
  const partySubtitle =
    party.partyTypeName === PartyType.Person
      ? getFormattedDateOfBirthLabel(party.dateOfBirth)
      : party.orgNumber
        ? `${t('common.org_nr')} ${formatOrgNr(party.orgNumber)}`
        : undefined;
  const actionDescription = userHasAccess
    ? (revokeDescription ??
      t('party_info.revoke_confirmation', {
        partyName: userName,
        packageName: accessPackage.name,
      }))
    : (delegateDescription ??
      t('party_info.delegate_confirmation', {
        partyName: userName,
        packageName: accessPackage.name,
      }));

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
        <div className={classes.headerText}>
          <DsHeading
            level={1}
            data-size='md'
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
      </div>
      <DsParagraph data-size='sm'>
        {accessPackage.name}
        {roleDescription ? ` · ${roleDescription}` : ''}
      </DsParagraph>
      <DsParagraph data-size='md'>{actionDescription}</DsParagraph>

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
            toPartyName={userName}
          />

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
