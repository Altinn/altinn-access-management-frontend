import React, { useRef } from 'react';
import { DsButton, DsDialog, DsHeading, DsTabs } from '@altinn/altinn-components';
import { t } from 'i18next';
import { PlusIcon } from '@navikt/aksel-icons';

import { NewPersonContent } from './NewPersonContent';
import classes from './NewUserModal.module.css';
import { NewOrgContent } from './NewOrgContent';

/**
 * NewUserButton component renders a button that, when clicked, opens a modal to add a new user.
 * @component
 */
interface NewUserButtonProps {
  /*** Render a larger version of the trigger button */
  isLarge?: boolean;
}

export const NewUserButton: React.FC<NewUserButtonProps> = ({ isLarge }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <DsButton
        variant={isLarge ? 'primary' : 'secondary'}
        onClick={() => modalRef.current?.showModal()}
        className={isLarge ? classes.largeButton : undefined}
      >
        <PlusIcon aria-label={t('common.add')} />
        {isLarge ? t('new_user_modal.trigger_button_large') : t('new_user_modal.trigger_button')}
      </DsButton>
      <NewUserModal modalRef={modalRef} />
    </>
  );
};

interface NewUserModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
}

const NewUserModal: React.FC<NewUserModalProps> = ({ modalRef }) => {
  const displayLimitedPreviewLaunch = window.featureFlags?.displayLimitedPreviewLaunch;
  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      aria-labelledby='newUserModal'
    >
      <DsHeading
        data-size='xs'
        level={2}
        className={classes.modalHeading}
        id='newUserModal'
      >
        {t('new_user_modal.modal_title')}
      </DsHeading>
      <DsTabs
        defaultValue={displayLimitedPreviewLaunch ? 'org' : 'person'}
        data-size='sm'
      >
        <DsTabs.List>
          {<DsTabs.Tab value='person'>{t('new_user_modal.person')}</DsTabs.Tab>}
          <DsTabs.Tab value='org'>{t('new_user_modal.organization')}</DsTabs.Tab>
        </DsTabs.List>
        <DsTabs.Panel value='person'>
          <NewPersonContent />
        </DsTabs.Panel>
        <DsTabs.Panel value='org'>
          <NewOrgContent />
        </DsTabs.Panel>
      </DsTabs>
    </DsDialog>
  );
};

export default NewUserModal;
