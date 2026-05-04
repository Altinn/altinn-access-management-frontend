import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { DsHeading, DsParagraph, DsLink } from '@altinn/altinn-components';

import classes from '../ErrorPage.module.css';
import { getAltinnStartPageUrl } from '@/resources/utils/pathUtils';

export const ReporteeChangeError = () => {
  const { t } = useTranslation();

  return (
    <div className={classes.errorContent}>
      <DsHeading
        className={classes.header}
        level={1}
        data-size='sm'
      >
        {t('error_page.reportee_change_error.header')}
      </DsHeading>
      <DsParagraph>{t('error_page.reportee_change_error.description')}</DsParagraph>
      <DsParagraph>
        {t('error_page.reportee_change_error.if_persistent_contact_service')}
      </DsParagraph>
      <DsParagraph>
        <DsLink href={getAltinnStartPageUrl()}>
          {t('error_page.reportee_change_error.go_to_altinn')}
        </DsLink>
      </DsParagraph>
    </div>
  );
};
