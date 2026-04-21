import React, { useRef, useState } from 'react';
import { ArrowLeftIcon, HandshakeIcon, MinusCircleIcon, PackageIcon } from '@navikt/aksel-icons';
import {
  Button,
  DsButton,
  DsDialog,
  DsHeading,
  formatDisplayName,
  List,
  ListItem,
  Snackbar,
  SnackbarDuration,
  SnackbarProvider,
  useSnackbar,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import {
  useGetEnrichedSentPackageRequestsQuery,
  useGetSentRequestsQuery,
  useWithdrawRequestMutation,
  type EnrichedPackageRequestDto,
} from '@/rtk/features/requestApi';
import { getRequestPartyQueryParams } from '@/resources/utils/singleRightRequestUtils';

import classes from './PendingRequests.module.css';
import { PackageItem } from '../../common/AccessPackageList/PackageItem';
import { SkeletonAccessPackageList } from '../../common/AccessPackageList/SkeletonAccessPackageList';
import { AccessPackageInfo } from '../../common/DelegationModal/AccessPackages/AccessPackageInfo';
import { DelegationAction } from '../../common/DelegationModal/EditModal';

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

  const partyName = formatDisplayName({
    fullName: fromParty?.name || '',
    type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });

  return (
    <>
      <SentPackageRequestsModal
        isModalOpen={isModalOpen}
        modalRef={modalRef}
        heading={t('delegation_modal.request.sent_requests_modal_header', {
          partyName,
        })}
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

interface SentPackageRequestsModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  isModalOpen: boolean;
  heading: string;
  onClose: () => void;
}

export const SentPackageRequestsModal = ({
  modalRef,
  isModalOpen,
  onClose,
  heading,
}: SentPackageRequestsModalProps) => {
  const { t } = useTranslation();
  const [selectedRequest, setSelectedRequest] = useState<EnrichedPackageRequestDto | null>(null);

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      onClose={() => {
        setSelectedRequest(null);
        onClose();
      }}
      className={classes.pendingRequestsModal}
    >
      {isModalOpen && (
        <SnackbarProvider>
          <PendingPackageRequestsList
            heading={heading}
            selectedRequest={selectedRequest}
            setSelectedRequest={setSelectedRequest}
          />
          <Snackbar />
        </SnackbarProvider>
      )}
      {!selectedRequest && (
        <Button
          variant='primary'
          className={classes.closeButton}
          onClick={() => modalRef.current?.close()}
        >
          {t('common.close')}
        </Button>
      )}
    </DsDialog>
  );
};

interface PendingPackageRequestsListProps {
  selectedRequest: EnrichedPackageRequestDto | null;
  heading: string;
  setSelectedRequest: (request: EnrichedPackageRequestDto | null) => void;
}

const PendingPackageRequestsList = ({
  selectedRequest,
  heading,
  setSelectedRequest,
}: PendingPackageRequestsListProps) => {
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const { actingParty, fromParty } = usePartyRepresentation();
  const { openSnackbar } = useSnackbar();

  const { data: enrichedRequests = [], isLoading } = useGetEnrichedSentPackageRequestsQuery(
    {
      ...getRequestPartyQueryParams(actingParty?.partyUuid, fromParty?.partyUuid),
      status: ['Pending'],
    },
    { skip: !actingParty?.partyUuid || !fromParty?.partyUuid },
  );

  const [withdrawRequest, { isLoading: isWithdrawing }] = useWithdrawRequestMutation();

  const handleDelete = async (request: EnrichedPackageRequestDto) => {
    try {
      await withdrawRequest({
        party: actingParty?.partyUuid ?? '',
        id: request.id,
      }).unwrap();
      if (selectedRequest?.id === request.id) setSelectedRequest(null);
      openSnackbar({
        message: t('delegation_modal.request.withdraw_request_success', {
          resource: request.package?.name,
        }),
        color: 'success',
      });
    } catch {
      openSnackbar({
        message: t('delegation_modal.request.withdraw_request_error', {
          resource: request.package?.name,
        }),
        color: 'danger',
        duration: SnackbarDuration.infinite,
      });
    }
  };

  if (selectedRequest) {
    return (
      <>
        <Button
          variant='tertiary'
          onClick={() => setSelectedRequest(null)}
          className={classes.backButton}
        >
          <ArrowLeftIcon />
          {t('common.back')}
        </Button>
        <AccessPackageInfo
          accessPackage={selectedRequest.package}
          availableActions={[DelegationAction.REQUEST]}
        />
      </>
    );
  }

  return (
    <>
      <DsHeading
        data-size='xs'
        level={1}
        className={classes.pendingRequestsHeading}
      >
        {heading}
      </DsHeading>
      {isLoading ? (
        <SkeletonAccessPackageList />
      ) : (
        <List>
          {enrichedRequests.map((req) => (
            <PackageItem
              key={req.id}
              pkg={req.package}
              partyType={PartyType.Person}
              as='button'
              onSelect={() => setSelectedRequest(req)}
              controls={
                <Button
                  variant='tertiary'
                  data-size='sm'
                  aria-label={t('common.delete_request_for', { poa_object: req.package?.name })}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(req);
                  }}
                  disabled={isWithdrawing}
                  loading={isWithdrawing}
                >
                  <MinusCircleIcon />
                  {isSmallScreen ? '' : t('common.delete')}
                </Button>
              }
            />
          ))}
        </List>
      )}
    </>
  );
};
