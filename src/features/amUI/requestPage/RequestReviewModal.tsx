import { DsButton, DsDialog, DsHeading, List, ResourceListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Request } from './types';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  useApproveRequestMutation,
  useRejectRequestMutation,
  useGetEnrichedReceivedResourceRequestsQuery,
} from '@/rtk/features/requestApi';
import { ResourceList } from '../common/ResourceList/ResourceList';
import { useLazyDelegationCheckQuery } from '@/rtk/features/singleRights/singleRightsApi';

interface RequestReviewModalProps {
  request: Request | null;
  onClose: () => void;
}

export const RequestReviewModal = ({ request, onClose }: RequestReviewModalProps) => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();
  const [approveRequest] = useApproveRequestMutation();
  const [rejectRequest] = useRejectRequestMutation();
  const { data: resourceRequests, isLoading: isLoadingPendingReceivedAccessRequests } =
    useGetEnrichedReceivedResourceRequestsQuery(
      { party: actingParty?.partyUuid || '', from: request?.partyUuid || '', status: ['Pending'] },
      { skip: !actingParty?.partyUuid || !request?.partyUuid },
    );
  const [lazyDelegationCheck, { data: delegationCheckData, isLoading: isLoadingDelegationCheck }] =
    useLazyDelegationCheckQuery();

  const requestedResources = resourceRequests?.map((r) => r.resource);

  return (
    <DsDialog
      open={!!request}
      closedby='any'
      closeButton={t('common.close')}
      onClose={onClose}
    >
      <DsHeading
        level={2}
        data-size='xs'
      >
        {t('request_page.review_modal_title', { fromPartyName: request?.displayPartyName })}
      </DsHeading>
      <List>
        {isLoadingPendingReceivedAccessRequests ? (
          <>
            <ResourceListItem
              id='1'
              resourceName='xxxxxxxxxxxxxxxxxxxx'
              ownerName='xxxxxxxxx xxxxxxxxxxx'
              loading
              as='div'
              interactive={false}
              shadow='none'
            />
            <ResourceListItem
              id='2'
              resourceName='xxxxxxxxxxxxxxxxxxxx'
              ownerName='xxxxxxxxx xxxxxxxxxxx'
              loading
              as='div'
              interactive={false}
              shadow='none'
            />
          </>
        ) : (
          <ResourceList
            enableSearch={false}
            showDetails={false}
            interactive={true}
            resources={requestedResources || []}
          />
        )}
      </List>
    </DsDialog>
  );
};
