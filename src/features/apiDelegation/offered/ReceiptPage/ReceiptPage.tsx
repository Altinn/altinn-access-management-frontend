import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import * as React from 'react';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { RouterPath } from '@/routes/Router';
import { ReactComponent as ApiIcon } from '@/assets/Api.svg';
import { resetDelegableOrgs } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { resetDelegableApis } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { SummaryPage, PageContainer, PageColor } from '@/components';

export const ReceiptPage = () => {
  const failedApiDelegations = useAppSelector(
    (state) => state.delegationRequest.failedApiDelegations,
  );
  const successfulApiDelegations = useAppSelector(
    (state) => state.delegationRequest.succesfulApiDelegations,
  );
  const { t } = useTranslation('common');
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
        restartProcessPath={'/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.ChooseOrg}
        pageHeaderText={String(t('api_delegation.give_access_to_new_api'))}
        topListText={String(t('api_delegation.failed_delegations'))}
        bottomListText={String(t('api_delegation.succesful_delegations'))}
        failedDelegationText={
          failedApiDelegations.length > 0
            ? String(t('api_delegation.receipt_page_bottom_text_failed'))
            : undefined
        }
        bottomText={
          successfulApiDelegations.length > 0
            ? String(t('api_delegation.receipt_page_bottom_text'))
            : undefined
        }
        headerIcon={<ApiIcon />}
        headerColor={PageColor.Success}
        showNavigationButtons={false}
      ></SummaryPage>
    </PageContainer>
  );
};
