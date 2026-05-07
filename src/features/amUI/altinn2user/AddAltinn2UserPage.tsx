import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsButton,
  DsDialog,
  DsHeading,
  DsLink,
  DsParagraph,
  DsTextfield,
} from '@altinn/altinn-components';
import { PersonCircleIcon } from '@navikt/aksel-icons';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { getAfUrl } from '@/resources/utils/pathUtils';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useAddAltinn2UserMutation } from '@/rtk/features/selfIdentifiedUserApi';
import classes from './AddAltinn2UserPage.module.css';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';

export const AddAltinn2UserPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<number>(1);
  const modalRef = useRef<HTMLDialogElement>(null);

  useDocumentTitle(t('altinn2_user_page.page_title'));

  const { data: reportee, isError: isReporteeError } = useGetReporteeQuery();

  const [addAltinn2User, { isLoading: isAddingAltinn2User, error: addUserError }] =
    useAddAltinn2UserMutation();

  const isActionButtonDisabled = !username || !password || isAddingAltinn2User;
  const afUrl = `${getAfUrl()}inbox`;
  const profileUrl = `${getAfUrl()}profile`;

  const onAddAltinn2User = async () => {
    const to = reportee?.partyUuid;
    if (!isActionButtonDisabled && to) {
      addAltinn2User({ to, username, password })
        .unwrap()
        .then(() => {
          setStep(3);
        }); // error is caught and displayed as addUserError
    }
  };

  useEffect(() => {
    if (reportee && reportee.type !== 'SelfIdentified') {
      // TODO: cleanup check
      modalRef.current?.showModal();
    }
  }, [reportee]);

  const step1Component = (
    <DsDialog.Block className={classes.addAltinn2UserPage}>
      <DsHeading level={1}>Legg til konto</DsHeading>
      <DsParagraph>Du har logget inn som {reportee?.name}.</DsParagraph>
      <DsParagraph>
        Har du tidligere logget inn med brukernavn og passord kan du legge til den gamle kontoen din
        her. Da vil du få tilgang til meldingene som er sendt til denne kontoen når du logger inn
        med e-post.
      </DsParagraph>
      <div className={classes.buttonRow}>
        <DsButton
          variant='primary'
          onClick={() => setStep(2)}
        >
          Gå videre
        </DsButton>
        <DsButton
          variant='secondary'
          asChild
        >
          <a href={afUrl}>Avbryt</a>
        </DsButton>
      </div>
    </DsDialog.Block>
  );

  const step2Component = (
    <>
      <DsDialog.Block className={classes.addSelfidentifiedUserHeader}>
        <PersonCircleIcon fontSize={'1.5rem'} />
        <DsHeading level={1}>Legg til konto</DsHeading>
      </DsDialog.Block>
      <DsDialog.Block className={classes.addAltinn2UserPage}>
        <DsParagraph>
          Logg inn med brukernavn og passord for å koble kontoen sammen med {reportee?.name}.
        </DsParagraph>
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
        {addUserError && (
          <DsAlert data-color='danger'>
            {(addUserError as { status: number }).status === 401
              ? 'Ugyldig kombinasjon av brukernavn og passord.'
              : 'Det skjedde en feil ved å legge til konto.'}
          </DsAlert>
        )}
        <div className={classes.buttonRow}>
          <DsButton
            variant='primary'
            aria-disabled={isActionButtonDisabled}
            loading={isAddingAltinn2User}
            onClick={onAddAltinn2User}
          >
            Legg til
          </DsButton>
          <DsButton
            variant='secondary'
            asChild
          >
            <a href={afUrl}>Avbryt</a>
          </DsButton>
          <DsLink
            target='_blank'
            rel='noopener noreferrer'
            href='https://www.altinn.no/ui/Authentication/SelfIdentified'
          >
            Glemt passord
          </DsLink>
        </div>
      </DsDialog.Block>
    </>
  );

  const step3Component = (
    <DsDialog.Block className={classes.addAltinn2UserPage}>
      <DsHeading>Kontoen er lagt til</DsHeading>
      <DsParagraph>
        Du vil nå se dine gamle meldinger i den nye innboksen. Du kan legge til flere kontoer under
        Din profil om du ønsker det.
      </DsParagraph>
      <div className={classes.buttonRow}>
        <DsButton
          variant='primary'
          asChild
        >
          <a href={afUrl}>Gå til innboks</a>
        </DsButton>
        <DsButton
          variant='secondary'
          asChild
        >
          <a href={profileUrl}>Gå til profil</a>
        </DsButton>
      </div>
    </DsDialog.Block>
  );

  return (
    <PageLayoutWrapper hideSidebar>
      {isReporteeError && <DsAlert data-color='danger'>Kunne ikke laste bruker.</DsAlert>}
      {reportee && reportee.type !== 'SelfIdentified' && (
        <DsAlert data-color='danger'>Kun selvidentifiserte brukere kan legge til konto.</DsAlert>
      )}
      <DsDialog
        ref={modalRef}
        closeButton={step === 2 ? undefined : false}
        closedby='none'
        onClose={() => window.location.assign(afUrl)}
      >
        {step === 1 && step1Component}
        {step === 2 && step2Component}
        {step === 3 && step3Component}
      </DsDialog>
    </PageLayoutWrapper>
  );
};
