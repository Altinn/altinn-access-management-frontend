/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as React from 'react';
import { PersonIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Button, Ingress, Paragraph, Popover } from '@digdir/designsystemet-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';

import { Page, PageHeader, PageContent, PageContainer, GroupElements } from '@/components';
import { useMediaQuery, useFetchRecipientInfo } from '@/resources/hooks';
import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import {
  type DelegationAccessCheckDto,
  delegationAccessCheck,
  removeServiceResource,
  resetProcessedDelegations,
  ServiceStatus,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { SingleRightPath } from '@/routes/paths';
import { redirectToSevicesAvailableForUser } from '@/resources/utils';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

import { SearchSection } from '../../components/SearchSection';
import { ResourceCollectionBar } from '../../components/ResourceCollectionBar';
import { RecipientErrorAlert } from '../../components/RecipientErrorAlert/RecipientErrorAlert';
import { ChooseServiceSkeleton } from '../../components/ChooseServiceSkeleton/ChooseServiceSkeleton';

export const ChooseServicePage = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();
  const [urlParams] = useSearchParams();
  const [popoverOpen, setPopoverOpen] = useState(false);
  useDocumentTitle(t('single_rights.page_title'));
  const delegableChosenServices = useAppSelector((state) =>
    state.singleRightsSlice.servicesWithStatus.filter(
      (s) => s.status === ServiceStatus.Delegable || s.status === ServiceStatus.PartiallyDelegable,
    ),
  );

  useLayoutEffect(() => {
    void dispatch(resetProcessedDelegations());
  }, []);

  const {
    name: recipientName,
    error: recipientError,
    userID,
    partyID,
    isLoading: recipientIsLoading,
  } = useFetchRecipientInfo(urlParams.get('userUUID'), urlParams.get('partyUUID'));

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

  return (
    <PageContainer>
      <Page
        color='dark'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<PersonIcon />}>{t('single_rights.delegate_single_rights')}</PageHeader>
        <PageContent>
          {recipientIsLoading ? (
            <ChooseServiceSkeleton />
          ) : (
            <>
              {recipientError ? (
                <RecipientErrorAlert
                  userUUID={urlParams.get('userUUID')}
                  partyUUID={urlParams.get('partyUUID')}
                />
              ) : (
                <>
                  <Ingress spacing>
                    {t('single_rights.delegate_choose_service_page_top_text', {
                      name: recipientName,
                    })}
                  </Ingress>
                  <ResourceCollectionBar
                    resources={delegableChosenServices.map(
                      (servicewithStatus) => servicewithStatus.service,
                    )}
                    onRemove={onRemove}
                    compact={isSm}
                    proceedToPath={`/${SingleRightPath.DelegateSingleRights}/${SingleRightPath.ChooseRights}?${urlParams}`}
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
                          `/${SingleRightPath.DelegateSingleRights}/${SingleRightPath.ChooseRights}?${urlParams}`,
                        );
                      }}
                    >
                      {t('common.proceed')}
                    </Button>
                    <Popover
                      variant={'warning'}
                      placement='top'
                      open={popoverOpen}
                      onClose={() => setPopoverOpen(false)}
                    >
                      <Popover.Trigger
                        variant='tertiary'
                        color={delegableChosenServices.length > 0 ? 'danger' : 'first'}
                        size='medium'
                        onClick={
                          delegableChosenServices.length > 0
                            ? () => setPopoverOpen(!popoverOpen)
                            : () => redirectToSevicesAvailableForUser(userID, partyID)
                        }
                      >
                        {t('common.cancel')}
                      </Popover.Trigger>
                      <Popover.Content>
                        <Paragraph>{t('single_rights.cancel_popover_text')}</Paragraph>
                        <GroupElements>
                          <Button
                            onClick={() => redirectToSevicesAvailableForUser(userID, partyID)}
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
                </>
              )}
            </>
          )}
        </PageContent>
      </Page>
    </PageContainer>
  );
};
