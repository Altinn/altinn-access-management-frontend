import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { DsHeading, DsParagraph, DsLink, DsListItem } from '@altinn/altinn-components';

import classes from '../ErrorPage.module.css';
import { getAfUrl, getAltinnStartPageUrl } from '@/resources/utils/pathUtils';

export const PageNotFound = () => {
  const { t } = useTranslation();

  return (
    <div className={classes.errorContent}>
      <DsHeading
        level={1}
        data-size='sm'
        className={classes.header}
      >
        {t('error_page.not_found_site_header')}
      </DsHeading>

      <DsParagraph>{t('error_page.not_found_site_description')}</DsParagraph>

      <div className={classes.list}>
        <DsListItem>
          <DsParagraph>
            <DsLink href={getAfUrl()}>{t('error_page.see_messages')}</DsLink>
          </DsParagraph>
        </DsListItem>

        <DsListItem>
          <DsParagraph>
            <DsLink href={getAltinnStartPageUrl() + 'skjemaoversikt'}>
              {t('error_page.find_a_form')}
            </DsLink>
          </DsParagraph>
        </DsListItem>

        <DsListItem>
          <DsParagraph>
            <DsLink href={getAltinnStartPageUrl() + 'starte-og-drive'}>
              {t('error_page.start_or_run_business')}
            </DsLink>
          </DsParagraph>
        </DsListItem>
      </div>
    </div>
  );
};
