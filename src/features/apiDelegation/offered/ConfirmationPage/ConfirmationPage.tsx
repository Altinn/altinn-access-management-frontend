import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { DsHeading, DsParagraph, DsButton, DsSpinner, DsAlert } from '@altinn/altinn-components';

import classes from './ConfirmationPage.module.css';
import { DelegableApiList, DelegableOrgList, DelegationReceiptList } from './DelegationLists';

import { useAppSelector } from '@/rtk/app/hooks';
import { ApiDelegationPath } from '@/routes/paths';
import ApiIcon from '@/assets/Api.svg?react';
import { Page, PageContainer, PageContent, PageHeader, RestartPrompter } from '@/components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import type { BatchApiDelegationRequest } from '@/rtk/features/apiDelegation/apiDelegationApi';
import { usePostApiDelegationMutation } from '@/rtk/features/apiDelegation/apiDelegationApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { ListTextColor } from '@/components/CompactDeletableListItem/CompactDeletableListItem';
import { overviewOrgApi } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgApi';

export const ConfirmationPage = () => {
  const dispatch = useDispatch();
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenApis);
  const chosenOrgs = useAppSelector((state) => state.apiDelegation.chosenOrgs);

  const { t } = useTranslation();

  useDocumentTitle(t('api_delegation.delegate_page_title'));

  const partyId = getCookie('AltinnPartyId');
  const navigate = useNavigate();

  const [postApiDelegation, { data, isLoading, isError }] = usePostApiDelegationMutation();

  const successfulApiDelegations = React.useMemo(
    () => data?.filter((d) => d.success) || [],
    [data],
  );
  const failedApiDelegations = React.useMemo(() => data?.filter((d) => !d.success) || [], [data]);

  React.useEffect(() => {
    if (successfulApiDelegations && successfulApiDelegations.length > 0) {
      dispatch(overviewOrgApi.util.invalidateTags(['overviewOrg']));
    }
  }, [successfulApiDelegations]);

  const handleConfirm = async () => {
    const request: BatchApiDelegationRequest = {
      partyId,
      apis: chosenApis,
      orgs: chosenOrgs,
    };
    postApiDelegation(request);
  };

  const navigateToOverview = () => {
    navigate('/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.Overview);
  };

  const delegationRecieptContent = () => {
    return (
      <>
        {failedApiDelegations.length > 0 && (
          <>
            <DsHeading
              data-size='md'
              level={2}
              className={classes.alertHeading}
            >
              {t('api_delegation.failed_delegations')}
            </DsHeading>
            <DelegationReceiptList
              items={failedApiDelegations}
              contentColor={ListTextColor.error}
            />
          </>
        )}
        {successfulApiDelegations.length > 0 && (
          <>
            <DsHeading
              data-size='md'
              level={2}
              className={classes.alertHeading}
            >
              {t('api_delegation.succesful_delegations')}
            </DsHeading>
            <DelegationReceiptList items={successfulApiDelegations} />
          </>
        )}
        <DsParagraph
          variant='long'
          className={classes.list}
        >
          {successfulApiDelegations.length === 0
            ? t('api_delegation.receipt_page_failed_text')
            : t('api_delegation.receipt_page_bottom_text')}
        </DsParagraph>
        <div className={classes.navigationSection}>
          <DsButton
            data-color='accent'
            variant='primary'
            onClick={navigateToOverview}
          >
            {t('api_delegation.receipt_page_main_button')}
          </DsButton>
        </div>
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
        <DsHeading
          data-size='sm'
          level={2}
        >
          {t('api_delegation.confirmation_page_content_top_text')}
        </DsHeading>
        <DelegableApiList />
        <DsHeading
          data-size='sm'
          level={2}
        >
          {t('api_delegation.confirmation_page_content_second_text')}
        </DsHeading>
        <DelegableOrgList />
        <DsParagraph data-size='lg'>
          {t('api_delegation.confirmation_page_content_bottom_text')}
        </DsParagraph>
        <div className={classes.navigationSection}>
          <DsButton
            data-color='accent'
            variant='secondary'
            onClick={() =>
              navigate(
                '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseOrg,
              )
            }
          >
            {t('common.previous')}
          </DsButton>
          <DsButton
            onClick={handleConfirm}
            data-color='accent'
          >
            {isLoading && <DsSpinner aria-label={t('common.loading')} />}
            {t('common.confirm')}
          </DsButton>
        </div>
      </>
    );
  };

  return (
    <div>
      <PageContainer>
        <Page
          color={
            failedApiDelegations.length > 0
              ? 'danger'
              : successfulApiDelegations.length > 0
                ? 'success'
                : 'dark'
          }
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
              <DsAlert
                title={t('common.general_error_title')}
                data-color='danger'
              >
                <DsHeading
                  level={2}
                  data-size='xs'
                  className={classes.alertHeading}
                >
                  {t('common.general_error_title')}
                </DsHeading>
                {`${t('common.general_error_paragraph')}`}
              </DsAlert>
            )}
          </PageContent>
        </Page>
      </PageContainer>
    </div>
  );
};
