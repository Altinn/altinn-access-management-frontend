import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Alert, Spinner, Button, Heading, Paragraph } from '@digdir/designsystemet-react';

import { useGetSystemUserRequestQuery } from '@/rtk/features/systemUserApi';
import { SystemUserPath } from '@/routes/paths';
import {
  useApproveSystemUserRequestMutation,
  useRejectSystemUserRequestMutation,
} from '@/rtk/features/systemUserApi';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { RequestPageBase } from './components/RequestPageBase/RequestPageBase';
import type { ProblemDetail } from './types';
import { RightsList } from './components/RightsList/RightsList';
import { ButtonRow } from './components/ButtonRow/ButtonRow';
import { DelegationCheckError } from './components/DelegationCheckError/DelegationCheckError';
import { getApiBaseUrl, getLogoutUrl } from './urlUtils';
import { CreateSystemUserCheck } from './components/CanCreateSystemUser/CanCreateSystemUser';

export const SystemUserRequestPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('id') ?? '';
  const partyId = getCookie('AltinnPartyId');

  const {
    data: request,
    isLoading: isLoadingRequest,
    error: loadingRequestError,
  } = useGetSystemUserRequestQuery(
    { partyId, requestId },
    {
      skip: !requestId,
    },
  );
  const { data: reporteeData } = useGetReporteeQuery();

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
      postAcceptCreationRequest({ partyId, requestId: request.id })
        .unwrap()
        .then(() => {
          if (request.redirectUrl) {
            logoutAndRedirectToVendor();
          } else {
            navigate(SystemUserPath.Overview);
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
    window.location.assign(`${getApiBaseUrl()}/request/${request?.id}/logout`);
  };

  return (
    <RequestPageBase
      system={request?.system}
      heading={t('systemuser_request.banner_title')}
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
        <Spinner
          aria-label={t('systemuser_request.loading_creation_request')}
          title={''}
        />
      )}
      {request && request.system && (
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
              i18nKey={'systemuser_request.system_description'}
              values={{
                systemName: request.system.name,
                partyName: reporteeData?.name,
              }}
            ></Trans>
          </Paragraph>
          <div />
          <div>
            <Heading
              level={3}
              data-size='xs'
            >
              {request.resources.length === 1
                ? t('systemuser_request.rights_list_header_single')
                : t('systemuser_request.rights_list_header')}
            </Heading>
            <RightsList resources={request.resources} />
          </div>
          <Paragraph>{t('systemuser_request.withdraw_consent_info')}</Paragraph>
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
