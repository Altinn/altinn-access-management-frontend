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
import { useAddAltinn2AccountMutation } from '@/rtk/features/selfIdentifiedUserApi';
import classes from './AddAltinn2AccountPage.module.css';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';

export const AddAltinn2AccountPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<number>(1);
  const modalRef = useRef<HTMLDialogElement>(null);

  useDocumentTitle(t('add_altinn2_account_page.page_title'));

  const { data: reportee, isError: isReporteeError } = useGetReporteeQuery();

  const [addAltinn2Account, { isLoading: isAddingAltinn2Account, error: addUserError }] =
    useAddAltinn2AccountMutation();

  const isActionButtonDisabled = !username || !password || isAddingAltinn2Account;
  const afUrl = `${getAfUrl()}inbox`;
  const profileUrl = `${getAfUrl()}profile`;

  const onAddAltinn2Account = async () => {
    const to = reportee?.partyUuid;
    if (!isActionButtonDisabled && to) {
      try {
        await addAltinn2Account({ to, username, password }).unwrap();
        setStep(3);
      } catch {
        // error displayed via addUserError RTK Query state
      }
    }
  };

  useEffect(() => {
    if (reportee && reportee.type === 'SelfIdentified') {
      modalRef.current?.showModal();
    }
  }, [reportee]);

  const step1Component = (
    <DsDialog.Block className={classes.addAltinn2Account}>
      <DsHeading level={1}>{t('add_altinn2_account_page.add_account_heading')}</DsHeading>
      <DsParagraph>
        {t('add_altinn2_account_page.logged_in_as', { name: reportee?.name })}
      </DsParagraph>
      <DsParagraph>{t('add_altinn2_account_page.add_account_info')}</DsParagraph>
      <div className={classes.buttonRow}>
        <DsButton
          variant='primary'
          onClick={() => setStep(2)}
        >
          {t('add_altinn2_account_page.continue')}
        </DsButton>
        <DsButton
          variant='secondary'
          asChild
        >
          <a href={afUrl}>{t('add_altinn2_account_page.cancel')}</a>
        </DsButton>
      </div>
    </DsDialog.Block>
  );

  const step2Component = (
    <>
      <DsDialog.Block className={classes.addAltinn2AccountHeader}>
        <PersonCircleIcon fontSize={'1.5rem'} />
        <DsHeading level={1}>{t('add_altinn2_account_page.add_account_heading')}</DsHeading>
      </DsDialog.Block>
      <DsDialog.Block className={classes.addAltinn2Account}>
        <DsParagraph>
          {t('add_altinn2_account_page.login_info', { name: reportee?.name })}
        </DsParagraph>
        <DsTextfield
          label={t('add_altinn2_account_page.username')}
          data-size='sm'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <DsTextfield
          label={t('add_altinn2_account_page.password')}
          data-size='sm'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {addUserError && (
          <DsAlert data-color='danger'>
            {(addUserError as { status: number }).status === 401
              ? t('add_altinn2_account_page.invalid_credentials')
              : t('add_altinn2_account_page.add_account_error')}
          </DsAlert>
        )}
        <div className={classes.buttonRow}>
          <DsButton
            variant='primary'
            aria-disabled={isActionButtonDisabled}
            loading={isAddingAltinn2Account}
            onClick={onAddAltinn2Account}
          >
            {t('add_altinn2_account_page.add_account_button')}
          </DsButton>
          <DsButton
            variant='secondary'
            asChild
          >
            <a href={afUrl}>{t('add_altinn2_account_page.cancel')}</a>
          </DsButton>
          <DsLink
            target='_blank'
            rel='noopener noreferrer'
            href='https://www.altinn.no/ui/Authentication/SelfIdentified'
          >
            {t('add_altinn2_account_page.forgot_password')}
          </DsLink>
        </div>
      </DsDialog.Block>
    </>
  );

  const step3Component = (
    <DsDialog.Block className={classes.addAltinn2Account}>
      <DsHeading>{t('add_altinn2_account_page.account_added_heading')}</DsHeading>
      <DsParagraph>{t('add_altinn2_account_page.account_added_info')}</DsParagraph>
      <div className={classes.buttonRow}>
        <DsButton
          variant='primary'
          asChild
        >
          <a href={afUrl}>{t('add_altinn2_account_page.go_to_inbox')}</a>
        </DsButton>
        <DsButton
          variant='secondary'
          asChild
        >
          <a href={profileUrl}>{t('add_altinn2_account_page.go_to_profile')}</a>
        </DsButton>
      </div>
    </DsDialog.Block>
  );

  return (
    <PageLayoutWrapper hideSidebar>
      {isReporteeError && (
        <DsAlert data-color='danger'>{t('add_altinn2_account_page.load_user_error')}</DsAlert>
      )}
      {reportee && reportee.type !== 'SelfIdentified' && (
        <DsAlert data-color='danger'>
          {t('add_altinn2_account_page.not_self_identified_error')}
        </DsAlert>
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
