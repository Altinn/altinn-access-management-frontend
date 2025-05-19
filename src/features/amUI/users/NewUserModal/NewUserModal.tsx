import React, { useRef } from 'react';
import { Button, DsDialog, DsHeading, DsTabs } from '@altinn/altinn-components';
import { t } from 'i18next';

import { NewPersonContent } from './NewPersonContent';
import classes from './NewUserModal.module.css';
import { NewOrgContent } from './NewOrgContent';

/**
 * NewUserButton component renders a button that, when clicked, opens a modal to add a new user.
 * @component
 */
export const NewUserButton: React.FC = () => {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button
        variant='outline'
        onClick={() => modalRef.current?.showModal()}
      >
        {t('new_user_modal.trigger_button')}
      </Button>
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
          {!displayLimitedPreviewLaunch && (
            <DsTabs.Tab value='person'>{t('new_user_modal.person')}</DsTabs.Tab>
          )}
          <DsTabs.Tab value='org'>{t('new_user_modal.organization')}</DsTabs.Tab>
        </DsTabs.List>
        {!displayLimitedPreviewLaunch && (
          <DsTabs.Panel value='person'>
            <NewPersonContent />
          </DsTabs.Panel>
        )}
        <DsTabs.Panel value='org'>
          <NewOrgContent />
        </DsTabs.Panel>
      </DsTabs>
    </DsDialog>
  );
};

export default NewUserModal;
