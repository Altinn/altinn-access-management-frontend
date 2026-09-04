import * as React from 'react';
import { useTranslation } from 'react-i18next';

import classes from './ErrorPage.module.css';
import { ErrorLayoutWrapper } from './ErrorLayoutWrapper';
import { ReporteeChangeError } from './contents/ReporteeChangeError';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

export const ReporteeChangeErrorPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('error_page.reportee_change_error.page_title'));

  return (
    <ErrorLayoutWrapper hideAccountSelector={false}>
      <div className={classes.errorPageWrapper}>
        <ReporteeChangeError />
      </div>
    </ErrorLayoutWrapper>
  );
};
