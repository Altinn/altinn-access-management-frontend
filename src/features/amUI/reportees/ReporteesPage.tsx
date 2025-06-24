import { DsAlert, DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { useGetIsAdminQuery } from '@/rtk/features/userInfoApi';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AlertIfNotAvailableForUserType } from '../common/alertIfNotAvailableForUserType/AlertIfNotAvailableForUserType';
import { PageSkeleton } from '../common/PageSkeleton/PageSkeleton';

import classes from './ReporteePage.module.css';
import { ReporteesList } from './ReporteesList';

export const ReporteesPage = () => {
  const { t } = useTranslation();
  const { data: party } = useGetReporteePartyQuery();
  const { data: isAdmin, isLoading } = useGetIsAdminQuery();

  useDocumentTitle(t('reportees_page.page_title'));

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <AlertIfNotAvailableForUserType
          loadingIndicator={<PageSkeleton template={'detailsPage'} />}
        >
          {!isLoading && !isAdmin ? (
            <DsAlert data-color='warning'>
              {t('reportees_page.not_admin_alert', { name: party?.name || '' })}
            </DsAlert>
          ) : (
            <PartyRepresentationProvider
              fromPartyUuid={getCookie('AltinnPartyUuid')}
              actingPartyUuid={getCookie('AltinnPartyUuid')}
            >
              <div className={classes.reporteeListHeading}>
                <DsHeading
                  level={1}
                  data-size='md'
                >
                  {t('reportees_page.main_page_heading', { name: party?.name || '' })}
                </DsHeading>
              </div>
              <ReporteesList />
            </PartyRepresentationProvider>
          )}
        </AlertIfNotAvailableForUserType>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
