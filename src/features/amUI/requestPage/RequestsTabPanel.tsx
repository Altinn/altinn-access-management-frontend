import { formatDateToNorwegian } from '@/resources/utils';
import { getConsentRequestUrl } from '@/routes/paths/consentPath';
import {
  getSystemUserRequestUrl,
  getSystemUserAgentRequestUrl,
} from '@/routes/paths/systemUserPath';
import { Button, DsAlert, List, UserListItem } from '@altinn/altinn-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useRestoreFocusContext, useRestoreFocusTarget } from '../common/RestoreFocus';
import { RequestReviewModal } from './RequestReviewModal/RequestReviewModal';
import { Request } from './types';
import classes from './RequestPage.module.css';
import { amUIPath } from '@/routes/paths';
import { HandledRequestsSection } from './HandledRequestsSection';

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
  return (
    <>
      {isError && (
        <div className={classes.errorWrapper}>
          <DsAlert data-color='danger'>
            {count > 0
              ? t('request_page.error_partial_loading_requests')
              : t('request_page.error_loading_requests')}
          </DsAlert>
        </div>
      )}
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
        {!isError && !isLoading && count === 0 && <div>{t(emptyMessageKey)}</div>}
      </List>
    </>
  );
};

export const RequestListItem = (props: React.ComponentProps<typeof UserListItem>) => {
  useRestoreFocusTarget(props.id);
  return <UserListItem {...props} />;
};

interface PendingRequestsProps {
  pendingRequests: Request[] | undefined;
  handledRequests: Request[] | undefined;
}

const PAGE_SIZE = 8;

export const PendingRequests = ({ pendingRequests, handledRequests }: PendingRequestsProps) => {
  const { t } = useTranslation();
  const [openAccessRequest, setOpenAccessRequest] = useState<Request | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const restoreFocus = useRestoreFocusContext();

  const handleClose = () => {
    if (openAccessRequest) {
      restoreFocus?.requestFocus(openAccessRequest.id);
    }
    setOpenAccessRequest(null);
  };

  const paginatedRequests = pendingRequests?.slice(0, PAGE_SIZE * currentPage);
  const hasNextPage = (pendingRequests?.length ?? 0) > PAGE_SIZE * currentPage;
  return (
    <>
      {paginatedRequests?.map((request) => {
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
          <RequestListItem
            key={request.id}
            id={request.id}
            name={request.displayPartyName}
            type={request.displayPartyType}
            subUnit={request.isSubUnit}
            titleAs='span'
            linkIcon
            description={`${request.description ? t(request.description) : t('request_page.asks_for_number', { count: request.numberOfRequests })} (${formatDateToNorwegian(request.createdDate)})`}
            as={
              toUrl
                ? (props) => (
                    <Link
                      {...props}
                      to={toUrl}
                    />
                  )
                : 'button'
            }
            onClick={toUrl ? undefined : () => setOpenAccessRequest(request)}
            controls={
              <div className={classes.requestItemBadge}>
                {t('request_page.process_request', { count: request.numberOfRequests || 1 })}
              </div>
            }
          />
        );
      })}
      {hasNextPage && (
        <div className={classes.showMoreButtonContainer}>
          <Button
            className={classes.showMoreButton}
            onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
            variant='outline'
            size='md'
          >
            {t('common.show_more')}
          </Button>
        </div>
      )}
      <RequestReviewModal
        request={openAccessRequest}
        onClose={handleClose}
      />
      <HandledRequestsSection
        handledRequests={handledRequests}
        direction='received'
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
