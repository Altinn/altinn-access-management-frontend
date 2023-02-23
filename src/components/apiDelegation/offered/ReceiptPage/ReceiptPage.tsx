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
import { RouterPath } from '@/routes/Router';
import { ReactComponent as ApiIcon } from '@/assets/ShakeHands.svg';
import { setLoading as setOveviewToReload } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { resetDelegableOrgs } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { resetDelegableApis } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';

import { SummaryPage, PageContainer } from '../../../reusables';

export const ReceiptPage = () => {
  const failedApiDelegations = useAppSelector(
    (state) => state.delegationRequest.failedApiDelegations,
  );
  const successfulApiDelegations = useAppSelector(
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
    <PageContainer>
      <SummaryPage
        failedDelegations={failedApiDelegations}
        successfulDelegations={successfulApiDelegations}
        restartProcessPath={
          '/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.OfferedApiChooseOrg
        }
        pageHeaderText={String(t('api_delegation.give_access_to_new_api'))}
        topListText={String(t('api_delegation.failed_delegations'))}
        bottomListText={String(t('api_delegation.succesful_delegations'))}
        bottomText={
          successfulApiDelegations.length > 0
            ? String(t('api_delegation.receipt_page_bottom_text'))
            : String(t('api_delegation.receipt_page_bottom_text_failed'))
        }
        mainButton={
          <Button
            color={ButtonColor.Primary}
            size={ButtonSize.Small}
            variant={ButtonVariant.Filled}
            onClick={() => {
              dispatch(setOveviewToReload());
              navigate(
                '/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.OfferedApiOverview,
              );
            }}
          >
            {t('api_delegation.receipt_page_main_button')}
          </Button>
        }
        headerIcon={<ApiIcon />}
        headerColor={PageColor.Success}
      ></SummaryPage>
    </PageContainer>
  );
};
