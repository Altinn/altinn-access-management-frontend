import { Button, ButtonVariant, ButtonColor, ButtonSize } from '@altinn/altinn-design-system';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as React from 'react';

import { useAppSelector } from '@/rtk/app/hooks';
import { Paths } from '@/routes/Router';

import { ReactComponent as ApiIcon } from '../../assets/ShakeHands.svg';
import { ConfirmationPage } from '../Reusables/ConfirmationPage';
import { PageContainer } from '../Reusables/PageContainer';

export const ApiDelegationConfirmationPage = () => {
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <PageContainer>
      <ConfirmationPage
        apiList={chosenApis}
        orgList={chosenOrgs}
        restartProcessPath={
          '/' + Paths.GivenApiDelegationsOverview + '/' + Paths.NewGivenOrgDelegation
        }
        pageHeaderText={t('api_delegation.give_access_to_new_api')}
        apiListContentHeader={String(t('api_delegation.confirmation_page_content_top_text'))}
        orgListContentHeader={String(t('api_delegation.confirmation_page_content_second_text'))}
        bottomText={String(t('api_delegation.confirmation_page_content_bottom_text'))}
        mainButton={
          <Button
            color={ButtonColor.Success}
            variant={ButtonVariant.Filled}
            size={ButtonSize.Small}
            onClick={() => navigate(Paths.ApiDelegationReceipt)}
            disabled={chosenApis.length < 1 || chosenOrgs.length < 1}
          >
            {t('api_delegation.confirm_delegation')}
          </Button>
        }
        complementaryButton={
          <Button
            color={ButtonColor.Primary}
            variant={ButtonVariant.Outline}
            size={ButtonSize.Small}
            onClick={() =>
              navigate(
                '/' +
                  Paths.GivenApiDelegationsOverview +
                  '/' +
                  Paths.NewGivenOrgDelegation +
                  '/' +
                  Paths.NewGivenApiDelegation,
              )
            }
          >
            {t('api_delegation.previous')}
          </Button>
        }
        headerIcon={<ApiIcon />}
      />
    </PageContainer>
  );
};
