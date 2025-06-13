import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router';
import { DsAlert, DsSpinner, DsHeading, DsParagraph, DsButton } from '@altinn/altinn-components';

import {
  useGetAgentSystemUserRequestQuery,
  useApproveAgentSystemUserRequestMutation,
  useRejectAgentSystemUserRequestMutation,
  useGetSystemUserReporteeQuery,
} from '@/rtk/features/systemUserApi';
import { SystemUserPath } from '@/routes/paths';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

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

  const {
    data: request,
    isLoading: isLoadingRequest,
    error: loadingRequestError,
  } = useGetAgentSystemUserRequestQuery(
    { requestId },
    {
      skip: !requestId,
    },
  );
  const { data: reporteeData } = useGetSystemUserReporteeQuery(request?.partyId ?? '', {
    skip: !request?.partyId,
  });

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
      const partyId = request.partyId;
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
      const partyId = request.partyId;
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
      reporteeName={reporteeData?.name}
      heading={t('systemuser_agent_request.banner_title')}
    >
      {!requestId && (
        <DsAlert data-color='danger'>{t('systemuser_request.load_creation_request_no_id')}</DsAlert>
      )}
      {(loadingRequestError || (request && !request.system)) && (
        <DsAlert data-color='danger'>
          {(loadingRequestError as { data: ProblemDetail }).data.status === 404
            ? t('systemuser_request.load_creation_request_error_notfound')
            : t('systemuser_request.load_creation_request_error')}
        </DsAlert>
      )}
      {isLoadingRequest && (
        <DsSpinner aria-label={t('systemuser_request.loading_creation_request')} />
      )}
      {request?.system && (
        <>
          {request.status === 'Accepted' && (
            <DsAlert data-color='info'>{t('systemuser_request.request_accepted')}</DsAlert>
          )}
          {request.status === 'Rejected' && (
            <DsAlert data-color='info'>{t('systemuser_request.request_rejected')}</DsAlert>
          )}
          {request.status === 'Timedout' && (
            <DsAlert data-color='info'>{t('systemuser_request.request_expired')}</DsAlert>
          )}
          <DsHeading
            level={2}
            data-size='sm'
          >
            {t('systemuser_request.creation_header', {
              vendorName: request.system.name,
            })}
          </DsHeading>
          <DsParagraph>
            <Trans
              i18nKey={'systemuser_agent_request.system_description'}
              values={{
                vendorName: request.system.name,
                companyName: reporteeData?.name,
              }}
            ></Trans>
          </DsParagraph>
          <DsHeading
            level={3}
            data-size='xs'
          >
            {request.accessPackages.length === 1
              ? t('systemuser_request.rights_list_header_single')
              : t('systemuser_request.rights_list_header')}
          </DsHeading>
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
              <DsAlert
                data-color='danger'
                role='alert'
              >
                {t('systemuser_request.reject_error')}
              </DsAlert>
            )}
            <CreateSystemUserCheck partyId={request.partyId}>
              <ButtonRow>
                <DsButton
                  variant='primary'
                  aria-disabled={isActionButtonDisabled}
                  onClick={acceptSystemUser}
                  loading={isAcceptingSystemUser}
                >
                  {isAcceptingSystemUser
                    ? t('systemuser_request.accept_loading')
                    : t('systemuser_request.accept')}
                </DsButton>
                <DsButton
                  variant='tertiary'
                  aria-disabled={isActionButtonDisabled}
                  onClick={rejectSystemUser}
                  loading={isRejectingSystemUser}
                >
                  {isRejectingSystemUser
                    ? t('systemuser_request.reject_loading')
                    : t('systemuser_request.reject')}
                </DsButton>
              </ButtonRow>
            </CreateSystemUserCheck>
          </div>
        </>
      )}
    </RequestPageBase>
  );
};
