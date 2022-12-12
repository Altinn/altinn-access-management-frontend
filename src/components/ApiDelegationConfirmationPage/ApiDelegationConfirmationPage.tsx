import {
  Page,
  PageContent,
  PageHeader,
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  List,
  BorderStyle,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softRemove as softRemoveApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softRemove as softRemoveOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { ReactComponent as OfficeIcon } from '@/assets/Office1.svg';
import { ReactComponent as SettingsIcon } from '@/assets/Settings.svg';
import { ConfirmationPageProps } from '@/components/Common/ConfirmationPage';

import { ReactComponent as ApiIcon } from '../../assets/ShakeHands.svg';
import { CompactDeletableListItem } from '../Common/CompactDeletableListItem';

import classes from './ApiDelegationConfirmationPage.module.css';

export const ApiDelegationConfirmationPage = () => {
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const dispatch = useAppDispatch();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <div>
      <div className={classes.page}>
        <ConfirmationPageProps
          firstListItems={chosenApis}
          secondListItems={chosenOrgs}
          headerText={t('api_delegation.give_access_to_new_api')}
        />
        <Page>
          <PageHeader icon={<ApiIcon />}>{t('api_delegation.give_access_to_new_api')}</PageHeader>
          <PageContent>
            <div className={classes.pageContent}>
              <h2>{t('api_delegation.confirmation_page_content_top_text')}</h2>
              <List borderStyle={BorderStyle.Dashed}>{apiListItems}</List>
              <h2 className={classes.secondText}>
                {t('api_delegation.confirmation_page_content_second_text')}
              </h2>
              <List borderStyle={BorderStyle.Dashed}>{orgListItems}</List>
              <h3 className={classes.bottomText}>
                {t('api_delegation.confirmation_page_content_bottom_text')}
              </h3>
              <div className={classes.navButtonContainer}>
                <div className={classes.previousButton}>
                  <Button
                    color={ButtonColor.Primary}
                    variant={ButtonVariant.Outline}
                    size={ButtonSize.Small}
                    onClick={() => navigate(-1)}
                  >
                    {t('api_delegation.previous')}
                  </Button>
                </div>
                <div className={classes.confirmButton}>
                  <Button
                    color={ButtonColor.Success}
                    variant={ButtonVariant.Filled}
                    size={ButtonSize.Small}
                    onClick={() => navigate('/api-delegations/receipt')}
                  >
                    {t('api_delegation.confirm_delegation')}
                  </Button>
                </div>
              </div>
            </div>
          </PageContent>
        </Page>
      </div>
    </div>
  );
};
