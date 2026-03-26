import { formatDateToNorwegian } from '@/resources/utils';
import { DsAlert, formatDisplayName, List, UserListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Request } from './types';

import classes from './RequestPage.module.css';
import { useRef, useState } from 'react';
import { SentRequestsModal } from '../userRightsPage/SingleRightsSection/PendingRequests';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { getCookie } from '@/resources/Cookie/CookieMethods';

interface SentRequestsTabPanelProps {
  requests: Request[] | undefined;
  count: number;
  isLoading: boolean;
  isError: boolean;
  emptyMessageKey: string;
}

export const SentRequestsTabPanel = ({
  requests,
  count,
  isLoading,
  isError,
  emptyMessageKey,
}: SentRequestsTabPanelProps) => {
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
          <SentRequests pendingRequests={requests} />
        )}
        {!isError && !isLoading && count === 0 && <div>{t(emptyMessageKey)}</div>}
      </List>
    </>
  );
};

interface SentRequestsProps {
  pendingRequests: Request[] | undefined;
}

const SentRequests = ({ pendingRequests }: SentRequestsProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [openAccessRequest, setOpenAccessRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { t } = useTranslation();
  return (
    <>
      {pendingRequests?.map((request) => {
        return (
          <UserListItem
            key={request.id}
            id={request.id}
            name={request.displayPartyName}
            type={request.displayPartyType}
            linkIcon
            description={`${request.description ? t(request.description) : t('request_page.waiting_for_number', { count: request.numberOfRequests })} (${formatDateToNorwegian(request.createdDate)})`}
            as={(props) => (
              <button
                {...props}
                onClick={() => {
                  setOpenAccessRequest(request);
                  setIsModalOpen(true);
                  modalRef.current?.showModal();
                }}
              />
            )}
            controls={
              <div className={classes.requestItemBadge}>{t('request_page.process_request')}</div>
            }
          />
        );
      })}
      <PartyRepresentationProvider
        fromPartyUuid={openAccessRequest?.partyUuid || ''}
        toPartyUuid={getCookie('AltinnPartyUuid')}
        actingPartyUuid={getCookie('AltinnPartyUuid')}
      >
        <SentRequestsModal
          modalRef={modalRef}
          toPartyUuid={openAccessRequest?.partyUuid || ''}
          heading={t('delegation_modal.request.sent_requests_modal_header', {
            partyName: formatDisplayName({
              fullName: openAccessRequest?.displayPartyName || '',
              type: openAccessRequest?.displayPartyType === 'person' ? 'person' : 'company',
            }),
          })}
          isModalOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            modalRef.current?.close();
          }}
        />
      </PartyRepresentationProvider>
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
