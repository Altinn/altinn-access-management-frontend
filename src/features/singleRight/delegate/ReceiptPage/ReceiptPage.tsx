import { Button, Paragraph } from '@digdir/design-system-react';
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
import { GroupElements } from '@/components/GroupElements/GroupElements';

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
          <Paragraph spacing>{t('single_rights.rights_are_valid_until_deletion')}</Paragraph>
          <GroupElements>
            <Button
              color={'success'}
              size='medium'
            >
              {t('common.finished')}
            </Button>
            <Button
              onClick={() => {
                navigate(
                  '/' + SingleRightPath.DelegateSingleRights + '/' + SingleRightPath.ChooseService,
                );
              }}
              color={'primary'}
              size='medium'
            >
              {t('single_rights.give_more_rights')}
            </Button>
          </GroupElements>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
