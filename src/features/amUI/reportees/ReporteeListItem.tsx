import type { ListItemProps } from '@altinn/altinn-components';
import { ListItem } from '@altinn/altinn-components';
import { useState } from 'react';
import cn from 'classnames';

import type { Reportee } from '@/rtk/features/userInfoApi';

import { ReporteeList } from './RepporteeList';
import classes from './ReporteePage.module.css';

interface ReporteeListItemProps extends ListItemProps {
  reportee: Reportee;
}

export const ReporteeListItem = ({ reportee, size = 'lg', ...props }: ReporteeListItemProps) => {
  const hasInheritingReportees = reportee.inheritingReportees.length > 0;
  const [isExpanded, setExpanded] = useState(false);
  return (
    <li className={cn(classes.reporteeList, classes.spacing_md)}>
      <ListItem
        {...props}
        size={size}
        title={reportee.name}
        description={reportee.unitType}
        avatar={{
          name: reportee.name,
          type: reportee.partyType === 'Organization' ? 'company' : 'person',
        }}
        expanded={isExpanded}
        collapsible={reportee.inheritingReportees.length > 0}
        onClick={() => {
          if (hasInheritingReportees) setExpanded(!isExpanded);
        }}
      />
      {hasInheritingReportees && isExpanded && (
        <ReporteeList
          reporteeList={[{ ...reportee, inheritingReportees: [] }, ...reportee.inheritingReportees]}
          size='sm'
          spacing='sm'
          indent
        />
      )}
    </li>
  );
};
