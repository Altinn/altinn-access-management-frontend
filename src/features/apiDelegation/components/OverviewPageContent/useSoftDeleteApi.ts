import { useState } from 'react';

import type {
  DeletionDto,
  OverviewOrg,
} from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgApi';

export const useSoftDeleteApi = (overviewOrgs: OverviewOrg[]) => {
  const [itemsToDelete, setItemsToDelete] = useState<DeletionDto[]>([]);

  const softRestoreAll = (orgId?: string) => {
    if (orgId) {
      setItemsToDelete(itemsToDelete.filter((o) => o.orgNr !== orgId));
    } else {
      setItemsToDelete([]);
    }
  };

  const softDeleteAll = (orgNumber?: string) => {
    if (orgNumber && overviewOrgs) {
      const orgToDelete = overviewOrgs.find((o) => orgNumber === o.orgNumber);
      setItemsToDelete(
        orgToDelete ? orgToDelete.apiList.map((a) => ({ apiId: a.id, orgNr: orgNumber })) : [],
      );
    }
  };

  const softRestoreItem = ({ orgNr, apiId }: DeletionDto) => {
    setItemsToDelete(itemsToDelete.filter((o) => !(o.orgNr === orgNr && o.apiId === apiId)));
  };

  const softDeleteItem = ({ orgNr, apiId }: DeletionDto) => {
    setItemsToDelete([...itemsToDelete, { apiId, orgNr: orgNr }]);
  };

  const checkIfItemIsSoftDeleted = ({ orgNr, apiId }: DeletionDto) => {
    return itemsToDelete.some((o) => o.orgNr === orgNr && o.apiId === apiId);
  };

  const checkIfAllItmesAreSoftDeleted = (orgNr: string) => {
    const selctedOrg = overviewOrgs.find((o) => o.orgNumber === orgNr);
    return selctedOrg
      ? selctedOrg.apiList.every((a) => checkIfItemIsSoftDeleted({ orgNr: orgNr, apiId: a.id }))
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
