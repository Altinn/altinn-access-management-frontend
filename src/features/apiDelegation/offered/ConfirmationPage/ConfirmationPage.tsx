import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { RouterPath } from '@/routes/Router';
import { ReactComponent as ApiIcon } from '@/assets/Api.svg';
import { PageContainer } from '@/components';
import { SummaryPage } from '@/components/SummaryPage';
import type { DelegationRequest } from '@/rtk/features/apiDelegation/delegationRequest/delegationRequestSlice';
import {
  postApiDelegation,
  setBatchPostSize,
} from '@/rtk/features/apiDelegation/delegationRequest/delegationRequestSlice';

export const ConfirmationPage = () => {
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const loading = useAppSelector((state) => state.delegationRequest.loading);
  const [isProcessingDelegations, setIsProcessingDelegations] = useState(false);
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!loading) {
      navigate('/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.Receipt);
    }
  }, [loading]);

  const handleConfirm = () => {
    setIsProcessingDelegations(true);
    const batchSize = chosenOrgs.length * chosenApis.length;
    dispatch(setBatchPostSize(batchSize));
    for (const org of chosenOrgs) {
      for (const api of chosenApis) {
        const request: DelegationRequest = {
          apiIdentifier: api.id,
          apiName: api.apiName,
          orgName: org.orgName,
          orgNr: org.orgNr,
        };
        void dispatch(postApiDelegation(request));
      }
    }
  };

  return (
    <PageContainer>
      <SummaryPage
        delegableApis={chosenApis}
        delegableOrgs={chosenOrgs}
        restartProcessPath={'/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.ChooseOrg}
        pageHeaderText={t('api_delegation.give_access_to_new_api')}
        topListText={String(t('api_delegation.confirmation_page_content_top_text'))}
        bottomListText={String(t('api_delegation.confirmation_page_content_second_text'))}
        bottomText={String(t('api_delegation.confirmation_page_content_bottom_text'))}
        confirmationButtonDisabled={
          isProcessingDelegations || chosenApis.length < 1 || chosenOrgs.length < 1
        }
        confirmationButtonLoading={isProcessingDelegations}
        confirmationButtonClick={handleConfirm}
        headerIcon={<ApiIcon />}
      />
    </PageContainer>
  );
};
