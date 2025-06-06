/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as React from 'react';
import { PersonIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { useLayoutEffect } from 'react';
import { DsParagraph } from '@altinn/altinn-components';

import { SearchSection } from '../../components/SearchSection';
import { ResourceCollectionBar } from '../../components/ResourceCollectionBar';
import { RecipientErrorAlert } from '../../components/RecipientErrorAlert/RecipientErrorAlert';
import { ChooseServiceSkeleton } from '../../components/ChooseServiceSkeleton/ChooseServiceSkeleton';
import { NavigationSection } from '../../components/NavigationSection/NavigationSection';

import classes from './ChooseServicePage.module.css';

import { Page, PageHeader, PageContent, PageContainer } from '@/components';
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

export const ChooseServicePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();
  const [urlParams] = useSearchParams();
  useDocumentTitle(t('single_rights.page_title'));
  const servicesWithStatus = useAppSelector((state) => state.singleRightsSlice.servicesWithStatus);
  const delegableChosenServices = servicesWithStatus.filter(
    (s) => s.status === ServiceStatus.Delegable || s.status === ServiceStatus.PartiallyDelegable,
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
                  <DsParagraph
                    variant='long'
                    className={classes.servicePageTopText}
                  >
                    {t('single_rights.delegate_choose_service_page_top_text', {
                      name: recipientName,
                    })}
                  </DsParagraph>
                  <ResourceCollectionBar
                    resources={
                      delegableChosenServices
                        .map((servicewithStatus) => servicewithStatus.service)
                        .filter(Boolean) as ServiceResource[]
                    }
                    onRemove={onRemove}
                    compact={isSm}
                    proceedToPath={`/${SingleRightPath.DelegateSingleRights}/${SingleRightPath.ChooseRights}?${urlParams}`}
                  />
                  <SearchSection
                    onAdd={onAdd}
                    onUndo={onRemove}
                  />
                  <NavigationSection
                    className={classes.navigationContainer}
                    cancelButtonProps={{
                      onCancel: () => redirectToSevicesAvailableForUser(userID, partyID),
                      showWarning: delegableChosenServices.length > 0,
                    }}
                    nextButtonProps={{
                      onNext: () => {
                        navigate(
                          `/${SingleRightPath.DelegateSingleRights}/${SingleRightPath.ChooseRights}?${urlParams}`,
                        );
                      },
                      disabled: delegableChosenServices.length < 1,
                    }}
                  />
                </>
              )}
            </>
          )}
        </PageContent>
      </Page>
    </PageContainer>
  );
};
