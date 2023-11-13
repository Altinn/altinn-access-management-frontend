/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as React from 'react';
import { PersonIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Button, Ingress, Paragraph, Popover } from '@digdir/design-system-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import { Page, PageHeader, PageContent, PageContainer, GroupElements } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import {
  type DelegationAccessCheckDto,
  delegationAccessCheck,
  removeServiceResource,
  resetProcessedDelegations,
  ServiceStatus,
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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const delegableChosenServices = useAppSelector((state) =>
    state.singleRightsSlice.servicesWithStatus.filter(
      (s) => s.status === ServiceStatus.Delegable || s.status === ServiceStatus.PartiallyDelegable,
    ),
  );

  useEffect(() => {
    void dispatch(resetProcessedDelegations());
  }, []);

  const onAdd = (serviceResource: ServiceResource) => {
    const dto: DelegationAccessCheckDto = {
      serviceResource,
      resourceReference: serviceResource.authorizationReference,
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
        color='dark'
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

          <GroupElements>
            <Button
              variant='primary'
              color='first'
              disabled={delegableChosenServices.length < 1}
              fullWidth
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
            <Button
              variant='tertiary'
              color={delegableChosenServices.length > 0 ? 'danger' : 'first'}
              size='medium'
              onClick={
                delegableChosenServices.length > 0 ? () => setPopoverOpen(!popoverOpen) : onCancel
              }
              ref={buttonRef}
            >
              {t('common.cancel')}
            </Button>
            <Popover
              variant={'warning'}
              placement='top'
              anchorEl={buttonRef.current}
              open={popoverOpen}
              onClose={() => setPopoverOpen(false)}
            >
              <Popover.Content>
                <Paragraph>{t('single_rights.cancel_popover_text')}</Paragraph>
                <GroupElements>
                  <Button
                    onClick={onCancel}
                    color={'danger'}
                    variant={'primary'}
                    fullWidth
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
                </GroupElements>
              </Popover.Content>
            </Popover>
          </GroupElements>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
