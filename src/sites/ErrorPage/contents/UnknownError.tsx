import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { Paragraph, Heading } from '@digdir/designsystemet-react';

import SeagullIcon from '@/assets/Seagull.svg?react';

import classes from '../ErrorPage.module.css';

export const UnknownError = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <Heading
        size='xlarge'
        spacing
        className={classes.header}
      >
        {t('error_page.unknown_error_header')}
      </Heading>
      <div className={classes.flexContainer}>
        <div className={classes.leftContainer}>
          <Paragraph
            size='large'
            spacing
            className={classes.contentText}
          >
            {t('error_page.unknown_error_description')}
          </Paragraph>

          <Paragraph
            size='large'
            spacing
            className={classes.contentText}
          >
            {t('error_page.if_persistent_contact_service')}
          </Paragraph>

          <Paragraph
            size='large'
            spacing
            className={classes.contentText}
          >
            <a
              className={classes.link}
              href='https://www.altinn.no/help'
            >
              {t('error_page.go_to_help')}
            </a>
          </Paragraph>
        </div>
        <div className={classes.rightContainer}>
          <SeagullIcon />
        </div>
      </div>
    </div>
  );
};
