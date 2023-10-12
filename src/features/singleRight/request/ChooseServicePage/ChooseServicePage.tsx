/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as React from 'react';
import { PersonIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Button, Ingress, Popover } from '@digdir/design-system-react';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { Page, PageHeader, PageContent, PageContainer, GroupElements } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { ResourceIdentifierDto } from '@/dataObjects/dtos/singleRights/ResourceIdentifierDto';
import {
  type DelegationAccessCheckDto,
  fetchRights,
  removeServiceResource,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { GeneralPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { SearchSection } from '../../components/SearchSection';
import { ResourceCollectionBar } from '../../components/ResourceCollectionBar';

export const ChooseServicePage = () => {
  const { t } = useTranslation('common');
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();
  const reporteeName = useAppSelector((state) => state.userInfo.reporteeName);
  const userName = useAppSelector((state) => state.userInfo.personName);
  const requestee = reporteeName ? reporteeName : userName;
  const delegableChosenServices = useAppSelector((state) =>
    state.singleRightsSlice.servicesWithStatus.filter((s) => s.status !== 'NotDelegable'),
  );

  const onAdd = (identifier: string, serviceResource: ServiceResource) => {
    const dto: DelegationAccessCheckDto = {
      serviceResource,
      resourceIdentifierDto: new ResourceIdentifierDto('urn:altinn:resource', identifier),
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
        color='light'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<PersonIcon />}>{t('single_rights.request_single_rights')}</PageHeader>
        <PageContent>
          <Ingress spacing>
            {t('single_rights.request_choose_service_page_top_text', { name: requestee })}
          </Ingress>
          <ResourceCollectionBar
            resources={delegableChosenServices.map(
              (servicewithStatus) => servicewithStatus.service,
            )}
            onRemove={onRemove}
            compact={isSm}
          />
          <SearchSection
            onAdd={onAdd}
            onUndo={onRemove}
          />
          <GroupElements>
            {delegableChosenServices.length > 0 ? (
              <Popover
                trigger={
                  <Button
                    variant='quiet'
                    color='danger'
                    fullWidth={isSm}
                    onClick={onCancel}
                  ></Button>
                }
              ></Popover>
            ) : (
              <Button
                variant='quiet'
                color='primary'
                fullWidth={isSm}
                onClick={onCancel}
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              variant='filled'
              color='primary'
              fullWidth={isSm}
            >
              {t('common.proceed')}
            </Button>
          </GroupElements>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
