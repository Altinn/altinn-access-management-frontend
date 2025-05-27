import { DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AlertIfNotAvailableForUserType } from '../common/notAvailableAlert/NotAvailableAlert';

import classes from './ReporteePage.module.css';
import { ReporteesList } from './ReporteesList';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';

export const ReporteesPage = () => {
  const { t } = useTranslation();
  const { data: party } = useGetReporteePartyQuery();

  useDocumentTitle(t('reportees_page.page_title'));

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
        >
          <AlertIfNotAvailableForUserType>
            <div className={classes.reporteeListHeading}>
              <DsHeading
                level={1}
                data-size='md'
              >
                {t('reportees_page.main_page_heading', { name: party?.name || '' })}
              </DsHeading>
            </div>
            <ReporteesList />
          </AlertIfNotAvailableForUserType>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
