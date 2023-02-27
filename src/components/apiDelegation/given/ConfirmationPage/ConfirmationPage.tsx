import { Button, ButtonVariant, ButtonColor, ButtonSize } from '@altinn/altinn-design-system';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { RouterPath } from '@/routes/Router';
import { ReactComponent as ApiIcon } from '@/assets/ShakeHands.svg';
import { PageContainer } from '@/components/reusables/PageContainer';
import { SummaryPage } from '@/components/reusables/SummaryPage';
import type { DelegationRequest } from '@/rtk/features/delegationRequest/delegationRequestSlice';
import {
  postApiDelegation,
  setBatchPostSize,
} from '@/rtk/features/delegationRequest/delegationRequestSlice';

export const ConfirmationPage = () => {
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const loading = useAppSelector((state) => state.delegationRequest.loading);
  const [confirmed, setConfirmed] = useState(false);
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleConfirm = () => {
    setConfirmed(true);
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
        void (async () => await dispatch(postApiDelegation(request)))().then();
      }
    }
  };

  useEffect(() => {
    if (!loading) {
      navigate('/' + RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiReceipt);
    }
  }, [loading]);

  return (
    <PageContainer>
      <SummaryPage
        delegableApis={chosenApis}
        delegableOrgs={chosenOrgs}
        restartProcessPath={
          '/' + RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiChooseOrg
        }
        pageHeaderText={t('api_delegation.give_access_to_new_api')}
        topListText={String(t('api_delegation.confirmation_page_content_top_text'))}
        bottomListText={String(t('api_delegation.confirmation_page_content_second_text'))}
        bottomText={String(t('api_delegation.confirmation_page_content_bottom_text'))}
        mainButton={
          <Button
            color={ButtonColor.Success}
            variant={ButtonVariant.Filled}
            size={ButtonSize.Small}
            onClick={handleConfirm}
            disabled={confirmed || chosenApis.length < 1 || chosenOrgs.length < 1}
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
              navigate('/' + RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiChooseApi)
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
