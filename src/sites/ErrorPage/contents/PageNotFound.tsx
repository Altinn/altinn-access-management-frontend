import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { Paragraph, Heading } from '@digdir/designsystemet-react';

import SeagullIcon from '@/assets/Seagull.svg?react';

import classes from '../ErrorPage.module.css';

export const PageNotFound = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Heading
        size='xlarge'
        level={1}
        spacing
        className={classes.header}
      >
        {t('error_page.not_found_site_header')}
      </Heading>
      <div className={classes.flexContainer}>
        <div className={classes.leftContainer}>
          <Paragraph
            size='large'
            spacing
            className={classes.contentText}
          >
            {t('error_page.not_found_site_upper_text')}
          </Paragraph>

          <Paragraph
            size='large'
            spacing
            className={classes.contentText}
          >
            <a
              className={classes.link}
              href='https://www.altinn.no/ui/MessageBox'
            >
              {t('error_page.go_to_inbox')}
            </a>
          </Paragraph>

          <Paragraph
            size='large'
            spacing
            className={classes.contentText}
          >
            <a
              className={classes.link}
              href='https://www.altinn.no/ui/Profile'
            >
              {t('error_page.go_to_profile')}
            </a>
          </Paragraph>

          <Paragraph
            size='large'
            spacing
            className={classes.contentText}
          >
            <a
              className={classes.link}
              href='https://www.altinn.no/skjemaoversikt/'
            >
              {t('error_page.find_and_submit_scheme')}
            </a>
          </Paragraph>

          <Paragraph
            size='large'
            spacing
            className={classes.contentText}
          >
            {t('error_page.not_found_site_lower_text')}
          </Paragraph>
        </div>
        <div className={classes.rightContainer}>
          <SeagullIcon />
        </div>
      </div>
    </div>
  );
};
