import { useTranslation } from 'react-i18next';
import type { Key } from 'react';
import * as React from 'react';
import { Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ApiDelegationPath } from '@/routes/paths';
import ApiIcon from '@/assets/Api.svg?react';
import { setLoading as setOveviewToReload } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import {
  PageContainer,
  Page,
  PageHeader,
  PageContent,
  CompactDeletableListItem,
  RestartPrompter,
  BorderedList,
} from '@/components';
import { ListTextColor } from '@/components/CompactDeletableListItem/CompactDeletableListItem';
import type { ApiDelegation } from '@/rtk/features/apiDelegation/delegationRequest/delegationRequestSlice';
import { useMediaQuery } from '@/resources/hooks';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

import classes from './ReceiptPage.module.css';

export const ReceiptPage = () => {
  const failedApiDelegations = useAppSelector(
    (state) => state.delegationRequest.failedApiDelegations,
  );
  const successfulApiDelegations = useAppSelector(
    (state) => state.delegationRequest.succesfulApiDelegations,
  );
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isSm = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  useDocumentTitle(t('api_delegation.delegate_page_title'));

  const failedDelegationContent = () => {
    return (
      <>
        <Heading
          size='medium'
          level={2}
          spacing
        >
          {t('api_delegation.failed_delegations')}
        </Heading>
        <BorderedList className={classes.list}>
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
        </BorderedList>
      </>
    );
  };

  const successfulDelegationsContent = () => {
    return (
      <>
        <Heading
          size='medium'
          level={2}
          spacing
        >
          {t('api_delegation.succesful_delegations')}
        </Heading>
        <BorderedList className={classes.list}>
          {successfulApiDelegations?.map(
            (apiDelegation: ApiDelegation, index: Key | null | undefined) => (
              <CompactDeletableListItem
                key={index}
                middleText={apiDelegation.apiName}
                leftText={apiDelegation.orgName}
              ></CompactDeletableListItem>
            ),
          )}
        </BorderedList>
      </>
    );
  };

  const delegatedContent = () => {
    return (
      <>
        {showTopSection() && failedDelegationContent()}
        {showBottomSection() && successfulDelegationsContent()}
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

  const navigateToOverview = () => {
    dispatch(setOveviewToReload());
    navigate('/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.Overview);
  };

  return (
    <PageContainer>
      <Page color={successfulApiDelegations.length === 0 ? 'danger' : 'success'}>
        <PageHeader icon={<ApiIcon />}>{t('api_delegation.give_access_to_new_api')}</PageHeader>
        <PageContent>
          {showErrorAlert() ? (
            <RestartPrompter
              spacingBottom
              restartPath={
                '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseApi
              }
              title={t('common.an_error_has_occured')}
              ingress={t('api_delegation.delegations_not_registered')}
            />
          ) : (
            <div>
              {delegatedContent()}
              <Paragraph spacing>
                {successfulApiDelegations.length === 0
                  ? t('api_delegation.receipt_page_failed_text')
                  : t('api_delegation.receipt_page_bottom_text')}
              </Paragraph>
            </div>
          )}
          <Button
            color='first'
            variant='primary'
            onClick={navigateToOverview}
            fullWidth={isSm}
          >
            {t('api_delegation.receipt_page_main_button')}
          </Button>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
