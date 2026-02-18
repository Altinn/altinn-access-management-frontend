import {
  Button,
  DsAlert,
  DsDialog,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  formatDisplayName,
} from '@altinn/altinn-components';
import { TrashIcon } from '@navikt/aksel-icons';
import { useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router';

import { getRedirectToA2UsersListSectionUrl } from '@/resources/utils';
import { amUIPath } from '@/routes/paths';
import { accessPackageApi } from '@/rtk/features/accessPackageApi';
import { useRemoveRightHolderMutation } from '@/rtk/features/connectionApi';
import { roleApi } from '@/rtk/features/roleApi';
import { PartyType } from '@/rtk/features/userInfoApi';

import { LoadingAnimation } from '../LoadingAnimation/LoadingAnimation';
import { handleSelectAccount } from '../PageLayoutWrapper/useHeader';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import classes from './DeleteUserModal.module.css';
import {
  AGENT_ROLE_REASON,
  DeletionLevel,
  type DeletionStatus,
  DeletionTarget,
  getDeleteUserDialogModelFromStatus,
  ER_ROLE_REASON,
  OLD_ALTINN_REASON,
  type NonDeletableReason,
} from './deletionModalUtils';

export interface DeleteUserModalContentProps {
  status: DeletionStatus;
  nonDeletableReasons: NonDeletableReason[];
  isRolePermissionsLoading?: boolean;
}

const srmLink =
  'https://www.altinn.no/Pages/ServiceEngine/Start/StartService.aspx?ServiceEditionCode=1&ServiceCode=3498&M=SP&DontChooseReportee=true&O=personal';
const a2ProfileLink = getRedirectToA2UsersListSectionUrl(9);

const nonDeletableReasonKeys: Record<NonDeletableReason, string> = {
  [OLD_ALTINN_REASON]: 'delete_user.non_deletable_reason_old_altinn',
  [ER_ROLE_REASON]: 'delete_user.non_deletable_reason_er_roles',
  [AGENT_ROLE_REASON]: 'delete_user.non_deletable_reason_agent_role',
};

export const DeleteUserModalContent = ({
  status,
  nonDeletableReasons,
  isRolePermissionsLoading = false,
}: DeleteUserModalContentProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [deleteUser, { isLoading: isDeleteLoading, isError, error }] =
    useRemoveRightHolderMutation();

  const {
    fromParty,
    toParty,
    actingParty,
    selfParty,
    isLoading: isPartyRepresentationLoading,
  } = usePartyRepresentation();

  const dialogModel = useMemo(
    () => getDeleteUserDialogModelFromStatus({ status, nonDeletableReasons }),
    [nonDeletableReasons, status],
  );

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

  const isDeletingYourself = dialogModel.status.target === DeletionTarget.Yourself;
  const agentAccessLinkPath = isDeletingYourself
    ? amUIPath.MyClients
    : amUIPath.ClientAdministration;
  const agentAccessLinkText = isDeletingYourself
    ? t('delete_user.agent_role_my_clients_link')
    : t('delete_user.agent_role_client_admin_link');

  const onDeleteUser = async () => {
    if (!toParty?.partyUuid || !fromParty?.partyUuid || !actingParty?.partyUuid) {
      return;
    }

    try {
      await deleteUser({
        to: toParty.partyUuid,
        from: fromParty.partyUuid,
        party: actingParty.partyUuid,
      }).unwrap();

      setIsSuccess(true);
      dispatch(roleApi.util.invalidateTags(['roles']));
      dispatch(accessPackageApi.util.invalidateTags(['AccessPackages']));

      if (toParty.partyUuid === selfParty?.partyUuid) {
        handleSelectAccount(selfParty.partyUuid);
      }
    } catch {
      // Error details are shown from mutation state.
    }
  };

  const isDeletionNotAllowed = dialogModel.status.level === DeletionLevel.None;
  const shouldShowNonDeletableReasons =
    dialogModel.status.level !== DeletionLevel.Full && dialogModel.nonDeletableReasons.length > 0;
  const isLoading = isDeleteLoading || isRolePermissionsLoading;
  const errorDetails = isError ? createErrorDetails(error) : null;
  const transComponents = {
    p: <DsParagraph data-size='sm'></DsParagraph>,
    erLink: (
      <Link
        to={srmLink}
        target='_blank'
        rel='noopener noreferrer'
      ></Link>
    ),
    a2Link: (
      <Link
        to={a2ProfileLink}
        target='_blank'
        rel='noopener noreferrer'
      ></Link>
    ),
  };

  return (
    <DsDialog.TriggerContext>
      <DsDialog.Trigger
        data-size='sm'
        variant='tertiary'
        disabled={!!isPartyRepresentationLoading}
      >
        <TrashIcon style={{ fontSize: '1.4rem' }} />
        {t(dialogModel.textKeys.triggerButtonKey)}
      </DsDialog.Trigger>
      <DsDialog
        ref={dialogRef}
        closedby='any'
        closeButton={t('common.close')}
        className={classes.modal}
      >
        {isLoading || isSuccess ? (
          <LoadingAnimation
            isLoading={isLoading}
            displaySuccess={isSuccess}
            onAnimationEnd={() => navigate(`/${amUIPath.Users}`)}
          />
        ) : isPartyRepresentationLoading ? (
          <DsSkeleton
            variant='text'
            width='180'
          />
        ) : (
          <div className={classes.modalContent}>
            <div className={classes.contentBody}>
              <DsHeading>{t(dialogModel.textKeys.headingKey)}</DsHeading>
              {dialogModel.textKeys.fullDeletionMessageKey && (
                <Trans
                  i18nKey={dialogModel.textKeys.fullDeletionMessageKey}
                  values={{
                    to_name: formattedToPartyName,
                    from_name: formattedFromPartyName,
                  }}
                  components={transComponents}
                />
              )}
              {shouldShowNonDeletableReasons && (
                <div className={classes.reasonsSection}>
                  <DsParagraph data-size='sm'>
                    {t('delete_user.non_deletable_reasons_intro', {
                      to_name: formattedToPartyName,
                    })}
                  </DsParagraph>
                  <ul className={classes.reasonList}>
                    {dialogModel.nonDeletableReasons.map((reason) => (
                      <li key={reason}>
                        <DsParagraph data-size='sm'>
                          <Trans
                            i18nKey={nonDeletableReasonKeys[reason]}
                            values={{ linkText: agentAccessLinkText }}
                            components={{
                              ...transComponents,
                              agentLink: <Link to={`/${agentAccessLinkPath}`}></Link>,
                            }}
                          />
                        </DsParagraph>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {dialogModel.partialConfirmationMessageKey && (
                <Trans
                  i18nKey={dialogModel.partialConfirmationMessageKey}
                  values={{
                    to_name: formattedToPartyName,
                    from_name: formattedFromPartyName,
                  }}
                  components={transComponents}
                />
              )}
              {errorDetails && (
                <DsAlert
                  data-size='sm'
                  data-color='danger'
                >
                  <TechnicalErrorParagraphs
                    status={errorDetails.status}
                    time={errorDetails.time}
                    traceId={errorDetails.traceId}
                    size='sm'
                  />
                </DsAlert>
              )}
            </div>
            {!isDeletionNotAllowed && (
              <div className={classes.buttons}>
                <Button
                  color='danger'
                  onClick={onDeleteUser}
                  disabled={isLoading || !!isPartyRepresentationLoading}
                >
                  {t('delete_user.yes_button')}
                </Button>
                <Button
                  color='neutral'
                  variant='tertiary'
                  onClick={() => dialogRef.current?.close()}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            )}
          </div>
        )}
      </DsDialog>
    </DsDialog.TriggerContext>
  );
};
