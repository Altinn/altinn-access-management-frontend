import { formatDateToNorwegian } from '@/resources/utils';
import { formatDisplayName, UserListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import type { Request, RequestReviewModalCloseOptions } from './types';

import classes from './RequestPage.module.css';
import { useEffect, useRef, useState } from 'react';
import { SentRequestsCombinedModal } from './SentRequestsCombinedModal';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PartyType } from '@/rtk/features/userInfoApi';
import { RestoreFocusTarget, useRestoreFocusContext } from '../common/RestoreFocus';

interface SentRequestsTabPanelProps {
  pendingRequests: Request[] | undefined;
}

export const SentRequestsTabPanel = ({ pendingRequests }: SentRequestsTabPanelProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [openAccessRequest, setOpenAccessRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [closedRequestFocus, setClosedRequestFocus] = useState<{
    id: string;
    waitForRequestRemoval: boolean;
  } | null>(null);
  const restoreFocus = useRestoreFocusContext();

  const { t } = useTranslation();

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

  const handleModalClose = (options?: RequestReviewModalCloseOptions) => {
    if (openAccessRequest) {
      setClosedRequestFocus({
        id: openAccessRequest.id,
        waitForRequestRemoval: options?.waitForRequestRemoval ?? false,
      });
    }
    setIsModalOpen(false);
    setOpenAccessRequest(null);
  };

  return (
    <>
      {pendingRequests?.map((request) => {
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
                <div className={classes.requestItemBadge}>
                  {t('request_page.view_request', { count: request.numberOfRequests })}
                </div>
              }
            />
          </RestoreFocusTarget>
        );
      })}
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
          onClose={handleModalClose}
        />
      </PartyRepresentationProvider>
    </>
  );
};
