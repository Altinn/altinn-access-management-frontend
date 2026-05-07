import { useTranslation } from 'react-i18next';
import * as React from 'react';
import {
  DsHeading,
  DsParagraph,
  DsLink,
  DsListItem,
  DsListUnordered,
} from '@altinn/altinn-components';

import classes from '../ErrorPage.module.css';
import { getAfUrl, getAltinnStartPageUrl, getAmStartPageUrl } from '@/resources/utils/pathUtils';

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
      <div className={classes.nextSteps}>
        <DsHeading
          id='where-to-header'
          className={classes.secondHeader}
          level={2}
          data-size='xs'
        >
          {t('error_page.reportee_change_error.where_to_now')}
        </DsHeading>
        <DsListUnordered
          className={classes.list}
          aria-labelledby='where-to-header'
        >
          <DsListItem>
            <DsParagraph>
              <DsLink href={getAltinnStartPageUrl()}>
                {t('error_page.reportee_change_error.go_to_altinn')}
              </DsLink>
            </DsParagraph>
          </DsListItem>

          <DsListItem>
            <DsParagraph>
              <DsLink href={getAfUrl()}>{t('error_page.reportee_change_error.go_to_inbox')}</DsLink>
            </DsParagraph>
          </DsListItem>

          <DsListItem>
            <DsParagraph>
              <DsLink href={getAmStartPageUrl()}>
                {t('error_page.reportee_change_error.go_to_am')}
              </DsLink>
            </DsParagraph>
          </DsListItem>
        </DsListUnordered>
      </div>
    </div>
  );
};
