import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';
import { ReporteeInfo } from '@/rtk/features/userInfoApi';
import type { RegisteredSystem } from '../../types';
import classes from './RequestPageBase.module.css';
import { formatOrgNr } from '@/resources/utils/reporteeUtils';
import { RequestPageLayout } from '@/features/amUI/common/RequestPageLayout/RequestPageLayout';

interface RequestPageBaseProps {
  system?: RegisteredSystem;
  heading: string;
  reportee?: ReporteeInfo;
  isLoading?: boolean;
  error?: React.ReactNode;
  children: React.ReactNode | React.ReactNode[];
}

export const RequestPageBase = ({
  system,
  heading,
  reportee,
  isLoading,
  error,
  children,
}: RequestPageBaseProps): React.ReactNode => {
  const { t } = useTranslation();

  const account: { name: string; type: 'person' | 'company' } = {
    name: reportee?.name || '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  };

  return (
    <>
      <RequestPageLayout
        account={account}
        isLoading={isLoading ?? false}
        error={error}
        heading={
          <DsHeading
            level={1}
            data-size='lg'
          >
            {heading}
          </DsHeading>
        }
        body={!isLoading && !error && <div className={classes.vendorRequestBlock}>{children}</div>}
        footer={
          system && (
            <DsParagraph
              data-size='sm'
              className={classes.vendorInfo}
            >
              {t('systemuser_request.org_nr', {
                systemName: system.name,
                vendorName: system.systemVendorOrgName,
                vendorOrg: formatOrgNr(system.systemVendorOrgNumber),
              })}
            </DsParagraph>
          )
        }
      />
    </>
  );
};
