import { formatDateToNorwegian } from '@/resources/utils';
import { getConsentRequestUrl } from '@/routes/paths/consentPath';
import {
  getSystemUserRequestUrl,
  getSystemUserAgentRequestUrl,
} from '@/routes/paths/systemUserPath';
import { DsAlert, List, UserListItem } from '@altinn/altinn-components';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { RequestReviewModal } from './RequestReviewModal/RequestReviewModal';
import type { Request, RequestReviewModalCloseOptions } from './types';

import classes from './RequestPage.module.css';
import { amUIPath } from '@/routes/paths';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  RestoreFocusTarget,
  useRestoreFocus,
  useRestoreFocusContext,
} from '../common/RestoreFocus';

interface RequestsTabPanelProps {
  count: number;
  isLoading: boolean;
  isError: boolean;
  emptyMessageKey: string;
  children?: React.ReactNode;
}

export const RequestsTabPanel = ({
  count,
  isLoading,
  isError,
  emptyMessageKey,
  children,
}: RequestsTabPanelProps) => {
  const { t } = useTranslation();
  const restoreFocus = useRestoreFocus();

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      {isError && (
        <div className={classes.errorWrapper}>
          <DsAlert data-color='danger'>
            {count > 0
              ? t('request_page.error_partial_loading_requests')
              : t('request_page.error_loading_requests')}
          </DsAlert>
        </div>
      )}
      <RestoreFocusFallback>
        <List>
          {isLoading ? (
            <>
              <LoadingRequestListItem />
              <LoadingRequestListItem />
              <LoadingRequestListItem />
              <LoadingRequestListItem />
            </>
          ) : (
            <>{children}</>
          )}
          {!isError && !isLoading && count === 0 && (
            <div data-restore-focus-fallback>{t(emptyMessageKey)}</div>
          )}
        </List>
      </RestoreFocusFallback>
    </RestoreFocusProvider>
  );
};

interface PendingRequestsProps {
  pendingRequests: Request[] | undefined;
}

export const PendingRequests = ({ pendingRequests }: PendingRequestsProps) => {
  const { t } = useTranslation();
  const [openAccessRequest, setOpenAccessRequest] = useState<Request | null>(null);
  const [closedRequestFocus, setClosedRequestFocus] = useState<{
    id: string;
    waitForRequestRemoval: boolean;
  } | null>(null);
  const restoreFocus = useRestoreFocusContext();

  useEffect(() => {
    if (!closedRequestFocus || !restoreFocus) {
      return;
    }

    const requestStillPresent = pendingRequests?.some(
      (request) => request.id === closedRequestFocus.id,
    );
    if (closedRequestFocus.waitForRequestRemoval && requestStillPresent) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      restoreFocus.requestFocus(closedRequestFocus.id);
      setClosedRequestFocus(null);
    });

    return () => cancelAnimationFrame(frame);
  }, [closedRequestFocus, pendingRequests, restoreFocus]);

  const handleReviewModalClose = (options?: RequestReviewModalCloseOptions) => {
    if (openAccessRequest) {
      setClosedRequestFocus({
        id: openAccessRequest.id,
        waitForRequestRemoval: options?.waitForRequestRemoval ?? false,
      });
    }
    setOpenAccessRequest(null);
  };

  return (
    <>
      {pendingRequests?.map((request) => {
        const getRequestUrl = () => {
          if (request.type === 'consent')
            return getConsentRequestUrl(request.id, encodeURIComponent(`/${amUIPath.Requests}`));
          if (request.type === 'systemuser')
            return getSystemUserRequestUrl(request.id, encodeURIComponent(`/${amUIPath.Requests}`));
          if (request.type === 'agentsystemuser')
            return getSystemUserAgentRequestUrl(
              request.id,
              encodeURIComponent(`/${amUIPath.Requests}`),
            );
          return null;
        };
        const toUrl = getRequestUrl();
        return (
          <RestoreFocusTarget
            key={request.id}
            id={request.id}
          >
            <UserListItem
              id={request.id}
              name={request.displayPartyName}
              type={request.displayPartyType}
              subUnit={request.isSubUnit}
              titleAs='div'
              linkIcon
              description={`${request.description ? t(request.description) : t('request_page.asks_for_number', { count: request.numberOfRequests })} (${formatDateToNorwegian(request.createdDate)})`}
              as={(props) =>
                toUrl ? (
                  <Link
                    {...props}
                    to={toUrl}
                  />
                ) : (
                  <button
                    {...props}
                    onClick={() => setOpenAccessRequest(request)}
                  />
                )
              }
              controls={
                <div className={classes.requestItemBadge}>
                  {t('request_page.process_request', { count: request.numberOfRequests || 1 })}
                </div>
              }
            />
          </RestoreFocusTarget>
        );
      })}
      <RequestReviewModal
        request={openAccessRequest}
        onClose={handleReviewModalClose}
      />
    </>
  );
};

const LoadingRequestListItem = () => {
  return (
    <UserListItem
      id={''}
      name={'xxxxxxxxxxxx'}
      description='xxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      type={'person'}
      interactive={false}
      loading
    />
  );
};
