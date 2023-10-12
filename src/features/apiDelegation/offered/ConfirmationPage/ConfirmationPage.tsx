import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import type { Key } from 'react';
import { useEffect, useState } from 'react';
import { Buldings3Icon, CogIcon } from '@navikt/aksel-icons';
import {
  Alert,
  Button,
  Heading,
  Ingress,
  List,
  Paragraph,
  Spinner,
} from '@digdir/design-system-react';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ApiDelegationPath } from '@/routes/paths';
import ApiIcon from '@/assets/Api.svg?react';
import {
  CompactDeletableListItem,
  GroupElements,
  Page,
  PageContainer,
  PageContent,
  PageHeader,
} from '@/components';
import { SummaryPage } from '@/features/apiDelegation/components/SummaryPage';
import type {
  ApiDelegation,
  DelegationRequest,
} from '@/rtk/features/apiDelegation/delegationRequest/delegationRequestSlice';
import {
  postApiDelegation,
  setBatchPostSize,
} from '@/rtk/features/apiDelegation/delegationRequest/delegationRequestSlice';
import type { DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { softRemoveApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import type { DelegableOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { softRemoveOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { useMediaQuery } from '@/resources/hooks';

import classes from './ConfirmationPage.module.css';

export const ConfirmationPage = () => {
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const loading = useAppSelector((state) => state.delegationRequest.loading);
  const [isProcessingDelegations, setIsProcessingDelegations] = useState(false);
  const isSm = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!loading) {
      navigate('/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.Receipt);
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

  const delegableApiList = () => {
    return (
      <div className={classes.listContainer}>
        <List borderStyle='dashed'>
          {chosenApis?.map((api: DelegableApi | ApiDelegation, index: Key) => (
            <CompactDeletableListItem
              key={index}
              startIcon={<CogIcon />}
              removeCallback={chosenApis.length > 1 ? () => dispatch(softRemoveApi(api)) : null}
              leftText={api.apiName}
              middleText={api.orgName}
            ></CompactDeletableListItem>
          ))}
        </List>
      </div>
    );
  };

  const delegableOrgList = () => {
    return (
      <List borderStyle='dashed'>
        {chosenOrgs?.map((org: DelegableOrg, index: Key | null | undefined) => (
          <CompactDeletableListItem
            key={index}
            startIcon={<Buldings3Icon />}
            removeCallback={chosenOrgs.length > 1 ? () => dispatch(softRemoveOrg(org)) : null}
            leftText={org.orgName}
            middleText={t('api_delegation.org_nr') + ' ' + org.orgNr}
          ></CompactDeletableListItem>
        ))}
      </List>
    );
  };

  const showTopSection = () => {
    return chosenApis !== null && chosenApis !== undefined && chosenApis?.length > 0;
  };

  const showBottomSection = () => {
    return chosenOrgs !== null && chosenOrgs !== undefined && chosenOrgs?.length > 0;
  };

  const showErrorPanel = () => {
    return !showTopSection() && !showBottomSection();
  };

  const errorAlert = () => {
    return (
      <Alert severity='danger'>
        <Heading
          size='small'
          level={2}
        >
          {t('common.an_error_has_occured')}
        </Heading>
        <Ingress>{t('api_delegation.delegations_not_registered')}</Ingress>
        <div className={classes.restartButton}>
          <Button
            variant='outline'
            color='danger'
            onClick={() => {
              navigate(
                '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseOrg,
              );
            }}
          >
            {t('common.restart')}
          </Button>
        </div>
      </Alert>
    );
  };

  const delegationContent = () => {
    return (
      <div>
        <Heading
          size='medium'
          level={2}
        >
          {t('api_delegation.confirmation_page_content_top_text')}
        </Heading>
        {delegableApiList()}
        <Heading
          size='medium'
          level={2}
        >
          {t('api_delegation.confirmation_page_content_second_text')}
        </Heading>
        {delegableOrgList()}
        <Paragraph size='large'>
          {t('api_delegation.confirmation_page_content_bottom_text')}
        </Paragraph>
        <GroupElements>
          <Button
            variant={'outline'}
            fullWidth={isSm}
            onClick={() =>
              navigate(
                '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseApi,
              )
            }
          >
            {t('api_delegation.previous')}
          </Button>
          <Button
            onClick={handleConfirm}
            color={'success'}
            fullWidth={isSm}
          >
            {isProcessingDelegations && (
              <Spinner
                title={String(t('common.loading'))}
                size='small'
                variant='interaction'
              />
            )}
            {t('common.confirm')}
          </Button>
        </GroupElements>
      </div>
    );
  };

  return (
    <div>
      <PageContainer>
        <Page
          color={'dark'}
          size={isSm ? 'small' : 'medium'}
        >
          <PageHeader icon={<ApiIcon />}>{t('api_delegation.give_access_to_new_api')}</PageHeader>
          <PageContent>
            {showErrorPanel() ? <>{errorAlert()}</> : <>{delegationContent()}</>}
          </PageContent>
        </Page>
      </PageContainer>
    </div>
  );
};
