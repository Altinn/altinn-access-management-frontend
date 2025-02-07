import cn from 'classnames';
import { useMemo } from 'react';

import type { Reportee } from '@/rtk/features/userInfoApi';

import { ReporteeListItem } from './ReporteeListItem';
import classes from './ReporteePage.module.css';

interface ReporteeListProps {
  reporteeList: Reportee[];
  spacing?: 'sm' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg';
  indent?: boolean;
}

export const ReporteeList = ({ reporteeList, size, spacing, indent }: ReporteeListProps) => {
  const sortedReportees = useMemo(() => {
    return [...reporteeList].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }, [reporteeList]);

  return (
    <ul
      className={cn(
        classes.reporteeList,
        classes[`spacing_${spacing || 'md'}`],
        indent ? classes.indent : '',
      )}
    >
      {sortedReportees?.map((reportee) => (
        <ReporteeListItem
          size={size}
          key={reportee.partyUuid}
          reportee={reportee}
        />
      ))}
    </ul>
  );
};
