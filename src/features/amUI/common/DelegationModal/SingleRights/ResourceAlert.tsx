import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, DsHeading, formatDisplayName } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { TechnicalErrorParagraphs } from '@/features/amUI/common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { DelegationAction } from '../EditModal';

export interface ResourceAlertProps {
  /*** The resource */
  resource: ServiceResource;
  /*** The technical error if one has occured */
  error?: { status: string; time: string } | null;
  /*** The reasons why each right is not delegable */
  rightReasons?: string[];
  /** Optional className for custom styling */
  className?: string;
  /** Optional list of available actions */
  availableActions?: DelegationAction[];
}

export const ResourceAlert = ({
  resource,
  error,
  rightReasons,
  className,
  availableActions,
}: ResourceAlertProps) => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();
  let headingText = '';
  let content = null;
  let color = 'warning';

  const isRequest = availableActions?.includes(DelegationAction.REQUEST);
  const isApprove = availableActions?.includes(DelegationAction.APPROVE);

  if (resource.delegable === false) {
    headingText = isRequest
      ? t('delegation_modal.request.cannot_request_right')
      : t('delegation_modal.service_error.general_heading');
    content = (
      <DsParagraph>
        {t('delegation_modal.service_error.undelegable_service', {
          resourceOwner: resource.resourceOwnerName,
        })}
      </DsParagraph>
    );
  } else if (error) {
    headingText = t('delegation_modal.service_error.technical_error_heading');
    color = 'danger';
    content = (
      <TechnicalErrorParagraphs
        status={error.status}
        time={error.time}
        additionalContext={resource.identifier ? `resource: ${resource.identifier}` : undefined}
      />
    );
  } else if (rightReasons) {
    if (
      rightReasons.every(
        (reason) =>
          reason === ErrorCode.MissingSrrRightAccess ||
          reason === ErrorCode.AccessListValidationFail,
      )
    ) {
      headingText = t('delegation_modal.service_error.general_heading');
      content = (
        <DsParagraph>
          {t('delegation_modal.service_error.access_list_service', {
            resourceOwner: resource.resourceOwnerName,
            reportee: formatDisplayName({
              fullName: reportee?.name ?? '',
              type: reportee?.organizationNumber ? 'company' : 'person',
            }),
          })}
        </DsParagraph>
      );
    } else if (isApprove && rightReasons.length > 0) {
      headingText = t('delegation_modal.service_error.approve_heading');
      content = (
        <DsParagraph>{t('delegation_modal.service_error.missing_approve_rights')}</DsParagraph>
      );
    } else {
      headingText = t('delegation_modal.service_error.general_heading');
      content = <DsParagraph>{t('delegation_modal.service_error.missing_rights')}</DsParagraph>;
    }
  }
  return (
    <DsAlert
      data-color={color}
      className={className}
    >
      <DsHeading
        level={2}
        data-size='2xs'
      >
        {headingText}
      </DsHeading>
      {content}
    </DsAlert>
  );
};
