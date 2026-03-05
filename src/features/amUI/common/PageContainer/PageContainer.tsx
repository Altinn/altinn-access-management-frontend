import React from 'react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Button, DsLink } from '@altinn/altinn-components';

import classes from './PageContainer.module.css';

/**
 * Layout component that provides consistent structure for pages.
 * It includes support for navigation actions, page-specific actions, and content-specific actions.
 * The component is designed to be used as a wrapper around the main content of a page.
 *
 *
 * @param {React.ReactNode} children - The main content of the page.
 * @param {React.ReactNode | React.ReactNode[]} [contentActions] - Actions or elements to display in the content actions area.
 *
 * Back navigation strategy:
 * - If the user has internal navigation history, clicking back uses browser history
 *   (navigate(-1)) to preserve URL state like filters and tabs.
 * - If the user deep-linked directly to this page (no internal history), the
 *   <Link to={backUrl}> navigates to the fallback URL normally.
 *
 * @param {string} [backUrl] - Fallback URL when there is no internal navigation history (e.g. deep links).
 * @param {() => void} [onNavigateBack] - Callback function to handle custom back navigation logic. (only used if `backUrl` is not provided)
 *
 * @example
 * <PageContainer
 *   backUrl="/dashboard"
 *   contentActions={<Button>Cancel</Button>}
 * >
 *   <p>This is the main content of the page.</p>
 * </PageContainer>
 */

interface PageContainerProps {
  children: React.ReactNode;
  contentActions?: React.ReactNode | React.ReactNode[];
  backUrl?: string;
  onNavigateBack?: () => void;
}

export const PageContainer = ({
  children,
  contentActions,
  backUrl,
  onNavigateBack,
}: PageContainerProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // If the user navigated here from within the app, use browser history to go back,
  // preserving URL state (filters, tabs). Otherwise render a <Link> to the fallback backUrl.
  const hasInternalHistory = (window.history.state?.idx ?? 0) > 0;

  const backButton = hasInternalHistory ? (
    <Button
      onClick={() => navigate(-1)}
      variant='tertiary'
      data-color='neutral'
    >
      <ArrowLeftIcon aria-hidden={true} />
      {t('common.back')}
    </Button>
  ) : backUrl ? (
    <DsLink
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
    </DsLink>
  ) : onNavigateBack ? (
    <Button
      onClick={onNavigateBack}
      variant='tertiary'
      data-color='neutral'
    >
      <ArrowLeftIcon aria-hidden={true} />
      {t('common.back')}
    </Button>
  ) : undefined;

  return (
    <div className={classes.container}>
      <div className={classes.topActions}>
        <div className={classes.pageActions}>{backButton}</div>
        <div className={classes.contentActions}>{contentActions}</div>
      </div>
      <div className={classes.pageContent}>{children}</div>
    </div>
  );
};
