import { useTranslation } from 'react-i18next';
import type { Key } from 'react';
import { useEffect } from 'react';
import * as React from 'react';
import { Alert, Button, Heading, Ingress, List } from '@digdir/design-system-react';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ApiDelegationPath } from '@/routes/paths';
import ApiIcon from '@/assets/Api.svg?react';
import { resetDelegableOrgs } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { resetDelegableApis } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import {
  SummaryPage,
  PageContainer,
  Page,
  PageHeader,
  PageContent,
  CompactDeletableListItem,
} from '@/components';
import { ListTextColor } from '@/components/CompactDeletableListItem/CompactDeletableListItem';
import type { ApiDelegation } from '@/rtk/features/apiDelegation/delegationRequest/delegationRequestSlice';

import { ErrorAlert } from '../../components/ErrorAlert/ErrorAlert';

import classes from './ReceiptPage.module.css';

export const ReceiptPage = () => {
  const failedApiDelegations = useAppSelector(
    (state) => state.delegationRequest.failedApiDelegations,
  );
  const successfulApiDelegations = useAppSelector(
    (state) => state.delegationRequest.succesfulApiDelegations,
  );
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();

  const failedDelegationContent = () => {
    return (
      <div>
        <Heading
          size='medium'
          level={2}
        >
          {t('api_delegation.failed_delegations')}
        </Heading>
        <div className={classes.listContainer}>
          <List borderStyle='dashed'>
            {failedApiDelegations?.map(
              (apiDelegation: ApiDelegation, index: Key | null | undefined) => (
                <CompactDeletableListItem
                  key={index}
                  contentColor={ListTextColor.error}
                  middleText={apiDelegation.apiName}
                  leftText={apiDelegation.orgName}
                ></CompactDeletableListItem>
              ),
            )}
          </List>
        </div>
      </div>
    );
  };

  const successfulDelegationsContent = () => {
    return (
      <div>
        <Heading
          size='medium'
          level={2}
        >
          {t('api_delegation.succesful_delegations')}
        </Heading>
        <List borderStyle='dashed'>
          {successfulApiDelegations?.map(
            (apiDelegation: ApiDelegation, index: Key | null | undefined) => (
              <CompactDeletableListItem
                key={index}
                middleText={apiDelegation.apiName}
                leftText={apiDelegation.orgName}
              ></CompactDeletableListItem>
            ),
          )}
        </List>
      </div>
    );
  };

  const delegatedContent = () => {
    return (
      <>
        {showTopSection() && failedDelegationContent}
        {showBottomSection() && successfulDelegationsContent}
      </>
    );
  };

  const showTopSection = () => {
    return (
      failedApiDelegations !== null &&
      failedApiDelegations !== undefined &&
      failedApiDelegations?.length > 0
    );
  };

  const showBottomSection = () => {
    return (
      successfulApiDelegations !== null &&
      successfulApiDelegations !== undefined &&
      successfulApiDelegations?.length > 0
    );
  };

  const showErrorAlert = () => {
    return !showTopSection() && !showBottomSection();
  };

  return (
    <PageContainer>
      <Page color={successfulApiDelegations.length === 0 ? 'danger' : 'success'}>
        <PageHeader>{t('api_delegation.give_access_to_new_api')}</PageHeader>
        <PageContent>{showErrorAlert() ? <ErrorAlert /> : delegatedContent()}</PageContent>
      </Page>
      <SummaryPage
        failedDelegations={failedApiDelegations}
        successfulDelegations={successfulApiDelegations}
        restartProcessPath={
          '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseOrg
        }
        pageHeaderText={String(t('api_delegation.give_access_to_new_api'))}
        topListText={String(t('api_delegation.failed_delegations'))}
        bottomListText={String(t('api_delegation.succesful_delegations'))}
        failedDelegationText={
          failedApiDelegations.length > 0
            ? String(t('api_delegation.receipt_page_failed_text'))
            : undefined
        }
        bottomText={
          successfulApiDelegations.length > 0
            ? String(t('api_delegation.receipt_page_bottom_text'))
            : undefined
        }
        headerIcon={<ApiIcon />}
        headerColor='success'
        showNavigationButtons={false}
      ></SummaryPage>
    </PageContainer>
  );
};
