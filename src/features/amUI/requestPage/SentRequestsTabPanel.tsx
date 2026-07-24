import { formatDateToNorwegian } from '@/resources/utils';
import { Button, formatDisplayName, List } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Request } from './types';

import classes from './RequestPage.module.css';
import { useRef, useState } from 'react';
import { useRestoreFocusContext } from '../common/RestoreFocus';
import { RequestListItem } from './RequestsTabPanel';
import { SentRequestsCombinedModal } from './SentRequestsCombinedModal';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PartyType } from '@/rtk/features/userInfoApi';
import { HandledRequestsSection } from './HandledRequestsSection';

interface SentRequestsTabPanelProps {
  pendingRequests: Request[] | undefined;
  handledRequests: Request[] | undefined;
}

const PAGE_SIZE = 8;

export const SentRequestsTabPanel = ({
  pendingRequests,
  handledRequests,
}: SentRequestsTabPanelProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [openAccessRequest, setOpenAccessRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const restoreFocus = useRestoreFocusContext();

  const handleClose = () => {
    if (openAccessRequest) {
      restoreFocus?.requestFocus(openAccessRequest.id);
    }
    setIsModalOpen(false);
  };

  const paginatedRequests = pendingRequests?.slice(0, PAGE_SIZE * currentPage);
  const hasNextPage = (pendingRequests?.length ?? 0) > PAGE_SIZE * currentPage;

  const { t } = useTranslation();
  return (
    <>
      <List>
        {paginatedRequests?.map((request) => {
          return (
            <RequestListItem
              key={request.id}
              id={request.id}
              name={request.displayPartyName}
              type={request.displayPartyType}
              subUnit={request.isSubUnit}
              titleAs='span'
              linkIcon
              description={`${request.description ? t(request.description) : t('request_page.waiting_for_number', { count: request.numberOfRequests })} (${formatDateToNorwegian(request.createdDate)})`}
              as='button'
              onClick={() => {
                setOpenAccessRequest(request);
                setIsModalOpen(true);
                modalRef.current?.showModal();
              }}
              controls={
                <div className={classes.requestItemBadge}>
                  {t('request_page.view_request', { count: request.numberOfRequests })}
                </div>
              }
            />
          );
        })}
      </List>
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
      <PartyRepresentationProvider
        fromPartyOverride={{
          partyId: 0,
          partyUuid: openAccessRequest?.partyUuid || '',
          name: openAccessRequest?.displayPartyName || '',
          partyTypeName:
            openAccessRequest?.displayPartyType == 'person'
              ? PartyType.Person
              : PartyType.Organization,
        }}
        toPartyUuid={getCookie('AltinnPartyUuid')}
        actingPartyUuid={getCookie('AltinnPartyUuid')}
      >
        <SentRequestsCombinedModal
          modalRef={modalRef}
          heading={t('delegation_modal.request.sent_requests_modal_header', {
            partyName: formatDisplayName({
              fullName: openAccessRequest?.displayPartyName || '',
              type: openAccessRequest?.displayPartyType === 'person' ? 'person' : 'company',
            }),
          })}
          isModalOpen={isModalOpen}
          onClose={handleClose}
        />
      </PartyRepresentationProvider>
      <HandledRequestsSection
        handledRequests={handledRequests}
        direction='sent'
      />
    </>
  );
};
