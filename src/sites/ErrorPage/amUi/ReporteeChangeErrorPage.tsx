import * as React from 'react';

import classes from './ErrorPage.module.css';
import { ErrorLayoutWrapper } from './ErrorLayoutWrapper';
import { ReporteeChangeError } from './contents/ReporteeChangeError';

export const ReporteeChangeErrorPage = () => {
  return (
    <ErrorLayoutWrapper>
      <div className={classes.errorPageWrapper}>
        <ReporteeChangeError />
      </div>
    </ErrorLayoutWrapper>
  );
};
