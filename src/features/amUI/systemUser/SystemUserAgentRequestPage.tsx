import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router';
import { Alert, Spinner, Button, Heading, Paragraph } from '@digdir/designsystemet-react';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { SystemUserPath } from '@/routes/paths';
import {
  useGetAgentSystemUserRequestQuery,
  useApproveAgentSystemUserRequestMutation,
  useRejectAgentSystemUserRequestMutation,
} from '@/rtk/features/systemUserApi';

import { RequestPageBase } from './components/RequestPageBase/RequestPageBase';
import type { ProblemDetail } from './types';
import { ButtonRow } from './components/ButtonRow/ButtonRow';
import { DelegationCheckError } from './components/DelegationCheckError/DelegationCheckError';
import { getApiBaseUrl, getLogoutUrl } from './urlUtils';
import { CreateSystemUserCheck } from './components/CanCreateSystemUser/CanCreateSystemUser';
import { RightsList } from './components/RightsList/RightsList';

export const SystemUserAgentRequestPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle(t('systemuser_agent_request.page_title'));
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('id') ?? '';
  const partyId = getCookie('AltinnPartyId');

  const {
    data: request,
    isLoading: isLoadingRequest,
    error: loadingRequestError,
  } = useGetAgentSystemUserRequestQuery(
    { partyId, requestId },
    {
      skip: !requestId,
    },
  );
  const { data: reporteeData } = useGetReporteeQuery();

  const [
    postAcceptCreationRequest,
    { error: acceptCreationRequestError, isLoading: isAcceptingSystemUser },
  ] = useApproveAgentSystemUserRequestMutation();

  const [
    postRejectCreationRequest,
    { isError: isRejectCreationRequestError, isLoading: isRejectingSystemUser },
  ] = useRejectAgentSystemUserRequestMutation();

  const isActionButtonDisabled =
    isAcceptingSystemUser || isRejectingSystemUser || request?.status !== 'New';

  const acceptSystemUser = (): void => {
    if (!isActionButtonDisabled) {
      postAcceptCreationRequest({ partyId, requestId: request.id })
        .unwrap()
        .then(() => {
          if (request.redirectUrl) {
            logoutAndRedirectToVendor();
          } else {
            navigate(`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`);
          }
        });
    }
  };

  const rejectSystemUser = (): void => {
    if (!isActionButtonDisabled) {
      postRejectCreationRequest({ partyId, requestId: request.id })
        .unwrap()
        .then(() => {
          if (request.redirectUrl) {
            logoutAndRedirectToVendor();
          } else {
            window.location.assign(getLogoutUrl());
          }
        });
    }
  };

  const logoutAndRedirectToVendor = (): void => {
    window.location.assign(`${getApiBaseUrl()}/agentrequest/${request?.id}/logout`);
  };

  return (
    <RequestPageBase
      system={request?.system}
      heading={t('systemuser_agent_request.banner_title')}
    >
      {!requestId && (
        <Alert data-color='danger'>{t('systemuser_request.load_creation_request_no_id')}</Alert>
      )}
      {(loadingRequestError || (request && !request.system)) && (
        <Alert data-color='danger'>
          {(loadingRequestError as { data: ProblemDetail }).data.status === 404
            ? t('systemuser_request.load_creation_request_error_notfound')
            : t('systemuser_request.load_creation_request_error')}
        </Alert>
      )}
      {isLoadingRequest && (
        <Spinner aria-label={t('systemuser_request.loading_creation_request')} />
      )}
      {request?.system && (
        <>
          {request.status === 'Accepted' && (
            <Alert data-color='info'>{t('systemuser_request.request_accepted')}</Alert>
          )}
          {request.status === 'Rejected' && (
            <Alert data-color='info'>{t('systemuser_request.request_rejected')}</Alert>
          )}
          {request.status === 'Timedout' && (
            <Alert data-color='info'>{t('systemuser_request.request_expired')}</Alert>
          )}
          <Heading
            level={2}
            data-size='sm'
          >
            {t('systemuser_request.creation_header', {
              vendorName: request.system.name,
            })}
          </Heading>
          <Paragraph>
            <Trans
              i18nKey={'systemuser_agent_request.system_description'}
              values={{
                vendorName: request.system.name,
                companyName: reporteeData?.name,
              }}
            ></Trans>
          </Paragraph>
          <Heading
            level={3}
            data-size='xs'
          >
            {request.accessPackages.length === 1
              ? t('systemuser_request.rights_list_header_single')
              : t('systemuser_request.rights_list_header')}
          </Heading>
          <RightsList
            resources={[]}
            accessPackages={request.accessPackages}
            hideHeadings
          />
          <div>
            {acceptCreationRequestError && (
              <DelegationCheckError
                defaultError='systemuser_includedrightspage.create_systemuser_error'
                error={acceptCreationRequestError as { data: ProblemDetail }}
              />
            )}
            {isRejectCreationRequestError && (
              <Alert
                data-color='danger'
                role='alert'
              >
                {t('systemuser_request.reject_error')}
              </Alert>
            )}
            <CreateSystemUserCheck>
              <ButtonRow>
                <Button
                  variant='primary'
                  aria-disabled={isActionButtonDisabled}
                  onClick={acceptSystemUser}
                  loading={isAcceptingSystemUser}
                >
                  {isAcceptingSystemUser
                    ? t('systemuser_request.accept_loading')
                    : t('systemuser_request.accept')}
                </Button>
                <Button
                  variant='tertiary'
                  aria-disabled={isActionButtonDisabled}
                  onClick={rejectSystemUser}
                  loading={isRejectingSystemUser}
                >
                  {isRejectingSystemUser
                    ? t('systemuser_request.reject_loading')
                    : t('systemuser_request.reject')}
                </Button>
              </ButtonRow>
            </CreateSystemUserCheck>
          </div>
        </>
      )}
    </RequestPageBase>
  );
};
