import { getCookie } from '@/resources/Cookie/CookieMethods';

import { AreaList } from '../common/AreaList/AreaList';

interface ReporteeAccessPackageSectionProps {
  reporteeUuid?: string;
}

export const ReporteeAccessPackageSection = ({
  reporteeUuid,
}: ReporteeAccessPackageSectionProps) => {
  return (
    <AreaList
      fromPartyUuid={reporteeUuid ?? ''}
      toPartyUuid={getCookie('AltinnPartyUuid')}
      editable={false}
    />
  );
};
