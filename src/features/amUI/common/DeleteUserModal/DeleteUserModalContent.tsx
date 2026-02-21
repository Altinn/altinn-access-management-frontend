import {
  Button,
  DsAlert,
  DsDialog,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  formatDisplayName,
} from '@altinn/altinn-components';
import { TrashIcon, XMarkOctagonFillIcon } from '@navikt/aksel-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  GUARDIANSHIP_ROLE_REASON,
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
  'https://info.altinn.no/skjemaoversikt/bronnoysundregistrene/stiftelse-av-aksjeselskap/';
const guardianshipInfoLink = 'https://www.vergemal.no/';

const nonDeletableReasonKeys: Record<NonDeletableReason, string> = {
  [OLD_ALTINN_REASON]: 'delete_user.non_deletable_reason_old_altinn',
  [ER_ROLE_REASON]: 'delete_user.non_deletable_reason_er_roles',
  [AGENT_ROLE_REASON]: 'delete_user.non_deletable_reason_agent_role',
  [GUARDIANSHIP_ROLE_REASON]: 'delete_user.non_deletable_reason_guardianship',
};

const nonDeletableReasonsIntroKeys: Record<DeletionTarget, string> = {
  [DeletionTarget.User]: 'delete_user.user_non_deletable_reasons_intro',
  [DeletionTarget.Yourself]: 'delete_user.yourself_non_deletable_reasons_intro',
  [DeletionTarget.Reportee]: 'delete_user.reportee_non_deletable_reasons_intro',
};

export const DeleteUserModalContent = ({
  status,
  nonDeletableReasons,
  isRolePermissionsLoading = false,
}: DeleteUserModalContentProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSuccess, setIsSuccess] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    if (dialogVisible) {
      dispatch(roleApi.util.invalidateTags(['role-permissions', 'roles']));
      dispatch(accessPackageApi.util.invalidateTags(['AccessPackages']));
    }
  }, [dialogVisible, dispatch]);

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
  const a2ProfileLink = getRedirectToA2UsersListSectionUrl(9);

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
  const shouldNavigateOnDeleteComplete = dialogModel.status.level === DeletionLevel.Full;
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
      dispatch(roleApi.util.invalidateTags(['role-permissions', 'roles']));
      dispatch(accessPackageApi.util.invalidateTags(['AccessPackages']));

      if (toParty.partyUuid === selfParty?.partyUuid) {
        handleSelectAccount(selfParty.partyUuid);
      }
    } catch {
      // Error details are shown from mutation state.
    }
  };

  const onDeleteComplete = () => {
    if (shouldNavigateOnDeleteComplete) {
      navigate(`/${amUIPath.Users}`);
      return;
    }

    setIsSuccess(false);
    setDialogVisible(false);
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
    guardianshipLink: (
      <Link
        to={guardianshipInfoLink}
        target='_blank'
        rel='noopener noreferrer'
      ></Link>
    ),
  };

  return (
    <DsDialog.TriggerContext>
      <DsDialog.Trigger
        onClick={() => {
          setDialogVisible(true);
        }}
        data-size='sm'
        variant='tertiary'
        disabled={!!isPartyRepresentationLoading}
      >
        <TrashIcon style={{ fontSize: '1.4rem' }} />
        {t(dialogModel.textKeys.triggerButtonKey)}
      </DsDialog.Trigger>
      <DsDialog
        open={dialogVisible}
        onClose={() => setDialogVisible(false)}
        closedby='any'
        closeButton={t('common.close')}
        className={classes.modal}
      >
        {isLoading || isSuccess ? (
          <LoadingAnimation
            isLoading={isLoading}
            displaySuccess={isSuccess}
            onAnimationEnd={onDeleteComplete}
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
                  <div className={classes.infoLine}>
                    <XMarkOctagonFillIcon
                      fontSize='1.5rem'
                      className={classes.dangerIcon}
                    />
                    <DsParagraph data-size='sm'>
                      {t(nonDeletableReasonsIntroKeys[dialogModel.status.target], {
                        to_name: formattedToPartyName,
                        from_name: formattedFromPartyName,
                      })}
                    </DsParagraph>
                  </div>
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
                  onClick={() => {
                    setIsSuccess(false);
                    setDialogVisible(false);
                  }}
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
