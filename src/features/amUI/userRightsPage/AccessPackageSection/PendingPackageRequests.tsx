import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, HandshakeIcon, MinusCircleIcon } from '@navikt/aksel-icons';
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
import {
  useGetEnrichedSentPackageRequestsQuery,
  useGetSentRequestsQuery,
  useWithdrawRequestMutation,
  type EnrichedPackageRequest,
} from '@/rtk/features/requestApi';
import { useAutoFocusRef } from '@/resources/hooks/useAutoFocusRef';
import { getRequestPartyQueryParams } from '@/resources/utils/singleRightRequestUtils';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import { PackageItem } from '../../common/AccessPackageList/PackageItem';
import { SkeletonAccessPackageList } from '../../common/AccessPackageList/SkeletonAccessPackageList';
import { AccessPackageInfo } from '../../common/DelegationModal/AccessPackages/AccessPackageInfo';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import classes from './PendingPackageRequests.module.css';

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

interface PendingPackageRequestsModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  isModalOpen: boolean;
  heading: string;
  onClose: () => void;
}

const PendingPackageRequestsModal = ({
  modalRef,
  isModalOpen,
  heading,
  onClose,
}: PendingPackageRequestsModalProps) => {
  const { t } = useTranslation();
  const [selectedRequest, setSelectedRequest] = useState<EnrichedPackageRequest | null>(null);

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      onClose={() => {
        setSelectedRequest(null);
        onClose();
      }}
      className={classes.dialog}
    >
      <SnackbarProvider>
        {isModalOpen && (
          <PendingPackageRequestsList
            heading={heading}
            selectedRequest={selectedRequest}
            setSelectedRequest={setSelectedRequest}
          />
        )}
        <Snackbar />
      </SnackbarProvider>
      {!selectedRequest && (
        <DsButton
          variant='primary'
          className={classes.closeButton}
          onClick={() => modalRef.current?.close()}
        >
          {t('common.close')}
        </DsButton>
      )}
    </DsDialog>
  );
};

interface PendingPackageRequestsListProps {
  heading: string;
  selectedRequest: EnrichedPackageRequest | null;
  setSelectedRequest: (request: EnrichedPackageRequest | null) => void;
}

const PendingPackageRequestsList = ({
  heading,
  selectedRequest,
  setSelectedRequest,
}: PendingPackageRequestsListProps) => {
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const { actingParty, fromParty } = usePartyRepresentation();
  const { openSnackbar } = useSnackbar();
  const headingRef = useAutoFocusRef<HTMLHeadingElement>();
  const backButtonRef = useAutoFocusRef<HTMLButtonElement>();

  const [loadingByRequestId, setLoadingByRequestId] = useState<Record<string, boolean>>({});

  const {
    data: enrichedRequests = [],
    isLoading,
    isFetching: isRefetching,
  } = useGetEnrichedSentPackageRequestsQuery(
    {
      ...getRequestPartyQueryParams(actingParty?.partyUuid, fromParty?.partyUuid),
      status: ['Pending'],
    },
    { skip: !actingParty?.partyUuid || !fromParty?.partyUuid },
  );

  useEffect(() => {
    if (!isRefetching) {
      setLoadingByRequestId({});
    }
  }, [isRefetching]);

  const [withdrawRequest] = useWithdrawRequestMutation();

  const handleDelete = async (request: EnrichedPackageRequest) => {
    setLoadingByRequestId((prev) => ({ ...prev, [request.id]: true }));
    try {
      await withdrawRequest({
        party: actingParty?.partyUuid ?? '',
        id: request.id,
      }).unwrap();
      openSnackbar({
        message: t('delegation_modal.request.withdraw_request_success', {
          resource: request.package?.name,
        }),
        color: 'success',
      });
    } catch {
      setLoadingByRequestId((prev) => ({ ...prev, [request.id]: false }));
      openSnackbar({
        message: t('delegation_modal.request.withdraw_request_error', {
          resource: request.package?.name,
        }),
        color: 'danger',
        duration: SnackbarDuration.infinite,
      });
    }
  };

  return (
    <>
      {selectedRequest ? (
        <>
          <DsButton
            ref={backButtonRef}
            variant='tertiary'
            className={classes.backButton}
            onClick={() => setSelectedRequest(null)}
          >
            <ArrowLeftIcon />
            {t('common.back')}
          </DsButton>
          <AccessPackageInfo
            accessPackage={selectedRequest.package}
            availableActions={[DelegationAction.REQUEST]}
          />
        </>
      ) : (
        <>
          <DsHeading
            ref={headingRef}
            tabIndex={-1}
            data-size='xs'
            level={1}
            className={classes.heading}
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
                  partyType={fromParty?.partyTypeName ?? PartyType.Organization}
                  as='button'
                  onSelect={() => setSelectedRequest(req)}
                  controls={
                    <Button
                      variant='tertiary'
                      data-size='sm'
                      aria-label={t('common.delete_request_for', {
                        poa_object: req.package?.name,
                      })}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(req);
                      }}
                      disabled={loadingByRequestId[req.id]}
                      loading={loadingByRequestId[req.id]}
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
      )}
    </>
  );
};
