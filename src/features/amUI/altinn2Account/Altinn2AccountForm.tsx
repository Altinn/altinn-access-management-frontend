import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsButton,
  DsDialog,
  DsHeading,
  DsParagraph,
  DsTextfield,
} from '@altinn/altinn-components';
import { PersonCircleIcon } from '@navikt/aksel-icons';
import { getAfUrl } from '@/resources/utils/pathUtils';
import classes from './AddAltinn2AccountPage.module.css';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

interface Altinn2AccountFormProps {
  onAddAltinn2Account: (username: string, password: string) => Promise<void>;
  isAddingAltinn2Account: boolean;
  addUserError: FetchBaseQueryError | SerializedError | undefined;
  onSendForgotPasswordEmail: (username: string) => void;
  isSendingForgotPasswordEmail: boolean;
  forgotPasswordError: string;
  reporteeName?: string;
}

export const Altinn2AccountForm = ({
  onAddAltinn2Account,

  isAddingAltinn2Account,
  addUserError,
  onSendForgotPasswordEmail,
  isSendingForgotPasswordEmail,
  forgotPasswordError,
  reporteeName,
}: Altinn2AccountFormProps) => {
  const { t } = useTranslation();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isShowPasswordStepVisible, setIsShowPasswordStepVisible] = useState<boolean>(false);
  const isValidateCrentialsButtonDisabled = !userName || !password || isAddingAltinn2Account;
  const isSendEmailButtonDisabled = !userName || isSendingForgotPasswordEmail;
  const afUrl = `${getAfUrl()}inbox`;

  const handleInputFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAltinn2Account();
    }
  };

  const addAltinn2Account = () => {
    if (!isValidateCrentialsButtonDisabled) {
      onAddAltinn2Account(userName, password);
    }
  };

  const sendForgotPasswordEmail = () => {
    if (!isSendEmailButtonDisabled) {
      onSendForgotPasswordEmail(userName);
    }
  };

  const getAddUserErrorMessage = () => {
    if ((addUserError as { status: number }).status === 401) {
      return t('add_altinn2_account_page.invalid_credentials');
    } else if ((addUserError as { status: number }).status === 429) {
      return t('add_altinn2_account_page.too_many_requests_error');
    }
    return t('add_altinn2_account_page.add_account_error');
  };

  if (isShowPasswordStepVisible)
    return (
      <DsDialog.Block className={classes.addAltinn2Account}>
        <DsHeading>{t('add_altinn2_account_page.forgot_password')}</DsHeading>
        <DsParagraph>{t('add_altinn2_account_page.forgot_password_info')}</DsParagraph>
        <DsTextfield
          label={t('add_altinn2_account_page.username')}
          data-size='sm'
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendForgotPasswordEmail();
            }
          }}
        />
        {forgotPasswordError && <DsAlert data-color='danger'>{forgotPasswordError}</DsAlert>}
        <div className={classes.buttonRow}>
          <DsButton
            variant='primary'
            aria-disabled={isSendEmailButtonDisabled}
            loading={isSendingForgotPasswordEmail}
            onClick={sendForgotPasswordEmail}
          >
            {t('add_altinn2_account_page.send_link')}
          </DsButton>
          <DsButton
            variant='secondary'
            onClick={() => {
              setIsShowPasswordStepVisible(false);
              setUserName('');
            }}
          >
            {t('common.cancel')}
          </DsButton>
        </div>
      </DsDialog.Block>
    );

  return (
    <>
      <DsDialog.Block className={classes.addAltinn2AccountHeader}>
        <PersonCircleIcon fontSize={'1.5rem'} />
        <DsHeading level={1}>{t('add_altinn2_account_page.add_account_heading')}</DsHeading>
      </DsDialog.Block>
      <DsDialog.Block className={classes.addAltinn2Account}>
        <DsParagraph>
          {t('add_altinn2_account_page.login_info', { name: reporteeName })}
        </DsParagraph>
        <DsTextfield
          label={t('add_altinn2_account_page.username')}
          data-size='sm'
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={handleInputFieldKeyDown}
        />
        <DsTextfield
          label={t('add_altinn2_account_page.password')}
          data-size='sm'
          type='password'
          autoComplete='off'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleInputFieldKeyDown}
        />
        {addUserError && <DsAlert data-color='danger'>{getAddUserErrorMessage()}</DsAlert>}
        <div className={classes.buttonRow}>
          <DsButton
            variant='primary'
            aria-disabled={isValidateCrentialsButtonDisabled}
            loading={isAddingAltinn2Account}
            onClick={addAltinn2Account}
          >
            {t('add_altinn2_account_page.add_account_button')}
          </DsButton>
          <DsButton
            variant='secondary'
            asChild
          >
            <a href={afUrl}>{t('common.cancel')}</a>
          </DsButton>
          <DsButton
            variant='tertiary'
            onClick={() => {
              setUserName('');
              setPassword('');
              setIsShowPasswordStepVisible(true);
            }}
          >
            {t('add_altinn2_account_page.forgot_password')}
          </DsButton>
        </div>
      </DsDialog.Block>
    </>
  );
};
