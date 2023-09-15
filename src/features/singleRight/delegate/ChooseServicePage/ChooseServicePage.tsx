/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as React from 'react';
import { PersonIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Button, Ingress } from '@digdir/design-system-react';
import { useNavigate } from 'react-router-dom';

import { Page, PageHeader, PageContent, PageContainer, DualElementsContainer } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ResourceIdentifierDto } from '@/dataObjects/dtos/singleRights/ResourceIdentifierDto';
import {
  type DelegationAccessCheckDto,
  delegationAccessCheck,
  removeServiceResource,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { GeneralPath, SingleRightPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { SearchSection } from '../../components/SearchSection';
import { ResourceCollectionBar } from '../../components/ResourceCollectionBar';

export const ChooseServicePage = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();
  const delegableChosenServices = useAppSelector((state) =>
    state.singleRightsSlice.servicesWithStatus.filter((s) => s.status !== 'NotDelegable'),
  );

  const onAdd = (identifier: string, serviceResource: ServiceResource) => {
    const dto: DelegationAccessCheckDto = {
      serviceResource,
      resourceIdentifierDto: new ResourceIdentifierDto('urn:altinn:resource', identifier),
    };

    void dispatch(delegationAccessCheck(dto));
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
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent>
          <Ingress spacing>
            {t('single_rights.delegate_choose_service_page_top_text', { name: 'ANNEMA FIGMA' })}
          </Ingress>
          <ResourceCollectionBar
            resources={delegableChosenServices.map(
              (servicewithStatus) => servicewithStatus.service,
            )}
            onRemove={onRemove}
            compact={isSm}
            proceedToPath={
              '/' + SingleRightPath.DelegateSingleRights + '/' + SingleRightPath.ChooseRights
            }
          />
          <SearchSection
            onAdd={onAdd}
            onUndo={onRemove}
          />
          <DualElementsContainer
            leftElement={
              <Button
                variant='quiet'
                color='danger'
                fullWidth={true}
                onClick={onCancel}
              >
                {t('common.cancel')}
              </Button>
            }
            rightElement={
              <Button
                variant='filled'
                color='primary'
                fullWidth={true}
                onClick={() => {
                  navigate(
                    '/' +
                      SingleRightPath.DelegateSingleRights +
                      '/' +
                      String(SingleRightPath.ChooseRights),
                  );
                }}
              >
                {t('common.proceed')}
              </Button>
            }
          />
        </PageContent>
      </Page>
    </PageContainer>
  );
};
