/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as React from 'react';
import { PersonIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Paragraph } from '@digdir/designsystemet-react';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { Page, PageHeader, PageContent, PageContainer } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import {
  type DelegationAccessCheckDto,
  fetchRights,
  removeServiceResource,
  ServiceStatus,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { GeneralPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetUserInfoQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { SearchSection } from '../../components/SearchSection';
import { ResourceCollectionBar } from '../../components/ResourceCollectionBar';
import { NavigationSection } from '../../components/NavigationSection/NavigationSection';

import classes from './ChooseServicePage.module.css';

export const ChooseServicePage = () => {
  const { t } = useTranslation();
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();

  const { data: userData } = useGetUserInfoQuery();
  const { data: reporteeData } = useGetReporteeQuery();

  const requestee = reporteeData?.name || userData?.name || '';

  const servicesWithStatus = useAppSelector((state) => state.singleRightsSlice.servicesWithStatus);
  const delegableChosenServices = servicesWithStatus.filter(
    (s) => s.status === ServiceStatus.Delegable || s.status === ServiceStatus.PartiallyDelegable,
  );

  const onAdd = (serviceResource: ServiceResource) => {
    const dto: DelegationAccessCheckDto = {
      serviceResource,
      resourceReference: serviceResource.authorizationReference,
    };
    dispatch(fetchRights(dto));
  };

  const onRemove = (identifier: string | undefined) => {
    void dispatch(removeServiceResource(identifier));
  };

  const onCancel = () => {
    const cleanHostname = window.location.hostname.replace('am.ui.', '');
    const partyId = getCookie('AltinnPartyId');
    const encodedUrl = `ui/AccessManagement/ServicesAvailableForActor?userID=&amp;partyID=${partyId}`;

    window.location.href =
      'https://' +
      cleanHostname +
      '/' +
      String(GeneralPath.Altinn2SingleRights) +
      '?userID=' +
      getCookie('AltinnUserId') +
      '&amp;' +
      'partyID=' +
      getCookie('AltinnPartyId') +
      encodeURIComponent(encodedUrl);
  };

  return (
    <PageContainer>
      <Page
        color='dark'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<PersonIcon />}>{t('single_rights.request_single_rights')}</PageHeader>
        <PageContent>
          <Paragraph
            variant='long'
            className={classes.servicePageTopText}
          >
            {t('single_rights.request_choose_service_page_top_text', { name: requestee })}
          </Paragraph>
          <ResourceCollectionBar
            resources={
              delegableChosenServices
                .map((servicewithStatus) => servicewithStatus.service)
                .filter(Boolean) as ServiceResource[]
            }
            onRemove={onRemove}
            compact={isSm}
          />
          <SearchSection
            onAdd={onAdd}
            onUndo={onRemove}
          />
          <NavigationSection
            className={classes.navigationContainer}
            nextButtonProps={{
              onNext: () => {},
              disabled: false,
            }}
            cancelButtonProps={{
              onCancel,
              showWarning: delegableChosenServices.length > 0,
            }}
          />
        </PageContent>
      </Page>
    </PageContainer>
  );
};
