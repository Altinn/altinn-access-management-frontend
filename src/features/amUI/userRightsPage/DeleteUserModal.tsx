import { Button } from '@altinn/altinn-components';
import { Alert, Dialog, Heading, Paragraph } from '@digdir/designsystemet-react';
import { t } from 'i18next';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { TrashIcon } from '@navikt/aksel-icons';
import { Trans } from 'react-i18next';

import { useRemoveRightHolderMutation } from '@/rtk/features/userInfoApi';
import type { Party } from '@/rtk/features/lookupApi';
import { amUIPath } from '@/routes/paths';

import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { LoadingAnimation } from '../common/LoadingAnimation/LoadingAnimation';

import classes from './DeleteUserModal.module.css';

export const DeleteUserModal = ({ user, reporteeName }: { user: Party; reporteeName: string }) => {
  const [deleteUser, { isLoading, isError, error }] = useRemoveRightHolderMutation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const onDeleteUser = () => {
    deleteUser(user.partyUuid)
      .unwrap()
      .then(() => {
        setIsSuccess(true);
      })
      .catch((err) => {
        // Error is already captured by RTK Query's isError and error states
        console.error('Failed to delete user:', err);
      });
  };

  const redirectToUsersPage = () => navigate(`/${amUIPath.Users}`);

  const errorDetails = isError ? createErrorDetails(error) : null;

  return (
    <Dialog.TriggerContext>
      <Dialog.Trigger
        data-size='sm'
        variant='tertiary'
      >
        {t('delete_user.trigger_button')}
        <TrashIcon style={{ fontSize: '1.4rem' }} />
      </Dialog.Trigger>
      <Dialog
        ref={dialogRef}
        closedby='any'
        closeButton={t('common.close')}
        className={classes.modal}
      >
        {isLoading || isSuccess ? (
          <LoadingAnimation
            isLoading={isLoading}
            displaySuccess={isSuccess}
            onAnimationEnd={redirectToUsersPage}
          />
        ) : (
          <div className={classes.modalContent}>
            <Heading>{t('delete_user.heading')}</Heading>

            <Paragraph data-size='sm'>
              <Trans
                i18nKey='delete_user.message'
                values={{
                  user_name: user?.name,
                  reportee_name: reporteeName,
                }}
              />
            </Paragraph>
            {isError && errorDetails && (
              <Alert
                data-size='sm'
                data-color='danger'
              >
                <TechnicalErrorParagraphs
                  status={errorDetails.status}
                  time={errorDetails.time}
                  size='sm'
                />
              </Alert>
            )}
            <div className={classes.buttons}>
              <Button
                color='danger'
                onClick={onDeleteUser}
              >
                {t('delete_user.yes_button')}
              </Button>
              <Button
                color='neutral'
                variant='text'
                onClick={() => dialogRef.current?.close()}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </Dialog.TriggerContext>
  );
};
