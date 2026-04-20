import React, { useRef, useState } from 'react';
import { ArrowLeftIcon, HandshakeIcon, MinusCircleIcon, PackageIcon } from '@navikt/aksel-icons';
import { Icon } from '@altinn/altinn-components';
import {
  DsButton,
  DsDialog,
  DsHeading,
  DsParagraph,
  formatDisplayName,
  List,
  ListItem,
  ResourceListItem,
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
import { ResourceList } from '../../common/ResourceList/ResourceList';

import classes from './PendingRequests.module.css';
import { PackageItem } from '../../common/AccessPackageList/PackageItem';
import { SkeletonAccessPackageList } from '../../common/AccessPackageList/SkeletonAccessPackageList';

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

  return (
    <>
      <SentPackageRequestsModal
        isModalOpen={isModalOpen}
        modalRef={modalRef}
        heading={t('delegation_modal.request.sent_requests_modal_header', {
          partyName: formatDisplayName({
            fullName: fromParty?.name || '',
            type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
          }),
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
        <DsButton
          variant='tertiary'
          className={classes.backButton}
          onClick={() => setSelectedRequest(null)}
        >
          <ArrowLeftIcon />
          {t('common.back')}
        </DsButton>
        <div className={classes.packageInfoHeader}>
          <Icon
            size='md'
            svgElement={PackageIcon}
          />
          <DsHeading
            data-size='xs'
            level={1}
            className={classes.pendingRequestsHeading}
          >
            {selectedRequest.package?.name}
          </DsHeading>
        </div>
        {selectedRequest.package?.description && (
          <DsParagraph
            data-size={isSmallScreen ? 'sm' : 'md'}
            variant='long'
          >
            {selectedRequest.package.description}
          </DsParagraph>
        )}
        <DsHeading
          data-size='2xs'
          level={2}
        >
          {t('delegation_modal.package_services', {
            count: selectedRequest.package?.resources?.length ?? 0,
            name: selectedRequest.package?.name,
          })}
        </DsHeading>
        <ResourceList
          resources={selectedRequest.package?.resources ?? []}
          enableSearch={false}
          showDetails={false}
          interactive={false}
          size={isSmallScreen ? 'sm' : 'md'}
          as='div'
        />
        <DsButton
          data-color='danger'
          loading={isWithdrawing}
          disabled={isWithdrawing}
          onClick={() => handleDelete(selectedRequest)}
          className={classes.closeButton}
        >
          {t('delegation_modal.request.delete_request')}
        </DsButton>
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
                <DsButton
                  variant='tertiary'
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
                </DsButton>
              }
            />
          ))}
        </List>
      )}
    </>
  );
};
