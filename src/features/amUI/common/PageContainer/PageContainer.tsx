import React from 'react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Link as DsLink } from '@digdir/designsystemet-react';
import classes from './PageContainer.module.css';
import { Link } from 'react-router';

interface PageContainerProps {
  children: React.ReactNode;
  pageActions?: React.ReactNode | React.ReactNode[];
  contentActions?: React.ReactNode | React.ReactNode[];
  backUrl?: string;
}

export const PageContainer = ({
  children,
  pageActions,
  contentActions,
  backUrl,
}: PageContainerProps) => {
  const { t } = useTranslation();
  return (
    <div className={classes.container}>
      <div className={classes.topActions}>
        <div className={classes.pageActions}>
          <DsLink
            asChild={true}
            data-size='md'
          >
            <Link to={backUrl ?? '..'}>
              <ArrowLeftIcon
                aria-hidden={true}
                fontSize='1.3rem'
              />
              {t('common.back')}
            </Link>
          </DsLink>
          {pageActions}
        </div>
        <div className={classes.contentActions}>{contentActions}</div>
      </div>
      <div className={classes.pageContent}>{children}</div>
    </div>
  );
};
