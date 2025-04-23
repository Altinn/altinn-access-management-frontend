import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { DsHeading, DsParagraph, DsLink } from '@altinn/altinn-components';

import classes from '../ErrorPage.module.css';

import SeagullIcon from '@/assets/Seagull.svg?react';

export const PageNotFound = () => {
  const { t } = useTranslation();

  return (
    <div className={classes.errorContent}>
      <DsHeading
        data-size='lg'
        level={1}
        className={classes.header}
      >
        {t('error_page.not_found_site_header')}
      </DsHeading>
      <div className={classes.flexContainer}>
        <div className={classes.leftContainer}>
          <DsParagraph
            data-size='lg'
            variant='long'
            className={classes.contentText}
          >
            {t('error_page.not_found_site_upper_text')}
          </DsParagraph>

          <DsParagraph
            data-size='lg'
            variant='long'
            className={classes.contentText}
          >
            <DsLink href='https://www.altinn.no/ui/MessageBox'>
              {t('error_page.go_to_inbox')}
            </DsLink>
          </DsParagraph>

          <DsParagraph
            data-size='lg'
            variant='long'
            className={classes.contentText}
          >
            <DsLink href='https://www.altinn.no/ui/Profile'>{t('error_page.go_to_profile')}</DsLink>
          </DsParagraph>

          <DsParagraph
            data-size='lg'
            variant='long'
            className={classes.contentText}
          >
            <DsLink href='https://www.altinn.no/skjemaoversikt/'>
              {t('error_page.find_and_submit_scheme')}
            </DsLink>
          </DsParagraph>

          <DsParagraph
            data-size='lg'
            variant='long'
            className={classes.contentText}
          >
            {t('error_page.not_found_site_lower_text')}
          </DsParagraph>
        </div>
        <div className={classes.rightContainer}>
          <SeagullIcon />
        </div>
      </div>
    </div>
  );
};
