import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { rerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';

import classes from './InfoPage.module.css';

export const InfoPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('info_page.page_title'));

  rerouteIfNotConfetti();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <div className={classes.infoContainer}>
          <DsHeading
            data-size='sm'
            level={1}
          >
            {t('info_page.main_title')}
          </DsHeading>
          <DsParagraph>
            <Trans
              i18nKey='info_page.paragraph_1'
              components={{ br: <br /> }}
            />
          </DsParagraph>
          <DsHeading
            data-size='xs'
            level={2}
          >
            {t('info_page.title_2')}
          </DsHeading>
          <DsParagraph>{t('info_page.paragraph_2')}</DsParagraph>
          <DsHeading
            data-size='2xs'
            level={3}
          >
            {t('info_page.title_3')}
          </DsHeading>
          <DsParagraph>{t('info_page.paragraph_3')}</DsParagraph>
          <DsHeading
            data-size='xs'
            level={2}
          >
            {t('info_page.title_4')}
          </DsHeading>
          <DsParagraph>{t('info_page.paragraph_4')}</DsParagraph>
          <DsHeading
            data-size='2xs'
            level={3}
          >
            {t('info_page.title_5')}
          </DsHeading>
          <DsParagraph>
            <Trans
              i18nKey='info_page.paragraph_5'
              components={{ br: <br /> }}
            />
          </DsParagraph>
        </div>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
