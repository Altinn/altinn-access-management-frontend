import { Button, Ingress, Paragraph } from '@digdir/design-system-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PersonIcon } from '@navikt/aksel-icons';

import { SingleRightPath } from '@/routes/paths';
import { Page, PageContainer, PageContent, PageHeader } from '@/components';
import { useMediaQuery } from '@/resources/hooks';

import classes from './ReceiptPage.module.css';

export const ReceiptPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');

  return (
    <PageContainer>
      <Page
        color='light'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent>
          <Ingress spacing>
            {t('single_rights.has_received_these_rights', { name: 'ANNEMA FIGMA' })}
          </Ingress>
          <Paragraph spacing>{t('single_rights.rights_are_valid_until_deletion')}</Paragraph>
          <div className={classes.successButtonContainer}>
            <Button
              onClick={() => {
                navigate(
                  '/' + SingleRightPath.DelegateSingleRights + '/' + SingleRightPath.ChooseService,
                );
              }}
              color={'success'}
            >
              {t('single_rights.to_delegation_page')}
            </Button>
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
