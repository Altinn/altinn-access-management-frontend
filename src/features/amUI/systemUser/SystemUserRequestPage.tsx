import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { DsAlert, DsSpinner, DsHeading, DsParagraph, DsButton } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import {
  useGetSystemUserRequestQuery,
  useApproveSystemUserRequestMutation,
  useRejectSystemUserRequestMutation,
  useGetSystemUserReporteeQuery,
} from '@/rtk/features/systemUserApi';

import { RequestPageBase } from './components/RequestPageBase/RequestPageBase';
import type { ProblemDetail } from './types';
import { RightsList } from './components/RightsList/RightsList';
import { ButtonRow } from './components/ButtonRow/ButtonRow';
import { DelegationCheckError } from './components/DelegationCheckError/DelegationCheckError';
import { getApiBaseUrl, getLogoutUrl } from './urlUtils';
import { CreateSystemUserCheck } from './components/CanCreateSystemUser/CanCreateSystemUser';

export const SystemUserRequestPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('systemuser_request.page_title'));
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('id') ?? '';

  const {
    data: request,
    isLoading: isLoadingRequest,
    error: loadingRequestError,
  } = useGetSystemUserRequestQuery(
    { requestId },
    {
      skip: !requestId,
    },
  );
  const {
    data: reporteeData,
    isLoading: isLoadingReportee,
    error: loadReporteeError,
  } = useGetSystemUserReporteeQuery(
    { partyId: request?.partyId || '', partyUuid: request?.partyUuid || '' },
    {
      skip: !request?.partyId,
    },
  );

  const [
    postAcceptCreationRequest,
    { error: acceptCreationRequestError, isLoading: isAcceptingSystemUser },
  ] = useApproveSystemUserRequestMutation();

  const [
    postRejectCreationRequest,
    { isError: isRejectCreationRequestError, isLoading: isRejectingSystemUser },
  ] = useRejectSystemUserRequestMutation();

  const isActionButtonDisabled =
    isAcceptingSystemUser || isRejectingSystemUser || request?.status !== 'New';

  const acceptSystemUser = (): void => {
    if (!isActionButtonDisabled) {
      const partyId = request.partyId;
      postAcceptCreationRequest({ partyId, requestId: request.id })
        .unwrap()
        .then(onRejectOrApprove);
    }
  };

  const rejectSystemUser = (): void => {
    if (!isActionButtonDisabled) {
      const partyId = request.partyId;
      postRejectCreationRequest({ partyId, requestId: request.id })
        .unwrap()
        .then(onRejectOrApprove);
    }
  };

  const onRejectOrApprove = (): void => {
    const url = request?.redirectUrl
      ? `${getApiBaseUrl()}/request/${request?.id}/logout`
      : getLogoutUrl();
    window.location.assign(url);
  };

  return (
    <RequestPageBase
      system={request?.system}
      reporteeName={reporteeData?.party.name}
      heading={t('systemuser_request.banner_title')}
    >
      {!requestId && (
        <DsAlert data-color='danger'>{t('systemuser_request.load_creation_request_no_id')}</DsAlert>
      )}
      {loadReporteeError && (
        <DsAlert data-color='danger'>{t('systemuser_request.load_user_info_error')}</DsAlert>
      )}
      {(loadingRequestError || (request && !request.system)) && (
        <DsAlert data-color='danger'>
          {(loadingRequestError as { data: ProblemDetail }).data.status === 404
            ? t('systemuser_request.load_creation_request_error_notfound')
            : t('systemuser_request.load_creation_request_error')}
        </DsAlert>
      )}
      {(isLoadingRequest || isLoadingReportee) && (
        <DsSpinner aria-label={t('systemuser_request.loading_creation_request')} />
      )}
      {request?.system && reporteeData && (
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
              i18nKey={'systemuser_request.system_description'}
              values={{
                systemName: request.system.name,
                partyName: reporteeData?.party.name,
              }}
            ></Trans>
          </DsParagraph>
          <div />
          <DsHeading
            level={3}
            data-size='xs'
          >
            {request.resources.length + request.accessPackages.length === 1
              ? t('systemuser_request.rights_list_header_single')
              : t('systemuser_request.rights_list_header')}
          </DsHeading>
          <RightsList
            resources={request.resources}
            accessPackages={request.accessPackages}
          />
          <DsParagraph>{t('systemuser_request.withdraw_consent_info')}</DsParagraph>
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
            <CreateSystemUserCheck canCreateSystemUser={reporteeData.hasCreateSystemuserPermission}>
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
