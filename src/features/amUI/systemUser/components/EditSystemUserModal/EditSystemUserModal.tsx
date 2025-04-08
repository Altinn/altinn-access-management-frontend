import React, { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  Field,
  Heading,
  Input,
  Label,
  ValidationMessage,
} from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { PencilIcon } from '@navikt/aksel-icons';
import { useNavigate } from 'react-router';

import {
  useDeleteAgentSystemuserMutation,
  useDeleteSystemuserMutation,
  useUpdateSystemuserMutation,
} from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { SystemUserPath } from '@/routes/paths';

import type { SystemUser } from '../../types';
import { ButtonRow } from '../ButtonRow/ButtonRow';

import { DeleteSystemUserPopover } from './DeleteSystemUserPopover';
import classes from './EditSystemUserModal.module.css';

interface EditSystemUserModalProps {
  systemUser: SystemUser;
  hasAgentDelegations?: boolean;
  isAgentSystemUser?: boolean;
  onSystemUserUpdated: () => void;
}

export const EditSystemUserModal = ({
  systemUser,
  hasAgentDelegations,
  isAgentSystemUser,
  onSystemUserUpdated,
}: EditSystemUserModalProps): React.ReactNode => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const partyId = getCookie('AltinnPartyId');
  const partyUuid = getCookie('AltinnPartyUuid');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [integrationTitle, setIntegrationTitle] = useState<string>('');

  const [updateSystemUser, { isError: isUpdateError, isLoading: isUpdatingSystemUser }] =
    useUpdateSystemuserMutation();

  const [deleteSystemUser, { isError: isDeleteSystemUserError, isLoading: isDeletingSystemUser }] =
    useDeleteSystemuserMutation();

  const [
    deleteAgentSystemUser,
    { isError: isDeleteAgentSystemUserError, isLoading: isDeletingAgentSystemUser },
  ] = useDeleteAgentSystemuserMutation();

  const handleDeleteSystemUser = (): void => {
    deleteSystemUser({ partyId, systemUserId: systemUser.id }).unwrap().then(navigateBack);
  };

  const handleDeleteAgentSystemUser = (): void => {
    deleteAgentSystemUser({ partyId, systemUserId: systemUser.id, partyUuid })
      .unwrap()
      .then(navigateBack);
  };

  const handleUpdateSystemUser = (): void => {
    const payload = {
      integrationTitle: integrationTitle,
    };
    updateSystemUser({
      partyId: partyId,
      systemUserId: systemUser.id || '',
      systemUserUpdate: payload,
    })
      .unwrap()
      .then(() => {
        onCloseModal();
        onSystemUserUpdated();
      });
  };

  const navigateBack = (): void => {
    navigate(`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`);
  };

  const onDeleteSystemUser = (): void => {
    if (isAgentSystemUser) {
      handleDeleteAgentSystemUser();
    } else {
      handleDeleteSystemUser();
    }
  };

  const openModal = (): void => {
    setIsModalOpen(true);
    setIntegrationTitle(systemUser.integrationTitle);
  };

  const onCloseModal = (): void => {
    setIsModalOpen(false);
  };

  const isTitleEmpty = integrationTitle.length === 0;
  const isTitleTooLong = integrationTitle.length > 255;

  return (
    <Dialog.TriggerContext>
      <Dialog.Trigger
        variant='tertiary'
        className={classes.editSystemUserButton}
        onClick={openModal}
      >
        <PencilIcon />
        {t('systemuser_detailpage.edit_systemuser')}
      </Dialog.Trigger>
      <Dialog
        closedby='any'
        open={isModalOpen}
        onClose={onCloseModal}
      >
        <Heading level={1}>{t('systemuser_detailpage.edit_systemuser')}</Heading>
        <Field className={classes.editSystemUserNameField}>
          <Label>{t('systemuser_detailpage.edit_systemuser_name')}</Label>
          <Input
            type='text'
            className={classes.maxWidth}
            value={integrationTitle}
            onChange={(e) => setIntegrationTitle(e.target.value)}
          />
          {isTitleEmpty && (
            <ValidationMessage>
              {t('systemuser_detailpage.edit_systemuser_name_empty_error')}
            </ValidationMessage>
          )}
          {isTitleTooLong && (
            <ValidationMessage>{t('systemuser_detailpage.name_too_long')}</ValidationMessage>
          )}
        </Field>
        <div className={classes.editSystemUserButtons}>
          <ButtonRow>
            <Button
              disabled={
                isTitleEmpty ||
                isTitleTooLong ||
                isUpdatingSystemUser ||
                isDeletingSystemUser ||
                isDeletingAgentSystemUser
              }
              onClick={handleUpdateSystemUser}
            >
              {t('systemuser_detailpage.save_systemuser')}
            </Button>
            <Button
              variant='tertiary'
              onClick={onCloseModal}
            >
              {t('common.cancel')}
            </Button>
          </ButtonRow>
          {isUpdateError && (
            <Alert
              data-color='danger'
              role='alert'
            >
              {t('systemuser_detailpage.update_systemuser_error')}
            </Alert>
          )}
          <DeleteSystemUserPopover
            integrationTitle={systemUser.integrationTitle ?? ''}
            isDeleteError={isDeleteSystemUserError || isDeleteAgentSystemUserError}
            isDeletingSystemUser={isDeletingSystemUser || isDeletingAgentSystemUser}
            handleDeleteSystemUser={onDeleteSystemUser}
            hasAgentDelegation={hasAgentDelegations}
          />
        </div>
      </Dialog>
    </Dialog.TriggerContext>
  );
};
