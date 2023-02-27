import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  PageColor,
} from '@altinn/altinn-design-system';
import { useEffect } from 'react';
import * as React from 'react';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { resetDelegableOrgs } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { resetDelegableApis } from '@/rtk/features/delegableApi/delegableApiSlice';
import { RouterPath } from '@/routes/Router';
import { ReactComponent as ApiIcon } from '@/assets/ShakeHands.svg';

import { SummaryPage, PageContainer } from '../../../reusables';

export const ReceiptPage = () => {
  const failedApiDelegations = useAppSelector(
    (state) => state.delegationRequest.failedApiDelegations,
  );
  const succesfulApiDelegations = useAppSelector(
    (state) => state.delegationRequest.succesfulApiDelegations,
  );
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetDelegableOrgs());
    dispatch(resetDelegableApis());
  });

  return (
    <div>
      <PageContainer>
        <SummaryPage
          failedDelegations={failedApiDelegations}
          successfulDelegations={succesfulApiDelegations}
          restartProcessPath={
            '/' + RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiChooseOrg
          }
          pageHeaderText={String(t('api_delegation.give_access_to_new_api'))}
          topListText={String(t('api_delegation.failed_delegations'))}
          bottomListText={String(t('api_delegation.succesful_delegations'))}
          bottomText={String(t('api_delegation.receipt_page_bottom_text'))}
          mainButton={
            <Button
              color={ButtonColor.Primary}
              size={ButtonSize.Small}
              variant={ButtonVariant.Filled}
              onClick={() =>
                navigate('/' + RouterPath.GivenApiDelegations + '/' + RouterPath.Overview)
              }
            >
              {t('api_delegation.receipt_page_main_button')}
            </Button>
          }
          headerIcon={<ApiIcon />}
          headerColor={PageColor.Success}
        ></SummaryPage>
      </PageContainer>
    </div>
  );
};
