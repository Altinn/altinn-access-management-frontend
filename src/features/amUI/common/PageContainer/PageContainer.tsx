import React from 'react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Link as DSLink } from '@digdir/designsystemet-react';
import classes from './PageContainer.module.css';
import { Link } from 'react-router';
import { Button } from '@altinn/altinn-components';

/**
 * Layout component that provides consistent structure for pages.
 * It includes support for navigation actions, page-specific actions, and content-specific actions.
 * The component is designed to be used as a wrapper around the main content of a page.
 *
 *
 * @param {React.ReactNode} children - The main content of the page.
 * @param {React.ReactNode | React.ReactNode[]} [pageActions] - Actions or elements to display in the page actions area.
 * @param {React.ReactNode | React.ReactNode[]} [contentActions] - Actions or elements to display in the content actions area.
 * @param {string} [backUrl] - URL to navigate back to when the back button is clicked. (the preferred way to handle back navigation)
 * @param {() => void} [onNavigateBack] - Callback function to handle custom back navigation logic. (this will only be called if `backUrl` is not provided)
 *
 * @example
 * <PageContainer
 *   backUrl="/dashboard"
 *   pageActions={<Button>Save</Button>}
 *   contentActions={<Button>Cancel</Button>}
 * >
 *   <p>This is the main content of the page.</p>
 * </PageContainer>
 */

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
          {backUrl ? (
            <DSLink
              asChild={true}
              data-size='md'
              data-color='neutral'
            >
              <Link to={backUrl}>
                <ArrowLeftIcon
                  aria-hidden={true}
                  fontSize='1.3rem'
                />
                {t('common.back')}
              </Link>
            </DSLink>
          ) : onNavigateBack ? (
            <Button
              onClick={onNavigateBack}
              variant='text'
              icon={ArrowLeftIcon}
              data-color='neutral'
            >
              {t('common.back')}
            </Button>
          ) : undefined}
          {pageActions}
        </div>
        <div className={classes.contentActions}>{contentActions}</div>
      </div>
      <div className={classes.pageContent}>{children}</div>
    </div>
  );
};
