import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsButton, DsHeading, DsLink, DsTextfield } from '@altinn/altinn-components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import classes from './AddAltinn2UserPage.module.css';
import { RequestPageLayout } from '../common/RequestPageLayout/RequestPageLayout';
import { useAddAltinn2UserMutation } from '@/rtk/features/altinn2userApi';
import { getAfUrl } from '@/resources/utils/pathUtils';

export const AddAltinn2UserPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useDocumentTitle(t('altinn2_user_page.page_title'));
  const {
    data: reportee,
    isLoading: isLoadingReportee,
    isError: isReporteeError,
  } = useGetReporteeQuery();

  const [addAltinn2User, { isLoading: isAddingAltinn2User, error: addUserError }] =
    useAddAltinn2UserMutation();

  const isActionButtonDisabled = !username || !password || isAddingAltinn2User;
  const onAddAltinn2User = async () => {
    if (!isActionButtonDisabled) {
      try {
        await addAltinn2User({ username, password });
      } catch (error) {
        console.error('Error adding Altinn2 user:', error);
      }
    }
  };

  const account: { name: string; type: 'person' | 'company' } = {
    name: reportee?.name ?? '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  };

  let heading: React.ReactNode = <DsHeading level={1}>Legg til innboks</DsHeading>;
  let body: React.ReactNode = (
    <div className={classes.addAltinn2UserPage}>
      <DsTextfield
        label='Brukernavn'
        data-size='sm'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <DsTextfield
        label='Passord'
        data-size='sm'
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <DsLink
        data-size='sm'
        href='https://www.altinn.no/ui/Authentication/SelfIdentified'
      >
        Glemt passord
      </DsLink>
      {addUserError && (
        <DsAlert
          data-color='danger'
          className={classes.errorAlert}
        >
          {/** Håndter feilmeldinger; rate-limit, feil brukernavn/passord, feil ved opprettelse av bruker */}
          Det skjedde en feil ved å legge til gammel innboks. Prøv igjen senere.
        </DsAlert>
      )}
      <div className={classes.buttonRow}>
        <DsButton
          variant='primary'
          data-size='sm'
          aria-disabled={isActionButtonDisabled}
          loading={isAddingAltinn2User}
          onClick={onAddAltinn2User}
        >
          Legg til innboks
        </DsButton>
        <DsButton
          variant='secondary'
          data-size='sm'
          asChild
        >
          <a href={`${getAfUrl()}inbox`}>Avbryt</a>
        </DsButton>
      </div>
    </div>
  );
  let error: React.ReactNode = null;
  if (isReporteeError) {
    error = <DsAlert data-color='danger'>Kunne ikke laste bruker</DsAlert>;
  }
  if (reportee && reportee.type !== 'Person') {
    error = <DsAlert data-color='danger'>Kun personer kan legge til innboks.</DsAlert>;
  }

  return (
    <RequestPageLayout
      account={account}
      isLoading={isLoadingReportee}
      error={error}
      heading={heading}
      body={body}
    />
  );
};
