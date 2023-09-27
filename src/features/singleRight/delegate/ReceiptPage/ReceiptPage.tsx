import {
  Alert,
  Button,
  Chip,
  ErrorMessage,
  Heading,
  Ingress,
  Paragraph,
} from '@digdir/design-system-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PersonIcon } from '@navikt/aksel-icons';
import { useEffect } from 'react';

import { SingleRightPath } from '@/routes/paths';
import { Page, PageContainer, PageContent, PageHeader } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { useAppDispatch } from '@/rtk/app/hooks';
import { resetServicesWithStatus } from '@/rtk/features/singleRights/singleRightsSlice';

import classes from './ReceiptPage.module.css';
import { ActionBarSection } from './ActionBarSection/ActionBarSection';

export const ReceiptPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(resetServicesWithStatus());
  }, []);

  return (
    <PageContainer>
      <Page
        color='light'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent>
          <div className={classes.actionBars}>
            <ActionBarSection />
          </div>
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
