import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import type { Key } from 'react';
import { useEffect, useState } from 'react';
import { Buldings3Icon, CogIcon } from '@navikt/aksel-icons';
import { Button, Heading, Paragraph, Spinner } from '@digdir/designsystemet-react';

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
  RestartPrompter,
  BorderedList,
} from '@/components';
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
import type { Organization } from '@/rtk/features/lookup/lookupApi';
import { removeOrg } from '@/rtk/features/apiDelegation/apiDelegationSlice';
import { useMediaQuery } from '@/resources/hooks';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

import classes from './ConfirmationPage.module.css';

export const ConfirmationPage = () => {
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenApis);
  const chosenOrgs = useAppSelector((state) => state.apiDelegation.chosenOrgs);
  const loading = useAppSelector((state) => state.delegationRequest.loading);
  const [isProcessingDelegations, setIsProcessingDelegations] = useState(false);
  const isSm = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useDocumentTitle(t('api_delegation.delegate_page_title'));

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
          apiIdentifier: api.identifier,
          apiName: api.apiName,
          orgName: org.name,
          orgNr: org.orgNumber,
        };
        void dispatch(postApiDelegation(request));
      }
    }
  };

  const delegableApiList = () => {
    return (
      <div className={classes.listContainer}>
        <BorderedList>
          {chosenApis?.map((api: DelegableApi | ApiDelegation, index: Key) => (
            <CompactDeletableListItem
              key={index}
              startIcon={<CogIcon />}
              removeCallback={chosenApis.length > 1 ? () => dispatch(softRemoveApi(api)) : null}
              leftText={api.apiName}
              middleText={api.orgName}
            ></CompactDeletableListItem>
          ))}
        </BorderedList>
      </div>
    );
  };

  const delegableOrgList = () => {
    return (
      <div className={classes.listContainer}>
        <BorderedList>
          {chosenOrgs?.map((org: Organization, index: Key | null | undefined) => (
            <CompactDeletableListItem
              key={index}
              startIcon={<Buldings3Icon />}
              removeCallback={chosenOrgs.length > 1 ? () => dispatch(removeOrg(org)) : null}
              leftText={org.name}
              middleText={t('common.org_nr') + ' ' + org.orgNumber}
            ></CompactDeletableListItem>
          ))}
        </BorderedList>
      </div>
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

  const delegationContent = () => {
    return (
      <>
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
            {isProcessingDelegations && (
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
            {showErrorPanel() ? (
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
          </PageContent>
        </Page>
      </PageContainer>
    </div>
  );
};
