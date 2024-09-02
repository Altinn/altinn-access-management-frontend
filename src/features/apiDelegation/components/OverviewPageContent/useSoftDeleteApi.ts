import { useState } from 'react';

import type {
  DeletionDto,
  OverviewOrg,
} from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgApi';

export const useSoftDeleteApi = (overviewOrgs: OverviewOrg[]) => {
  const [itemsToDelete, setItemsToDelete] = useState<DeletionDto[]>([]);

  const softRestoreAll = (orgId?: string) => {
    if (orgId) {
      setItemsToDelete(itemsToDelete.filter((o) => o.orgNumber !== orgId));
    } else {
      setItemsToDelete([]);
    }
  };

  const softDeleteAll = (orgNumber?: string) => {
    if (orgNumber && overviewOrgs) {
      const orgToDelete = overviewOrgs.find((o) => orgNumber === o.orgNumber);
      setItemsToDelete(
        orgToDelete ? orgToDelete.apiList.map((a) => ({ apiId: a.id, orgNumber })) : [],
      );
    }
  };

  const softRestoreItem = ({ orgNumber, apiId }: DeletionDto) => {
    setItemsToDelete(
      itemsToDelete.filter((o) => !(o.orgNumber === orgNumber && o.apiId === apiId)),
    );
  };

  const softDeleteItem = ({ orgNumber, apiId }: DeletionDto) => {
    setItemsToDelete([...itemsToDelete, { apiId, orgNumber }]);
  };

  const checkIfItemIsSoftDeleted = ({ orgNumber, apiId }: DeletionDto) => {
    return itemsToDelete.some((o) => o.orgNumber === orgNumber && o.apiId === apiId);
  };

  const checkIfAllItmesAreSoftDeleted = (orgNumber: string) => {
    const selctedOrg = overviewOrgs.find((o) => o.orgNumber === orgNumber);
    return selctedOrg
      ? selctedOrg.apiList.every((a) => checkIfItemIsSoftDeleted({ orgNumber, apiId: a.id }))
      : false;
  };

  return {
    itemsToDelete,
    softRestoreAll,
    softDeleteAll,
    softRestoreItem,
    softDeleteItem,
    checkIfItemIsSoftDeleted,
    checkIfAllItmesAreSoftDeleted,
  };
};
