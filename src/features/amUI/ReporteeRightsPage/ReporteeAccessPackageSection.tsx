import { useGetReporteeDelegationsQuery } from '@/rtk/features/accessPackageApi';

import { AreaList } from '../common/AreaList/AreaList';

interface ReporteeAccessPackageSectionProps {
  reporteeUuid?: string;
}

export const ReporteeAccessPackageSection = ({
  reporteeUuid,
}: ReporteeAccessPackageSectionProps) => {
  const { data: activeDelegations, isLoading: loadingDelegations } = useGetReporteeDelegationsQuery(
    reporteeUuid ?? '',
  );

  return (
    <AreaList
      isLoading={loadingDelegations}
      activeDelegations={activeDelegations}
      onSelect={() => {}}
      onRevoke={() => {}}
    />
  );
};
