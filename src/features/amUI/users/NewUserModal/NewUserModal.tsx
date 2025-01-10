import React, { useRef } from 'react';
import { Button } from '@altinn/altinn-components';
import { Modal, Tabs } from '@digdir/designsystemet-react';

import { NewPersonContent } from './NewPersonContent';

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
        Legg til bruker
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
    <Modal ref={modalRef}>
      <h2>Legg til ny person eller virksomhet</h2>
      <Tabs
        defaultValue='person'
        size='sm'
      >
        <Tabs.List>
          <Tabs.Tab value='person'>Person</Tabs.Tab>
          <Tabs.Tab value='org'>Organisasjon</Tabs.Tab>
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
