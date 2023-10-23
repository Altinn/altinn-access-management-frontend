/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as React from 'react';
import { PersonIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Button, Ingress, Paragraph, Popover } from '@digdir/design-system-react';
import { useState } from 'react';

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
  const [popoverOpen, setPopoverOpen] = useState(false);
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
        color='dark'
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
            <Button
              variant='primary'
              color='first'
              fullWidth={isSm}
            >
              {t('common.proceed')}
            </Button>
            <Popover
              variant={'warning'}
              onOpenChange={() => setPopoverOpen(!popoverOpen)}
              open={popoverOpen}
              placement={'top'}
              trigger={
                <Button
                  variant='tertiary'
                  color={delegableChosenServices.length > 0 ? 'danger' : 'first'}
                  fullWidth={isSm}
                  onClick={onCancel}
                >
                  {t('common.cancel')}
                </Button>
              }
            >
              <Paragraph>{t('single_rights.cancel_popover_text')}</Paragraph>
              <Button
                onClick={onCancel}
                color={'danger'}
                variant={'primary'}
              >
                {t('common.yes')}
              </Button>
              <Button
                onClick={() => setPopoverOpen(false)}
                color={'danger'}
                variant={'tertiary'}
              >
                {t('single_rights.no_continue_delegating')}
              </Button>
            </Popover>
          </GroupElements>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
