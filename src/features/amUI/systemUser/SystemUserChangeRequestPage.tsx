import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { DsAlert, DsSpinner, DsHeading, DsParagraph, DsButton } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import {
  useApproveChangeRequestMutation,
  useGetChangeRequestQuery,
  useGetSystemUserReporteeQuery,
  useRejectChangeRequestMutation,
} from '@/rtk/features/systemUserApi';

import { RequestPageBase } from './components/RequestPageBase/RequestPageBase';
import type { ProblemDetail, SystemUserAccessPackage } from './types';
import { RightsList } from './components/RightsList/RightsList';
import { ButtonRow } from './components/ButtonRow/ButtonRow';
import { DelegationCheckError } from './components/DelegationCheckError/DelegationCheckError';
import { getApiBaseUrl, getLogoutUrl } from './urlUtils';
import { CreateSystemUserCheck } from './components/CanCreateSystemUser/CanCreateSystemUser';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export const SystemUserChangeRequestPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('systemuser_change_request.page_title'));
  const [searchParams] = useSearchParams();
  const changeRequestId = searchParams.get('id') ?? '';

  const {
    data: changeRequest,
    isLoading: isLoadingChangeRequest,
    error: loadingChangeRequestError,
  } = useGetChangeRequestQuery(
    { changeRequestId },
    {
      skip: !changeRequestId,
    },
  );
  const {
    data: reporteeData,
    isLoading: isLoadingReportee,
    error: loadReporteeError,
  } = useGetSystemUserReporteeQuery(changeRequest?.partyId ?? '', {
    skip: !changeRequest?.partyId,
  });

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
      const partyId = changeRequest.partyId;
      postAcceptChangeRequest({ partyId, changeRequestId: changeRequest.id })
        .unwrap()
        .then(onRejectOrApprove);
    }
  };

  const rejectChangeRequest = (): void => {
    if (!isActionButtonDisabled) {
      const partyId = changeRequest.partyId;
      postRejectChangeRequest({ partyId, changeRequestId: changeRequest.id })
        .unwrap()
        .then(onRejectOrApprove);
    }
  };

  const onRejectOrApprove = (): void => {
    const url = changeRequest?.redirectUrl
      ? `${getApiBaseUrl()}/changerequest/${changeRequest?.id}/logout`
      : getLogoutUrl();
    window.location.assign(url);
  };

  return (
    <RequestPageBase
      system={changeRequest?.system}
      reporteeName={reporteeData?.name}
      heading={t('systemuser_change_request.banner_title')}
    >
      {!changeRequestId && (
        <DsAlert data-color='danger'>{t('systemuser_request.load_creation_request_no_id')}</DsAlert>
      )}
      {loadReporteeError && (
        <DsAlert data-color='danger'>{t('systemuser_request.load_user_info_error')}</DsAlert>
      )}
      {(loadingChangeRequestError || (changeRequest && !changeRequest.system)) && (
        <DsAlert data-color='danger'>
          {(loadingChangeRequestError as { data: ProblemDetail }).data.status === 404
            ? t('systemuser_change_request.load_change_request_error_notfound')
            : t('systemuser_change_request.load_change_request_error')}
        </DsAlert>
      )}
      {(isLoadingChangeRequest || isLoadingReportee) && (
        <DsSpinner aria-label={t('systemuser_change_request.loading_change_request')} />
      )}
      {changeRequest?.system && reporteeData && (
        <>
          {changeRequest.status === 'Accepted' && (
            <DsAlert data-color='info'>{t('systemuser_change_request.request_accepted')}</DsAlert>
          )}
          {changeRequest.status === 'Rejected' && (
            <DsAlert data-color='info'>{t('systemuser_change_request.request_rejected')}</DsAlert>
          )}
          {changeRequest.status === 'Timedout' && (
            <DsAlert data-color='info'>{t('systemuser_change_request.request_expired')}</DsAlert>
          )}
          <DsHeading
            level={2}
            data-size='sm'
          >
            {t('systemuser_change_request.change_request_header', {
              vendorName: changeRequest.system.name,
            })}
          </DsHeading>
          <DsParagraph>
            <Trans
              i18nKey={'systemuser_request.system_description'}
              values={{
                systemName: changeRequest.system.name,
                partyName: reporteeData?.name,
              }}
            ></Trans>
          </DsParagraph>
          <div />
          <DsHeading
            level={3}
            data-size='xs'
          >
            {t('systemuser_change_request.rights_list_header')}
          </DsHeading>
          <ChangeList accessPackages={changeRequest.requiredAccessPackages} />
          <ChangeList
            accessPackages={changeRequest.unwantedAccessPackages}
            isRemove
          />
          <ChangeList resources={changeRequest.requiredRights} />
          <ChangeList
            resources={changeRequest.unwantedRights}
            isRemove
          />
          <DsParagraph>{t('systemuser_request.withdraw_consent_info')}</DsParagraph>
          <div>
            {acceptChangeRequestError && (
              <DelegationCheckError
                defaultError='systemuser_change_request.accept_error'
                error={acceptChangeRequestError as { data: ProblemDetail }}
              />
            )}
            {isRejectChangeRequestError && (
              <DsAlert
                data-color='danger'
                role='alert'
              >
                {t('systemuser_change_request.reject_error')}
              </DsAlert>
            )}
            <CreateSystemUserCheck reporteeData={reporteeData}>
              <ButtonRow>
                <DsButton
                  variant='primary'
                  aria-disabled={isActionButtonDisabled}
                  onClick={acceptChangeRequest}
                  loading={isAcceptingChangeRequest}
                >
                  {isAcceptingChangeRequest
                    ? t('systemuser_change_request.accept_loading')
                    : t('systemuser_change_request.accept')}
                </DsButton>
                <DsButton
                  variant='tertiary'
                  aria-disabled={isActionButtonDisabled}
                  onClick={rejectChangeRequest}
                  loading={isRejectingChangeRequest}
                >
                  {isRejectingChangeRequest
                    ? t('systemuser_change_request.reject_loading')
                    : t('systemuser_change_request.reject')}
                </DsButton>
              </ButtonRow>
            </CreateSystemUserCheck>
          </div>
        </>
      )}
    </RequestPageBase>
  );
};

interface ChangeListProps {
  resources?: ServiceResource[];
  accessPackages?: SystemUserAccessPackage[];
  isRemove?: boolean;
}
export const ChangeList = ({ resources, accessPackages, isRemove }: ChangeListProps) => {
  const { t } = useTranslation();

  let text = '';
  if (accessPackages?.length === 1) {
    text = isRemove
      ? t('systemuser_change_request.remove_accesspackage_single')
      : t('systemuser_change_request.add_accesspackage_single');
  }
  if ((accessPackages?.length ?? 0) > 1) {
    text = isRemove
      ? t('systemuser_change_request.remove_accesspackages')
      : t('systemuser_change_request.add_accesspackages');
  }
  if (resources?.length === 1) {
    text = isRemove
      ? t('systemuser_change_request.remove_right_single')
      : t('systemuser_change_request.add_right_single');
  }
  if ((resources?.length ?? 0) > 1) {
    text = isRemove
      ? t('systemuser_change_request.remove_rights')
      : t('systemuser_change_request.add_rights');
  }

  if (!text) {
    return null;
  }

  return (
    <div>
      <DsHeading
        level={4}
        data-size='2xs'
      >
        {text}
      </DsHeading>
      <RightsList
        hideHeadings
        resources={resources ?? []}
        accessPackages={accessPackages ?? []}
      />
    </div>
  );
};
