import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Alert, Spinner, Button, Heading, Paragraph } from '@digdir/designsystemet-react';

import {
  useApproveChangeRequestMutation,
  useGetChangeRequestQuery,
  useRejectChangeRequestMutation,
} from '@/rtk/features/systemUserApi';
import { SystemUserPath } from '@/routes/paths';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

import { RequestPageBase } from './components/RequestPageBase/RequestPageBase';
import type { ProblemDetail } from './types';
import { RightsList } from './components/RightsList/RightsList';
import { ButtonRow } from './components/ButtonRow/ButtonRow';
import { DelegationCheckError } from './components/DelegationCheckError/DelegationCheckError';
import { getApiBaseUrl, getLogoutUrl } from './urlUtils';
import { CreateSystemUserCheck } from './components/CanCreateSystemUser/CanCreateSystemUser';

export const SystemUserChangeRequestPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle(t('systemuser_change_request.page_title'));
  const [searchParams] = useSearchParams();
  const changeRequestId = searchParams.get('id') ?? '';
  const partyId = getCookie('AltinnPartyId');

  const {
    data: changeRequest,
    isLoading: isLoadingChangeRequest,
    error: loadingChangeRequestError,
  } = useGetChangeRequestQuery(
    { partyId, changeRequestId },
    {
      skip: !changeRequestId,
    },
  );
  const { data: reporteeData } = useGetReporteeQuery();

  const [
    postAcceptChangeRequest,
    { error: acceptChangeRequestError, isLoading: isAcceptingChangeRequest },
  ] = useApproveChangeRequestMutation();

  const [
    postRejectChangeRequest,
    { isError: isRejectChangeRequestError, isLoading: isRejectingChangeRequest },
  ] = useRejectChangeRequestMutation();

  const isActionButtonDisabled =
    isAcceptingChangeRequest || isRejectingChangeRequest || changeRequest?.status !== 'New';

  const acceptChangeRequest = (): void => {
    if (!isActionButtonDisabled) {
      postAcceptChangeRequest({ partyId, changeRequestId: changeRequest.id })
        .unwrap()
        .then(() => {
          if (changeRequest.redirectUrl) {
            logoutAndRedirectToVendor();
          } else {
            navigate(SystemUserPath.Overview);
          }
        });
    }
  };

  const rejectChangeRequest = (): void => {
    if (!isActionButtonDisabled) {
      postRejectChangeRequest({ partyId, changeRequestId: changeRequest.id })
        .unwrap()
        .then(() => {
          if (changeRequest.redirectUrl) {
            logoutAndRedirectToVendor();
          } else {
            window.location.assign(getLogoutUrl());
          }
        });
    }
  };

  const logoutAndRedirectToVendor = (): void => {
    window.location.assign(`${getApiBaseUrl()}/changerequest/${changeRequest?.id}/logout`);
  };

  return (
    <RequestPageBase
      system={changeRequest?.system}
      heading={t('systemuser_change_request.banner_title')}
    >
      {!changeRequestId && (
        <Alert data-color='danger'>{t('systemuser_request.load_creation_request_no_id')}</Alert>
      )}
      {(loadingChangeRequestError || (changeRequest && !changeRequest.system)) && (
        <Alert data-color='danger'>
          {t('systemuser_change_request.load_systemuser_change_request_error')}
        </Alert>
      )}
      {isLoadingChangeRequest && (
        <Spinner
          aria-label={t('systemuser_change_request.loading_systemuser_change_request')}
          title={''}
        />
      )}
      {changeRequest?.system && (
        <>
          {changeRequest.status === 'Accepted' && (
            <Alert data-color='info'>{t('systemuser_change_request.request_accepted')}</Alert>
          )}
          {changeRequest.status === 'Rejected' && (
            <Alert data-color='info'>{t('systemuser_change_request.request_rejected')}</Alert>
          )}
          {changeRequest.status === 'Timedout' && (
            <Alert data-color='info'>{t('systemuser_change_request.request_expired')}</Alert>
          )}
          <Heading
            level={2}
            data-size='sm'
          >
            {t('systemuser_change_request.change_request_header', {
              vendorName: changeRequest.system.name,
            })}
          </Heading>
          <Paragraph>
            <Trans
              i18nKey={'systemuser_request.system_description'}
              values={{
                systemName: changeRequest.system.name,
                partyName: reporteeData?.name,
              }}
            ></Trans>
          </Paragraph>
          <div />
          <Heading
            level={3}
            data-size='xs'
          >
            {changeRequest.resources.length + changeRequest.accessPackages.length === 1
              ? t('systemuser_change_request.rights_list_header_single')
              : t('systemuser_change_request.rights_list_header')}
          </Heading>
          <RightsList
            resources={changeRequest.resources}
            accessPackages={changeRequest.accessPackages}
          />
          <Paragraph>{t('systemuser_request.withdraw_consent_info')}</Paragraph>
          <div>
            {acceptChangeRequestError && (
              <DelegationCheckError
                defaultError='systemuser_change_request.accept_error'
                error={acceptChangeRequestError as { data: ProblemDetail }}
              />
            )}
            {isRejectChangeRequestError && (
              <Alert
                data-color='danger'
                role='alert'
              >
                {t('systemuser_change_request.reject_error')}
              </Alert>
            )}
            <CreateSystemUserCheck>
              <ButtonRow>
                <Button
                  variant='primary'
                  aria-disabled={isActionButtonDisabled}
                  onClick={acceptChangeRequest}
                  loading={isAcceptingChangeRequest}
                >
                  {isAcceptingChangeRequest
                    ? t('systemuser_change_request.accept_loading')
                    : t('systemuser_change_request.accept')}
                </Button>
                <Button
                  variant='tertiary'
                  aria-disabled={isActionButtonDisabled}
                  onClick={rejectChangeRequest}
                  loading={isRejectingChangeRequest}
                >
                  {isRejectingChangeRequest
                    ? t('systemuser_change_request.reject_loading')
                    : t('systemuser_change_request.reject')}
                </Button>
              </ButtonRow>
            </CreateSystemUserCheck>
          </div>
        </>
      )}
    </RequestPageBase>
  );
};
