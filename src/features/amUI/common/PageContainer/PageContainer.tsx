import React from 'react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Link as DSLink } from '@digdir/designsystemet-react';
import classes from './PageContainer.module.css';
import { Link } from 'react-router';
import { Button } from '@altinn/altinn-components';

interface PageContainerProps {
  children: React.ReactNode;
  pageActions?: React.ReactNode | React.ReactNode[];
  contentActions?: React.ReactNode | React.ReactNode[];
  backUrl?: string;
  onNavigateBack?: () => void;
}

export const PageContainer = ({
  children,
  pageActions,
  contentActions,
  backUrl,
  onNavigateBack,
}: PageContainerProps) => {
  const { t } = useTranslation();

  return (
    <div className={classes.container}>
      <div className={classes.topActions}>
        <div className={classes.pageActions}>
          {onNavigateBack ? (
            <Button
              onClick={onNavigateBack}
              variant='text'
              size='sm'
              icon={ArrowLeftIcon}
            >
              {t('common.back')}
            </Button>
          ) : (
            <DSLink
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
            </DSLink>
          )}
          {pageActions}
        </div>
        <div className={classes.contentActions}>{contentActions}</div>
      </div>
      <div className={classes.pageContent}>{children}</div>
    </div>
  );
};
