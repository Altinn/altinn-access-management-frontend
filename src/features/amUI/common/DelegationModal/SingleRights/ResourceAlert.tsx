import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, DsHeading, formatDisplayName } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { TechnicalErrorParagraphs } from '@/features/amUI/common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

export interface ResourceAlertProps {
  /*** The resource */
  resource: ServiceResource;
  /*** The technical error if one has occured */
  error?: { status: string; time: string } | null;
  /*** The reasons why each right is not delegable */
  rightReasons?: string[];
  /** Optional className for custom styling */
  className?: string;
}

export const ResourceAlert = ({ resource, error, rightReasons, className }: ResourceAlertProps) => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();
  let headingText = '';
  let content = null;
  let color = 'warning';

  if (resource.delegable === false) {
    headingText = t('delegation_modal.service_error.general_heading');
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
