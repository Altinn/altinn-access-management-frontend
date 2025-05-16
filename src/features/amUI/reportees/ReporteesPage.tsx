import { DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './ReporteePage.module.css';
import { ReporteesList } from './ReporteesList';

export const ReporteesPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('reportees_page.page_title'));
  const { data: party } = useGetReporteePartyQuery();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
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
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
