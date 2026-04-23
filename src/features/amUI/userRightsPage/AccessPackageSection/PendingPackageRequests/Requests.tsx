import { useRef, useState } from 'react';
import { HandshakeIcon } from '@navikt/aksel-icons';
import { formatDisplayName, ListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { usePartyRepresentation } from '../../../common/PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';
import { useGetSentRequestsQuery } from '@/rtk/features/requestApi';
import { getRequestPartyQueryParams } from '@/resources/utils/singleRightRequestUtils';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import { PendingPackageRequestsModal } from './RequestsModal';

export const PendingPackageRequests = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const { actingParty, fromParty } = usePartyRepresentation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: sentPackageRequests = [] } = useGetSentRequestsQuery(
    {
      ...getRequestPartyQueryParams(actingParty?.partyUuid, fromParty?.partyUuid),
      type: 'package',
      status: ['Pending'],
    },
    { skip: !actingParty?.partyUuid || !fromParty?.partyUuid },
  );

  const heading = t('delegation_modal.request.sent_requests_modal_header', {
    partyName: formatDisplayName({
      fullName: fromParty?.name || '',
      type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
    }),
  });

  return (
    <>
      <PendingPackageRequestsModal
        modalRef={modalRef}
        isModalOpen={isModalOpen}
        heading={heading}
        onClose={() => setIsModalOpen(false)}
      />
      {sentPackageRequests.length > 0 && (
        <ListItem
          title={t('delegation_modal.request.sent_requests_item')}
          description={t('delegation_modal.request.active_access_request', {
            count: sentPackageRequests.length,
          })}
          icon={HandshakeIcon}
          linkIcon
          color='neutral'
          variant='tinted'
          border='solid'
          interactive
          as='button'
          badge={
            isSmallScreen ? undefined : <div>{t('delegation_modal.request.view_requests')}</div>
          }
          onClick={() => {
            setIsModalOpen(true);
            modalRef.current?.showModal();
          }}
        />
      )}
    </>
  );
};
