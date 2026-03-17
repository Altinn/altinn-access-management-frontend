import { formatDateToNorwegian } from '@/resources/utils';
import { getConsentRequestUrl } from '@/routes/paths/consentPath';
import {
  getSystemUserRequestUrl,
  getSystemUserAgentRequestUrl,
} from '@/routes/paths/systemUserPath';
import { DsAlert, List, UserListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Request } from './types';

import classes from './RequestPage.module.css';

interface RequestsTabPanelProps {
  requests: Request[] | undefined;
  count: number;
  isLoading: boolean;
  isError: boolean;
  emptyMessageKey: string;
}

export const RequestsTabPanel = ({
  requests,
  count,
  isLoading,
  isError,
  emptyMessageKey,
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
          <PendingRequests pendingRequests={requests} />
        )}
        {!isError && !isLoading && count === 0 && <div>{t(emptyMessageKey)}</div>}
      </List>
    </>
  );
};

interface PendingRequestsProps {
  pendingRequests: Request[] | undefined;
}

const PendingRequests = ({ pendingRequests }: PendingRequestsProps) => {
  const { t } = useTranslation();
  return (
    <>
      {pendingRequests?.map((request) => {
        let toUrl = '';
        if (request.type === 'consent') {
          toUrl = getConsentRequestUrl(request.id, 'landingpage');
        } else if (request.type === 'systemuser') {
          toUrl = getSystemUserRequestUrl(request.id, 'landingpage');
        } else if (request.type === 'agentsystemuser') {
          toUrl = getSystemUserAgentRequestUrl(request.id, 'landingpage');
        }
        return (
          <UserListItem
            key={request.id}
            id={request.id}
            name={request.displayPartyName}
            type={request.displayPartyType}
            linkIcon
            description={`${request.description ? t(request.description) : t('request_page.asks_for_number', { count: request.numberOfRequests })} (${formatDateToNorwegian(request.createdDate)})`}
            as={(props) => (
              <Link
                {...props}
                to={toUrl}
              />
            )}
            controls={
              <div className={classes.requestItemBadge}>{t('request_page.process_request')}</div>
            }
          />
        );
      })}
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
