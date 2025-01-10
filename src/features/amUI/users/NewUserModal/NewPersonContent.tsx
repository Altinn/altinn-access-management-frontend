import { Button, TextField } from '@altinn/altinn-components';
import { useState } from 'react';
import { Alert } from '@digdir/designsystemet-react';

import { useValidateNewUserPersonMutation } from '@/rtk/features/userInfoApi';

import classes from './NewUserModal.module.css';

export const NewPersonContent = () => {
  const [ssn, setSsn] = useState('');
  const [lastName, setLastName] = useState('');

  const [validateNewPerson, { error }] = useValidateNewUserPersonMutation();

  const navigateIfValidPerson = () => {
    validateNewPerson({ ssn, lastName })
      .unwrap()
      .then((userUuid) => {
        window.location.href = `${window.location.href}/${userUuid}`;
      });
  };

  return (
    <>
      {error && (
        <Alert
          color='danger'
          className={classes.error}
        >
          Something failed oh no!
          {status in error && error.status}
        </Alert>
      )}
      <TextField
        className={classes.textField}
        label='Fødselsnummer'
        size='sm'
        onChange={(e) => setSsn((e.target as HTMLInputElement).value)}
      />
      <TextField
        className={classes.textField}
        label='Etternavn'
        size='sm'
        onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
      />
      <Button onClick={navigateIfValidPerson}>Valider</Button>
    </>
  );
};
