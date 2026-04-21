import React from 'react';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import {
  Button,
  formatDisplayName,
  List,
  SnackbarDuration,
  useSnackbar,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';
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
import { PendingRequestsDialog } from '../PendingRequestsDialog';

export const PendingPackageRequests = () => {
  const { t } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();

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
    <PendingRequestsDialog<EnrichedPackageRequestDto>
      count={sentPackageRequests.length}
      heading={t('delegation_modal.request.sent_requests_modal_header', {
        partyName,
      })}
      dialogClassName={classes.pendingRequestsModal}
      headingClassName={classes.pendingRequestsHeading}
      closeButtonClassName={classes.closeButton}
      backButtonClassName={classes.backButton}
      renderList={({ isSmallScreen, onSelect }) => (
        <PendingPackageRequestsList
          onSelect={onSelect}
          isSmallScreen={isSmallScreen}
        />
      )}
      renderSelected={(selectedRequest) => (
        <AccessPackageInfo
          accessPackage={selectedRequest.package}
          availableActions={[DelegationAction.REQUEST]}
        />
      )}
    />
  );
};

interface PendingPackageRequestsListProps {
  isSmallScreen: boolean;
  onSelect: (request: EnrichedPackageRequestDto) => void;
}

const PendingPackageRequestsList = ({
  isSmallScreen,
  onSelect,
}: PendingPackageRequestsListProps) => {
  const { t } = useTranslation();
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

  return (
    <>
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
              onSelect={() => onSelect(req)}
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
