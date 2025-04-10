import React, { useRef } from 'react';
import { Button } from '@altinn/altinn-components';
import { Heading, Dialog, Tabs } from '@digdir/designsystemet-react';
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
    <Dialog
      ref={modalRef}
      closedby='any'
      aria-labelledby='newUserModal'
    >
      <Heading
        data-size='xs'
        level={2}
        className={classes.modalHeading}
        id='newUserModal'
      >
        {t('new_user_modal.modal_title')}
      </Heading>
      <Tabs
        defaultValue='person'
        data-size='sm'
      >
        <Tabs.List>
          {displayLimitedPreviewLaunch && (
            <Tabs.Tab value='person'>{t('new_user_modal.person')}</Tabs.Tab>
          )}
          <Tabs.Tab value='org'>{t('new_user_modal.organization')}</Tabs.Tab>
        </Tabs.List>
        {displayLimitedPreviewLaunch && (
          <Tabs.Panel value='person'>
            <NewPersonContent />
          </Tabs.Panel>
        )}
        <Tabs.Panel value='org'>
          <NewOrgContent />
        </Tabs.Panel>
      </Tabs>
    </Dialog>
  );
};

export default NewUserModal;
