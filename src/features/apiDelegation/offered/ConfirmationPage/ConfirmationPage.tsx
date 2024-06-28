import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { Alert, Button, Heading, Paragraph, Spinner } from '@digdir/designsystemet-react';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ApiDelegationPath } from '@/routes/paths';
import ApiIcon from '@/assets/Api.svg?react';
import {
  GroupElements,
  Page,
  PageContainer,
  PageContent,
  PageHeader,
  RestartPrompter,
} from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { setLoading as setOveviewToReload } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import {
  BatchApiDelegationRequest,
  usePostApiDelegationMutation,
} from '@/rtk/features/apiDelegation/apiDelegationApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { ListTextColor } from '@/components/CompactDeletableListItem/CompactDeletableListItem';
import { DelegableApiList, DelegableOrgList, DelegationReceiptList } from './DelegableList';

export const ConfirmationPage = () => {
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenApis);
  const chosenOrgs = useAppSelector((state) => state.apiDelegation.chosenOrgs);
  const isSm = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation('common');
  useDocumentTitle(t('api_delegation.delegate_page_title'));

  const partyId = getCookie('AltinnPartyId');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [postApiDelegation, { data, isLoading, isError }] = usePostApiDelegationMutation();

  const handleConfirm = async () => {
    const request: BatchApiDelegationRequest = {
      partyId,
      apis: chosenApis,
      orgs: chosenOrgs,
    };
    postApiDelegation(request);
  };

  const navigateToOverview = () => {
    dispatch(setOveviewToReload());
    navigate('/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.Overview);
  };

  const delegationRecieptContent = () => {
    const successfulApiDelegations = data ? data.filter((d) => d.success) : [];
    const failedApiDelegations = data ? data.filter((d) => !d.success) : [];
    return (
      <>
        {failedApiDelegations.length > 0 && (
          <>
            <Heading
              size='medium'
              level={2}
              spacing
            >
              {t('api_delegation.failed_delegations')}
            </Heading>
            <DelegationReceiptList
              items={failedApiDelegations}
              contentColor={ListTextColor.error}
            />
          </>
        )}
        {successfulApiDelegations.length > 0 && (
          <>
            <Heading
              size='medium'
              level={2}
              spacing
            >
              {t('api_delegation.succesful_delegations')}
            </Heading>
            <DelegationReceiptList items={successfulApiDelegations} />
          </>
        )}
        <Paragraph spacing>
          {successfulApiDelegations.length === 0
            ? t('api_delegation.receipt_page_failed_text')
            : t('api_delegation.receipt_page_bottom_text')}
        </Paragraph>
        <Button
          color='first'
          variant='primary'
          onClick={navigateToOverview}
          fullWidth={isSm}
        >
          {t('api_delegation.receipt_page_main_button')}
        </Button>
      </>
    );
  };

  const shouldShowErrorPanel = () => {
    return (!chosenApis || chosenApis.length === 0) && (!chosenOrgs || chosenOrgs.length === 0);
  };

  const delegationContent = () => {
    return data && data.length > 0 ? (
      delegationRecieptContent()
    ) : (
      <>
        <Heading
          size='medium'
          level={2}
        >
          {t('api_delegation.confirmation_page_content_top_text')}
        </Heading>
        <DelegableApiList />
        <Heading
          size='medium'
          level={2}
        >
          {t('api_delegation.confirmation_page_content_second_text')}
        </Heading>
        <DelegableOrgList />
        <Paragraph size='large'>
          {t('api_delegation.confirmation_page_content_bottom_text')}
        </Paragraph>
        <GroupElements>
          <Button
            color='first'
            variant='secondary'
            fullWidth={isSm}
            onClick={() =>
              navigate(
                '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseOrg,
              )
            }
          >
            {t('common.previous')}
          </Button>
          <Button
            onClick={handleConfirm}
            color={'success'}
            fullWidth={isSm}
          >
            {isLoading && (
              <Spinner
                title={t('common.loading')}
                variant='interaction'
              />
            )}
            {t('common.confirm')}
          </Button>
        </GroupElements>
      </>
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
            {shouldShowErrorPanel() ? (
              <RestartPrompter
                spacingBottom
                restartPath={
                  '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseApi
                }
                title={t('common.an_error_has_occured')}
                ingress={t('api_delegation.delegations_not_registered')}
              />
            ) : (
              delegationContent()
            )}
            {isError && (
              <Alert
                title={t('common.general_error_title')}
                severity='danger'
              >
                <Heading size='xsmall'>{t('common.general_error_title')}</Heading>
                {`${t('common.general_error_paragraph')}`}
              </Alert>
            )}
          </PageContent>
        </Page>
      </PageContainer>
    </div>
  );
};
