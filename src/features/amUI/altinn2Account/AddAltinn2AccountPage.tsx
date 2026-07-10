import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsButton,
  DsDialog,
  DsHeading,
  DsParagraph,
  DsSpinner,
} from '@altinn/altinn-components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { getAfUrl } from '@/resources/utils/pathUtils';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import {
  useAddAltinn2AccountFromTokenMutation,
  useAddAltinn2AccountMutation,
  useSendForgotPasswordEmailMutation,
} from '@/rtk/features/selfIdentifiedUserApi';
import classes from './AddAltinn2AccountPage.module.css';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { Altinn2AccountForm } from './Altinn2AccountForm';

export const AddAltinn2AccountPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [forgotPasswordError, setForgotPasswordError] = useState<string>('');
  const modalRef = useRef<HTMLDialogElement>(null);

  useDocumentTitle(t('add_altinn2_account_page.page_title'));

  const { data: reportee, isError: isReporteeError } = useGetReporteeQuery();

  const [addAltinn2Account, { isLoading: isAddingAltinn2Account, error: addUserError }] =
    useAddAltinn2AccountMutation();

  const [
    sendForgotPasswordEmail,
    { data: forgotPasswordEmail, isLoading: isSendingForgotPasswordEmail },
  ] = useSendForgotPasswordEmailMutation();

  const [
    addAltinn2AccountFromToken,
    { isLoading: isAddingAltinn2AccountFromToken, error: addUserFromTokenError },
  ] = useAddAltinn2AccountFromTokenMutation();

  const afUrl = `${getAfUrl()}inbox`;
  const profileUrl = `${getAfUrl()}profile`;

  const onAddAltinn2Account = async (userName: string, password: string) => {
    try {
      await addAltinn2Account({ userName, password }).unwrap();
      setStep(3);
    } catch {
      // error displayed via addUserError RTK Query state
    }
  };

  const onSendForgotPasswordEmail = (userName: string) => {
    const lang = i18n.language as 'no_nb' | 'no_nn' | 'en';
    sendForgotPasswordEmail({ userName, lang })
      .unwrap()
      .then((payload) => {
        if (payload.maskedEmail) {
          setStep(4);
        } else {
          setForgotPasswordError(t('add_altinn2_account_page.no_email_for_username'));
        }
      })
      .catch(() => {
        setForgotPasswordError(t('add_altinn2_account_page.forgot_password_error'));
      });
  };

  const onAddAccountFromToken = async (token: string) => {
    try {
      await addAltinn2AccountFromToken({ token }).unwrap();
      modalRef.current?.showModal();
      setStep(3);
    } catch {
      // error displayed via addUserFromTokenError RTK Query state
    }
  };

  useEffect(() => {
    const isEnabled = reportee?.type === 'SelfIdentified' && window.featureFlags?.addAltinn2Account;
    if (isEnabled && token) {
      onAddAccountFromToken(token);
    } else if (isEnabled && !token) {
      modalRef.current?.showModal();
    }
  }, [reportee, token]);

  const getAddUserFromTokenErrorMessage = () => {
    if ((addUserFromTokenError as { status: number }).status === 401) {
      return t('add_altinn2_account_page.add_account_from_token_invalid_token');
    } else if ((addUserFromTokenError as { status: number }).status === 403) {
      return t('add_altinn2_account_page.add_account_from_token_not_from_caller');
    }
    return t('add_altinn2_account_page.add_account_from_token_error');
  };

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
          <a href={afUrl}>{t('common.cancel')}</a>
        </DsButton>
      </div>
    </DsDialog.Block>
  );

  const step2Component = (
    <Altinn2AccountForm
      onAddAltinn2Account={onAddAltinn2Account}
      isAddingAltinn2Account={isAddingAltinn2Account}
      addUserError={addUserError}
      onSendForgotPasswordEmail={onSendForgotPasswordEmail}
      isSendingForgotPasswordEmail={isSendingForgotPasswordEmail}
      forgotPasswordError={forgotPasswordError}
      reporteeName={reportee?.name}
    />
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

  const forgotPasswordReceiptComponent = (
    <DsDialog.Block className={classes.addAltinn2Account}>
      <DsHeading>{t('add_altinn2_account_page.forgot_password')}</DsHeading>
      <DsParagraph>
        {t('add_altinn2_account_page.forgot_password_sent', {
          email: forgotPasswordEmail?.maskedEmail,
        })}
      </DsParagraph>
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
      {window.featureFlags && !window.featureFlags.addAltinn2Account && (
        <DsAlert data-color='danger'>{t('add_altinn2_account_page.feature_toggled_off')}</DsAlert>
      )}
      {isAddingAltinn2AccountFromToken && (
        <DsSpinner
          data-size='lg'
          aria-label={t('common.loading')}
        />
      )}
      {addUserFromTokenError && (
        <DsAlert data-color='danger'>{getAddUserFromTokenErrorMessage()}</DsAlert>
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
        {step === 4 && forgotPasswordReceiptComponent}
      </DsDialog>
    </PageLayoutWrapper>
  );
};
