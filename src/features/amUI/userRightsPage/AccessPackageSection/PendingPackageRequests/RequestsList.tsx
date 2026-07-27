import { useEffect, useState } from 'react';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { Button, List, useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { usePartyRepresentation } from '../../../common/PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';
import {
  useGetEnrichedSentPackageRequestsQuery,
  useWithdrawRequestMutation,
  type EnrichedPackageRequest,
} from '@/rtk/features/requestApi';
import { useRestoreFocusOnDataChange } from '../../../common/RestoreFocus';
import { getRequestPartyQueryParams } from '@/resources/utils/singleRightRequestUtils';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import { PackageItem } from '../../../common/AccessPackageList/PackageItem';
import { SkeletonAccessPackageList } from '../../../common/AccessPackageList/SkeletonAccessPackageList';
import { AccessPackageInfo } from '../../../common/DelegationModal/AccessPackages/AccessPackageInfo';
import { DelegationAction } from '../../../common/DelegationModal/EditModal';

interface PendingPackageRequestsListProps {
  selectedRequest: EnrichedPackageRequest | null;
  setSelectedRequest: (request: EnrichedPackageRequest | null) => void;
}

export const PendingPackageRequestsList = ({
  selectedRequest,
  setSelectedRequest,
}: PendingPackageRequestsListProps) => {
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const { actingParty, fromParty } = usePartyRepresentation();
  const { openSnackbar } = useSnackbar();

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

  // Deleting a request drops its row once the list refetches; the id no longer exists, so the
  // zone's RestoreFocusFallback catches the focus instead of letting it fall to <body>.
  const requestFocusOnDataChange = useRestoreFocusOnDataChange(enrichedRequests);

  const handleDelete = async (request: EnrichedPackageRequest) => {
    setLoadingByRequestId((prev) => ({ ...prev, [request.id]: true }));
    try {
      await withdrawRequest({
        party: actingParty?.partyUuid ?? '',
        id: request.id,
      }).unwrap();
      requestFocusOnDataChange(request.package?.id ?? request.id);
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
      });
    }
  };

  return (
    <div>
      {selectedRequest ? (
        <AccessPackageInfo
          accessPackage={selectedRequest.package}
          availableActions={[DelegationAction.REQUEST]}
        />
      ) : isLoading ? (
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
                isSmallScreen ? undefined : (
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
                    <MinusCircleIcon aria-hidden='true' />
                    {t('common.delete')}
                  </Button>
                )
              }
            />
          ))}
        </List>
      )}
    </div>
  );
};
