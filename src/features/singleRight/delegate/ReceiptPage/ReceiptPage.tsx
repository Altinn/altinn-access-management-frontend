import { Button, Ingress, Paragraph } from '@digdir/design-system-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { SingleRightPath } from '@/routes/paths';
import { Page, PageContainer, PageContent } from '@/components';

import classes from './ReceiptPage.module.css';

export const ReceiptPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Page>
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
