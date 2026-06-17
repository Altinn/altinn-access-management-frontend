import { useEffect, useState } from 'react';
import { ArrowLeftIcon, MinusCircleIcon } from '@navikt/aksel-icons';
import { Button, DsButton, DsHeading, List, useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { usePartyRepresentation } from '../../../common/PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';
import {
  useGetEnrichedSentPackageRequestsQuery,
  useWithdrawRequestMutation,
  type EnrichedPackageRequest,
} from '@/rtk/features/requestApi';
import { useAutoFocusRef } from '@/resources/hooks/useAutoFocusRef';
import { getRequestPartyQueryParams } from '@/resources/utils/singleRightRequestUtils';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import { PackageItem } from '../../../common/AccessPackageList/PackageItem';
import { SkeletonAccessPackageList } from '../../../common/AccessPackageList/SkeletonAccessPackageList';
import { AccessPackageInfo } from '../../../common/DelegationModal/AccessPackages/AccessPackageInfo';
import { DelegationAction } from '../../../common/DelegationModal/EditModal';
import classes from './Requests.module.css';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
  useRestoreFocusAfterSettled,
} from '../../../common/RestoreFocus';

interface PendingPackageRequestsListProps {
  heading?: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  headingSize?: '2xs' | 'xs';
  selectedRequest: EnrichedPackageRequest | null;
  setSelectedRequest: (request: EnrichedPackageRequest | null) => void;
}

export const PendingPackageRequestsList = ({
  heading,
  headingLevel = 1,
  headingSize = 'xs',
  selectedRequest,
  setSelectedRequest,
}: PendingPackageRequestsListProps) => {
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const { actingParty, fromParty } = usePartyRepresentation();
  const { openSnackbar } = useSnackbar();
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
  const restoreFocus = useRestoreFocus();
  const restoreFocusAfterDelete = useRestoreFocusAfterSettled<string>({
    isSettling: isRefetching,
    onRestore: restoreFocus.requestFocus,
  });

  const handleDelete = async (request: EnrichedPackageRequest) => {
    setLoadingByRequestId((prev) => ({ ...prev, [request.id]: true }));
    try {
      await withdrawRequest({
        party: actingParty?.partyUuid ?? '',
        id: request.id,
      }).unwrap();
      restoreFocusAfterDelete(request.package.id);
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
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <div>
        {selectedRequest ? (
          <>
            <DsButton
              ref={backButtonRef}
              variant='tertiary'
              className={classes.backButton}
              onClick={() => {
                restoreFocus.requestFocus(selectedRequest.package.id);
                setSelectedRequest(null);
              }}
            >
              <ArrowLeftIcon aria-hidden='true' />
              {t('common.back')}
            </DsButton>
            <AccessPackageInfo
              accessPackage={selectedRequest.package}
              availableActions={[DelegationAction.REQUEST]}
            />
          </>
        ) : (
          <>
            {heading && (
              <RestoreFocusFallback>
                <DsHeading
                  data-size={headingSize}
                  level={headingLevel}
                  className={classes.heading}
                >
                  {heading}
                </DsHeading>
              </RestoreFocusFallback>
            )}
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
          </>
        )}
      </div>
    </RestoreFocusProvider>
  );
};
