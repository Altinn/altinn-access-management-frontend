/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ErrorPage = () => {
  console.log('hey');

  const { t } = useTranslation('basic');

  const error = useRouteError();
  return (
    <div id="error-page">
      <h1>{t('error.heading')}</h1>
      <p>{t('error.tryAgain')}</p>
      <p>
        <i>
          {t('error.errorMessage')}: {error.statusText || error.message}
        </i>
      </p>
    </div>
  );
};
