/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as React from 'react';
import { PersonIcon, MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '@digdir/design-system-react';
import { useNavigate } from 'react-router-dom';

import {
  Page,
  PageHeader,
  PageContent,
  PageContainer,
  ActionBar,
  CollectionBar,
  DualElementsContainer,
} from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ResourceIdentifierDto } from '@/dataObjects/dtos/singleRights/ResourceIdentifierDto';
import {
  type DelegationRequestDto,
  delegationAccessCheck,
  removeServiceResource,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { GeneralPath, SingleRightPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { SearchSection } from './SearchSection/SearchSection';

export const ChooseServicePage = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();
  const delegableChosenServices = useAppSelector((state) =>
    state.singleRightsSlice.chosenServices.filter((s) => s.status !== 'NotDelegable'),
  );

  const onAdd = (identifier: string, serviceResource: ServiceResource) => {
    const dto: DelegationRequestDto = {
      serviceResource,
      delegationRequest: new ResourceIdentifierDto('urn:altinn:resource', identifier),
    };

    void dispatch(delegationAccessCheck(dto));
  };

  const onRemove = (identifier: string | undefined) => {
    void dispatch(removeServiceResource(identifier));
  };

  const onCancel = () => {
    const cleanHostname = window.location.hostname.replace('am.ui.', '');
    window.location.href =
      'https://' +
      cleanHostname +
      '/' +
      String(GeneralPath.Altinn2SingleRights) +
      '?userID=' +
      getCookie('AltinnUserId') +
      '&amp;' +
      'partyID=' +
      getCookie('AltinnPartyId');
  };

  const selectedResourcesActionBars = delegableChosenServices.map((resource, index) => (
    <ActionBar
      key={index}
      title={resource.service?.title}
      subtitle={resource.service?.resourceOwnerName}
      size='small'
      color='success'
      actions={
        <Button
          variant='quiet'
          size={isSm ? 'medium' : 'small'}
          onClick={() => {
            onRemove(resource.service?.identifier);
          }}
          icon={isSm && <MinusCircleIcon title={t('common.remove')} />}
        >
          {!isSm && t('common.remove')}
        </Button>
      }
    ></ActionBar>
  ));

  return (
    <PageContainer>
      <Page
        color='light'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent>
          <CollectionBar
            title='Valgte tjenester'
            color={selectedResourcesActionBars.length > 0 ? 'success' : 'neutral'}
            collection={selectedResourcesActionBars}
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
