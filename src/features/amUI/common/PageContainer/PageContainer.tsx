import React from 'react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
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
 * Back navigation strategy:
 * - If the user has internal navigation history, clicking back uses browser history
 *   (navigate(-1)) to preserve URL state like filters and tabs.
 * - If the user deep-linked directly to this page (no internal history), it falls back to `backUrl`.
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
  const location = useLocation();

  // Prefer the referrer URL passed via React Router state (preserves filters/tabs),
  // otherwise fall back to the static backUrl prop.
  const resolvedBackUrl = (location.state?.from as string) ?? backUrl;

  return (
    <div className={classes.container}>
      <div className={classes.topActions}>
        <div className={classes.pageActions}>
          {resolvedBackUrl ? (
            <DsLink
              asChild={true}
              data-size='md'
              data-color='neutral'
            >
              <Link to={resolvedBackUrl}>
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
          ) : undefined}
        </div>
        <div className={classes.contentActions}>{contentActions}</div>
      </div>
      <div className={classes.pageContent}>{children}</div>
    </div>
  );
};
