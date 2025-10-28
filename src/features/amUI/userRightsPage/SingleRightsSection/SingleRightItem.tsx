/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { ResourceListItem } from '@altinn/altinn-components';
import type { FC } from 'react';
import { useMemo, useRef } from 'react';

import type { ResourceDelegation } from '@/rtk/features/singleRights/singleRightsApi';
import type { Party } from '@/rtk/features/lookupApi';
import { useProviderLogoUrl } from '@/resources/hooks/useProviderLogoUrl';

import { EditModal } from '../../common/DelegationModal/EditModal';

import { DeleteResourceButton } from './DeleteResourceButton';

interface SingleRightItemProps {
  delegation: ResourceDelegation;
  toParty: Party;
}

const SingleRightItem: FC<SingleRightItemProps> = ({ delegation, toParty }) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const { resource } = delegation;
  const { getProviderLogoUrl, isLoading: providerLogoLoading } = useProviderLogoUrl();

  const emblem = useMemo(
    () => getProviderLogoUrl(resource?.resourceOwnerOrgNumber ?? ''),
    [getProviderLogoUrl, resource?.resourceOwnerOrgNumber],
  );

  return (
    <>
      <ResourceListItem
        resourceName={resource.title}
        ownerName={resource.resourceOwnerName ?? ''}
        id={resource.identifier}
        // color={hasAccess ? "company" : "neutral"}
        size='md'
        as='button'
        onClick={() => modalRef.current?.showModal()}
        titleAs='h3'
        ownerLogoUrlAlt={resource.resourceOwnerName ?? ''}
        loading={providerLogoLoading}
        controls={
          <DeleteResourceButton
            resource={resource}
            toParty={toParty}
          />
        }
        ownerLogoUrl={emblem ?? resource.resourceOwnerLogoUrl}
      />
      <EditModal
        ref={modalRef}
        resource={resource}
      />
    </>
  );
};

export default SingleRightItem;
