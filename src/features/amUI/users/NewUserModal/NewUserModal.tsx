import React, { useRef } from 'react';
import { Button } from '@altinn/altinn-components';
import { Heading, Modal, Tabs } from '@digdir/designsystemet-react';
import { t } from 'i18next';

import { NewPersonContent } from './NewPersonContent';
import classes from './NewUserModal.module.css';

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
      <NewUserModal modalRef={modalRef}></NewUserModal>
    </>
  );
};

interface NewUserModalProps {
  modalRef: React.RefObject<HTMLDialogElement>;
}

const NewUserModal: React.FC<NewUserModalProps> = ({ modalRef }) => {
  return (
    <Modal
      ref={modalRef}
      backdropClose
      aria-labelledby='newUserModal'
    >
      <Heading
        size='xs'
        level={2}
        className={classes.modalHeading}
        id='newUserModal'
      >
        {t('new_user_modal.modal_title')}
      </Heading>
      <Tabs
        defaultValue='person'
        size='sm'
      >
        <Tabs.List>
          <Tabs.Tab value='person'>{t('new_user_modal.person')}</Tabs.Tab>
          <Tabs.Tab value='org'>{t('new_user_modal.organization')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value='person'>
          <NewPersonContent />
        </Tabs.Panel>
        <Tabs.Panel value='org'>Kommer senere...</Tabs.Panel>
      </Tabs>
    </Modal>
  );
};

export default NewUserModal;
